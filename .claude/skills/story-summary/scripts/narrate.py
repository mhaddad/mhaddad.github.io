# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy"]
# ///
"""Gera a narração do story, uma requisição ao ElevenLabs por frase (duração em STORY_DUR).

Uso:
  uv run narrate.py --check
  uv run narrate.py PASTA_DE_TRABALHO [--env-file CAMINHO] [--mp3-dir PASTA] [--tempo 1.06] [--force]

Lê PASTA_DE_TRABALHO/roteiro.json:
  {"voice_id": "vklPHUBwn1Im6Bv9XJzM", "frases": ["...", "...", "...", "...", "...", "..."]}

Grava em PASTA_DE_TRABALHO:
  audio/l{i}.mp3   resposta bruta do ElevenLabs (reaproveitada nas execuções seguintes)
  audio/f{i}.wav   frase sem silêncio nas pontas, com atempo aplicado
  narration.wav    30 s, mono, 44,1 kHz: início em 0,4 s e 0,3 s de pausa entre frases
  timings.json     [[início, fim], ...] de cada frase, em segundos

A chave vem de ELEVENLABS_API_KEY no ambiente ou de um arquivo .env
(--env-file, senão PASTA_DE_TRABALHO/../.env, senão ./.env). A chave nunca é impressa.
Com --mp3-dir, usa l1.mp3 ... l6.mp3 gerados manualmente no site, sem chamar a API.
"""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
import wave
from pathlib import Path

import numpy as np

API = "https://api.elevenlabs.io/v1"
SR = 44100
DUR = float(__import__("os").environ.get("STORY_DUR", "30"))
START = 0.4
GAP = 0.3
# A última frase precisa terminar cedo o bastante para a cena final respirar.
LAST_END_MAX = DUR - 2.0
VOICE_SETTINGS = {"stability": 0.5, "similarity_boost": 0.75, "style": 0.2, "use_speaker_boost": True}


def load_key(env_file: Path | None, work: Path | None) -> str:
    raw = os.environ.get("ELEVENLABS_API_KEY", "")
    if not raw:
        candidates = [env_file] if env_file else []
        if work:
            candidates += [work.parent / ".env", work / ".env"]
        candidates.append(Path.cwd() / ".env")
        for c in candidates:
            if c and c.is_file():
                for line in c.read_text(encoding="utf-8").splitlines():
                    if line.strip().startswith("ELEVENLABS_API_KEY"):
                        raw = line.split("=", 1)[-1].strip().strip("'\"")
                        break
            if raw:
                break
    if not raw:
        sys.exit("Chave não encontrada: defina ELEVENLABS_API_KEY no ambiente ou num arquivo .env.")
    m = re.search(r"sk_[A-Za-z0-9]+", raw)
    if not m:
        sys.exit("O valor de ELEVENLABS_API_KEY não começa com sk_: parece ser o ID da chave, não a chave.")
    return m.group(0)


def check_network() -> None:
    try:
        with urllib.request.urlopen(f"{API}/models", timeout=10) as r:
            status = r.status
    except urllib.error.HTTPError as e:
        status = e.code
    except (urllib.error.URLError, TimeoutError) as e:
        sys.exit(f"api.elevenlabs.io inacessível ({e}). Peça a liberação do domínio na rede ou gere os MP3 no site e use --mp3-dir.")
    print(f"api.elevenlabs.io acessível (HTTP {status}).")


def tts(key: str, voice: str, text: str, prev: str, nxt: str, out: Path) -> None:
    body = {"text": text, "model_id": "eleven_multilingual_v2", "voice_settings": VOICE_SETTINGS}
    if prev:
        body["previous_text"] = prev
    if nxt:
        body["next_text"] = nxt
    req = urllib.request.Request(
        f"{API}/text-to-speech/{voice}?output_format=mp3_44100_128",
        data=json.dumps(body).encode("utf-8"),
        headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            out.write_bytes(r.read())
    except urllib.error.HTTPError as e:
        detail = e.read().decode("utf-8", "replace")[:300]
        sys.exit(f"ElevenLabs respondeu HTTP {e.code} na frase {out.stem}: {detail}")


def trim(src: Path, dst: Path, tempo: float) -> None:
    af = (
        "silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
        "silenceremove=start_periods=1:start_threshold=-45dB,areverse"
    )
    if abs(tempo - 1.0) > 1e-3:
        af += f",atempo={tempo}"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", af, "-ac", "1", "-ar", str(SR), str(dst)],
        check=True,
    )


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path), "rb") as w:
        assert w.getnchannels() == 1 and w.getframerate() == SR and w.getsampwidth() == 2
        return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def write_wav(path: Path, data: np.ndarray) -> None:
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("work", nargs="?", type=Path)
    ap.add_argument("--check", action="store_true", help="só testa se api.elevenlabs.io está acessível")
    ap.add_argument("--env-file", type=Path)
    ap.add_argument("--mp3-dir", type=Path, help="pasta com l1.mp3 ... l6.mp3 gerados manualmente")
    ap.add_argument("--tempo", type=float, default=1.0, help="atempo entre 1.0 e 1.08, só se precisar caber")
    ap.add_argument("--force", action="store_true", help="gera de novo os MP3 que já existem")
    args = ap.parse_args()

    if args.check:
        check_network()
        return
    if not args.work:
        ap.error("informe a PASTA_DE_TRABALHO")
    if not 1.0 <= args.tempo <= 1.08:
        sys.exit("--tempo fora da faixa 1.0–1.08: encurte o roteiro em vez de acelerar mais.")

    work = args.work.resolve()
    roteiro = json.loads((work / "roteiro.json").read_text(encoding="utf-8"))
    frases, voice = roteiro["frases"], roteiro.get("voice_id", "vklPHUBwn1Im6Bv9XJzM")
    audio = work / "audio"
    audio.mkdir(exist_ok=True)

    key = None
    for i, text in enumerate(frases, 1):
        mp3 = audio / f"l{i}.mp3"
        if args.mp3_dir:
            src = args.mp3_dir / f"l{i}.mp3"
            if not src.is_file():
                sys.exit(f"Falta {src}")
            mp3.write_bytes(src.read_bytes())
        elif args.force or not mp3.is_file():
            key = key or load_key(args.env_file, work)
            prev = frases[i - 2] if i > 1 else ""
            nxt = frases[i] if i < len(frases) else ""
            tts(key, voice, text, prev, nxt, mp3)
        trim(mp3, audio / f"f{i}.wav", args.tempo)

    clips = [read_wav(audio / f"f{i}.wav") for i in range(1, len(frases) + 1)]
    timings, t = [], START
    for clip in clips:
        timings.append([round(t, 3), round(t + len(clip) / SR, 3)])
        t = timings[-1][1] + GAP

    for i, (s, e) in enumerate(timings, 1):
        print(f"frase {i}: {s:6.2f} → {e:6.2f}  ({e - s:4.2f} s)")
    last = timings[-1][1]
    print(f"fala total: {sum(e - s for s, e in timings):.2f} s; última frase termina em {last:.2f} s")
    if last > LAST_END_MAX:
        sys.exit(
            f"A última frase termina depois de {LAST_END_MAX} s. Encurte o roteiro ou rode de novo com "
            "--tempo maior (os MP3 já gerados são reaproveitados, sem nova chamada à API)."
        )

    out = np.zeros(int(DUR * SR), dtype=np.float32)
    for clip, (s, _) in zip(clips, timings):
        a = int(round(s * SR))
        out[a : a + len(clip)] += clip
    write_wav(work / "narration.wav", out)
    (work / "timings.json").write_text(json.dumps(timings), encoding="utf-8")


if __name__ == "__main__":
    main()
