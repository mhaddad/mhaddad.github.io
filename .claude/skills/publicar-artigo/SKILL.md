---
name: publicar-artigo
description: Publica no site um artigo do vault do Obsidian (matheus-haddad/artigos). Lê a nota indicada, extrai só a seção "Conteúdo original", converte o frontmatter, traduz para o inglês, grava o par PT/EN em src/content/articles, valida e faz commit e push. Use quando Matheus pedir para publicar, republicar ou atualizar um artigo no site.
---

# Publicar artigo

Publica **um** artigo do vault `matheus-haddad/artigos` no site, em português e inglês.

Regra de ouro: **se qualquer passo falhar, pare, explique o problema e não faça commit nem push.** Nunca suba um artigo pela metade.

## 0. Pré-checagens

1. Confirme a nota pedida. Se Matheus não disse qual é, pergunte. Nunca escolha por conta própria.
2. Rode `git status --short`. Se houver mudanças não commitadas em `src/content/articles/`, pare e pergunte.
3. Rode `git branch --show-current`:
   - **Antes de 27/10/2026:** a branch precisa ser `novo-site`. Se for `main`, **pare**: publicar na `main` antes da troca mistura o Astro com o site antigo no ar.
   - **A partir de 27/10/2026:** a branch esperada é `main`.
4. Rode `git pull --ff-only`. Se falhar (conflito ou divergência), pare e avise.

## 1. Ler a nota no vault

- Use o **MCP do Obsidian** (ferramentas de leitura de arquivo do vault) para abrir **somente** a nota indicada pelo nome. Não liste nem leia outras notas além do necessário para localizá-la.
- Se o MCP não estiver disponível, peça a Matheus o caminho local do vault e leia o arquivo com a ferramenta Read. As regras abaixo valem igualmente.
- **Nunca publique notas de `_rascunhos/`**, a menos que Matheus peça explicitamente aquela nota de rascunho.
- Se o frontmatter tiver `status` diferente de `publicado`, pergunte antes de seguir.

## 2. Extrair o conteúdo

- Publique **apenas** o texto sob o título `## Conteúdo original`, até o próximo título de nível 2 (`## `) ou o fim da nota. O título `## Conteúdo original` em si não entra.
- Todo o resto é material editorial e **nunca** vai para o site: "Classificação", "Ideias centrais", "Artigos relacionados", "Síntese estruturada", "Referência", comentários `%% %%`, callouts de nota interna.
- Se a seção não existir ou estiver vazia, pare e avise.
- Converta a sintaxe do Obsidian para Markdown comum:
  - `[[Nota]]` ou `[[Nota|texto]]` → só o texto (sem link), salvo se a nota for outro artigo já publicado no site; nesse caso, link para a URL do site (`/artigos/<slug>/`).
  - `![[imagem.png]]` → veja **Imagens** abaixo.
  - Remova blocos `%% … %%` e tags `#tag` soltas no texto.
- Títulos internos do artigo começam em `##` (o `#` é o título da página).
- **Exportações do Medium** começam com uma linha `---` e repetem o título como `### Título`: remova as duas e promova os subtítulos `###` para `##`.
- Corrija formatação Markdown quebrada (ex.: `***termo***(texto)**palavra**` sem espaços).
- Corrija **erros de português** no PT (decisão de Matheus em 02/10/2026): letras trocadas ou faltando, acentuação ("têm", "veem", "heroico", ênclise como "dividi-lo"), grafia do Acordo Ortográfico ("consequência", "socioemocionais", "predeterminado", "multidisciplinar") e crase. Corrija também concordância, regência e vírgula entre sujeito e verbo (decisão de 02/10/2026). Não mexa em estilo, escolha de palavras nem estrutura de frases: quando o sentido pretendido for incerto, mantenha e liste no relatório para Matheus decidir.
- Links para outros artigos no Medium/LinkedIn (inclusive `share.atelie.software` e publicações do Medium) ficam como estão até o artigo de destino estar publicado no site. Quando estiver, troque pelo link interno nos dois idiomas, com o título em inglês na versão EN. O ID do post do Medium (o hash no fim da URL) é o mesmo em todos esses domínios.

**Sanitização (obrigatória):**
- Remova qualquer `<script>`.
- Remova `<iframe>` que não seja do YouTube. Iframes do YouTube devem usar `https://www.youtube-nocookie.com/embed/<id>`; converta `youtube.com/embed/` para esse formato.
- **Mapas do Google My Maps** (iframe do Medium via embedly) são permitidos, com carregamento só no clique: escreva `<iframe src="https://www.google.com/maps/d/embed?mid=<id>" title="descrição curta"></iframe>` **sozinho num parágrafo** (linha em branco antes e depois), seguido da legenda em itálico. Use o `mid` do link `maps/d/viewer?mid=` ou `maps/d/embed?mid=`. Qualquer outro iframe do Google é removido.
- O build falha se sobrar `<script>` ou iframe fora de `youtube-nocookie.com` e dos mapas do My Maps (`validateArticles` em `src/lib/articles.ts`).

**Imagens:** se o artigo tiver imagens, copie-as para `src/assets/articles/<translationKey>/` e use caminho relativo no Markdown (`../../../assets/articles/<translationKey>/<arquivo>`), com texto alternativo em cada idioma. Se não conseguir ler a imagem do vault, pare e peça o arquivo a Matheus.
- Imagens remotas (CDN do Medium, `media.licdn.com`) são **baixadas** para a mesma pasta (`curl -sSL -o …`), nunca referenciadas pela URL externa. Confira o tipo com `file`.
- URLs do LinkedIn exportadas costumam vir truncadas (`https://media.licdn.com/media<ID>`) e responder 404. Antes de desistir, abra a página pública do artigo (`originalUrl`) e use a URL completa do `og:image`, que traz o mesmo `<ID>`. Só se não houver, peça a imagem a Matheus ou a decisão de publicar sem ela.
- Legendas da exportação (ex.: "Imagem criada com …") viram uma linha em itálico logo abaixo da imagem.
- **Imagem de abertura = imagem de destaque.** Se o original abre com uma imagem (a capa no Medium ou no LinkedIn), ela deve ser o **primeiro elemento do corpo**, antes do subtítulo e de qualquer citação: o site usa automaticamente a imagem que abre o artigo como destaque do card na listagem. Não preencha `cover` no frontmatter para isso.

## 3. Montar o frontmatter

Fonte de verdade das categorias: `src/i18n/categories.ts` (`vaultName` → chave).

| Campo no site | Origem no vault | Regra |
|---|---|---|
| `title` | `title` | Igual ao vault em PT; traduzido em EN |
| `description` | `tldr` no frontmatter ou callout `> [!abstract] TL;DR` no corpo | Até **160 caracteres**. Se `tldr` faltar ou passar disso, escreva um resumo fiel ao texto, sem prometer o que o artigo não entrega |
| `pubDate` | `date` | `AAAA-MM-DD`, data **original** (Medium/LinkedIn nos migrados) |
| `updatedDate` | — | Só em republicação com mudança relevante: data de hoje |
| `category` | `category` | Chave correspondente ao `vaultName`. Se não houver correspondência, pare e pergunte |
| `lang` | — | `pt` ou `en` |
| `translationKey` | — | Igual ao slug PT. **Nunca muda** depois de publicado |
| `originalUrl` | `source_url` ou primeiro de `source_urls` | Só se for URL do LinkedIn ou do Medium |
| `draft` | — | `false`, salvo pedido de Matheus |

Ignore `series`, `tags`, `status`, `platform` e metadados de exportação.

**Slugs:** kebab-case, minúsculas, sem acentos nem pontuação, a partir do título em cada idioma, com até ~70 caracteres cortando em fim de palavra. O slug é o nome do arquivo.

Template (PT em `src/content/articles/pt/<slug-pt>.md`, EN em `src/content/articles/en/<slug-en>.md`):

```markdown
---
title: "A IA muda quase tudo na sua empresa, menos o jogo de poder"
description: "Resumo de até 160 caracteres."
pubDate: 2026-08-25
category: ai
lang: pt
translationKey: a-ia-muda-quase-tudo-na-sua-empresa-menos-o-jogo-de-poder
originalUrl: https://www.linkedin.com/pulse/...
draft: false
---

Texto do artigo, a partir do conteúdo original.
```

## 4. Republicação

Antes de criar arquivos, procure o artigo pelo `translationKey`:

```bash
grep -rl "translationKey: <slug-pt>" src/content/articles/
```

Procure também pelo título, caso o slug calculado tenha mudado. Se o artigo já existir:
- **Mantenha** os nomes de arquivo (slugs PT e EN), `translationKey` e `pubDate`. Nunca os altere.
- Atualize o texto PT e **refaça a tradução** EN.
- Defina `updatedDate` com a data de hoje se a mudança for relevante (conteúdo, não só um erro de digitação).

## 5. Traduzir para o inglês

- Inglês americano, natural, com a voz do autor: primeira pessoa, frases diretas, perguntas ao leitor, analogias concretas. Não resuma, não acrescente nem suavize ideias.
- Traduza título, `description`, texto e textos alternativos de imagem. Mantenha links, números, nomes próprios e estrutura de títulos.
- Citações de terceiros: use a versão original em inglês, se ela existir e você tiver certeza dela. Caso contrário, traduza mantendo a atribuição.
- Livros: use o título oficial em inglês, se existir.

**Glossário:**

| Português | Inglês |
|---|---|
| gestão | management |
| autogestão | self-management |
| design organizacional | organizational design |
| liderança | leadership |
| Coerência Cognitiva | Cognitive Coherence |
| P-O Fit (ajuste pessoa-organização) | P-O Fit (person-organization fit) |
| IA | AI |
| colaborador(es) | employee(s) / people (conforme o contexto) |
| empresa | company / organization (conforme o contexto) |
| Caminho de Santiago | Camino de Santiago |
| desenvolvimento de software | software development |
| agilidade / ágil | agility / agile |
| Lugar de Potência / 16 Lugares de Potência | Place of Potential / 16 Places of Potential (decisão de 02/10/2026; evita confusão com "power") |
| Índice de Prontidão para Autonomia (IPA) | Readiness for Autonomy Index (IPA) |
| Para refletir / Uma proposta de reflexão | Food for thought / Something to reflect on |

Nomes de empresas e produtos não se traduzem (Webgoal, Ateliê de Software, Granatum, Lumiar, Orgganica, Aliança Empreendedora, A Guarda-Chuva, TugÁgil, Feedback Canvas).

## 6. Validar

Rode, nesta ordem, e só siga se todos passarem:

```bash
npm run check   # tipos e schema (astro check)
npm run build   # roda validateArticles: par PT/EN, slugs e HTML perigoso
npm test
```

O build local leva segundos e é o único passo que valida o par PT/EN e o HTML perigoso. Se algo falhar, corrija os arquivos do artigo. Se a falha não for do artigo, pare e avise.

## 7. Checklist antes do commit

- [ ] `git status --short` mostra **só** os 2 arquivos do artigo (e imagens em `src/assets/articles/<translationKey>/`, se houver)
- [ ] Nenhum título editorial do vault ("Classificação", "Ideias centrais", "Artigos relacionados", "Síntese estruturada", "Referência", "Conteúdo original") aparece nos arquivos
- [ ] Nenhum `<script>`, iframe fora de `youtube-nocookie.com`, link `[[ ]]` ou bloco `%% %%`
- [ ] `description` com até 160 caracteres nos dois idiomas
- [ ] Mesmo `translationKey`, `category`, `pubDate` e `draft` nos dois arquivos
- [ ] Em republicação: slugs e `pubDate` inalterados
- [ ] `git diff --cached` revisado: nenhum segredo ou dado pessoal além do texto do artigo

## 8. Commit e push

```bash
git add src/content/articles/pt/<slug-pt>.md src/content/articles/en/<slug-en>.md
git commit -m "Publica artigo \"<título em PT>\""      # ou: Atualiza artigo "<título>"
git push
```

Se o push for rejeitado, rode `git pull --ff-only` uma vez. Se ainda houver conflito, pare e avise. Nunca force o push.

## 9. Relatório

Informe a Matheus:
- As URLs: `https://matheushaddad.com/artigos/<slug-pt>/` e `https://matheushaddad.com/en/articles/<slug-en>/` (no ar após o deploy, a partir de 27/10)
- O hash do commit
- Decisões tomadas (descrição reescrita, termos do glossário, citações traduzidas, imagens), para revisão amostral da tradução

Em caso de falha: o que falhou, em que passo, e que nada foi commitado. Se arquivos novos tiverem sido criados antes da falha, remova-os (`git clean` restrito aos arquivos do artigo, após mostrar quais são) para não deixar meio artigo no repositório.
