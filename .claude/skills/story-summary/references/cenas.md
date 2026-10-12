# Cenas

A legenda conta a história; a tela destaca uma palavra e um gráfico que deixa a pergunta no ar.

## Quadro

1080×1920. Zonas fixas do template:

| Faixa (y) | O que fica |
|---|---|
| 0–250 | livre (barra de progresso e perfil do Instagram) |
| 280 | "MATHEUS HADDAD" e contador `0N / 05` (chrome do template) |
| 400–660 | título da cena, classe `hl` (Fraunces 120px, até duas linhas) |
| 720–1260 | gráfico: `<svg>` em `left:90px;top:720px`, `width=900 height=540` |
| 1300–1540 | legenda embutida (automática, a partir do roteiro) |
| 1560–1920 | livre (campo de resposta do Instagram) |

## Cada cena

`scenes.html`, para i de 0 a 3:

```html
<div class="scene" id="s0">
 <div class="abs disp hl" id="s0t">Quem bate o <span class="acc">martelo</span>?</div>
 <svg class="abs" id="s0svg" style="left:90px;top:720px" width="900" height="540" viewBox="0 0 900 540"></svg>
</div>
```

- **Título**: 2 a 4 palavras, com **uma** palavra em `.acc`. Destaca a ideia da frase narrada, sem repeti-la.
- **Gráfico**: uma ideia, montada em movimento. Padrões que funcionaram:
  - nós em linha, com um "?" que procura quem decide;
  - linha do tempo de dois pontos (1970 → IA);
  - funções que migram para uma caixa tracejada com "?";
  - cartão com texto tarjado ("A PERGUNTA"): a resposta existe, mas está no artigo;
  - barras com números que crescem (400 × ~100 linhas);
  - itens que aparecem em sequência (11 decisões);
  - bloco cortado ao meio (−50% do escopo) e relógio (15 min);
  - lista com ✓, ✓ e um "?" piscando;
  - escada de 4 nós numerados com os nomes tarjados.
- Rótulos em JetBrains Mono, caixa alta, de uma ou duas palavras. Nada de parágrafo nem citação longa na tela.

## Cores: só constantes

O tema (fundo preto ou branco) e a cor de destaque mudam de vídeo para vídeo, então **nunca escrever cor em hexadecimal nas cenas**. Usar:

| Constante | Papel |
|---|---|
| `A` | cor de destaque (a única do vídeo) |
| `AC` | texto sobre a cor de destaque |
| `BG` | fundo |
| `SURF` | superfície de cartões e nós |
| `TXT` | texto |
| `MUTED` | texto secundário, rótulos |
| `BORDER` | bordas e trilhos |
| `DIM` | traço neutro (eixos, nós apagados, barra secundária) |
| `DEEP` | fundo de caixas vazias |
| `GRAY`, `SHIM` | tarjas de texto censurado e o brilho delas |

`hexA(A,.15)` dá a cor de destaque translúcida. No HTML, `class="acc"` e as variáveis CSS (`var(--accent)` e afins) já seguem o tema.

## Animação

- `rN(t)` recebe o tempo **local** da cena, de 0 até a sua duração. A cena N começa 0,25 s antes da frase N, e o crossfade entre cenas já está no template.
- Tudo calculado de `t`, sem CSS animation nem transition: o render é quadro a quadro.
- A cena 0 aparece já no primeiro quadro: `fadeUp($('s0t'),t,-.15,.45,30)`.
- Alinhar o momento-chave do gráfico à palavra narrada. A posição da palavra se estima pela proporção de caracteres da frase dentro de `timings.json`.
- Helpers do template:
  - `pr(t,a,b)`: progresso de 0 a 1 entre dois instantes;
  - `eo`, `eio`, `back`: easings;
  - `fadeUp(el,t,inicio,dur,dy)`: entrada de elemento;
  - `S(pai,tag,attrs)`: cria elemento SVG;
  - `line(...)` + `draw(el,p)`: linha que se desenha;
  - `pop(g,p)`: nó que surge em escala em torno de `g._c`;
  - `redact(pai,x,y,larguras)`: tarjas de texto;
  - `hexA(cor,alfa)`: cor translúcida;
  - classe SVG `lbl`: rótulo com contorno da cor do fundo, para cruzar linhas.
- `scenes.js` termina com `const SCENE_FNS=[r0,r1,r2,r3];`.

## Cena final (padrão, não editar por vídeo)

O template monta a cena final:

- a imagem de destaque do artigo, que entra com zoom lento;
- o rótulo "ARTIGO" e o título do artigo;
- três linhas de respiro;
- "Leia o artigo completo." centralizado, no tamanho do título;
- a seta centralizada logo abaixo.

**Abaixo da seta não vai nada**: é onde Matheus coloca o link no Instagram, e a legenda embutida some nessa cena. O título vem de `meta.json` e a imagem é a primeira imagem do artigo, que `build.py` copia.

## Conferência

Na folha de contato, conferir:

- texto cortado ou sobreposto;
- título com mais de duas linhas;
- legenda com palavra solitária na segunda linha;
- contraste nos dois temas. Se a combinação sorteada for de fundo branco, conferir que as tarjas e os traços `DIM` continuam visíveis.
