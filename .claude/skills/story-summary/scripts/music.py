# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy"]
# ///
"""Sintetiza a trilha instrumental original do vídeo (sem direitos autorais).

Uso: uv run music.py PASTA_DE_TRABALHO [--trilha 1..6] [--seed 7]

--trilha escolhe um dos seis estilos de TRILHAS (andamento, harmonia, timbre, arpejo e
percussão). A 1 é a trilha original descrita abaixo; as demais variam a partir dela.

Grava PASTA_DE_TRABALHO/music.wav: 30 s, 44,1 kHz, estéreo, 16 bits.
96 BPM, Am–F–Cmaj7–G (um acorde por compasso), pad de serras desafinadas com passa-baixa
de 1,4 kHz, baixo senoidal em colcheias, arpejo pluck a partir de 3 s, kick suave a partir
de ~6,4 s, chimbal a partir de ~11 s, acorde final em ~28,3 s, fade-in 1,2 s, fade-out 1,5 s,
pico normalizado em ~-1 dB.
"""
import argparse
import wave
from pathlib import Path

import numpy as np

SR = 44100
DUR = float(__import__("os").environ.get("STORY_DUR", "30"))
N = int(SR * DUR)
END_CHORD = DUR - 1.7

# Estilos de trilha. Acordes: (notas do pad, nota do baixo), em MIDI. arp: índices das notas do
# acorde (None = pausa). kick/hats: instante de entrada em segundos, ou None para não tocar.
TRILHAS = {
    1: dict(nome="original", bpm=96, wave="saw", cutoff=1400,
            chords=[([57, 60, 64], 45), ([53, 57, 60], 41), ([60, 64, 67, 71], 48), ([55, 59, 62], 43)],
            final=([57, 60, 64, 69], 45), arp=[0, 1, 2, 1, 0, 2, 1, 2], arp_oct=12, tau=0.18,
            bass="oitavos", kick=6.4, kick_half=False, hats=11.0),
    2: dict(nome="lo-fi calmo", bpm=80, wave="tri", cutoff=900,
            chords=[([62, 65, 69, 72], 50), ([55, 59, 62, 65], 43), ([60, 64, 67, 71], 48), ([57, 60, 64, 67], 45)],
            final=([60, 64, 67, 71, 74], 48), arp=[0, None, 2, None, 3, None, 1, None], arp_oct=12, tau=0.35,
            bass="semibreves", kick=4.0, kick_half=True, hats=None),
    3: dict(nome="pulsante", bpm=112, wave="saw", cutoff=2000,
            chords=[([64, 67, 71], 52), ([60, 64, 67], 48), ([55, 59, 62, 67], 43), ([62, 66, 69], 50)],
            final=([64, 67, 71, 76], 52), arp=[0, 1, 2, 3, 2, 1, 0, 2], arp_oct=12, tau=0.12,
            bass="oitavas", kick=2.0, kick_half=False, hats=6.0),
    4: dict(nome="reflexivo", bpm=72, wave="tri", cutoff=1100,
            chords=[([53, 57, 60, 64], 41), ([52, 55, 59, 62], 40), ([50, 53, 57, 60], 38), ([48, 52, 55, 59], 36)],
            final=([48, 55, 59, 64], 36), arp=[0, 2, None, 3, None, 1, None, None], arp_oct=24, tau=0.45,
            bass="semibreves", kick=None, kick_half=False, hats=None),
    5: dict(nome="esperançoso", bpm=100, wave="saw", cutoff=1600,
            chords=[([60, 64, 67], 48), ([55, 59, 62], 43), ([57, 60, 64], 45), ([53, 57, 60, 65], 41)],
            final=([60, 64, 67, 72], 48), arp=[0, 2, 1, 2, 0, 2, 1, 3], arp_oct=24, tau=0.15,
            bass="oitavos", kick=5.0, kick_half=False, hats=9.0),
    6: dict(nome="suspense", bpm=88, wave="tri", cutoff=1000,
            chords=[([57, 60, 64], 45), ([55, 59, 62], 43), ([53, 57, 60, 64], 41), ([52, 56, 59], 40)],
            final=([57, 60, 64, 69], 45), arp=[0, 1, 2, 1, 2, 1, 0, None], arp_oct=12, tau=0.22,
            bass="oitavas", kick=3.0, kick_half=True, hats=12.0),
}
P = TRILHAS[1]


def configurar(n: int) -> None:
    global P, BEAT, BAR, CHORDS, FINAL
    P = TRILHAS[n]
    BEAT = 60 / P["bpm"]
    BAR = 4 * BEAT
    CHORDS, FINAL = P["chords"], P["final"]


configurar(1)

t = np.arange(N) / SR


def hz(m: float) -> float:
    return 440.0 * 2 ** ((m - 69) / 12)


def spectral(x: np.ndarray, fc: float, kind: str, order: int = 2) -> np.ndarray:
    """Filtro Butterworth de fase zero aplicado no domínio da frequência."""
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    r = (np.maximum(f, 1e-6) / fc) ** (2 * order)
    X *= 1 / np.sqrt(1 + r) if kind == "low" else np.sqrt(r / (1 + r))
    return np.fft.irfft(X, len(x))


def env(start: float, length: float, attack: float, release: float) -> np.ndarray:
    e = np.zeros(N)
    a, b = int(start * SR), min(N, int((start + length) * SR))
    if a >= N:
        return e
    seg = np.arange(b - a) / SR
    e[a:b] = np.minimum(1, seg / attack) * np.clip((length - seg) / release, 0, 1)
    return e


def saw(freq: float) -> np.ndarray:
    ph = (t * freq) % 1.0
    return 2 * ph - 1


def tri(freq: float) -> np.ndarray:
    ph = (t * freq) % 1.0
    return 2 * np.abs(2 * ph - 1) - 1


def osc(freq: float) -> np.ndarray:
    return saw(freq) if P["wave"] == "saw" else tri(freq) * 1.6


def pad() -> np.ndarray:
    out = np.zeros(N)
    nbars = int(np.ceil(END_CHORD / BAR))
    for k in range(nbars):
        notes, _ = CHORDS[k % 4]
        start = k * BAR
        length = min(BAR + 0.4, END_CHORD - start + 0.3)
        e = env(start, length, 0.6, 0.5)
        voice = sum(osc(hz(n) * 2 ** (d / 1200)) for n in notes for d in (-7, 0, 7))
        out += e * voice / (3 * len(notes))
    notes, _ = FINAL
    out += env(END_CHORD, DUR - END_CHORD, 0.15, 1.6) * sum(
        osc(hz(n) * 2 ** (d / 1200)) for n in notes for d in (-7, 0, 7)
    ) / (3 * len(notes))
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * t / (2 * BAR) - np.pi / 2)
    return spectral(out * swell, P["cutoff"], "low") * 0.55


def bass() -> np.ndarray:
    out = np.zeros(N)
    step = BAR if P["bass"] == "semibreves" else BEAT / 2
    for i in range(int(END_CHORD / step)):
        start = i * step
        _, root = CHORDS[int(start // BAR) % 4]
        if P["bass"] == "semibreves":
            e = env(start, step * 0.98, 0.05, 0.6)
            out += e * np.sin(2 * np.pi * hz(root) * t) * 1.1
            continue
        e = env(start, step * 0.95, 0.008, 0.12)
        note = root + (12 if P["bass"] == "oitavas" and i % 2 else 0)
        out += e * np.sin(2 * np.pi * hz(note) * t) * (1.0 if i % 2 == 0 else 0.7)
    _, root = FINAL
    out += env(END_CHORD, DUR - END_CHORD, 0.01, 1.6) * np.sin(2 * np.pi * hz(root) * t)
    return out * 0.32


def pluck_note(start: float, freq: float, tau: float = 0.18) -> np.ndarray:
    a = int(start * SR)
    if a >= N:
        return np.zeros(N)
    seg = np.arange(N - a) / SR
    y = np.zeros(N)
    y[a:] = np.exp(-seg / tau) * (np.sin(2 * np.pi * freq * seg) + 0.3 * np.sin(4 * np.pi * freq * seg))
    y[a : a + 40] *= np.linspace(0, 1, 40)
    return y


def arp() -> tuple[np.ndarray, np.ndarray]:
    mono = np.zeros(N)
    step = BEAT / 2
    pattern = P["arp"]
    for i in range(int(3.0 / step) + 1, int(END_CHORD / step)):
        start = i * step
        notes, _ = CHORDS[int(start // BAR) % 4]
        idx = pattern[i % len(pattern)]
        if idx is None:
            continue
        n = notes[idx % len(notes)] + P["arp_oct"]
        mono += pluck_note(start, hz(n), tau=P["tau"])
    for j, n in enumerate(FINAL[0]):
        mono += pluck_note(END_CHORD + j * 0.06, hz(n + P["arp_oct"]), tau=0.9)
    mono = spectral(mono, 3500, "low") * 0.16 * np.clip((t - 3.0) / 3.0, 0, 1) ** 0.5
    pan = 0.5 + 0.3 * np.sin(2 * np.pi * t / 4.0)
    return mono * np.sqrt(1 - pan), mono * np.sqrt(pan)


def kick() -> np.ndarray:
    out = np.zeros(N)
    if P["kick"] is None:
        return out
    first = int(np.ceil(P["kick"] / BEAT - 0.5))
    for i in range(first, int(END_CHORD / BEAT)):
        if P["kick_half"] and i % 2:
            continue
        a = int(i * BEAT * SR)
        seg = np.arange(min(int(0.35 * SR), N - a)) / SR
        f = 45 + 65 * np.exp(-seg / 0.04)
        ph = 2 * np.pi * np.cumsum(f) / SR
        out[a : a + len(seg)] += np.sin(ph) * np.exp(-seg / 0.12)
    ramp = np.clip((t - P["kick"]) / 4.0, 0, 1)
    return out * 0.38 * ramp


def hats(rng: np.random.Generator) -> np.ndarray:
    if P["hats"] is None:
        return np.zeros(N)
    noise = spectral(rng.standard_normal(N), 7000, "high", order=3)
    gate = np.zeros(N)
    first = int(np.ceil(P["hats"] / (BEAT / 2)))
    for i in range(first, int(END_CHORD / (BEAT / 2))):
        if i % 2 == 0:
            continue  # contratempo
        a = int(i * BEAT / 2 * SR)
        seg = np.arange(min(int(0.08 * SR), N - a)) / SR
        gate[a : a + len(seg)] = np.exp(-seg / 0.025)
    ramp = np.clip((t - P["hats"]) / 3.0, 0, 1)
    return noise * gate * 0.05 * ramp


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("work", type=Path)
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--trilha", type=int, default=1, choices=sorted(TRILHAS))
    ap.add_argument("--saida", type=Path, help="arquivo de saída (padrão: PASTA/music.wav)")
    args = ap.parse_args()
    configurar(args.trilha)
    rng = np.random.default_rng(args.seed)

    p, b, k = pad(), bass(), kick()
    al, ar = arp()
    h = hats(rng)
    L = p + b + k + al + h * 0.8
    R = p + b + k + ar + h
    fade = np.clip(t / 1.2, 0, 1) * np.clip((DUR - t) / 1.5, 0, 1)
    st = np.stack([L, R], axis=1) * fade[:, None]
    st *= 10 ** (-1 / 20) / np.max(np.abs(st))

    pcm = (st * 32767).astype(np.int16)
    out = args.saida or args.work / "music.wav"
    with wave.open(str(out), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print(f"Trilha {args.trilha} ({P['nome']}) gravada: {out}")


if __name__ == "__main__":
    main()
