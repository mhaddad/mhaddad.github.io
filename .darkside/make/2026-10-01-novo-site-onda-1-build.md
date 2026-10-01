# Novo site em Astro — Onda 1: Casa própria publicando

**Tech Design Plan:** `.darkside/tech-design/2026-09-28-novo-site-astro-plan.md`

## Order

### Escopo

Passos 2 a 6 da Onda 1 do plano. O passo 1 (tag `site-v1` + branch `novo-site`) foi concluído em 01/10/2026.

| # | Passo do plano | Entra nesta ordem |
|---|---|---|
| 2 | Esqueleto Astro, i18n, layout base neutro, workflow de build | Sim |
| 3 | Coleções, schemas e dicionário de interface | Sim |
| 4 | Lista, artigo, categoria, RSS, sitemap, `hreflang`, canonical | Sim |
| 5 | Skill `publicar-artigo` + 3 artigos reais | Sim (depende do Obsidian MCP — ver Riscos) |
| 6 | GA4 com eventos | Sim (infraestrutura + evento de troca de idioma) |

**Fora do escopo (ondas seguintes):** design system e visual definitivo, home real, índice/progresso/compartilhar no artigo, imagens OG geradas, botão de WhatsApp e chamada no fim do artigo, Sobre/Serviços/Palestras/Empresas/Livros, 404, conteúdo de `talks`/`companies`/`services`, remoção do site antigo.

### Abordagem e arquitetura

- **Astro 7.3.5 estático na raiz do repositório**, convivendo com o site antigo até 27/10. O Astro só lê `src/` e `public/`; os `.html` antigos na raiz não entram no build. `public/` recebe **cópias** de `CNAME`, `favicon.ico` e `feedback-canvas/` (os originais ficam onde estão até a troca).
- **i18n nativo do Astro:** `defaultLocale: 'pt'`, `locales: ['pt', 'en']`, `prefixDefaultLocale: false`. Como os caminhos diferem entre idiomas (`/artigos/` ↔ `/en/articles/`), as rotas são páginas físicas separadas em `src/pages/` e `src/pages/en/`, e o par de cada página vem de um **mapa de rotas** em `src/i18n/routes.ts`.
- **URLs:** `trailingSlash: 'always'` e `build.format: 'directory'`, conforme o contrato.
- **Artigos:** coleção `articles` com `glob` loader em `src/content/articles/{pt,en}/<slug>.md`. O slug é o nome do arquivo; o idioma vem da pasta e precisa bater com o campo `lang`. O par PT/EN é ligado por `translationKey`.
- **Regras entre arquivos** (par obrigatório, slug duplicado, idioma da pasta, HTML perigoso) não cabem no Zod, que valida um arquivo por vez. Ficam numa função pura `validateArticles()` chamada no `getStaticPaths` das páginas de artigo. Se ela lançar erro, `astro build` falha. A função é coberta por testes unitários.
- **Categorias:** lista fechada de 6 em `src/i18n/categories.ts`, com chave estável, nome PT/EN, slug PT/EN e nome correspondente no vault. O frontmatter usa a chave. Categoria sem artigos publicados não gera página nem aparece nos filtros.
- **SEO central:** componente `Seo.astro` alimentado por `buildSeo()` (função pura e testada). Gera title, description, canonical, `hreflang` (`pt-BR`, `en`, `x-default` → PT), Open Graph e Twitter Card, todos com URL absoluta. A imagem de prévia na Onda 1 é uma imagem padrão fixa de 1200×630 (`public/og-default.png`); o gerador fica para a Onda 2.
- **Visual neutro:** `src/styles/global.css` com poucas custom properties provisórias (fonte do sistema, largura de leitura). Nenhuma decisão de design system aqui.
- **GA4:** `Analytics.astro` carrega o gtag de forma assíncrona **apenas no build de produção**. Um ouvinte de clique delegado envia eventos a partir de `data-ga-event` e `data-ga-*` em qualquer elemento, o que já serve aos botões de WhatsApp e de compartilhar das ondas 2 e 3. Na Onda 1, o único evento ativo é `language_switch` (de, para, página).
- **Configuração:** `src/config.ts` reúne `SITE_URL`, `GA_ID` e `WHATSAPP_NUMBER`, que são dados públicos.
- **CI:** `.github/workflows/deploy.yml`. Em push na `novo-site` ou na `main`, roda `npm ci`, `npm test`, `astro check` e `astro build`. O job de deploy só roda na `main` e só passa a valer depois do merge de 27/10. Inclui também `dependabot.yml` para npm e GitHub Actions.
- **Skill `publicar-artigo`:** `.claude/skills/publicar-artigo/SKILL.md`, com template de frontmatter, mapa de categorias do vault, glossário de tradução, checklist, `astro check` e `npm test` antes do commit, e commit e push **na branch atual**. Até 27/10, a skill recusa push na `main`.

### Componentes a construir

| Área | Arquivos principais |
|---|---|
| Fundação | `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/config.ts`, `public/*` |
| i18n | `src/i18n/ui.ts` (dicionário + `t()`), `src/i18n/routes.ts`, `src/i18n/categories.ts` |
| Conteúdo | `src/content.config.ts` (articles, talks, companies, services), `src/lib/articles.ts` (validação, slug, ordenação, tempo de leitura, plataforma de origem) |
| SEO | `src/lib/seo.ts`, `src/components/Seo.astro` |
| Layout | `src/layouts/BaseLayout.astro`, `src/layouts/ArticleLayout.astro`, `src/components/Header.astro`, `Footer.astro`, `LanguageSwitcher.astro`, `ArticleCard.astro`, `src/styles/global.css` |
| Páginas | `src/pages/index.astro`, `en/index.astro` (home provisória), `artigos/index.astro`, `artigos/[slug].astro`, `artigos/categoria/[category].astro`, `rss.xml.ts` e os equivalentes em `en/` |
| Analytics | `src/components/Analytics.astro`, `src/lib/analytics.ts` |
| CI | `.github/workflows/deploy.yml`, `.github/dependabot.yml` |
| Publicação | `.claude/skills/publicar-artigo/SKILL.md`, 3 pares de artigos reais em `src/content/articles/` |

### Ordem de implementação e justificativa

1. **Fundação.** Sem projeto Astro e sem Vitest, nada pode ser testado nem construído.
2. **i18n e conteúdo** (passo 3). O contrato do schema e das rotas é dependência crítica dos passos 4 e 5 no plano.
3. **Blog e SEO** (passo 4). Usa schema, rotas e dicionário.
4. **Analytics** (passo 6). Depende do layout base e do seletor de idioma.
5. **CI.** Entra depois que `test`, `check` e `build` existem localmente.
6. **Skill + 3 artigos reais** (passo 5). Por último porque precisa do schema estável e do `astro check`, e é a **menor entrega com valor**: publicar pela skill e ver o artigo nos dois idiomas.

### Estratégia de testes

O projeto não tem testes; esta ordem introduz o **Vitest 5**, conforme a convenção do `tech.md`: descrições em português, estrutura AAA, `*.test.ts` ao lado do código.

- **Unitários** (`src/**/*.test.ts`): helpers de rotas e categorias, dicionário, `validateArticles`, tempo de leitura, plataforma de origem, `buildSeo`, atributos de evento do GA.
- **De build** (`tests/build.test.ts`): rodam o `astro build` contra artigos de **fixture** em `tests/fixtures/articles/`, selecionados pela variável `ARTICLES_DIR` e gerados em `.test-dist/`. Conferem URLs geradas, `hreflang` e canonical absolutos, seletor de idioma apontando para o par, RSS nos dois idiomas, sitemap, rascunho fora do ar, categoria vazia sem página e GA presente no build. As fixtures nunca entram no site real.
- `astro check` e `astro build` continuam como portões finais, também no CI.

### Decisões técnicas e trade-offs

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| Validação do par em `validateArticles()` no `getStaticPaths` | Integração/hook de build | Mais simples, nativa, testável como função pura; a falha derruba o build do mesmo jeito |
| `translationKey` explícito no frontmatter | Inferir o par pelo slug | Slugs diferem por idioma; a chave também serve para a skill reconhecer republicação |
| Slug = nome do arquivo | Campo `slug` no frontmatter | Uma única fonte de verdade; impossível divergir |
| **Sitemap sem alternâncias de idioma** (`hreflang` só no HTML) | `i18n` do `@astrojs/sitemap` | O recurso do plugin só funciona quando o caminho é igual nos dois idiomas, e o nosso contrato usa caminhos traduzidos. O `hreflang` no HTML é suficiente para o Google. **Desvio do plano registrado** |
| Guarda de HTML perigoso no build (`<script>`, `<iframe>` fora de `youtube-nocookie.com`) | `rehype-sanitize` | Zero dependência; complementa a sanitização da skill (defesa em profundidade) |
| `description` com no máximo **160 caracteres** | 200+ | Cabe na prévia do WhatsApp e do LinkedIn e no snippet do Google |
| TypeScript **6.x** | TypeScript 7.0 (último) | `@astrojs/check` 0.9.10 aceita só `^5 \|\| ^6` |
| Node **24 LTS** no CI (`engines: >=22.12`) | Fixar 25 | Local roda Node 25.2; o CI segue o plano |
| Actions fixadas por **SHA de commit** com comentário da versão | Tag de versão | Tag pode ser movida; SHA é imutável |
| GA só no build de produção | GA também no dev | Não poluir o baseline com acessos locais |
| Skill roda `npm run build` local além do `astro check` | Só `astro check` (plano) | O par PT/EN e a guarda de HTML rodam no `getStaticPaths`, que o `astro check` não executa; o build local leva ~1 s. **Desvio do plano registrado** |
| Home provisória mínima (PT/EN) | Esperar a Onda 2 | `x-default`, seletor de idioma e link do header precisam de destino |

### Correção no plano

A tabela de validações do plano (linha 59) ainda lista as categorias antigas ("AI, Desenvolvimento de Software, Gestão, Liderança, Hobbies"). Esta ordem segue a **decisão posterior e irreversível** (linhas 133–142): as 6 categorias alinhadas ao vault.

### Decisões do autor (irreversíveis, entram nas URLs)

**Slugs das categorias — aprovados em 01/10/2026 (versão curta):**

| Chave | PT `/artigos/categoria/…/` | EN `/en/articles/category/…/` | Nome no site (PT / EN) | Nome no vault |
|---|---|---|---|---|
| `gestao` | `gestao` | `management` | Gestão e Design Organizacional / Management & Organizational Design | Gestão e Design Organizacional |
| `coerencia` | `coerencia-cognitiva` | `cognitive-coherence` | Coerência Cognitiva e P-O Fit / Cognitive Coherence & P-O Fit | Coerência Cognitiva e P-O Fit |
| `ai` | `ai` | `ai` | AI, Trabalho e Organizações / AI, Work & Organizations | IA, Trabalho e Organizações |
| `software` | `software` | `software` | Desenvolvimento de Software / Software Development | Agilidade e Desenvolvimento de Software |
| `educacao` | `educacao` | `education` | Educação / Education | Educação e Aprendizagem |
| `hobbies` | `hobbies` | `hobbies` | Hobbies / Hobbies | História, Simbolismo e Caminho de Santiago |

### Considerações de segurança

- **Vault:** a skill lê **somente** a nota indicada pelo nome, extrai **somente** `## Conteúdo original` e recusa notas em `_rascunhos/` sem pedido explícito. O checklist exige conferir que nenhum título de seção editorial ("Classificação", "Ideias centrais", "Síntese estruturada" etc.) chegou ao arquivo.
- **HTML no Markdown:** a skill remove `<script>` e iframes não permitidos, e o build falha se algum escapar (`validateArticles`).
- **Workflow:** permissões mínimas por job (`contents: read`; `pages: write` e `id-token: write` só no deploy), actions por SHA, `concurrency` cancelando deploys obsoletos, nenhum segredo manual (deploy por OIDC).
- **Supply chain:** `package-lock.json` versionado, `npm ci` no CI, Dependabot semanal para npm e Actions, `npm audit` na revisão. Só dependências previstas no plano, mais Vitest como dev.
- **Segredos:** nenhum no repositório. GA4 e WhatsApp são públicos. A skill confere `git diff --cached` antes do commit.
- **Links externos:** `target="_blank" rel="noopener"` (inclusive o link para `originalUrl`).
- **Terceiros:** apenas o gtag do GA4 nesta onda. LGPD é risco aceito e não será reaberto.
- **Push acidental na `main`** antes de 27/10 publicaria fontes do Astro junto com o site antigo. A skill bloqueia esse caso.

### Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| **Obsidian MCP desconectado** (`mcp-tools-istefox` falhou nesta sessão) | Bloqueia o teste real da skill (passo 5) | Abrir o Obsidian com o plugin ativo antes do squad de Publicação; se persistir, a skill aceita ler o arquivo do vault pelo caminho local, com as mesmas regras de extração |
| Atraso de ~3 dias na Onda 1 | Aperta a Onda 2 | Escopo da Onda 1 restrito ao essencial; visual fica para a Onda 2 |
| Tradução sem revisão humana | Qualidade em EN | Glossário na skill; Matheus revisa os 3 artigos de teste |
| Artigos de fixture vazarem para o site | Conteúdo falso no ar | Fixtures só em `tests/`, carregadas apenas com `ARTICLES_DIR`; teste de build confirma que o build padrão não as inclui |

## Tasks

> Todo o código abaixo foi validado num protótipo em 01/10/2026 (Astro 7.3.5, Vitest 5.0.3, TypeScript 6.0.3): 65 testes passando, `astro check` com 0 erros e build falhando com mensagem clara quando falta o par de idioma.

> **Convenção TDD:** em cada squad, os arquivos `*.test.ts` são escritos e executados primeiro (devem falhar por módulo inexistente ou asserção); depois vem a implementação.

### Squad: Fundação
**Agent:** coder-frontend

- [ ] **Task 1: Projeto Astro, dependências e ferramentas**
  - Files: `package.json`, `package-lock.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/config.ts`, `src/env.d.ts`
  - [ ] Criar `package.json`:

    ```json
    {
      "name": "matheushaddad-site",
      "private": true,
      "type": "module",
      "engines": {
        "node": ">=22.12.0"
      },
      "scripts": {
        "dev": "astro dev",
        "build": "astro build",
        "preview": "astro preview",
        "check": "astro check",
        "test": "vitest run"
      }
    }
    ```

  - [ ] Instalar as versões exatas consultadas em 01/10/2026:

    ```bash
    npm install astro@7.3.5 @astrojs/sitemap@3.7.4 @astrojs/rss@4.0.19 sharp@^0.35.4
    npm install -D @astrojs/check@0.9.10 typescript@^6.0.3 vitest@5.0.3
    ```

  - [ ] Criar `astro.config.mjs`:

    ```js
    // @ts-check
    import { defineConfig } from 'astro/config';
    import sitemap from '@astrojs/sitemap';
    import { SITE_URL } from './src/config.ts';

    export default defineConfig({
      site: SITE_URL,
      trailingSlash: 'always',
      build: { format: 'directory' },
      i18n: {
        defaultLocale: 'pt',
        locales: ['pt', 'en'],
        routing: { prefixDefaultLocale: false },
      },
      integrations: [sitemap()],
    });
    ```

  - [ ] Criar `tsconfig.json`:

    ```json
    {
      "extends": "astro/tsconfigs/strict",
      "include": [".astro/types.d.ts", "**/*"],
      "exclude": ["dist", ".test-dist", "assets", "js", "specifications"]
    }
    ```

  - [ ] Criar `vitest.config.ts`:

    ```ts
    import { defineConfig } from 'vitest/config';

    export default defineConfig({
      test: {
        include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
      },
    });
    ```

  - [ ] Criar `src/config.ts`:

    ```ts
    export const SITE_URL = 'https://matheushaddad.com';
    export const SITE_NAME = 'Matheus Haddad';
    export const GA_ID = 'G-CPNE8N9WS3';
    export const WHATSAPP_NUMBER = '5535988867870';
    export const DEFAULT_OG_IMAGE = '/og-default.png';
    ```

  - [ ] Criar `src/env.d.ts`:

    ```ts
    interface Window {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    }
    ```

  - [ ] Substituir o `.gitignore` (a linha `.claude` ignorava a pasta inteira e impediria versionar a skill `publicar-artigo`; agora só a configuração local fica fora):

    ```gitignore
    /specifications
    .DS_Store
    .claude/settings.local.json
    node_modules/
    dist/
    .test-dist/
    .astro/
    ```

  - [ ] Verificar — rodar `npx astro --version`, esperado: `astro  v7.3.5`; rodar `npm ls --depth=0`, esperado: as 7 dependências acima sem `UNMET` nem `invalid`.

- [ ] **Task 2: Arquivos públicos e pastas de conteúdo**
  - Files: `public/CNAME`, `public/favicon.ico`, `public/feedback-canvas/**`, `public/og-default.png`, `src/content/**/.gitkeep`
  - [ ] Copiar (sem mover; o site antigo segue intacto até 27/10):

    ```bash
    mkdir -p public/feedback-canvas
    cp CNAME favicon.ico public/
    cp -R feedback-canvas/. public/feedback-canvas/
    ```

  - [ ] Gerar a imagem de prévia padrão provisória (1200×630; substituída pelo gerador na Onda 2):

    ```bash
    node -e '
    const sharp = require("sharp");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#ffffff"/><text x="80" y="340" font-family="Georgia, serif" font-size="88" font-weight="600" fill="#111111">Matheus Haddad</text><text x="84" y="410" font-family="Helvetica, Arial, sans-serif" font-size="32" fill="#555555">Negócios, tecnologia e pessoas</text></svg>`;
    sharp(Buffer.from(svg)).png().toFile("public/og-default.png").then((info) => console.log(info.width, info.height));
    '
    ```

  - [ ] Criar as pastas das coleções (evita avisos do glob loader):

    ```bash
    mkdir -p src/content/articles/pt src/content/articles/en src/content/talks src/content/companies src/content/services/pt src/content/services/en
    touch src/content/articles/pt/.gitkeep src/content/articles/en/.gitkeep src/content/talks/.gitkeep src/content/companies/.gitkeep src/content/services/pt/.gitkeep src/content/services/en/.gitkeep
    ```

  - [ ] Verificar — o comando do `sharp` imprime `1200 630`; rodar `cat public/CNAME`, esperado: `matheushaddad.com`; rodar `ls public/feedback-canvas`, esperado: `Feedback-Canvas-V1.pdf  Feedback-Canvas-V2.pdf  Feedback-Canvas-V3.pdf  README.txt  en`.

### Squad: i18n e Conteúdo
**Agent:** coder-frontend

- [ ] **Task 3: Dicionário de interface PT/EN**
  - Files: `src/i18n/ui.test.ts`, `src/i18n/ui.ts`
  - [ ] Criar `src/i18n/ui.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { formatDate, otherLang, t, ui } from './ui';

    describe('dicionário de interface', () => {
      it('deve ter as mesmas chaves quando compara português e inglês', () => {
        // Arrange
        const ptKeys = Object.keys(ui.pt).sort();

        // Act
        const enKeys = Object.keys(ui.en).sort();

        // Assert
        expect(enKeys).toEqual(ptKeys);
      });

      it('deve ter todos os textos preenchidos quando percorre os dois idiomas', () => {
        // Arrange
        const values = [...Object.values(ui.pt), ...Object.values(ui.en)];

        // Act
        const empty = values.filter((value) => value.trim() === '');

        // Assert
        expect(empty).toEqual([]);
      });

      it('deve substituir variáveis quando elas são informadas', () => {
        // Arrange
        const vars = { minutes: 7 };

        // Act
        const text = t('pt', 'article.readingTime', vars);

        // Assert
        expect(text).toBe('7 min de leitura');
      });

      it('deve manter o marcador quando a variável não é informada', () => {
        // Arrange
        const vars = {};

        // Act
        const text = t('en', 'article.readingTime', vars);

        // Assert
        expect(text).toBe('{minutes} min read');
      });
    });

    describe('otherLang', () => {
      it('deve devolver o outro idioma quando recebe pt ou en', () => {
        // Arrange
        const langs = ['pt', 'en'] as const;

        // Act
        const result = langs.map(otherLang);

        // Assert
        expect(result).toEqual(['en', 'pt']);
      });
    });

    describe('formatDate', () => {
      it('deve formatar a data por extenso sem deslocar o dia quando o fuso local é diferente de UTC', () => {
        // Arrange
        const date = new Date('2026-08-25');

        // Act
        const pt = formatDate('pt', date);
        const en = formatDate('en', date);

        // Assert
        expect(pt).toBe('25 de agosto de 2026');
        expect(en).toBe('August 25, 2026');
      });
    });
    ```

  - [ ] Criar `src/i18n/ui.ts`:

    ```ts
    export const languages = ['pt', 'en'] as const;
    export type Lang = (typeof languages)[number];
    export const defaultLang: Lang = 'pt';

    export const htmlLang: Record<Lang, string> = { pt: 'pt-BR', en: 'en' };
    export const ogLocale: Record<Lang, string> = { pt: 'pt_BR', en: 'en_US' };

    const pt = {
      'site.description':
        'Negócios, tecnologia e pessoas: artigos de Matheus Haddad sobre gestão, liderança, AI e desenvolvimento de software.',
      'skip.toContent': 'Pular para o conteúdo',
      'nav.label': 'Navegação principal',
      'nav.articles': 'Artigos',
      'lang.switch': 'English',
      'lang.switchLabel': 'Read this page in English',
      'home.title': 'Matheus Haddad',
      'home.intro':
        'Empresário, consultor e palestrante. Escrevo sobre como organizações crescem na era da AI.',
      'home.cta': 'Ler os artigos',
      'articles.title': 'Artigos',
      'articles.description':
        'Artigos de Matheus Haddad sobre gestão, liderança, AI e desenvolvimento de software.',
      'articles.filterLabel': 'Filtrar por tema',
      'articles.all': 'Todos',
      'articles.empty': 'Ainda não há artigos publicados.',
      'category.title': 'Artigos sobre {category}',
      'category.description': 'Artigos de Matheus Haddad sobre {category}.',
      'article.readingTime': '{minutes} min de leitura',
      'article.updated': 'Atualizado em {date}',
      'article.originallyPublished': 'Publicado originalmente no {platform} em {date}',
      'footer.rss': 'RSS',
      'footer.rights': '© {year} Matheus Haddad',
    } as const;

    export type UIKey = keyof typeof pt;

    const en: Record<UIKey, string> = {
      'site.description':
        'Business, technology and people: articles by Matheus Haddad on management, leadership, AI and software development.',
      'skip.toContent': 'Skip to content',
      'nav.label': 'Main navigation',
      'nav.articles': 'Articles',
      'lang.switch': 'Português',
      'lang.switchLabel': 'Ler esta página em português',
      'home.title': 'Matheus Haddad',
      'home.intro':
        'Entrepreneur, consultant and speaker. I write about how organizations grow in the age of AI.',
      'home.cta': 'Read the articles',
      'articles.title': 'Articles',
      'articles.description':
        'Articles by Matheus Haddad on management, leadership, AI and software development.',
      'articles.filterLabel': 'Filter by topic',
      'articles.all': 'All',
      'articles.empty': 'No articles published yet.',
      'category.title': 'Articles on {category}',
      'category.description': 'Articles by Matheus Haddad on {category}.',
      'article.readingTime': '{minutes} min read',
      'article.updated': 'Updated on {date}',
      'article.originallyPublished': 'Originally published on {platform} on {date}',
      'footer.rss': 'RSS',
      'footer.rights': '© {year} Matheus Haddad',
    };

    export const ui: Record<Lang, Record<UIKey, string>> = { pt, en };

    export function t(lang: Lang, key: UIKey, vars: Record<string, string | number> = {}): string {
      return ui[lang][key].replace(/\{(\w+)\}/g, (match, name: string) =>
        name in vars ? String(vars[name]) : match,
      );
    }

    export function otherLang(lang: Lang): Lang {
      return lang === 'pt' ? 'en' : 'pt';
    }

    export function formatDate(lang: Lang, date: Date): string {
      return new Intl.DateTimeFormat(htmlLang[lang], {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date);
    }
    ```

  - [ ] Verificar — rodar `npx vitest run src/i18n/ui.test.ts`, esperado: `Tests  6 passed (6)`.

- [ ] **Task 4: Categorias com slugs curtos aprovados**
  - Files: `src/i18n/categories.test.ts`, `src/i18n/categories.ts`
  - [ ] Criar `src/i18n/categories.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { categories, categoryFromSlug, categoryKeys } from './categories';

    describe('categorias', () => {
      it('deve ter as 6 categorias do vault na ordem de exibição quando listadas', () => {
        // Arrange
        const expected = ['gestao', 'coerencia', 'ai', 'software', 'educacao', 'hobbies'];

        // Act
        const keys = [...categoryKeys];

        // Assert
        expect(keys).toEqual(expected);
      });

      it('deve usar os slugs curtos aprovados em 01/10/2026 quando monta URLs', () => {
        // Arrange
        const expected = {
          gestao: { pt: 'gestao', en: 'management' },
          coerencia: { pt: 'coerencia-cognitiva', en: 'cognitive-coherence' },
          ai: { pt: 'ai', en: 'ai' },
          software: { pt: 'software', en: 'software' },
          educacao: { pt: 'educacao', en: 'education' },
          hobbies: { pt: 'hobbies', en: 'hobbies' },
        };

        // Act
        const slugs = Object.fromEntries(categoryKeys.map((key) => [key, categories[key].slug]));

        // Assert
        expect(slugs).toEqual(expected);
      });

      it('deve ter slugs únicos quando comparados no mesmo idioma', () => {
        // Arrange
        const all = Object.values(categories);

        // Act
        const ptSlugs = new Set(all.map((category) => category.slug.pt));
        const enSlugs = new Set(all.map((category) => category.slug.en));

        // Assert
        expect(ptSlugs.size).toBe(all.length);
        expect(enSlugs.size).toBe(all.length);
      });

      it('deve encontrar a categoria quando o slug é do idioma informado', () => {
        // Arrange
        const slug = 'management';

        // Act
        const category = categoryFromSlug('en', slug);

        // Assert
        expect(category?.key).toBe('gestao');
      });

      it('deve não encontrar categoria quando o slug é de outro idioma', () => {
        // Arrange
        const slug = 'gestao';

        // Act
        const category = categoryFromSlug('en', slug);

        // Assert
        expect(category).toBeUndefined();
      });
    });
    ```

  - [ ] Criar `src/i18n/categories.ts`:

    ```ts
    import type { Lang } from './ui';

    export const categoryKeys = ['gestao', 'coerencia', 'ai', 'software', 'educacao', 'hobbies'] as const;
    export type CategoryKey = (typeof categoryKeys)[number];

    export interface Category {
      key: CategoryKey;
      name: Record<Lang, string>;
      slug: Record<Lang, string>;
      vaultName: string;
    }

    // Slugs entram nas URLs: nunca mudar depois de publicados.
    export const categories: Record<CategoryKey, Category> = {
      gestao: {
        key: 'gestao',
        name: { pt: 'Gestão e Design Organizacional', en: 'Management & Organizational Design' },
        slug: { pt: 'gestao', en: 'management' },
        vaultName: 'Gestão e Design Organizacional',
      },
      coerencia: {
        key: 'coerencia',
        name: { pt: 'Coerência Cognitiva e P-O Fit', en: 'Cognitive Coherence & P-O Fit' },
        slug: { pt: 'coerencia-cognitiva', en: 'cognitive-coherence' },
        vaultName: 'Coerência Cognitiva e P-O Fit',
      },
      ai: {
        key: 'ai',
        name: { pt: 'AI, Trabalho e Organizações', en: 'AI, Work & Organizations' },
        slug: { pt: 'ai', en: 'ai' },
        vaultName: 'IA, Trabalho e Organizações',
      },
      software: {
        key: 'software',
        name: { pt: 'Desenvolvimento de Software', en: 'Software Development' },
        slug: { pt: 'software', en: 'software' },
        vaultName: 'Agilidade e Desenvolvimento de Software',
      },
      educacao: {
        key: 'educacao',
        name: { pt: 'Educação', en: 'Education' },
        slug: { pt: 'educacao', en: 'education' },
        vaultName: 'Educação e Aprendizagem',
      },
      hobbies: {
        key: 'hobbies',
        name: { pt: 'Hobbies', en: 'Hobbies' },
        slug: { pt: 'hobbies', en: 'hobbies' },
        vaultName: 'História, Simbolismo e Caminho de Santiago',
      },
    };

    export function categoryFromSlug(lang: Lang, slug: string): Category | undefined {
      return Object.values(categories).find((category) => category.slug[lang] === slug);
    }
    ```

  - [ ] Verificar — rodar `npx vitest run src/i18n/categories.test.ts`, esperado: `Tests  5 passed (5)`.

- [ ] **Task 5: Mapa de rotas (contrato de URLs)**
  - Files: `src/i18n/routes.test.ts`, `src/i18n/routes.ts`
  - [ ] Criar `src/i18n/routes.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { absoluteUrl, articlePath, categoryPath, routePath } from './routes';

    describe('mapa de rotas', () => {
      it('deve seguir o contrato de URLs do plano quando consultado por chave e idioma', () => {
        // Arrange
        const expected = [
          ['/', '/en/'],
          ['/sobre/', '/en/about/'],
          ['/servicos/', '/en/services/'],
          ['/consultoria/', '/en/consulting/'],
          ['/mentoria/', '/en/mentoring/'],
          ['/palestras/', '/en/speaking/'],
          ['/empresas/', '/en/companies/'],
          ['/livros/', '/en/books/'],
          ['/artigos/', '/en/articles/'],
          ['/rss.xml', '/en/rss.xml'],
        ];
        const keys = ['home', 'about', 'services', 'consulting', 'mentoring', 'speaking', 'companies', 'books', 'articles', 'rss'] as const;

        // Act
        const paths = keys.map((key) => [routePath(key, 'pt'), routePath(key, 'en')]);

        // Assert
        expect(paths).toEqual(expected);
      });

      it('deve montar o caminho do artigo sem categoria nem data e com barra final quando recebe um slug', () => {
        // Arrange
        const slug = 'meu-artigo';

        // Act
        const pt = articlePath('pt', slug);
        const en = articlePath('en', 'my-article');

        // Assert
        expect(pt).toBe('/artigos/meu-artigo/');
        expect(en).toBe('/en/articles/my-article/');
      });

      it('deve usar o slug do idioma quando monta o caminho da categoria', () => {
        // Arrange
        const key = 'gestao';

        // Act
        const pt = categoryPath('pt', key);
        const en = categoryPath('en', key);

        // Assert
        expect(pt).toBe('/artigos/categoria/gestao/');
        expect(en).toBe('/en/articles/category/management/');
      });

      it('deve gerar URL absoluta no domínio do site quando recebe um caminho', () => {
        // Arrange
        const path = '/en/articles/';

        // Act
        const url = absoluteUrl(path);

        // Assert
        expect(url).toBe('https://matheushaddad.com/en/articles/');
      });
    });
    ```

  - [ ] Criar `src/i18n/routes.ts`:

    ```ts
    import { SITE_URL } from '../config';
    import { categories, type CategoryKey } from './categories';
    import type { Lang } from './ui';

    // Contrato de URLs do plano: nunca mudar caminhos já publicados.
    export const routes = {
      home: { pt: '/', en: '/en/' },
      about: { pt: '/sobre/', en: '/en/about/' },
      services: { pt: '/servicos/', en: '/en/services/' },
      consulting: { pt: '/consultoria/', en: '/en/consulting/' },
      mentoring: { pt: '/mentoria/', en: '/en/mentoring/' },
      speaking: { pt: '/palestras/', en: '/en/speaking/' },
      companies: { pt: '/empresas/', en: '/en/companies/' },
      books: { pt: '/livros/', en: '/en/books/' },
      articles: { pt: '/artigos/', en: '/en/articles/' },
      rss: { pt: '/rss.xml', en: '/en/rss.xml' },
    } as const satisfies Record<string, Record<Lang, string>>;

    export type RouteKey = keyof typeof routes;

    export function routePath(key: RouteKey, lang: Lang): string {
      return routes[key][lang];
    }

    export function articlePath(lang: Lang, slug: string): string {
      return `${routes.articles[lang]}${slug}/`;
    }

    export function categoryPath(lang: Lang, key: CategoryKey): string {
      const segment = lang === 'pt' ? 'categoria' : 'category';
      return `${routes.articles[lang]}${segment}/${categories[key].slug[lang]}/`;
    }

    export function absoluteUrl(path: string): string {
      return new URL(path, SITE_URL).href;
    }
    ```

  - [ ] Verificar — rodar `npx vitest run src/i18n/routes.test.ts`, esperado: `Tests  4 passed (4)`.

- [ ] **Task 6: Regras e helpers de artigos (par PT/EN, slugs, HTML perigoso, ordenação, tempo de leitura, rotas)**
  - Files: `src/lib/articles.test.ts`, `src/lib/articles.ts`
  - [ ] Criar `src/lib/articles.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import {
      ArticleValidationError,
      articleSlug,
      articleStaticPaths,
      categoriesInUse,
      categoryStaticPaths,
      findTranslation,
      originalPlatform,
      publishedArticles,
      readingTime,
      unsafeHtmlProblems,
      validateArticles,
      type ArticleData,
      type ArticleEntry,
    } from './articles';

    function entry(id: string, data: Partial<ArticleData> = {}, body = 'Texto.'): ArticleEntry {
      const lang = (id.split('/')[0] === 'en' ? 'en' : 'pt') as ArticleData['lang'];
      return {
        id,
        body,
        data: {
          title: id,
          lang,
          translationKey: 'chave',
          category: 'gestao',
          pubDate: new Date('2026-09-01'),
          draft: false,
          ...data,
        },
      };
    }

    function problemsOf(entries: ArticleEntry[]): string[] {
      try {
        validateArticles(entries);
        return [];
      } catch (error) {
        if (error instanceof ArticleValidationError) return error.problems;
        throw error;
      }
    }

    describe('articleSlug', () => {
      it('deve usar o nome do arquivo sem a pasta quando calcula o slug', () => {
        // Arrange
        const article = entry('pt/meu-artigo');

        // Act
        const slug = articleSlug(article);

        // Assert
        expect(slug).toBe('meu-artigo');
      });
    });

    describe('validateArticles', () => {
      it('deve aceitar quando o par PT/EN é válido', () => {
        // Arrange
        const entries = [entry('pt/meu-artigo'), entry('en/my-article')];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toEqual([]);
      });

      it('deve falhar quando falta a versão em inglês', () => {
        // Arrange
        const entries = [entry('pt/meu-artigo')];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toEqual(['translationKey "chave": falta a versão em en']);
      });

      it('deve falhar quando a pasta não bate com o idioma declarado', () => {
        // Arrange
        const entries = [entry('pt/meu-artigo'), entry('pt/my-article', { lang: 'en' })];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toContain('pt/my-article: está na pasta "pt" mas declara lang "en"');
      });

      it('deve falhar quando a mesma translationKey se repete no mesmo idioma', () => {
        // Arrange
        const entries = [entry('pt/um'), entry('pt/dois'), entry('en/one')];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toContain('pt/dois: translationKey "chave" repetida em pt (também em pt/um)');
      });

      it('deve falhar quando o slug está fora do padrão kebab-case', () => {
        // Arrange
        const entries = [entry('pt/Meu_Artigo'), entry('en/my-article')];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toContain('pt/Meu_Artigo: slug "Meu_Artigo" deve ser kebab-case, sem acentos e sem subpastas');
      });

      it('deve falhar quando o artigo está em subpasta', () => {
        // Arrange
        const entries = [entry('pt/2026/meu-artigo'), entry('en/my-article')];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toContain('pt/2026/meu-artigo: slug "2026/meu-artigo" deve ser kebab-case, sem acentos e sem subpastas');
      });

      it('deve falhar quando o par diverge no campo draft', () => {
        // Arrange
        const entries = [entry('pt/meu-artigo', { draft: true }), entry('en/my-article')];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toEqual(['translationKey "chave": campo draft diferente entre PT e EN']);
      });

      it('deve falhar quando o par diverge na categoria', () => {
        // Arrange
        const entries = [entry('pt/meu-artigo', { category: 'ai' }), entry('en/my-article')];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toEqual(['translationKey "chave": categoria diferente entre PT e EN']);
      });

      it('deve falhar quando o corpo tem HTML perigoso', () => {
        // Arrange
        const entries = [entry('pt/meu-artigo', {}, '<script>alert(1)</script>'), entry('en/my-article')];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toEqual(['pt/meu-artigo: contém <script>']);
      });

      it('deve listar todos os problemas quando há mais de um', () => {
        // Arrange
        const entries = [entry('pt/um', { translationKey: 'a' }), entry('pt/dois', { translationKey: 'b' })];

        // Act
        const problems = problemsOf(entries);

        // Assert
        expect(problems).toHaveLength(2);
      });
    });

    describe('unsafeHtmlProblems', () => {
      it('deve aceitar quando o iframe é do youtube-nocookie', () => {
        // Arrange
        const body = '<iframe src="https://www.youtube-nocookie.com/embed/abc123"></iframe>';

        // Act
        const problems = unsafeHtmlProblems(body);

        // Assert
        expect(problems).toEqual([]);
      });

      it('deve rejeitar quando o iframe é de outro domínio, inclusive youtube.com', () => {
        // Arrange
        const body = '<iframe src="https://www.youtube.com/embed/abc123"></iframe><iframe></iframe>';

        // Act
        const problems = unsafeHtmlProblems(body);

        // Assert
        expect(problems).toEqual([
          'contém iframe não permitido (https://www.youtube.com/embed/abc123)',
          'contém iframe não permitido (sem src)',
        ]);
      });

      it('deve rejeitar script quando escrito em qualquer caixa', () => {
        // Arrange
        const body = 'Texto <SCRIPT src="x.js"></SCRIPT>';

        // Act
        const problems = unsafeHtmlProblems(body);

        // Assert
        expect(problems).toEqual(['contém <script>']);
      });
    });

    describe('publishedArticles', () => {
      it('deve filtrar pelo idioma, remover rascunhos e ordenar do mais recente quando há artigos misturados', () => {
        // Arrange
        const antigo = entry('pt/antigo', { pubDate: new Date('2025-01-01') });
        const novo = entry('pt/novo', { pubDate: new Date('2026-01-01') });
        const rascunho = entry('pt/rascunho', { draft: true });
        const ingles = entry('en/english');

        // Act
        const result = publishedArticles([antigo, rascunho, novo, ingles], 'pt');

        // Assert
        expect(result.map((article) => article.id)).toEqual(['pt/novo', 'pt/antigo']);
      });
    });

    describe('findTranslation', () => {
      it('deve encontrar o par no outro idioma quando a translationKey coincide', () => {
        // Arrange
        const pt = entry('pt/meu-artigo');
        const en = entry('en/my-article');
        const outro = entry('en/other', { translationKey: 'outra' });

        // Act
        const translation = findTranslation([pt, outro, en], pt);

        // Assert
        expect(translation?.id).toBe('en/my-article');
      });
    });

    describe('categoriesInUse', () => {
      it('deve listar só categorias com publicados no idioma, na ordem fixa e com contagem quando há rascunhos e outros idiomas', () => {
        // Arrange
        const entries = [
          entry('pt/a', { category: 'ai' }),
          entry('pt/b', { category: 'gestao' }),
          entry('pt/c', { category: 'ai' }),
          entry('pt/d', { category: 'educacao', draft: true }),
          entry('en/e', { category: 'hobbies' }),
        ];

        // Act
        const result = categoriesInUse(entries, 'pt');

        // Assert
        expect(result).toEqual([
          { key: 'gestao', count: 1 },
          { key: 'ai', count: 2 },
        ]);
      });
    });

    describe('readingTime', () => {
      it('deve arredondar para cima quando passa de um múltiplo de 200 palavras', () => {
        // Arrange
        const body = Array.from({ length: 401 }, () => 'palavra').join(' ');

        // Act
        const minutes = readingTime(body);

        // Assert
        expect(minutes).toBe(3);
      });

      it('deve retornar 1 minuto quando o texto é vazio', () => {
        // Arrange
        const body = '';

        // Act
        const minutes = readingTime(body);

        // Assert
        expect(minutes).toBe(1);
      });

      it('deve ignorar marcação Markdown, HTML e blocos de código quando conta palavras', () => {
        // Arrange
        const text = Array.from({ length: 199 }, () => 'palavra').join(' ');
        const code = Array.from({ length: 50 }, () => 'codigo').join(' ');
        const body = `## ${text}\n\n<span class="a b c d e">x</span>\n\n\`\`\`\n${code}\n\`\`\``;

        // Act
        const minutes = readingTime(body);

        // Assert
        expect(minutes).toBe(1);
      });
    });

    describe('originalPlatform', () => {
      it('deve reconhecer LinkedIn e Medium quando a URL é do domínio ou de subdomínio', () => {
        // Arrange
        const urls = [
          'https://www.linkedin.com/pulse/artigo',
          'https://medium.com/@matheus/artigo',
          'https://matheus.medium.com/artigo',
        ];

        // Act
        const platforms = urls.map(originalPlatform);

        // Assert
        expect(platforms).toEqual(['LinkedIn', 'Medium', 'Medium']);
      });

      it('deve ignorar quando o domínio é outro, inclusive parecido', () => {
        // Arrange
        const urls = ['https://exemplo.com/artigo', 'https://fakelinkedin.com/x', undefined];

        // Act
        const platforms = urls.map(originalPlatform);

        // Assert
        expect(platforms).toEqual([undefined, undefined, undefined]);
      });
    });

    describe('articleStaticPaths', () => {
      it('deve gerar uma rota por publicado com o par como prop quando há rascunhos', () => {
        // Arrange
        const pt = entry('pt/meu-artigo');
        const en = entry('en/my-article');
        const rascunhoPt = entry('pt/rascunho', { translationKey: 'r', draft: true });

        // Act
        const paths = articleStaticPaths([pt, en, rascunhoPt], 'pt');

        // Assert
        expect(paths).toEqual([{ params: { slug: 'meu-artigo' }, props: { article: pt, translation: en } }]);
      });
    });

    describe('categoryStaticPaths', () => {
      it('deve gerar rotas com o slug do idioma só quando a categoria tem publicados', () => {
        // Arrange
        const entries = [entry('en/a', { category: 'gestao' }), entry('en/b', { category: 'educacao', draft: true })];

        // Act
        const paths = categoryStaticPaths(entries, 'en');

        // Assert
        expect(paths).toEqual([{ params: { category: 'management' }, props: { categoryKey: 'gestao' } }]);
      });
    });
    ```

  - [ ] Criar `src/lib/articles.ts`:

    ````ts
    import { categories, categoryKeys, type CategoryKey } from '../i18n/categories';
    import { languages, type Lang } from '../i18n/ui';

    export const DESCRIPTION_MAX = 160;
    export const WORDS_PER_MINUTE = 200;

    const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    const ALLOWED_IFRAME_SRC = /^https:\/\/www\.youtube-nocookie\.com\/embed\//;

    export interface ArticleData {
      title: string;
      lang: Lang;
      translationKey: string;
      category: CategoryKey;
      pubDate: Date;
      draft: boolean;
    }

    export interface ArticleEntry<TData extends ArticleData = ArticleData> {
      id: string;
      body?: string;
      data: TData;
    }

    export class ArticleValidationError extends Error {
      constructor(readonly problems: string[]) {
        super(`Artigos inválidos:\n- ${problems.join('\n- ')}`);
        this.name = 'ArticleValidationError';
      }
    }

    export function articleSlug(entry: ArticleEntry): string {
      return entry.id.split('/').slice(1).join('/');
    }

    function folderLang(entry: ArticleEntry): string {
      return entry.id.split('/')[0] ?? '';
    }

    export function unsafeHtmlProblems(body: string): string[] {
      const problems: string[] = [];
      if (/<script\b/i.test(body)) problems.push('contém <script>');
      for (const match of body.matchAll(/<iframe\b[^>]*>/gi)) {
        const src = /\bsrc\s*=\s*["']([^"']*)["']/i.exec(match[0])?.[1] ?? '';
        if (!ALLOWED_IFRAME_SRC.test(src)) problems.push(`contém iframe não permitido (${src || 'sem src'})`);
      }
      return problems;
    }

    export function validateArticles(entries: ArticleEntry[]): void {
      const problems: string[] = [];
      const byKey = new Map<string, Partial<Record<Lang, ArticleEntry>>>();

      for (const entry of entries) {
        const slug = articleSlug(entry);
        const { lang, translationKey } = entry.data;

        if (folderLang(entry) !== lang) {
          problems.push(`${entry.id}: está na pasta "${folderLang(entry)}" mas declara lang "${lang}"`);
        }
        if (!SLUG_PATTERN.test(slug)) {
          problems.push(`${entry.id}: slug "${slug}" deve ser kebab-case, sem acentos e sem subpastas`);
        }
        for (const problem of unsafeHtmlProblems(entry.body ?? '')) {
          problems.push(`${entry.id}: ${problem}`);
        }

        const pair = byKey.get(translationKey) ?? {};
        const existing = pair[lang];
        if (existing) {
          problems.push(`${entry.id}: translationKey "${translationKey}" repetida em ${lang} (também em ${existing.id})`);
        } else {
          pair[lang] = entry;
        }
        byKey.set(translationKey, pair);
      }

      for (const [key, pair] of byKey) {
        const missing = languages.filter((lang) => !pair[lang]);
        if (missing.length > 0) {
          problems.push(`translationKey "${key}": falta a versão em ${missing.join(', ')}`);
          continue;
        }
        if (pair.pt?.data.draft !== pair.en?.data.draft) {
          problems.push(`translationKey "${key}": campo draft diferente entre PT e EN`);
        }
        if (pair.pt?.data.category !== pair.en?.data.category) {
          problems.push(`translationKey "${key}": categoria diferente entre PT e EN`);
        }
      }

      if (problems.length > 0) throw new ArticleValidationError(problems);
    }

    export function publishedArticles<T extends ArticleEntry>(entries: T[], lang: Lang): T[] {
      return entries
        .filter((entry) => entry.data.lang === lang && !entry.data.draft)
        .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
    }

    export function findTranslation<T extends ArticleEntry>(entries: T[], entry: T): T | undefined {
      return entries.find(
        (other) =>
          other.data.translationKey === entry.data.translationKey && other.data.lang !== entry.data.lang,
      );
    }

    export function categoriesInUse(entries: ArticleEntry[], lang: Lang): { key: CategoryKey; count: number }[] {
      const published = publishedArticles(entries, lang);
      return categoryKeys
        .map((key) => ({ key, count: published.filter((entry) => entry.data.category === key).length }))
        .filter(({ count }) => count > 0);
    }

    export function readingTime(body: string): number {
      const text = body
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[#>*_`~-]/g, ' ');
      const words = text.split(/\s+/).filter(Boolean).length;
      return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
    }

    export function originalPlatform(url: string | undefined): 'LinkedIn' | 'Medium' | undefined {
      if (!url) return undefined;
      const host = new URL(url).hostname;
      if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'LinkedIn';
      if (host === 'medium.com' || host.endsWith('.medium.com')) return 'Medium';
      return undefined;
    }

    export function articleStaticPaths<T extends ArticleEntry>(entries: T[], lang: Lang) {
      return publishedArticles(entries, lang).map((article) => ({
        params: { slug: articleSlug(article) },
        props: { article, translation: findTranslation(entries, article) },
      }));
    }

    export function categoryStaticPaths(entries: ArticleEntry[], lang: Lang) {
      return categoriesInUse(entries, lang).map(({ key }) => ({
        params: { category: categories[key].slug[lang] },
        props: { categoryKey: key },
      }));
    }
    ````

  - [ ] Verificar — rodar `npx vitest run src/lib/articles.test.ts`, esperado: `Tests  24 passed (24)`.

- [ ] **Task 7: Schemas das coleções e leitura validada dos artigos**
  - Files: `src/content.config.ts`, `src/lib/collections.ts`, `tests/content.test.ts`
  - [ ] Criar `tests/content.test.ts`:

    ```ts
    import { readdirSync, readFileSync } from 'node:fs';
    import { join } from 'node:path';
    import { describe, expect, it } from 'vitest';

    const CONTENT_DIR = 'src/content/articles';

    function markdownFiles(dir: string): string[] {
      return readdirSync(dir, { recursive: true, encoding: 'utf8' })
        .filter((file) => file.endsWith('.md'))
        .map((file) => join(dir, file));
    }

    describe('conteúdo real', () => {
      it('deve não conter fixtures quando lê o conteúdo real', () => {
        // Arrange
        const files = markdownFiles(CONTENT_DIR);

        // Act
        const fixtures = files.filter((file) => /translationKey:\s*fixture-/.test(readFileSync(file, 'utf8')));

        // Assert
        expect(fixtures).toEqual([]);
      });
    });
    ```

  - [ ] Criar `src/content.config.ts`:

    ```ts
    import { defineCollection } from 'astro:content';
    import { glob } from 'astro/loaders';
    import { z } from 'astro/zod';
    import { categoryKeys } from './i18n/categories';
    import { languages } from './i18n/ui';
    import { DESCRIPTION_MAX } from './lib/articles';

    // ARTICLES_DIR só é usado pelos testes de build (tests/fixtures/articles).
    const articlesBase = process.env.ARTICLES_DIR ?? './src/content/articles';

    const localized = z.object({ pt: z.string().min(1), en: z.string().min(1) });

    const articles = defineCollection({
      loader: glob({ pattern: '{pt,en}/**/*.md', base: articlesBase }),
      schema: ({ image }) =>
        z.object({
          title: z.string().min(1),
          description: z.string().min(1).max(DESCRIPTION_MAX),
          pubDate: z.coerce.date(),
          updatedDate: z.coerce.date().optional(),
          category: z.enum(categoryKeys),
          lang: z.enum(languages),
          translationKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          cover: image().optional(),
          coverAlt: z.string().optional(),
          service: z.enum(['consultoria', 'mentoria', 'palestras']).optional(),
          originalUrl: z.url().optional(),
          draft: z.boolean().default(false),
        }),
    });

    const talks = defineCollection({
      loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/talks' }),
      schema: z.object({
        title: z.string().min(1),
        description: localized.optional(),
        type: z.enum(['palestra', 'podcast', 'webinar', 'entrevista']),
        event: z.string().min(1),
        date: z.coerce.date().optional(),
        url: z.url(),
        youtubeId: z.string().optional(),
        lang: z.enum(languages),
      }),
    });

    const companies = defineCollection({
      loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/companies' }),
      schema: ({ image }) =>
        z.object({
          name: z.string().min(1),
          logo: image(),
          url: z.url(),
          role: localized,
          description: localized,
          order: z.number().int(),
        }),
    });

    const services = defineCollection({
      loader: glob({ pattern: '{pt,en}/**/*.md', base: './src/content/services' }),
      schema: z.object({
        key: z.enum(['consultoria', 'mentoria', 'palestras']),
        lang: z.enum(languages),
        title: z.string().min(1),
        description: z.string().min(1).max(DESCRIPTION_MAX),
        audience: z.string().min(1),
        whatsappMessage: z.string().min(1),
      }),
    });

    export const collections = { articles, talks, companies, services };
    ```

  - [ ] Criar `src/lib/collections.ts`:

    ```ts
    import { getCollection, type CollectionEntry } from 'astro:content';
    import { validateArticles } from './articles';

    export type Article = CollectionEntry<'articles'>;

    export async function getAllArticles(): Promise<Article[]> {
      const entries = await getCollection('articles');
      validateArticles(entries);
      return entries;
    }
    ```

  - [ ] Verificar — rodar `npx vitest run tests/content.test.ts`, esperado: `Tests  1 passed (1)`; rodar `npx astro sync`, esperado: `Synced content` sem erros (avisos de pasta vazia são aceitáveis).

### Squad: Analytics
**Agent:** coder-frontend

- [ ] **Task 8: Atributos e leitura de eventos do GA4**
  - Files: `src/lib/analytics.test.ts`, `src/lib/analytics.ts`
  - [ ] Criar `src/lib/analytics.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { gaEventAttrs, parseGaParams } from './analytics';

    describe('gaEventAttrs', () => {
      it('deve gerar os atributos data-ga-* com parâmetros em JSON quando recebe um evento', () => {
        // Arrange
        const params = { from: 'pt', to: 'en' };

        // Act
        const attrs = gaEventAttrs('language_switch', params);

        // Assert
        expect(attrs).toEqual({
          'data-ga-event': 'language_switch',
          'data-ga-params': '{"from":"pt","to":"en"}',
        });
      });
    });

    describe('parseGaParams', () => {
      it('deve ler os parâmetros quando o texto veio de gaEventAttrs', () => {
        // Arrange
        const raw = gaEventAttrs('share', { network: 'linkedin' })['data-ga-params'];

        // Act
        const params = parseGaParams(raw);

        // Assert
        expect(params).toEqual({ network: 'linkedin' });
      });

      it('deve devolver objeto vazio quando a entrada é ausente, inválida ou não é objeto', () => {
        // Arrange
        const inputs = [undefined, '', '{quebrado', '[1,2]', 'null', '"texto"'];

        // Act
        const results = inputs.map(parseGaParams);

        // Assert
        expect(results).toEqual([{}, {}, {}, {}, {}, {}]);
      });

      it('deve descartar valores quando eles não são texto', () => {
        // Arrange
        const raw = '{"ok":"sim","numero":1,"objeto":{}}';

        // Act
        const params = parseGaParams(raw);

        // Assert
        expect(params).toEqual({ ok: 'sim' });
      });
    });
    ```

  - [ ] Criar `src/lib/analytics.ts`:

    ```ts
    export type GaEventName = 'language_switch' | 'whatsapp_click' | 'share';
    export type GaParams = Record<string, string>;

    export function gaEventAttrs(name: GaEventName, params: GaParams = {}): Record<string, string> {
      return { 'data-ga-event': name, 'data-ga-params': JSON.stringify(params) };
    }

    export function parseGaParams(raw: string | undefined): GaParams {
      if (!raw) return {};
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
        return Object.fromEntries(
          Object.entries(parsed).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
        );
      } catch {
        return {};
      }
    }
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/analytics.test.ts`, esperado: `Tests  4 passed (4)`.

- [ ] **Task 9: Componente do GA4 (só no build de produção) com ouvinte de eventos**
  - Files: `src/components/Analytics.astro`
  - [ ] Criar `src/components/Analytics.astro`:

    ```astro
    ---
    import { GA_ID } from '../config';

    const enabled = import.meta.env.PROD;
    ---

    {
      enabled && (
        <>
          <script is:inline async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
          <script is:inline define:vars={{ GA_ID }}>
            window.dataLayer = window.dataLayer || [];
            window.gtag = function gtag() {
              window.dataLayer.push(arguments);
            };
            window.gtag('js', new Date());
            window.gtag('config', GA_ID);
          </script>
        </>
      )
    }

    <script>
      import { parseGaParams } from '../lib/analytics';

      document.addEventListener('click', (event) => {
        const target = event.target instanceof Element ? event.target : null;
        const element = target?.closest<HTMLElement>('[data-ga-event]');
        if (!element?.dataset.gaEvent || typeof window.gtag !== 'function') return;
        window.gtag('event', element.dataset.gaEvent, parseGaParams(element.dataset.gaParams));
      });
    </script>
    ```

  - [ ] Verificar — coberto pelo teste `analytics > deve carregar o GA4 quando o build é de produção` (Task 13).

### Squad: Blog e SEO
**Agent:** coder-frontend

- [ ] **Task 10: Metadados de SEO (canonical, hreflang, Open Graph, Twitter Card)**
  - Files: `src/lib/seo.test.ts`, `src/lib/seo.ts`, `src/components/Seo.astro`
  - [ ] Criar `src/lib/seo.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { buildSeo } from './seo';

    const base = {
      lang: 'pt' as const,
      title: 'Meu artigo',
      description: 'Resumo do artigo.',
      path: '/artigos/meu-artigo/',
      alternatePath: '/en/articles/my-article/',
    };

    function metaContent(seo: ReturnType<typeof buildSeo>, key: string): string | undefined {
      return seo.meta.find((tag) => tag.property === key || tag.name === key)?.content;
    }

    describe('buildSeo', () => {
      it('deve acrescentar o nome do site ao título quando o título não é o próprio nome do site', () => {
        // Arrange
        const home = { ...base, title: 'Matheus Haddad' };

        // Act
        const article = buildSeo(base);
        const homeSeo = buildSeo(home);

        // Assert
        expect(article.title).toBe('Meu artigo · Matheus Haddad');
        expect(homeSeo.title).toBe('Matheus Haddad');
      });

      it('deve gerar canonical e hreflang absolutos com x-default em português quando a página é em português', () => {
        // Arrange
        const input = base;

        // Act
        const seo = buildSeo(input);

        // Assert
        expect(seo.canonical).toBe('https://matheushaddad.com/artigos/meu-artigo/');
        expect(seo.alternates).toEqual([
          { hreflang: 'pt-BR', href: 'https://matheushaddad.com/artigos/meu-artigo/' },
          { hreflang: 'en', href: 'https://matheushaddad.com/en/articles/my-article/' },
          { hreflang: 'x-default', href: 'https://matheushaddad.com/artigos/meu-artigo/' },
        ]);
      });

      it('deve apontar x-default para o português quando a página é em inglês', () => {
        // Arrange
        const input = { ...base, lang: 'en' as const, path: '/en/articles/my-article/', alternatePath: '/artigos/meu-artigo/' };

        // Act
        const seo = buildSeo(input);

        // Assert
        expect(seo.canonical).toBe('https://matheushaddad.com/en/articles/my-article/');
        expect(seo.alternates.at(-1)).toEqual({ hreflang: 'x-default', href: 'https://matheushaddad.com/artigos/meu-artigo/' });
        expect(metaContent(seo, 'og:locale')).toBe('en_US');
        expect(metaContent(seo, 'og:locale:alternate')).toBe('pt_BR');
      });

      it('deve usar a imagem padrão 1200×630 com URL absoluta quando a página não define imagem', () => {
        // Arrange
        const input = base;

        // Act
        const seo = buildSeo(input);

        // Assert
        expect(metaContent(seo, 'og:image')).toBe('https://matheushaddad.com/og-default.png');
        expect(metaContent(seo, 'og:image:width')).toBe('1200');
        expect(metaContent(seo, 'og:image:height')).toBe('630');
        expect(metaContent(seo, 'twitter:card')).toBe('summary_large_image');
        expect(metaContent(seo, 'twitter:image')).toBe('https://matheushaddad.com/og-default.png');
      });

      it('deve incluir datas de publicação e atualização quando a página é um artigo', () => {
        // Arrange
        const input = {
          ...base,
          type: 'article' as const,
          publishedTime: new Date('2026-08-25'),
          modifiedTime: new Date('2026-09-10'),
        };

        // Act
        const seo = buildSeo(input);

        // Assert
        expect(metaContent(seo, 'og:type')).toBe('article');
        expect(metaContent(seo, 'article:published_time')).toBe('2026-08-25T00:00:00.000Z');
        expect(metaContent(seo, 'article:modified_time')).toBe('2026-09-10T00:00:00.000Z');
      });

      it('deve omitir datas de artigo quando a página é comum', () => {
        // Arrange
        const input = base;

        // Act
        const seo = buildSeo(input);

        // Assert
        expect(metaContent(seo, 'og:type')).toBe('website');
        expect(metaContent(seo, 'article:published_time')).toBeUndefined();
      });
    });
    ```

  - [ ] Criar `src/lib/seo.ts`:

    ```ts
    import { DEFAULT_OG_IMAGE, SITE_NAME } from '../config';
    import { absoluteUrl } from '../i18n/routes';
    import { htmlLang, ogLocale, otherLang, type Lang } from '../i18n/ui';

    export interface SeoInput {
      lang: Lang;
      title: string;
      description: string;
      path: string;
      alternatePath: string;
      type?: 'website' | 'article';
      image?: string;
      publishedTime?: Date;
      modifiedTime?: Date;
    }

    export interface SeoData {
      title: string;
      description: string;
      canonical: string;
      alternates: { hreflang: string; href: string }[];
      meta: { property?: string; name?: string; content: string }[];
    }

    export function buildSeo(input: SeoInput): SeoData {
      const title = input.title === SITE_NAME ? SITE_NAME : `${input.title} · ${SITE_NAME}`;
      const canonical = absoluteUrl(input.path);
      const alternate = absoluteUrl(input.alternatePath);
      const ptUrl = input.lang === 'pt' ? canonical : alternate;
      const enUrl = input.lang === 'en' ? canonical : alternate;
      const image = absoluteUrl(input.image ?? DEFAULT_OG_IMAGE);
      const type = input.type ?? 'website';

      const meta: SeoData['meta'] = [
        { name: 'description', content: input.description },
        { property: 'og:type', content: type },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:title', content: input.title },
        { property: 'og:description', content: input.description },
        { property: 'og:url', content: canonical },
        { property: 'og:image', content: image },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: ogLocale[input.lang] },
        { property: 'og:locale:alternate', content: ogLocale[otherLang(input.lang)] },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: input.title },
        { name: 'twitter:description', content: input.description },
        { name: 'twitter:image', content: image },
      ];
      if (input.publishedTime) {
        meta.push({ property: 'article:published_time', content: input.publishedTime.toISOString() });
      }
      if (input.modifiedTime) {
        meta.push({ property: 'article:modified_time', content: input.modifiedTime.toISOString() });
      }

      return {
        title,
        description: input.description,
        canonical,
        alternates: [
          { hreflang: htmlLang.pt, href: ptUrl },
          { hreflang: htmlLang.en, href: enUrl },
          { hreflang: 'x-default', href: ptUrl },
        ],
        meta,
      };
    }
    ```

  - [ ] Criar `src/components/Seo.astro`:

    ```astro
    ---
    import { buildSeo, type SeoInput } from '../lib/seo';

    type Props = SeoInput;

    const seo = buildSeo(Astro.props);
    ---

    <title>{seo.title}</title>
    <link rel="canonical" href={seo.canonical} />
    {seo.alternates.map((alternate) => <link rel="alternate" hreflang={alternate.hreflang} href={alternate.href} />)}
    {seo.meta.map((tag) => <meta property={tag.property} name={tag.name} content={tag.content} />)}
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/seo.test.ts`, esperado: `Tests  6 passed (6)`.

- [ ] **Task 11: Itens do RSS por idioma**
  - Files: `src/lib/feed.test.ts`, `src/lib/feed.ts`
  - [ ] Criar `src/lib/feed.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { feedItems } from './feed';

    function entry(id: string, lang: 'pt' | 'en', pubDate: string, draft = false) {
      return {
        id,
        data: {
          title: `Título ${id}`,
          description: `Resumo ${id}`,
          lang,
          translationKey: id,
          category: 'ai' as const,
          pubDate: new Date(pubDate),
          draft,
        },
      };
    }

    describe('feedItems', () => {
      it('deve gerar itens só do idioma, sem rascunhos e do mais recente ao mais antigo quando há artigos misturados', () => {
        // Arrange
        const entries = [
          entry('pt/antigo', 'pt', '2025-01-01'),
          entry('pt/novo', 'pt', '2026-01-01'),
          entry('pt/rascunho', 'pt', '2026-02-01', true),
          entry('en/english', 'en', '2026-03-01'),
        ];

        // Act
        const items = feedItems(entries, 'pt');

        // Assert
        expect(items.map((item) => item.link)).toEqual(['/artigos/novo/', '/artigos/antigo/']);
      });

      it('deve incluir título, resumo, data e categoria no idioma quando o artigo é publicado', () => {
        // Arrange
        const entries = [entry('en/english', 'en', '2026-03-01')];

        // Act
        const [item] = feedItems(entries, 'en');

        // Assert
        expect(item).toEqual({
          title: 'Título en/english',
          description: 'Resumo en/english',
          pubDate: new Date('2026-03-01'),
          link: '/en/articles/english/',
          categories: ['AI, Work & Organizations'],
        });
      });
    });
    ```

  - [ ] Criar `src/lib/feed.ts`:

    ```ts
    import { articlePath } from '../i18n/routes';
    import { categories } from '../i18n/categories';
    import type { Lang } from '../i18n/ui';
    import { articleSlug, publishedArticles, type ArticleEntry } from './articles';

    interface FeedData {
      description: string;
    }

    export function feedItems<T extends ArticleEntry<ArticleEntry['data'] & FeedData>>(entries: T[], lang: Lang) {
      return publishedArticles(entries, lang).map((article) => ({
        title: article.data.title,
        description: article.data.description,
        pubDate: article.data.pubDate,
        link: articlePath(lang, articleSlug(article)),
        categories: [categories[article.data.category].name[lang]],
      }));
    }
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/feed.test.ts`, esperado: `Tests  2 passed (2)`.

- [ ] **Task 12: Layout base neutro, header, footer, seletor de idioma e componentes de lista**
  - Files: `src/styles/global.css`, `src/components/LanguageSwitcher.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/components/ArticleCard.astro`, `src/components/ArticleList.astro`, `src/layouts/BaseLayout.astro`, `src/layouts/ArticleLayout.astro`
  - [ ] Criar `src/styles/global.css`:

    ```css
    /* Visual provisório e neutro da Onda 1. O design system entra na Onda 2. */
    :root {
      --font-body: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      --color-text: #111;
      --color-muted: #555;
      --color-background: #fff;
      --color-border: #ddd;
      --color-link: #1d4ed8;
      --space-s: 0.5rem;
      --space-m: 1rem;
      --space-l: 2rem;
      --width-content: 1200px;
      --width-reading: 680px;
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      font-family: var(--font-body);
      line-height: 1.6;
      color: var(--color-text);
      background: var(--color-background);
    }

    a {
      color: var(--color-link);
    }

    img {
      max-width: 100%;
      height: auto;
    }

    .container {
      max-width: var(--width-content);
      margin: 0 auto;
      padding: 0 var(--space-m);
    }

    .skip-link {
      position: absolute;
      left: var(--space-m);
      top: -100px;
    }

    .skip-link:focus {
      top: var(--space-m);
    }
    ```

  - [ ] Criar `src/components/LanguageSwitcher.astro`:

    ```astro
    ---
    import { gaEventAttrs } from '../lib/analytics';
    import { htmlLang, otherLang, t, type Lang } from '../i18n/ui';

    interface Props {
      lang: Lang;
      alternatePath: string;
    }

    const { lang, alternatePath } = Astro.props;
    const target = otherLang(lang);
    ---

    <a
      class="language-switcher"
      href={alternatePath}
      hreflang={htmlLang[target]}
      lang={htmlLang[target]}
      aria-label={t(lang, 'lang.switchLabel')}
      {...gaEventAttrs('language_switch', { from: lang, to: target, page_path: Astro.url.pathname })}
    >
      {t(lang, 'lang.switch')}
    </a>
    ```

  - [ ] Criar `src/components/Header.astro`:

    ```astro
    ---
    import LanguageSwitcher from './LanguageSwitcher.astro';
    import { SITE_NAME } from '../config';
    import { routePath } from '../i18n/routes';
    import { t, type Lang } from '../i18n/ui';

    interface Props {
      lang: Lang;
      alternatePath: string;
    }

    const { lang, alternatePath } = Astro.props;
    ---

    <header class="container header">
      <a class="brand" href={routePath('home', lang)}>{SITE_NAME}</a>
      <nav aria-label={t(lang, 'nav.label')}>
        <a href={routePath('articles', lang)}>{t(lang, 'nav.articles')}</a>
      </nav>
      <LanguageSwitcher lang={lang} alternatePath={alternatePath} />
    </header>

    <style>
      .header {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-m);
        align-items: center;
        padding-block: var(--space-m);
        border-bottom: 1px solid var(--color-border);
      }

      .brand {
        margin-right: auto;
        font-weight: 700;
        color: inherit;
        text-decoration: none;
      }
    </style>
    ```

  - [ ] Criar `src/components/Footer.astro`:

    ```astro
    ---
    import { routePath } from '../i18n/routes';
    import { t, type Lang } from '../i18n/ui';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;
    ---

    <footer class="container footer">
      <p>{t(lang, 'footer.rights', { year: new Date().getFullYear() })}</p>
      <a href={routePath('rss', lang)}>{t(lang, 'footer.rss')}</a>
    </footer>

    <style>
      .footer {
        display: flex;
        gap: var(--space-m);
        align-items: center;
        padding-block: var(--space-l);
        border-top: 1px solid var(--color-border);
        color: var(--color-muted);
      }
    </style>
    ```

  - [ ] Criar `src/components/ArticleCard.astro`:

    ```astro
    ---
    import { categories } from '../i18n/categories';
    import { articlePath, categoryPath } from '../i18n/routes';
    import { formatDate } from '../i18n/ui';
    import { articleSlug } from '../lib/articles';
    import type { Article } from '../lib/collections';

    interface Props {
      article: Article;
    }

    const { article } = Astro.props;
    const { lang, category, title, description, pubDate } = article.data;
    ---

    <article class="article-card">
      <p class="meta">
        <a href={categoryPath(lang, category)}>{categories[category].name[lang]}</a>
        {' · '}
        <time datetime={pubDate.toISOString()}>{formatDate(lang, pubDate)}</time>
      </p>
      <h2><a href={articlePath(lang, articleSlug(article))}>{title}</a></h2>
      <p>{description}</p>
    </article>

    <style>
      .article-card {
        padding-block: var(--space-m);
        border-bottom: 1px solid var(--color-border);
      }

      .meta {
        margin: 0;
        color: var(--color-muted);
        font-size: 0.875rem;
      }
    </style>
    ```

  - [ ] Criar `src/components/ArticleList.astro`:

    ```astro
    ---
    import ArticleCard from './ArticleCard.astro';
    import { categories, type CategoryKey } from '../i18n/categories';
    import { categoryPath, routePath } from '../i18n/routes';
    import { t, type Lang } from '../i18n/ui';
    import { categoriesInUse, publishedArticles } from '../lib/articles';
    import type { Article } from '../lib/collections';

    interface Props {
      lang: Lang;
      articles: Article[];
      heading: string;
      current?: CategoryKey;
    }

    const { lang, articles, heading, current } = Astro.props;
    const filters = categoriesInUse(articles, lang);
    const list = publishedArticles(articles, lang).filter(
      (article) => !current || article.data.category === current,
    );
    ---

    <h1>{heading}</h1>
    <nav class="filters" aria-label={t(lang, 'articles.filterLabel')}>
      <a href={routePath('articles', lang)} aria-current={current ? undefined : 'page'}>{t(lang, 'articles.all')}</a>
      {
        filters.map(({ key, count }) => (
          <a href={categoryPath(lang, key)} aria-current={key === current ? 'page' : undefined}>
            {categories[key].name[lang]} ({count})
          </a>
        ))
      }
    </nav>
    {list.length === 0 ? <p>{t(lang, 'articles.empty')}</p> : list.map((article) => <ArticleCard article={article} />)}

    <style>
      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-s) var(--space-m);
      }

      .filters [aria-current='page'] {
        font-weight: 700;
      }
    </style>
    ```

  - [ ] Criar `src/layouts/BaseLayout.astro`:

    ```astro
    ---
    import '../styles/global.css';
    import Analytics from '../components/Analytics.astro';
    import Footer from '../components/Footer.astro';
    import Header from '../components/Header.astro';
    import Seo from '../components/Seo.astro';
    import { routePath } from '../i18n/routes';
    import { htmlLang, t } from '../i18n/ui';
    import type { SeoInput } from '../lib/seo';

    type Props = Omit<SeoInput, 'path'>;

    const props = Astro.props;
    const { lang, alternatePath } = props;
    ---

    <!doctype html>
    <html lang={htmlLang[lang]}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="application/rss+xml" title="RSS" href={routePath('rss', lang)} />
        <Seo {...props} path={Astro.url.pathname} />
        <Analytics />
      </head>
      <body>
        <a class="skip-link" href="#conteudo">{t(lang, 'skip.toContent')}</a>
        <Header lang={lang} alternatePath={alternatePath} />
        <main id="conteudo" class="container">
          <slot />
        </main>
        <Footer lang={lang} />
      </body>
    </html>
    ```

  - [ ] Criar `src/layouts/ArticleLayout.astro`:

    ```astro
    ---
    import BaseLayout from './BaseLayout.astro';
    import { categories } from '../i18n/categories';
    import { articlePath, categoryPath, routePath } from '../i18n/routes';
    import { formatDate, otherLang, t } from '../i18n/ui';
    import { articleSlug, originalPlatform, readingTime } from '../lib/articles';
    import type { Article } from '../lib/collections';

    interface Props {
      article: Article;
      translation?: Article;
    }

    const { article, translation } = Astro.props;
    const { lang, title, description, category, pubDate, updatedDate, originalUrl } = article.data;
    const alternatePath = translation
      ? articlePath(otherLang(lang), articleSlug(translation))
      : routePath('articles', otherLang(lang));
    const platform = originalPlatform(originalUrl);
    ---

    <BaseLayout
      lang={lang}
      title={title}
      description={description}
      alternatePath={alternatePath}
      type="article"
      publishedTime={pubDate}
      modifiedTime={updatedDate}
    >
      <article class="article">
        <header>
          <p class="meta">
            <a href={categoryPath(lang, category)}>{categories[category].name[lang]}</a>
            {' · '}
            <time datetime={pubDate.toISOString()}>{formatDate(lang, pubDate)}</time>
            {' · '}
            {t(lang, 'article.readingTime', { minutes: readingTime(article.body ?? '') })}
          </p>
          <h1>{title}</h1>
          {
            updatedDate && (
              <p class="meta">{t(lang, 'article.updated', { date: formatDate(lang, updatedDate) })}</p>
            )
          }
        </header>
        <slot />
        {
          platform && originalUrl && (
            <p class="original">
              <a href={originalUrl} target="_blank" rel="noopener">
                {t(lang, 'article.originallyPublished', { platform, date: formatDate(lang, pubDate) })}
              </a>
            </p>
          )
        }
      </article>
    </BaseLayout>

    <style>
      .article {
        max-width: var(--width-reading);
      }

      .meta,
      .original {
        color: var(--color-muted);
        font-size: 0.875rem;
      }
    </style>
    ```

  - [ ] Verificar — rodar `npm run check`, esperado: `0 errors`.

- [ ] **Task 13: Páginas (home provisória, lista, artigo, categoria, RSS) e testes de build com fixtures**
  - Files: `tests/build.test.ts`, `tests/fixtures/articles/en/draft.md`, `tests/fixtures/articles/en/first-article.md`, `tests/fixtures/articles/en/second-article.md`, `tests/fixtures/articles/pt/primeiro-artigo.md`, `tests/fixtures/articles/pt/rascunho.md`, `tests/fixtures/articles/pt/segundo-artigo.md`, `src/pages/index.astro`, `src/pages/en/index.astro`, `src/pages/artigos/index.astro`, `src/pages/en/articles/index.astro`, `src/pages/artigos/[slug].astro`, `src/pages/en/articles/[slug].astro`, `src/pages/artigos/categoria/[category].astro`, `src/pages/en/articles/category/[category].astro`, `src/pages/rss.xml.ts`, `src/pages/en/rss.xml.ts`
  - [ ] Criar `tests/build.test.ts`:

    ```ts
    import { execFileSync } from 'node:child_process';
    import { existsSync, readFileSync, rmSync } from 'node:fs';
    import { join } from 'node:path';
    import { beforeAll, describe, expect, it } from 'vitest';

    // Build de produção com os artigos de fixture, isolado do build real (dist/).
    const OUT_DIR = '.test-dist';
    const SITE = 'https://matheushaddad.com';

    // O Vitest copia variáveis de import.meta.env (MODE, DEV, PROD...) para process.env.
    // O build precisa de um ambiente limpo para rodar como produção.
    const VITEST_VARS = /^(VITEST.*|TEST|NODE_ENV|MODE|DEV|PROD|SSR|BASE_URL)$/;
    const buildEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !VITEST_VARS.test(key)));

    function page(path: string): string {
      return readFileSync(join(OUT_DIR, path), 'utf8');
    }

    function exists(path: string): boolean {
      return existsSync(join(OUT_DIR, path));
    }

    beforeAll(() => {
      rmSync(OUT_DIR, { recursive: true, force: true });
      execFileSync('node_modules/.bin/astro', ['build', '--outDir', OUT_DIR], {
        env: { ...buildEnv, ARTICLES_DIR: './tests/fixtures/articles' },
        stdio: 'pipe',
      });
    }, 120_000);

    describe('rotas geradas', () => {
      it('deve gerar artigos nos dois idiomas no caminho do contrato quando o par existe', () => {
        // Arrange
        const paths = ['artigos/primeiro-artigo/index.html', 'en/articles/first-article/index.html'];

        // Act
        const generated = paths.map(exists);

        // Assert
        expect(generated).toEqual([true, true]);
      });

      it('deve gerar home, lista e categorias com artigos quando o build termina', () => {
        // Arrange
        const paths = [
          'index.html',
          'en/index.html',
          'artigos/index.html',
          'en/articles/index.html',
          'artigos/categoria/ai/index.html',
          'artigos/categoria/gestao/index.html',
          'en/articles/category/ai/index.html',
          'en/articles/category/management/index.html',
        ];

        // Act
        const missing = paths.filter((path) => !exists(path));

        // Assert
        expect(missing).toEqual([]);
      });

      it('deve omitir rascunhos e categorias quando não há artigos publicados nelas', () => {
        // Arrange
        const paths = [
          'artigos/rascunho/index.html',
          'en/articles/draft/index.html',
          'artigos/categoria/educacao/index.html',
          'en/articles/category/education/index.html',
          'artigos/categoria/hobbies/index.html',
        ];

        // Act
        const generated = paths.filter(exists);

        // Assert
        expect(generated).toEqual([]);
      });

      it('deve copiar os arquivos preservados do site antigo quando o build termina', () => {
        // Arrange
        const paths = ['CNAME', 'favicon.ico', 'og-default.png', 'feedback-canvas/Feedback-Canvas-V1.pdf'];

        // Act
        const missing = paths.filter((path) => !exists(path));

        // Assert
        expect(missing).toEqual([]);
      });
    });

    describe('SEO da página de artigo', () => {
      it('deve declarar idioma, canonical e hreflang absolutos quando a página é um artigo', () => {
        // Arrange
        const html = page('artigos/primeiro-artigo/index.html');

        // Act
        const checks = [
          '<html lang="pt-BR">',
          `<link rel="canonical" href="${SITE}/artigos/primeiro-artigo/">`,
          `<link rel="alternate" hreflang="pt-BR" href="${SITE}/artigos/primeiro-artigo/">`,
          `<link rel="alternate" hreflang="en" href="${SITE}/en/articles/first-article/">`,
          `<link rel="alternate" hreflang="x-default" href="${SITE}/artigos/primeiro-artigo/">`,
        ].filter((snippet) => !html.includes(snippet));

        // Assert
        expect(checks).toEqual([]);
      });

      it('deve ter Open Graph e Twitter Card com imagem absoluta 1200×630 quando a página é um artigo', () => {
        // Arrange
        const html = page('en/articles/first-article/index.html');

        // Act
        const checks = [
          '<meta property="og:type" content="article">',
          `<meta property="og:url" content="${SITE}/en/articles/first-article/">`,
          `<meta property="og:image" content="${SITE}/og-default.png">`,
          '<meta property="og:image:width" content="1200">',
          '<meta property="og:image:height" content="630">',
          '<meta name="twitter:card" content="summary_large_image">',
        ].filter((snippet) => !html.includes(snippet));

        // Assert
        expect(checks).toEqual([]);
      });

      it('deve apontar o seletor de idioma para o par com evento do GA quando a página é um artigo', () => {
        // Arrange
        const html = page('artigos/primeiro-artigo/index.html');

        // Act
        const link = /<a class="language-switcher"[^>]*>/.exec(html)?.[0] ?? '';

        // Assert
        expect(link).toContain('href="/en/articles/first-article/"');
        expect(link).toContain('data-ga-event="language_switch"');
      });

      it('deve mostrar publicação original e atualização quando o artigo tem originalUrl e updatedDate', () => {
        // Arrange
        const pt = page('artigos/primeiro-artigo/index.html');
        const en = page('en/articles/first-article/index.html');

        // Act
        const notices = [
          pt.includes('Publicado originalmente no LinkedIn em 25 de agosto de 2026'),
          pt.includes('Atualizado em 10 de setembro de 2026'),
          en.includes('Originally published on LinkedIn on August 25, 2026'),
          en.includes('rel="noopener"'),
        ];

        // Assert
        expect(notices).toEqual([true, true, true, true]);
      });
    });

    describe('lista de artigos', () => {
      it('deve mostrar os publicados do mais recente ao mais antigo quando há rascunhos', () => {
        // Arrange
        const html = page('artigos/index.html');

        // Act
        const segundo = html.indexOf('Segundo artigo de teste');
        const primeiro = html.indexOf('Primeiro artigo de teste');

        // Assert
        expect(segundo).toBeGreaterThan(-1);
        expect(primeiro).toBeGreaterThan(segundo);
        expect(html).not.toContain('Rascunho de teste');
      });

      it('deve mostrar filtros com contagem só quando a categoria tem publicados', () => {
        // Arrange
        const html = page('en/articles/index.html');

        // Act
        const filters = /<nav class="filters"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '';

        // Assert
        expect(filters).toContain('Management &amp; Organizational Design (1)');
        expect(filters).toContain('AI, Work &amp; Organizations (1)');
        expect(filters).not.toContain('Education');
      });
    });

    describe('feeds e sitemap', () => {
      it('deve gerar RSS só com os publicados do idioma quando há dois idiomas', () => {
        // Arrange
        const pt = page('rss.xml');
        const en = page('en/rss.xml');

        // Act
        const result = {
          ptHasPt: pt.includes(`${SITE}/artigos/primeiro-artigo/`),
          ptHasEn: pt.includes('/en/articles/'),
          enHasEn: en.includes(`${SITE}/en/articles/first-article/`),
          draft: pt.includes('rascunho') || en.includes('/draft/'),
          language: pt.includes('<language>pt-BR</language>') && en.includes('<language>en</language>'),
        };

        // Assert
        expect(result).toEqual({ ptHasPt: true, ptHasEn: false, enHasEn: true, draft: false, language: true });
      });

      it('deve gerar sitemap com os dois idiomas e sem rascunhos quando o build termina', () => {
        // Arrange
        const sitemap = page('sitemap-0.xml');

        // Act
        const result = {
          index: exists('sitemap-index.xml'),
          pt: sitemap.includes(`<loc>${SITE}/artigos/primeiro-artigo/</loc>`),
          en: sitemap.includes(`<loc>${SITE}/en/articles/first-article/</loc>`),
          draft: sitemap.includes('rascunho'),
        };

        // Assert
        expect(result).toEqual({ index: true, pt: true, en: true, draft: false });
      });
    });

    describe('analytics', () => {
      it('deve carregar o GA4 quando o build é de produção', () => {
        // Arrange
        const html = page('index.html');

        // Act
        const loaded = html.includes('https://www.googletagmanager.com/gtag/js?id=G-CPNE8N9WS3');

        // Assert
        expect(loaded).toBe(true);
      });
    });
    ```

  - [ ] Criar `tests/fixtures/articles/en/draft.md`:

    ```markdown
    ---
    title: Test draft
    description: Draft that must not go live.
    pubDate: 2026-09-20
    category: educacao
    lang: en
    translationKey: fixture-rascunho
    draft: true
    ---

    Draft text.
    ```

  - [ ] Criar `tests/fixtures/articles/en/first-article.md`:

    ```markdown
    ---
    title: First test article
    description: Description of the first test article.
    pubDate: 2026-08-25
    updatedDate: 2026-09-10
    category: ai
    lang: en
    translationKey: fixture-primeiro
    originalUrl: https://www.linkedin.com/pulse/primeiro-artigo
    ---

    ## A subtitle

    Text of the first article.
    ```

  - [ ] Criar `tests/fixtures/articles/en/second-article.md`:

    ```markdown
    ---
    title: Second test article
    description: Description of the second test article.
    pubDate: 2026-09-15
    category: gestao
    lang: en
    translationKey: fixture-segundo
    ---

    Text of the second article.
    ```

  - [ ] Criar `tests/fixtures/articles/pt/primeiro-artigo.md`:

    ```markdown
    ---
    title: Primeiro artigo de teste
    description: Descrição do primeiro artigo de teste.
    pubDate: 2026-08-25
    updatedDate: 2026-09-10
    category: ai
    lang: pt
    translationKey: fixture-primeiro
    originalUrl: https://www.linkedin.com/pulse/primeiro-artigo
    ---

    ## Um subtítulo

    Texto do primeiro artigo.
    ```

  - [ ] Criar `tests/fixtures/articles/pt/rascunho.md`:

    ```markdown
    ---
    title: Rascunho de teste
    description: Rascunho que não pode ir ao ar.
    pubDate: 2026-09-20
    category: educacao
    lang: pt
    translationKey: fixture-rascunho
    draft: true
    ---

    Texto do rascunho.
    ```

  - [ ] Criar `tests/fixtures/articles/pt/segundo-artigo.md`:

    ```markdown
    ---
    title: Segundo artigo de teste
    description: Descrição do segundo artigo de teste.
    pubDate: 2026-09-15
    category: gestao
    lang: pt
    translationKey: fixture-segundo
    ---

    Texto do segundo artigo.
    ```

  - [ ] Criar `src/pages/index.astro`:

    ```astro
    ---
    import BaseLayout from '../layouts/BaseLayout.astro';
    import { routePath } from '../i18n/routes';
    import { t } from '../i18n/ui';

    const lang = 'pt';
    ---

    <BaseLayout
      lang={lang}
      title={t(lang, 'home.title')}
      description={t(lang, 'site.description')}
      alternatePath={routePath('home', 'en')}
    >
      <h1>{t(lang, 'home.title')}</h1>
      <p>{t(lang, 'home.intro')}</p>
      <p><a href={routePath('articles', lang)}>{t(lang, 'home.cta')}</a></p>
    </BaseLayout>
    ```

  - [ ] Criar `src/pages/en/index.astro`:

    ```astro
    ---
    import BaseLayout from '../../layouts/BaseLayout.astro';
    import { routePath } from '../../i18n/routes';
    import { t } from '../../i18n/ui';

    const lang = 'en';
    ---

    <BaseLayout
      lang={lang}
      title={t(lang, 'home.title')}
      description={t(lang, 'site.description')}
      alternatePath={routePath('home', 'pt')}
    >
      <h1>{t(lang, 'home.title')}</h1>
      <p>{t(lang, 'home.intro')}</p>
      <p><a href={routePath('articles', lang)}>{t(lang, 'home.cta')}</a></p>
    </BaseLayout>
    ```

  - [ ] Criar `src/pages/artigos/index.astro`:

    ```astro
    ---
    import ArticleList from '../../components/ArticleList.astro';
    import BaseLayout from '../../layouts/BaseLayout.astro';
    import { routePath } from '../../i18n/routes';
    import { t } from '../../i18n/ui';
    import { getAllArticles } from '../../lib/collections';

    const lang = 'pt';
    const articles = await getAllArticles();
    ---

    <BaseLayout
      lang={lang}
      title={t(lang, 'articles.title')}
      description={t(lang, 'articles.description')}
      alternatePath={routePath('articles', 'en')}
    >
      <ArticleList lang={lang} articles={articles} heading={t(lang, 'articles.title')} />
    </BaseLayout>
    ```

  - [ ] Criar `src/pages/en/articles/index.astro`:

    ```astro
    ---
    import ArticleList from '../../../components/ArticleList.astro';
    import BaseLayout from '../../../layouts/BaseLayout.astro';
    import { routePath } from '../../../i18n/routes';
    import { t } from '../../../i18n/ui';
    import { getAllArticles } from '../../../lib/collections';

    const lang = 'en';
    const articles = await getAllArticles();
    ---

    <BaseLayout
      lang={lang}
      title={t(lang, 'articles.title')}
      description={t(lang, 'articles.description')}
      alternatePath={routePath('articles', 'pt')}
    >
      <ArticleList lang={lang} articles={articles} heading={t(lang, 'articles.title')} />
    </BaseLayout>
    ```

  - [ ] Criar `src/pages/artigos/[slug].astro`:

    ```astro
    ---
    import { render } from 'astro:content';
    import ArticleLayout from '../../layouts/ArticleLayout.astro';
    import { articleStaticPaths } from '../../lib/articles';
    import { getAllArticles } from '../../lib/collections';

    export async function getStaticPaths() {
      return articleStaticPaths(await getAllArticles(), 'pt');
    }

    const { article, translation } = Astro.props;
    const { Content } = await render(article);
    ---

    <ArticleLayout article={article} translation={translation}>
      <Content />
    </ArticleLayout>
    ```

  - [ ] Criar `src/pages/en/articles/[slug].astro`:

    ```astro
    ---
    import { render } from 'astro:content';
    import ArticleLayout from '../../../layouts/ArticleLayout.astro';
    import { articleStaticPaths } from '../../../lib/articles';
    import { getAllArticles } from '../../../lib/collections';

    export async function getStaticPaths() {
      return articleStaticPaths(await getAllArticles(), 'en');
    }

    const { article, translation } = Astro.props;
    const { Content } = await render(article);
    ---

    <ArticleLayout article={article} translation={translation}>
      <Content />
    </ArticleLayout>
    ```

  - [ ] Criar `src/pages/artigos/categoria/[category].astro`:

    ```astro
    ---
    import ArticleList from '../../../components/ArticleList.astro';
    import BaseLayout from '../../../layouts/BaseLayout.astro';
    import { categories } from '../../../i18n/categories';
    import { categoryPath } from '../../../i18n/routes';
    import { t } from '../../../i18n/ui';
    import { categoryStaticPaths } from '../../../lib/articles';
    import { getAllArticles } from '../../../lib/collections';

    export async function getStaticPaths() {
      return categoryStaticPaths(await getAllArticles(), 'pt');
    }

    const lang = 'pt';
    const { categoryKey } = Astro.props;
    const name = categories[categoryKey].name[lang];
    const articles = await getAllArticles();
    ---

    <BaseLayout
      lang={lang}
      title={t(lang, 'category.title', { category: name })}
      description={t(lang, 'category.description', { category: name })}
      alternatePath={categoryPath('en', categoryKey)}
    >
      <ArticleList
        lang={lang}
        articles={articles}
        heading={t(lang, 'category.title', { category: name })}
        current={categoryKey}
      />
    </BaseLayout>
    ```

  - [ ] Criar `src/pages/en/articles/category/[category].astro`:

    ```astro
    ---
    import ArticleList from '../../../../components/ArticleList.astro';
    import BaseLayout from '../../../../layouts/BaseLayout.astro';
    import { categories } from '../../../../i18n/categories';
    import { categoryPath } from '../../../../i18n/routes';
    import { t } from '../../../../i18n/ui';
    import { categoryStaticPaths } from '../../../../lib/articles';
    import { getAllArticles } from '../../../../lib/collections';

    export async function getStaticPaths() {
      return categoryStaticPaths(await getAllArticles(), 'en');
    }

    const lang = 'en';
    const { categoryKey } = Astro.props;
    const name = categories[categoryKey].name[lang];
    const articles = await getAllArticles();
    ---

    <BaseLayout
      lang={lang}
      title={t(lang, 'category.title', { category: name })}
      description={t(lang, 'category.description', { category: name })}
      alternatePath={categoryPath('pt', categoryKey)}
    >
      <ArticleList
        lang={lang}
        articles={articles}
        heading={t(lang, 'category.title', { category: name })}
        current={categoryKey}
      />
    </BaseLayout>
    ```

  - [ ] Criar `src/pages/rss.xml.ts`:

    ```ts
    import rss from '@astrojs/rss';
    import type { APIContext } from 'astro';
    import { SITE_NAME } from '../config';
    import { htmlLang, t } from '../i18n/ui';
    import { getAllArticles } from '../lib/collections';
    import { feedItems } from '../lib/feed';

    export async function GET(context: APIContext) {
      const lang = 'pt';
      return rss({
        title: SITE_NAME,
        description: t(lang, 'articles.description'),
        site: context.site ?? '',
        items: feedItems(await getAllArticles(), lang),
        customData: `<language>${htmlLang[lang]}</language>`,
      });
    }
    ```

  - [ ] Criar `src/pages/en/rss.xml.ts`:

    ```ts
    import rss from '@astrojs/rss';
    import type { APIContext } from 'astro';
    import { SITE_NAME } from '../../config';
    import { htmlLang, t } from '../../i18n/ui';
    import { getAllArticles } from '../../lib/collections';
    import { feedItems } from '../../lib/feed';

    export async function GET(context: APIContext) {
      const lang = 'en';
      return rss({
        title: SITE_NAME,
        description: t(lang, 'articles.description'),
        site: context.site ?? '',
        items: feedItems(await getAllArticles(), lang),
        customData: `<language>${htmlLang[lang]}</language>`,
      });
    }
    ```

  - [ ] Verificar — rodar `npm test`, esperado: `Test Files  9 passed (9)` e `Tests  65 passed (65)`.
  - [ ] Verificar — rodar `npm run check`, esperado: `0 errors`, `0 warnings`.
  - [ ] Verificar o build real sem artigos — rodar `npm run build`, esperado: `Complete!`, com `/index.html`, `/en/index.html`, `/artigos/index.html`, `/en/articles/index.html`, `/rss.xml` e `/en/rss.xml` gerados e nenhuma página de fixture.
  - [ ] Verificar a falha sem par — copiar só `tests/fixtures/articles/pt/segundo-artigo.md` para uma pasta temporária `<tmp>/pt/`, criar `<tmp>/en/` vazia e rodar `ARTICLES_DIR=<tmp> npx astro build --outDir .tmp-dist`, esperado: saída com `translationKey "fixture-segundo": falta a versão em en` e código de saída diferente de 0. Remover `<tmp>` e `.tmp-dist` em seguida.

### Squad: CI e supply chain
**Agent:** coder-frontend

- [ ] **Task 14: Workflow de build e deploy, Dependabot**
  - Files: `.github/workflows/deploy.yml`, `.github/dependabot.yml`
  - [ ] Criar `.github/workflows/deploy.yml`:

    ```yaml
    name: Build e deploy

    on:
      push:
        branches: [main, novo-site]
      workflow_dispatch:

    permissions:
      contents: read

    concurrency:
      group: ${{ github.workflow }}-${{ github.ref }}
      cancel-in-progress: true

    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
          - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
            with:
              node-version: 24
              cache: npm
          - run: npm ci
          - run: npm test
          - run: npm run check
          - run: npm run build
          - if: github.ref == 'refs/heads/main'
            uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5.0.0
            with:
              path: dist

      # Só publica a partir da main. Até a troca de 27/10, a novo-site roda apenas o build.
      deploy:
        if: github.ref == 'refs/heads/main'
        needs: build
        runs-on: ubuntu-latest
        permissions:
          pages: write
          id-token: write
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        steps:
          - id: deployment
            uses: actions/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346 # v5.0.1
    ```

  - [ ] Criar `.github/dependabot.yml`:

    ```yaml
    # Lido apenas da branch padrão: passa a valer após o merge na main (27/10).
    version: 2
    updates:
      - package-ecosystem: npm
        directory: /
        schedule:
          interval: weekly
      - package-ecosystem: github-actions
        directory: /
        schedule:
          interval: weekly
    ```

  - [ ] Verificar — rodar `ruby -ryaml -e 'ARGV.each { |f| YAML.load_file(f); puts "#{f} ok" }' .github/workflows/deploy.yml .github/dependabot.yml`, esperado: as duas linhas `ok`.
  - [ ] Verificar — rodar `grep -E "uses: .*@[0-9a-f]{40}" .github/workflows/deploy.yml | wc -l`, esperado: `4` (todas as actions fixadas por SHA).
  - [ ] Verificação no GitHub (após o push da branch, decisão do autor): o workflow roda na `novo-site` com o job `build` verde e o job `deploy` ignorado.

### Squad: Publicação
**Agent:** coder-frontend

- [ ] **Task 15: Skill `publicar-artigo`**
  - Files: `.claude/skills/publicar-artigo/SKILL.md`
  - [ ] Criar `.claude/skills/publicar-artigo/SKILL.md`:

    ````markdown
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

    **Sanitização (obrigatória):**
    - Remova qualquer `<script>`.
    - Remova `<iframe>` que não seja do YouTube. Iframes do YouTube devem usar `https://www.youtube-nocookie.com/embed/<id>`; converta `youtube.com/embed/` para esse formato.
    - O build falha se sobrar `<script>` ou iframe fora de `youtube-nocookie.com` (`validateArticles` em `src/lib/articles.ts`).

    **Imagens:** se o artigo tiver imagens, copie-as para `src/assets/articles/<translationKey>/` e use caminho relativo no Markdown (`../../../assets/articles/<translationKey>/<arquivo>`), com texto alternativo em cada idioma. Se não conseguir ler a imagem do vault, pare e peça o arquivo a Matheus.

    ## 3. Montar o frontmatter

    Fonte de verdade das categorias: `src/i18n/categories.ts` (`vaultName` → chave).

    | Campo no site | Origem no vault | Regra |
    |---|---|---|
    | `title` | `title` | Igual ao vault em PT; traduzido em EN |
    | `description` | `tldr` | Até **160 caracteres**. Se `tldr` faltar ou passar disso, escreva um resumo fiel ao texto, sem prometer o que o artigo não entrega |
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
    ````

  - [ ] Verificar — o arquivo começa com frontmatter `name: publicar-artigo` e a skill aparece na lista de skills do Claude Code ao reiniciar a sessão.

- [ ] **Task 16: Publicar 3 artigos reais pela skill (um de cada categoria principal)**
  - Files: `src/content/articles/pt/<slug>.md` e `src/content/articles/en/<slug>.md` (3 pares)
  - [ ] Pré-requisito: Obsidian aberto com o plugin do MCP ativo (`claude mcp list` mostra `mcp-tools-istefox` conectado) **ou** caminho local do vault informado por Matheus.
  - [ ] Matheus escolhe 3 notas publicadas: uma de **Gestão e Design Organizacional**, uma de **Coerência Cognitiva e P-O Fit** e uma de **IA, Trabalho e Organizações**.
  - [ ] Rodar a skill `publicar-artigo` para cada nota, seguindo todos os passos (inclusive o checklist). O commit e o push de cada artigo são feitos pela skill **somente com a aprovação de Matheus naquele momento**.
  - [ ] Verificar — rodar `npm test`, esperado: todos passando; `npm run check`, esperado: `0 errors`; `npm run build`, esperado: `Complete!` com as 6 páginas de artigo (`/artigos/<slug>/` e `/en/articles/<slug>/`), as 3 páginas de categoria em cada idioma e os 3 artigos em cada RSS.
  - [ ] Verificar — rodar `grep -rlE "Ideias centrais|Síntese estruturada|Classificação|Conteúdo original|Artigos relacionados|\[\[|%%" src/content/articles/`, esperado: nenhuma saída.
  - [ ] Revisão amostral da tradução por Matheus nos 3 artigos (`npm run dev` e abrir `/en/articles/<slug>/`); ajustes viram regras no glossário da skill.

