#!/usr/bin/env python3
"""Produz o story de um artigo, do roteiro ao MP4, a partir de stories/<slug>/.

Uso (na raiz do projeto):
  python3 .claude/skills/story-summary/scripts/produzir.py SLUG --preview   narração + folha de contato
  python3 .claude/skills/story-summary/scripts/produzir.py SLUG             vídeo final
  ... --refazer-narracao   gera de novo todas as frases no ElevenLabs (texto ou voz mudou)

Precisa de stories/<slug>/fonte/roteiro.json e stories/<slug>/partes/{scenes.html,scenes.js,meta.json}.
Etapas: narração (MP3 por frase, reaproveitados) → duração = fim da fala + 3 s → animação (build.py)
→ [--preview: folha de contato e para] → trilha do vídeo → 30 quadros/s → MP4, pôster e verificação.
"""
import argparse
import json
import math
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CTA_RESPIRO = 3.0  # segundos de cena final depois da última frase


def run(cmd: list, dur: float | None = None) -> None:
    env = {**os.environ, **({'STORY_DUR': str(dur)} if dur else {})}
    r = subprocess.run(cmd, env=env)
    if r.returncode:
        sys.exit(r.returncode)


def uv(script: str, *args: str, dur: float | None = None) -> None:
    run(['uv', 'run', '--quiet', str(HERE / script), *args], dur)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument('slug')
    ap.add_argument('--preview', action='store_true')
    ap.add_argument('--refazer-narracao', action='store_true')
    args = ap.parse_args()

    story = Path('stories') / args.slug
    fonte, partes = story / 'fonte', story / 'partes'
    for f in (fonte / 'roteiro.json', partes / 'scenes.html', partes / 'scenes.js', partes / 'meta.json'):
        if not f.is_file():
            sys.exit(f'Falta {f}')

    # 1. Narração com folga de duração, só para medir; os MP3 ficam em fonte/audio e são reaproveitados.
    uv('narrate.py', str(fonte), *(['--force'] if args.refazer_narracao else []), dur=60)
    fim = json.loads((fonte / 'timings.json').read_text())[-1][1]
    dur = math.ceil(fim + CTA_RESPIRO)
    meta = json.loads((partes / 'meta.json').read_text())
    meta['dur'] = dur
    (partes / 'meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1) + '\n')

    # 2. Animação (sorteia tema, cor e trilha na primeira vez) e narração na duração final.
    run([sys.executable, str(HERE / 'build.py'), str(story)])
    uv('narrate.py', str(fonte), dur=dur)

    if args.preview:
        uv('render.py', str(fonte), '--preview', dur=dur)
        return

    # 3. Trilha, quadros e montagem.
    meta = json.loads((partes / 'meta.json').read_text())
    uv('music.py', str(fonte), '--trilha', str(meta['trilha']), dur=dur)
    uv('render.py', str(fonte), dur=dur)
    run([sys.executable, str(HERE / 'assemble.py'), str(fonte), '--slug', args.slug, '--dest', str(story), '--clean'], dur)


if __name__ == '__main__':
    main()
