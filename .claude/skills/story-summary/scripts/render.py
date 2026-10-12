# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright>=1.40"]
# ///
"""Renderiza a animação HTML do story (1080×1920) quadro a quadro com Playwright (Chromium).

Uso:
  uv run render.py PASTA_DE_TRABALHO --preview        um quadro por cena + folha de contato
  uv run render.py PASTA_DE_TRABALHO --at 3.2,7.5     quadros avulsos nesses instantes
  STORY_DUR=26 uv run render.py PASTA_DE_TRABALHO     todos os quadros (30 fps × STORY_DUR) em frames/

Lê PASTA_DE_TRABALHO/animacao-fonte.html e timings.json. Os timings são injetados como
window.TIMINGS antes dos scripts da página, então as cenas acompanham a narração sem
editar o HTML.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

FPS, DUR = 30, float(__import__("os").environ.get("STORY_DUR", "30"))
W, H = 1080, 1920
FONTS = ("Fraunces", "Inter", "JBM")


def open_page(p, work: Path):
    timings = json.loads((work / "timings.json").read_text(encoding="utf-8"))
    browser = p.chromium.launch(args=["--force-color-profile=srgb", "--allow-file-access-from-files"])
    page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
    page.add_init_script(f"window.TIMINGS={json.dumps(timings)};")
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.goto((work / "animacao-fonte.html").as_uri())
    page.evaluate("document.fonts.ready")
    # Fontes declaradas só carregam quando usadas; força o carregamento de todas.
    page.evaluate("Promise.all([...document.fonts].map(f=>f.load().catch(()=>null)))")
    loaded = page.evaluate("[...new Set([...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family.replace(/\"/g,'')))]")
    absent = [f for f in FONTS if f not in loaded]
    if absent:
        sys.exit(f"Fontes não carregadas: {', '.join(absent)}. Rode build.py, que copia as fontes para fonte/fonts.")
    if errors:
        sys.exit("Erro de JavaScript na animação:\n" + "\n".join(errors))
    return browser, page, timings


def shoot(page, t: float, path: Path) -> None:
    page.evaluate(f"render({t:.5f})")
    page.screenshot(path=str(path), type="jpeg", quality=95)


def preview_times(timings: list) -> list[float]:
    # Perto do fim de cada frase, quando a cena já se montou por inteiro.
    # A cena final continua se montando depois da última frase (rodapé e seta), então vai no fim.
    times = []
    for i, (s, e) in enumerate(timings[:-1]):
        times.append(round(min(e, timings[i + 1][0] - 0.7), 2))
    return times + [DUR - 0.5]


def contact_sheet(frames: list[Path], out: Path, cols: int = 6) -> None:
    rows = -(-len(frames) // cols)
    inputs = []
    for f in frames:
        inputs += ["-i", str(f)]
    scaled = "".join(f"[{i}:v]scale=360:640[s{i}];" for i in range(len(frames)))
    layout = "|".join(f"{(i % cols) * 360}_{(i // cols) * 640}" for i in range(len(frames)))
    stack = "".join(f"[s{i}]" for i in range(len(frames)))
    filt = f"{scaled}{stack}xstack=inputs={len(frames)}:layout={layout}:fill=black"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", *inputs, "-filter_complex", filt, "-frames:v", "1", "-q:v", "3", str(out)],
        check=True,
    )
    print(f"Folha de contato: {out} ({cols}×{rows})")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("work", type=Path)
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--at", help="instantes separados por vírgula, em segundos")
    args = ap.parse_args()
    work = args.work.resolve()

    with sync_playwright() as p:
        browser, page, timings = open_page(p, work)
        if args.preview or args.at:
            out = work / "preview"
            out.mkdir(exist_ok=True)
            times = [float(x) for x in args.at.split(",")] if args.at else preview_times(timings)
            shots = []
            for i, t in enumerate(times):
                path = out / f"p{i:02d}-{t:05.2f}s.jpg"
                shoot(page, t, path)
                shots.append(path)
                print(path)
            if args.preview:
                contact_sheet(shots, work / "folha-de-contato.jpg")
        else:
            frames = work / "frames"
            frames.mkdir(exist_ok=True)
            n = int(FPS * DUR)
            for i in range(n):
                shoot(page, i / FPS, frames / f"f{i:04d}.jpg")
                if i % 150 == 0:
                    print(f"quadro {i}/{n}", flush=True)
            print(f"{n} quadros em {frames}")
        browser.close()


if __name__ == "__main__":
    main()
