# Project Tech Overview

> Site pessoal de Matheus Haddad (`matheushaddad.com`).
>
> **Este documento descreve a stack de destino**, definida no plano `.darkside/tech-design/2026-09-28-novo-site-astro-plan.md` (baseado na discovery `.darkside/discover/2026-09-28-site-autoridade-blog.md`). O código atual na `main` ainda é o site estático antigo em HTML/CSS/JS vanilla (tag `site-v1` a ser criada antes da migração). O novo site é desenvolvido na branch `novo-site` e substitui o antigo em 27/10/2026.
>
> Atualizado em 2026-09-28.

## Stack

- **Linguagens:** TypeScript (configuração, schemas, helpers), Astro components (`.astro`), Markdown (conteúdo), CSS.
- **Framework:** **Astro 7.3.x**, gerando site 100% estático (sem SSR, sem adapter).
- **Runtime:** Node **24 LTS** (CI e local); gerenciador de pacotes **npm**.
- **Recursos do Astro usados:** content collections com schema (Zod), roteamento i18n nativo, `astro:assets` para imagens.
- **Serviços externos:** Google Analytics 4 (`G-CPNE8N9WS3`), WhatsApp via `wa.me` (+55 35 98886-7870), YouTube (`youtube-nocookie.com`, carregado no clique).
- **Hospedagem:** GitHub Pages com publicação via GitHub Actions; domínio `matheushaddad.com`.
- **Fonte de conteúdo:** vault do Obsidian `matheus-haddad/artigos` (repositório separado), lido por uma skill do Claude Code via Obsidian MCP local.

## Dependencies

**Production (entram no site gerado)**
- Nenhuma biblioteca JS de runtime além do próprio output do Astro.
- Fontes self-hosted (família definida pelo design system) e ícones em SVG.
- GA4 (gtag.js), carregado sem bloquear a renderização.

**Development / build**
- `astro` 7.3.x
- `@astrojs/sitemap` 3.7.x — sitemap com alternâncias de idioma
- `@astrojs/rss` 4.0.x — RSS por idioma
- `@astrojs/check` 0.9.x + `typescript` — verificação de tipos e schema (`astro check`)
- `sharp` — otimização de imagens (via `astro:assets`)
- Gerador de imagens Open Graph no build (biblioteca a escolher na onda 2)

**Infrastructure**
- GitHub Actions (workflow oficial do Astro para GitHub Pages, com grupo de concorrência)
- GitHub Pages (origem: GitHub Actions), `public/CNAME` → `matheushaddad.com`
- Dependabot para atualizações de segurança

**Removidas em relação ao site antigo:** Formspree, Font Awesome, Google Fonts via CDN, jQuery/HTML5 UP (`assets/`), `js/main.js`, `css/main.css`.

## Architecture

- **Site estático gerado (SSG) com Astro.** Todo HTML é produzido no build; o navegador executa apenas JavaScript mínimo (menu mobile, filtro de palestras, fachada do YouTube, eventos do GA4).
- **Conteúdo como dados:** artigos, palestras, empresas e serviços vivem em content collections versionadas, com **schema como contrato**. O build falha se um artigo não passar na validação ou não tiver o par PT/EN.
- **Bilíngue por construção:** português na raiz, inglês em `/en/`. Cada página e artigo tem par no outro idioma, `hreflang` e canonical. Textos de interface num dicionário em `src/i18n/`.
- **Contrato de URLs estável:** artigos em `/artigos/<slug>/` e `/en/articles/<slug>/`, **sem categoria nem data na URL**. Slug e `pubDate` nunca mudam após publicados.
- **Conversão via WhatsApp:** não há formulários nem página de contato. Um componente de botão monta `wa.me/5535988867870?text=...` conforme idioma, serviço e página de origem, e dispara evento no GA4.
- **Publicação por skill:** `.claude/skills/publicar-artigo/` lê a nota no vault (Obsidian MCP), extrai só `## Conteúdo original`, converte o frontmatter, traduz para o inglês, grava o par, roda `astro check` e faz commit e push. O build oficial acontece apenas no GitHub Actions.

## Folder Structure

```
.
├── .claude/skills/publicar-artigo/SKILL.md   # Skill de publicação de artigos (Obsidian → site)
├── .github/
│   ├── workflows/deploy.yml                  # astro check + build + deploy no GitHub Pages
│   └── dependabot.yml
├── .darkside/                                # Discovery, tech-design, scan e agentes (Darkside)
├── astro.config.mjs                          # site, i18n (pt default sem prefixo, en), integrações
├── public/                                   # Copiado sem processamento
│   ├── CNAME                                 # matheushaddad.com
│   ├── favicon.ico
│   └── feedback-canvas/                      # PDFs do Feedback Canvas (mesmos caminhos do site antigo)
├── src/
│   ├── content.config.ts                     # Schemas das coleções
│   ├── content/
│   │   ├── articles/pt/<slug>.md             # Artigos em português
│   │   ├── articles/en/<slug>.md             # Artigos em inglês (par obrigatório)
│   │   ├── talks/                            # Palestras, podcasts, webinars
│   │   ├── companies/                        # Empresas e organizações
│   │   └── services/                         # Consultoria, Mentoria, Palestras
│   ├── i18n/                                 # Dicionário PT/EN, mapa de rotas, helpers
│   ├── components/                           # Header, Footer, WhatsAppButton, ArticleCard, LanguageSwitcher, SEO...
│   ├── layouts/                              # BaseLayout, ArticleLayout
│   ├── pages/                                # Rotas PT na raiz; rotas EN em pages/en/
│   ├── assets/                               # Imagens processadas pelo astro:assets
│   └── styles/                               # Tokens e estilos globais do design system
├── package.json / package-lock.json
└── tsconfig.json
```

## Conventions & Patterns

- **Idioma:** conteúdo e UI em PT e EN; identificadores de código, nomes de componentes e comentários em inglês; commits em português, no imperativo ("Adiciona…", "Corrige…").
- **Componentes:** PascalCase (`WhatsAppButton.astro`); um componente por arquivo; reutilizar antes de criar. Props tipadas com `interface Props`.
- **Rotas e slugs:** kebab-case, sem acentos, no idioma da página (`/sobre/` ↔ `/en/about/`). Barra final consistente.
- **Frontmatter dos artigos:** `title`, `description` (tamanho máximo para prévias), `pubDate` (data original), `updatedDate?`, `category` (lista fechada), `lang` (`pt`|`en`), identificador do par, `cover?`, `service?`, `originalUrl?`, `draft?`.
- **Categorias (fechadas, alinhadas ao vault):** Gestão e Design Organizacional · Coerência Cognitiva e P-O Fit · AI, Trabalho e Organizações · Desenvolvimento de Software · Educação · Hobbies (com equivalentes em inglês). Campo `series` do vault não é usado.
- **Estilo:** tokens do design system em CSS custom properties (`src/styles/`); nada de valores literais de cor, fonte ou espaçamento fora dos tokens; estilos com escopo nos componentes `.astro`.
- **Textos de interface:** sempre via dicionário i18n, nunca literais nos componentes.
- **SEO:** um componente central gera title, description, canonical, `hreflang` (PT, EN, `x-default`), Open Graph e Twitter Card com **URLs absolutas**.
- **Imagens:** via `astro:assets` com dimensões explícitas; lazy loading fora da primeira dobra.
- **Links externos:** `target="_blank" rel="noopener"`.

## Config & Infrastructure

- **Variáveis de ambiente:** nenhuma obrigatória. `site: 'https://matheushaddad.com'` em `astro.config.mjs`. IDs públicos (GA4, número do WhatsApp) em constantes de configuração.
- **Docker:** não há.
- **CI/CD:** GitHub Actions em push na `main`: `npm ci` → `astro check` → `astro build` → deploy no GitHub Pages. Permissões mínimas (`contents: read`, `pages: write`, `id-token: write`); actions fixadas em versões; grupo de concorrência cancela deploys obsoletos. Falha de build mantém o site anterior no ar e envia e-mail.
- **Deploy target:** GitHub Pages (origem "GitHub Actions"), domínio `matheushaddad.com` com HTTPS.
- **Fluxo de branches:** push direto na `main` = produção. Até 27/10/2026, desenvolvimento na branch `novo-site`.
- **Rollback:** revert na `main`; em caso grave, restaurar o site antigo pela tag `site-v1`.
- **Privacidade:** GA4 sem aviso de cookies (risco de LGPD aceito pelo autor).

## Testing Conventions

Ainda não há testes no projeto, e o plano não define uma suíte de testes automatizados. A garantia de qualidade prevista é:

- **Schema das content collections** como contrato: build falha em frontmatter inválido, categoria fora da lista ou artigo sem par de idioma.
- **`astro check`** (tipos e schema) antes de todo push e no CI.
- **`astro build`** no GitHub Actions como verificação final.
- **Revisão manual** no lançamento: mobile, performance (< 3 s no 4G), acessibilidade básica, prévias reais no WhatsApp e no LinkedIn.

Se testes automatizados forem introduzidos (ex.: Vitest para helpers como mapeamento de rotas i18n e montagem da mensagem de WhatsApp, ou Playwright para fluxos), a convenção a adotar é: descrições em **português**, estrutura **AAA** (Arrange, Act, Assert), arquivos `*.test.ts` ao lado do código testado.
