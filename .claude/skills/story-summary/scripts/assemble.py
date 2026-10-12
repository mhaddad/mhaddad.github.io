#!/usr/bin/env python3
"""Mixa o áudio, codifica o MP4 e gera o pôster e a verificação do story.

Uso: STORY_DUR=26 python3 assemble.py PASTA_DE_TRABALHO --slug SLUG --dest PASTA_DE_ENTREGA [--clean]

Lê de PASTA_DE_TRABALHO: narration.wav, music.wav e frames/.
Grava em PASTA_DE_ENTREGA: story-SLUG.mp4 e story-SLUG.jpg (quadro do segundo 1).
Grava em PASTA_DE_TRABALHO: mix.wav e tira-de-quadros.jpg (um quadro a cada 3 s do MP4 final).
Com --clean, apaga frames/ e preview/ ao final.
Derivado do assemble.py da skill video-summary (plugin mhaddad-editorial).
"""
import argparse
import os
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

MIX = (
    "[0:a]pan=stereo|c0=c0|c1=c0,highpass=f=70,"
    "acompressor=threshold=-20dB:ratio=2.5:attack=5:release=80,asplit=2[v][sc];"
    "[1:a]volume={music}[m];"
    "[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];"
    "[v][md]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[a]"
)

def ff(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["ffmpeg", "-y", "-hide_banner", *args], check=True, capture_output=True, text=True)


def ts(sec: float) -> str:
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("work", type=Path)
    ap.add_argument("--slug", required=True)
    ap.add_argument("--dest", type=Path, required=True)
    ap.add_argument("--music-volume", default="0.45")
    ap.add_argument("--clean", action="store_true")
    args = ap.parse_args()

    work, dest, slug = args.work.resolve(), args.dest.resolve(), args.slug
    if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", slug):
        sys.exit("Slug inválido: use minúsculas, números e hífens.")
    frames = work / "frames"
    DUR = float(os.environ.get("STORY_DUR", "30"))
    nf = int(30 * DUR)
    if not (frames / f"f{nf - 1:04d}.jpg").is_file():
        sys.exit("Faltam quadros: rode render.py sem --preview antes.")
    dest.mkdir(parents=True, exist_ok=True)
    mp4 = dest / f"story-{slug}.mp4"

    mix = work / "mix.wav"
    ff("-i", str(work / "narration.wav"), "-i", str(work / "music.wav"),
       "-filter_complex", MIX.format(music=args.music_volume), "-map", "[a]", "-ar", "48000", str(mix))

    ff("-framerate", "30", "-i", str(frames / "f%04d.jpg"), "-i", str(mix),
       "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-profile:v", "high",
       "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(mp4))

    shutil.copyfile(frames / "f0030.jpg", dest / f"story-{slug}.jpg")

    # Sem .vtt: no story as legendas vão embutidas no vídeo.


    # Verificação
    dur = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp4)],
        check=True, capture_output=True, text=True,
    ).stdout.strip()
    meas = ff("-i", str(mp4), "-vn", "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-")
    stats = json.loads(meas.stderr[meas.stderr.rindex("{"):meas.stderr.rindex("}") + 1])
    ff("-i", str(mp4), "-vf", "select='not(mod(n\\,90))',scale=270:-1,tile=9x1", "-frames:v", "1",
       "-fps_mode", "vfr", "-q:v", "3", str(work / "tira-de-quadros.jpg"))

    print(f"MP4: {mp4}")
    print(f"duração: {float(dur):.3f} s (esperado {DUR:.3f})")
    print(f"loudness integrado: {stats['input_i']} LUFS (alvo -16); pico real: {stats['input_tp']} dBTP")
    print(f"tira de quadros: {work / 'tira-de-quadros.jpg'}")
    if abs(float(dur) - DUR) > 0.05:
        print(f"ATENÇÃO: duração diferente de {DUR} s.")
    if abs(float(stats["input_i"]) + 16) > 1.0:
        print("ATENÇÃO: loudness fora de -16 ± 1 LUFS.")

    if args.clean:
        shutil.rmtree(frames, ignore_errors=True)
        shutil.rmtree(work / "preview", ignore_errors=True)


if __name__ == "__main__":
    main()
