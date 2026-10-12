---
name: story-summary
description: Cria o vídeo vertical de divulgação de um artigo do site para os Stories do Instagram e o status do WhatsApp (1080×1920, ~25 s, narração com a voz clonada de Matheus, legendas embutidas e chamada para o link do artigo). Use quando Matheus pedir um story, um vídeo para Instagram ou WhatsApp, ou um vídeo de divulgação de um artigo publicado.
---

# Story summary

Transforma um artigo publicado no site num vídeo vertical que desperta curiosidade e leva a pessoa a clicar no link e ler o artigo inteiro.

Regra central:

> O story não resume o artigo. Ele abre uma pergunta que só o artigo responde.

## Entregáveis

Tudo em `stories/<slug>/`, pasta fora do Git (`.gitignore`):

- `story-<slug>.mp4`: 1080×1920, 30 fps, H.264 + AAC, cerca de -16 LUFS, duração = fim da fala + 3 s;
- `story-<slug>.jpg`: pôster (quadro do segundo 1);
- `legenda.txt`: texto do status do WhatsApp e URL do adesivo de link do Instagram;
- `fonte/` e `partes/`: roteiro, narração, trilha e animação, para refazer o vídeo sem gastar créditos de novo.

O que fica no repositório é só a skill: scripts, template, fontes, trilhas, exemplos e o histórico de variação.

## Pré-requisitos

- `ffmpeg`, `uv` e Python 3 no sistema. Na primeira execução, o `uv` instala numpy e Playwright, e o Chromium do Playwright é baixado se faltar: `uv run --with playwright python -m playwright install chromium`.
- Chave do ElevenLabs em `.env` na raiz do projeto (`ELEVENLABS_API_KEY=sk_...`). **Nunca abrir, imprimir nem copiar o `.env`.** Para conferir que ele existe, listar a pasta.
- Voz: o clone de Matheus, `voice_id` **HMUOWD7OU4q4pTI22jy2**, modelo `eleven_multilingual_v2`.

## Processo

Criar a lista de tarefas e seguir nesta ordem. Um artigo por vez; para vários, repetir o ciclo, e a variação de tema, cor e trilha acontece sozinha.

### 0. Artigo

- Identificar o artigo pelo slug, o nome do arquivo em `src/content/articles/pt/`. Se Matheus não disse qual, perguntar.
- Ler o artigo **inteiro**. O artigo precisa abrir com uma imagem: ela é a imagem de destaque da cena final.
- Criar `stories/<slug>/fonte/` e `stories/<slug>/partes/`.

### 1. Roteiro

Cinco frases, com a quinta fixa: "Leia o artigo completo no link." Regras completas em [Roteiro](references/roteiro.md).

Gravar `stories/<slug>/fonte/roteiro.json`:

```json
{"voice_id": "HMUOWD7OU4q4pTI22jy2", "frases": ["...", "...", "...", "...", "Leia o artigo completo no link."]}
```

Mostrar o roteiro a Matheus só se ele pedir; senão, seguir.

### 2. Cenas

Uma cena por frase, menos a última, que é a chamada padrão do template. Escrever:

- `partes/meta.json`: `{"title": "<título do artigo>"}` (o resto é preenchido pelos scripts);
- `partes/scenes.html`: as cenas `s0`…`s3`;
- `partes/scenes.js`: as funções `r0`…`r3`, terminando com `const SCENE_FNS=[r0,r1,r2,r3];`.

Regras visuais, constantes de cor e helpers em [Cenas](references/cenas.md). Partir de um dos [exemplos](exemplos/) aprovados.

### 3. Prévia

```bash
python3 .claude/skills/story-summary/scripts/produzir.py <slug> --preview
```

Gera a narração (uma chamada ao ElevenLabs por frase; os MP3 ficam guardados), calcula a duração, sorteia tema, cor e trilha na primeira vez e grava `fonte/folha-de-contato.jpg`, com um quadro por cena. **Olhar a folha** e corrigir sobreposição, texto cortado, excesso de texto, contraste e legenda com palavra solitária. Para ver um instante: `STORY_DUR=<dur> uv run .claude/skills/story-summary/scripts/render.py stories/<slug>/fonte --at 12.5`.

Se o texto de uma frase mudar depois da narração, rodar com `--refazer-narracao`.

### 4. Vídeo final

```bash
python3 .claude/skills/story-summary/scripts/produzir.py <slug>
```

Gera a trilha, renderiza os quadros e monta o MP4. O script imprime duração e loudness e grava `fonte/tira-de-quadros.jpg`, com um quadro a cada 3 s. Olhar a tira: quadro vazio só pode aparecer no início e nas transições.

### 5. Legenda de acompanhamento

Gravar `stories/<slug>/legenda.txt` no formato dos [exemplos](exemplos/): uma ou duas frases que reforçam a pergunta do vídeo, sem repetir a narração e sem superlativo, seguidas da URL `https://matheushaddad.com/artigos/<slug>/`. Texto do adesivo do Instagram: "Ler o artigo".

## Variação entre vídeos

Para quem acompanha não ver sempre o mesmo vídeo, cada story novo recebe uma combinação diferente, sorteada por `build.py` e guardada em [estado/rotacao.json](estado/rotacao.json):

- **fundo**: alterna entre preto e branco (temas escuro e claro do site);
- **cor de destaque**: verde, amarelo, azul ou laranja, nos tons do tema, e diferente das duas anteriores. É **uma cor só no vídeo inteiro**, como o site faz por visita;
- **trilha**: a próxima do ciclo das seis.

A combinação fica em `partes/meta.json`, e refazer o vídeo a mantém. Para trocá-la, apagar `tema`, `cor` e `trilha` do `meta.json` (sorteia de novo) ou editar os valores. `rotacao.json` é versionado: fazer commit dele junto com qualquer mudança da skill.

## Trilhas

Seis trilhas originais, sintetizadas por `scripts/music.py --trilha N` na duração exata de cada vídeo, sem direitos autorais:

| N | Estilo | Amostra |
|---|---|---|
| 1 | original (96 BPM) | [ouvir](assets/trilhas/trilha-1-original.mp3) |
| 2 | lo-fi calmo (80 BPM) | [ouvir](assets/trilhas/trilha-2-lo-fi-calmo.mp3) |
| 3 | pulsante (112 BPM) | [ouvir](assets/trilhas/trilha-3-pulsante.mp3) |
| 4 | reflexivo (72 BPM) | [ouvir](assets/trilhas/trilha-4-reflexivo.mp3) |
| 5 | esperançoso (100 BPM) | [ouvir](assets/trilhas/trilha-5-esperancoso.mp3) |
| 6 | suspense (88 BPM) | [ouvir](assets/trilhas/trilha-6-suspense.mp3) |

As amostras em `assets/trilhas/` servem para ouvir e escolher; o vídeo usa o sintetizador, que encaixa o acorde final no fim de cada vídeo. Uma trilha nova entra como mais uma entrada em `TRILHAS` no `music.py`, com `TRILHAS = 7` no `build.py` e uma amostra nova.

## Salvaguardas

Nunca:

- abrir, imprimir ou copiar o `.env`, nem pedir a chave no chat;
- pôr no vídeo número, nome, data ou citação que não esteja no artigo, nem afirmar mais do que o artigo afirma;
- usar música, imagem, logotipo ou fonte de terceiros: a trilha é a sintetizada, as fontes são as do site e a única imagem é a de destaque do próprio artigo;
- versionar `stories/`;
- afirmar que o áudio foi conferido: daqui não se ouve o resultado.

## Entrega

Resposta curta: link do MP4, tema, cor e trilha sorteados, duração e loudness medidos, e o pedido para Matheus ouvir a pronúncia de nomes, siglas e números e o equilíbrio entre a voz e a trilha.
