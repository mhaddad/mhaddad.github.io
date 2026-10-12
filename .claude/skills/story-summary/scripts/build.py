"""Monta stories/<slug>/fonte/animacao-fonte.html: template + cenas do artigo + título, frases,
duração, tema, cor e imagem de destaque.

Uso: python3 build.py PASTA_DO_STORY
Lê PASTA/partes/{scenes.html,scenes.js,meta.json} e PASTA/fonte/roteiro.json.
Na primeira vez sorteia tema, cor e trilha (ver sortear) e grava em meta.json e em
estado/rotacao.json, para os próximos renders do mesmo vídeo repetirem a combinação.
"""
import json, random, re, shutil, sys
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]
TEMPLATE = SKILL / 'assets' / 'template-stories.html'
FONTS = SKILL / 'assets' / 'fonts'
# Histórico de combinações já usadas, para cada vídeo novo variar em relação aos anteriores.
ROTACAO = SKILL / 'estado' / 'rotacao.json'

# Paleta de destaque do site por tema: (cor, contraste) — src/styles/tokens.css
ACCENTS = {
    'dark': {'green': ('#00f993', '#071a12'), 'yellow': ('#ffc132', '#241900'),
             'blue': ('#0097d7', '#001e2b'), 'orange': ('#f46036', '#260c04')},
    'light': {'green': ('#007d4c', '#ffffff'), 'yellow': ('#805600', '#ffffff'),
              'blue': ('#006695', '#ffffff'), 'orange': ('#ad3d1d', '#ffffff')},
}
TRILHAS = 6  # estilos de music.py --trilha


def project_root(start: Path) -> Path:
    for d in [start, *start.parents]:
        if (d / 'src' / 'content' / 'articles').is_dir():
            return d
    sys.exit('Não achei src/content/articles acima de ' + str(start))


def sortear(slug: str, hist: list) -> dict:
    """Tema alternado (preto/branco), cor diferente das duas anteriores e próxima trilha do ciclo."""
    prev = [h for h in hist if h['slug'] != slug]
    last = prev[-1] if prev else None
    tema = 'light' if not last or last['tema'] == 'dark' else 'dark'
    usadas = {h['cor'] for h in prev[-2:]}
    cor = random.choice([c for c in ACCENTS[tema] if c not in usadas])
    trilha = last['trilha'] % TRILHAS + 1 if last else 2
    return {'tema': tema, 'cor': cor, 'trilha': trilha}


def main() -> None:
    story = Path(sys.argv[1]).resolve()
    root = project_root(story)
    parts, fonte = story / 'partes', story / 'fonte'
    meta = json.loads((parts / 'meta.json').read_text())

    hist = json.loads(ROTACAO.read_text()) if ROTACAO.exists() else []
    if not all(k in meta for k in ('tema', 'cor', 'trilha')):
        meta.update(sortear(story.name, hist))
        hist = [h for h in hist if h['slug'] != story.name] + [
            {'slug': story.name, **{k: meta[k] for k in ('tema', 'cor', 'trilha')}}]
        ROTACAO.write_text(json.dumps(hist, ensure_ascii=False, indent=1) + '\n')
    (parts / 'meta.json').write_text(json.dumps(meta, ensure_ascii=False, indent=1) + '\n')
    accent, contrast = ACCENTS[meta['tema']][meta['cor']]

    # Fontes do site e imagem de destaque (a primeira imagem do artigo, a que abre o texto).
    (fonte / 'fonts').mkdir(parents=True, exist_ok=True)
    for f in FONTS.glob('*.woff2'):
        shutil.copyfile(f, fonte / 'fonts' / f.name)
    md = (root / 'src/content/articles/pt' / f'{story.name}.md').read_text()
    m = re.search(r'!\[[^\]]*\]\(([^)\s]+)\)', md)
    if not m or '/assets/' not in m.group(1):
        sys.exit('O artigo não abre com uma imagem de src/assets/: a cena final precisa dela.')
    img = m.group(1).split('/assets/')[1]
    shutil.copyfile(root / 'src/assets' / img, fonte / 'capa.jpg')  # o navegador identifica PNG pelo conteúdo

    frases = json.loads((fonte / 'roteiro.json').read_text())['frases']
    tpl = TEMPLATE.read_text()
    for key, val in {
        '/*SCENES_HTML*/': (parts / 'scenes.html').read_text(),
        '/*SCENES_JS*/': (parts / 'scenes.js').read_text(),
        '/*DUR*/30': str(meta['dur']),
        "/*TITLE*/''": json.dumps(meta['title'], ensure_ascii=False),
        '/*FRASES*/[]': json.dumps(frases, ensure_ascii=False),
        "/*THEME*/'dark'": json.dumps(meta['tema']),
        "/*ACCENT*/'#00f993'": json.dumps(accent),
        "/*ACCENT_CONTRAST*/'#071a12'": json.dumps(contrast),
    }.items():
        assert key in tpl, key
        tpl = tpl.replace(key, val)
    (fonte / 'animacao-fonte.html').write_text(tpl)
    print(f"animação: {fonte / 'animacao-fonte.html'} | tema {meta['tema']}, cor {meta['cor']}, "
          f"trilha {meta['trilha']}, {meta['dur']} s, capa {img}")


if __name__ == '__main__':
    main()
