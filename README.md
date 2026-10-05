# matheushaddad.com

Site pessoal de Matheus Haddad: artigos, palestras, mentoria, empresas, livros e mídia, em português (raiz) e inglês (`/en/`).

Site estático feito com [Astro](https://astro.build), publicado no GitHub Pages pelo GitHub Actions.

## Rodar localmente

Requer Node 22.12 ou mais novo.

```bash
npm install
npm run dev        # servidor de desenvolvimento em http://localhost:4321
npm run build      # gera o site em dist/
npm run preview    # serve o dist/ gerado
```

## Qualidade

```bash
npm test           # testes (Vitest): unidades, conteúdo e build completo com fixtures
npm run check      # tipos e schemas (astro check)
```

O `npm test` termina com `astro sync` para restaurar os tipos do conteúdo real. Se o servidor de desenvolvimento mostrar erro depois dos testes, reinicie-o com `npx astro dev stop` e `npm run dev`.

## Estrutura

| Pasta | O que tem |
|---|---|
| `src/pages/` | Rotas. Português na raiz e inglês em `src/pages/en/`. |
| `src/components/` | Componentes (cabeçalho, rodapé, páginas, cards). |
| `src/content/` | Conteúdo: `articles/` (artigos em Markdown, `pt/` e `en/`), `services/` (Palestras e Mentoria), `about/`, `companies/`, `books/`, `talks/`. Cada coleção é validada por schema em `src/content.config.ts`. |
| `src/i18n/` | Textos da interface, rotas e navegação nos dois idiomas. |
| `src/lib/` | Regras de negócio com testes (artigos, serviços, mídias, embeds, CTA). |
| `src/assets/` | Imagens processadas pelo Astro (capas dos artigos, logos, retratos). |
| `public/` | Arquivos servidos como estão: `CNAME`, favicon, `robots.txt`, PDFs do Feedback Canvas e redirecionamentos dos endereços `.html` do site antigo. |
| `scripts/` | `npm run assets` (logos, retrato e miniaturas) e `npm run favicon`. |
| `tests/` | Testes de build e de conteúdo, com fixtures em `tests/fixtures/`. |

## Conteúdo

- **Artigos:** vêm do vault do Obsidian. A skill `publicar-artigo` (em `.claude/skills/`) lê a nota, converte, traduz para o inglês, valida e publica o par PT/EN.
- **HTML nos artigos:** `<script>` e iframes fora da lista não passam no build. Valem apenas o YouTube (`youtube-nocookie.com`), mapas do Google (My Maps e embed padrão) e apresentações do SlideShare (`embed_code/key/`). Ver `.darkside/darkside-agents/security.md`.
- **Mídia, empresas e livros:** editados nos arquivos YAML de `src/content/`.

## Publicação

Todo push na `main` roda `.github/workflows/deploy.yml`: instala, roda testes, `astro check` e build, e publica o `dist/` no GitHub Pages. Pushes em outras branches rodam só a verificação.

O domínio `matheushaddad.com` vem do arquivo `public/CNAME`. O Dependabot cuida das atualizações de segurança (`.github/dependabot.yml`).

### Voltar ao site anterior

O site anterior (HTML estático) está na tag `site-v1`. Para voltar a ele, reverta o merge na `main` e, em Settings > Pages, volte a origem para "Deploy from a branch".
