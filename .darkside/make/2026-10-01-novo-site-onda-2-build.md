# Novo site em Astro — Onda 2: Cara nova

**Tech Design Plan:** `.darkside/tech-design/2026-09-28-novo-site-astro-plan.md`
**Fonte de design:** Figma Make `Qc3aGJIstqsCK6jdI415l2` (protótipo React + Tailwind; tokens em `src/index.css`, página `DesignSystem.tsx`)

## Order

### Escopo

Passos 7 a 10 da Onda 2 do plano.

| # | Passo do plano | O que entra |
|---|---|---|
| 7 | Design system | Tokens de cor (claro e escuro, 4 cores de destaque), tipografia, espaçamento, raios, breakpoints e ícones, com base no Figma Make; fontes servidas pelo próprio site |
| 8 | Layout, header, footer e página de artigo | Header fixo (5 itens, idioma, tema, WhatsApp, menu mobile), footer, página de artigo (progresso de leitura, índice, citação, aviso de origem, bloco "Quem escreve"), lista de artigos (destaque + grade + filtros) |
| 9 | Home | Hero com retrato real, faixa de prova (números + empresas), artigos em destaque, chamada final para o WhatsApp |
| 10 | Imagens OG e compartilhar | Imagem 1200×630 gerada no build para cada artigo e página; barra de compartilhar (LinkedIn, WhatsApp, copiar link com aviso) |

**Decisões do autor (01/10/2026), que divergem do design prompt:**
- A cor de destaque **muda a cada visita** entre verde, amarelo, azul e laranja, e se mantém durante a navegação.
- O tema é **escuro por padrão**, com botão para o claro que guarda a escolha.

**Fora do escopo:**
- Onda 3: mensagens de WhatsApp por página, chamada no fim do artigo e páginas de serviço.
- Onda 4: seções de Serviços e Palestras na home, que dependem de conteúdo dessas coleções.
- Onda 5: artigos relacionados.
- A página de Design System do protótipo. É ferramenta de design e não entra no site.

### Abordagem e arquitetura

- **Tokens em CSS puro** (`src/styles/tokens.css`), sem Tailwind. Os valores vêm do `index.css` do Figma Make. Tema e destaque ficam em atributos do `<html>`: `data-theme="dark|light"` e `data-accent="green|yellow|blue|orange"`. Componentes só usam `var(--…)`.
- **Tema e destaque sem flash.** Um script mínimo `is:inline` no `<head>` roda antes da primeira pintura:
  - Tema: lê `localStorage`; se não houver escolha salva, usa escuro.
  - Destaque: lê `sessionStorage`; se ainda não houver cor na visita, sorteia uma das quatro.
  - O HTML já sai com `data-theme="dark" data-accent="green"`, então a página funciona sem JavaScript.
  - A lógica fica numa função pura em `src/lib/theme.ts`, injetada no script inline pela serialização da própria função, o que permite testá-la.
- **Fontes:** API de fontes do Astro 7 com o provedor `npm` e os pacotes `@fontsource` (Fraunces, Inter, JetBrains Mono), validada em protótipo. Os arquivos `woff2` são servidos pelo próprio domínio, com preload das fontes de título e texto e fallback com métricas ajustadas. Nada é baixado do Google em tempo de execução.
- **Componentes novos:** `ThemeToggle`, `MobileMenu`, `WhatsAppButton`, `CategoryChip`, `GeometricPattern` (6 SVGs por categoria), `ArticleFeatured`, `ReadingProgress`, `TableOfContents`, `ShareBar`, `AuthorBlock`, `Icon`.
- **Componentes reescritos:** `Header`, `Footer`, `ArticleCard`, `ArticleList`, `ArticleLayout`, `BaseLayout`, `LanguageSwitcher` (vira o botão `EN`/`PT` do Figma, mantendo `hreflang` e o evento do GA).
- **Interatividade só onde precisa:** um script pequeno por componente para tema, menu mobile, progresso de leitura, item ativo do índice e copiar link. O índice no celular usa `<details>`, sem JS.
- **Imagens OG:** geradas no build por endpoints estáticos, com `satori` (layout para SVG) e `@resvg/resvg-js` (SVG para PNG). Saem em `/og/artigos/<slug>.png`, `/og/en/articles/<slug>.png` e `/og/default.png`. Usam a cor verde, que é o padrão da marca, porque a imagem é estática, mais o padrão geométrico da categoria, o título em Fraunces e a categoria em JetBrains Mono. O `public/og-default.png` provisório sai.
- **WhatsApp nesta onda:** o componente `WhatsAppButton` e o helper `whatsappUrl()` entram agora porque o header precisa deles. Usam a mensagem genérica do idioma e disparam o evento `whatsapp_click`. As mensagens por página entram na Onda 3.
- **Retrato:** `images/matheus-haddad-2025.jpg`, do site antigo, vai para `src/assets/`, processado pelo `astro:assets`.

### Componentes e arquivos principais

| Área | Arquivos |
|---|---|
| Design system | `src/styles/tokens.css`, `src/styles/global.css` (reescrito), `src/styles/prose.css`, `src/lib/theme.ts`, `src/lib/contrast.ts` |
| Fontes | `astro.config.mjs` (`fonts`), `package.json` (`@fontsource-variable/fraunces`, `@fontsource-variable/inter`, `@fontsource/jetbrains-mono`) |
| Layout | `BaseLayout.astro`, `Header.astro`, `MobileMenu.astro`, `ThemeToggle.astro`, `LanguageSwitcher.astro`, `Footer.astro`, `Icon.astro`, `WhatsAppButton.astro`, `src/lib/whatsapp.ts` |
| Artigos | `ArticleCard.astro`, `ArticleFeatured.astro`, `ArticleList.astro`, `CategoryChip.astro`, `GeometricPattern.astro`, `src/lib/patterns.ts` |
| Página de artigo | `ArticleLayout.astro`, `ReadingProgress.astro`, `TableOfContents.astro`, `ShareBar.astro`, `AuthorBlock.astro`, `src/lib/toc.ts`, `src/lib/share.ts` |
| Home | `src/pages/index.astro`, `src/pages/en/index.astro`, `src/components/home/*.astro` |
| OG | `src/lib/og.ts`, `src/pages/og/[...path].png.ts`, fontes estáticas para o satori |
| i18n | `src/i18n/ui.ts` (textos novos, em paridade PT/EN) |

### Ordem de implementação e justificativa

1. **Design system.** Os tokens e as fontes destravam tudo; no plano, o passo 7 vem antes dos passos 8 a 16. O contraste das 8 combinações é testado logo de início.
2. **Tema e destaque.** Afetam toda página e precisam estar no `<head>` antes do layout.
3. **Layout:** header, menu mobile e footer.
4. **Artigos:** cards, padrões geométricos, lista e filtros.
5. **Página de artigo:** progresso, índice, citação, aviso de origem e autor.
6. **Compartilhar e imagens OG.** O OG depende dos padrões geométricos e das fontes.
7. **Home.** Por último, porque reaproveita os cards, o botão de WhatsApp e os tokens.

### Estratégia de testes

- **Unitários:**
  - `theme.ts`: tema padrão escuro, escolha salva respeitada, cor sorteada uma vez por visita, armazenamento indisponível.
  - `contrast.ts`: lê o `tokens.css` e exige WCAG AA nas combinações reais. São texto e texto secundário sobre fundo e superfície, e texto do botão sobre a cor de destaque, nos dois temas, com as 4 cores. O critério é 4,5:1 para texto normal e 3:1 para componentes.
  - `whatsapp.ts`: URL `wa.me` com o número real e a mensagem codificada.
  - `share.ts`: URLs do LinkedIn e do WhatsApp com a URL canônica codificada.
  - `toc.ts`: só títulos `h2` e índice só com 2 ou mais seções.
  - `og.ts`: caminho da imagem por artigo.
- **De build (fixtures):**
  - O `<html>` sai com `data-theme="dark"` e o script de tema vem antes do CSS.
  - Fontes em `/_astro/fonts/` e nenhuma referência a `fonts.googleapis.com`.
  - Header com os 5 itens nos caminhos do contrato e botão de WhatsApp com o número real.
  - Imagem OG de 1200×630 por artigo, com `og:image` absoluto apontando para ela.
  - Barra de compartilhar com a URL canônica, índice presente quando há 2 ou mais seções, e foto e alt no bloco "Quem escreve".
  - Home com hero, faixa de prova e os 3 artigos mais recentes.
- **Revisão visual:** comparação com as capturas do Figma Make nos dois temas, no celular (390 px) e no desktop (1440 px), pelo navegador. `/visual-fidelity` não se aplica a arquivos do Make, então a comparação é por captura de tela.

### Decisões técnicas e trade-offs

| Decisão | Alternativa descartada | Motivo |
|---|---|---|
| CSS com tokens próprios | Tailwind, como no protótipo | Convenção do projeto (`tech.md`); zero dependência de runtime; os valores do Figma se traduzem direto em variáveis |
| Destaque por `sessionStorage` (por visita) | Por página / `localStorage` | "Uma cor por acesso" (Figma); mesma cor durante a navegação, nova cor na próxima visita |
| Script inline gerado da função `bootTheme` | Script escrito à mão no `<head>` | Uma fonte de verdade testável; o inline é obrigatório para não piscar |
| API de fontes do Astro + `@fontsource` (npm) | Arquivos `woff2` copiados à mão; provedor Google | Versões no `package-lock`, sem rede no build, preload e fallback métrico automáticos |
| `satori` + `resvg-js` para OG | `sharp` com SVG e texto | O `sharp` depende das fontes do sistema (diferentes no CI); o satori embute as fontes e é o padrão no ecossistema. Duas dependências **só de build** |
| OG sempre verde | OG na cor da visita | Imagem estática, cacheada pelo WhatsApp/LinkedIn; o verde é o padrão do protótipo |
| Índice no celular com `<details>` | Botão com JS | Acessível e sem JS |
| Header com 5 itens desde já | Só itens com página pronta | Fiel ao design; Serviços, Empresas, Palestras e Sobre caem na 404 até as ondas 3 e 4, só na `novo-site` e sem impacto no site no ar |
| Marca "MATHEUS HADDAD" em Inter 600 | Fraunces (design prompt) | Versão final do protótipo |

### Decisões que precisam do autor

1. **Números da faixa de prova e do bloco "Quem escreve"** (vêm do design prompt): "5 empresas fundadas", "15+ anos de gestão" e "500+ líderes apoiados". Estão corretos para publicar?
2. **Subtítulo da home** (vem do protótipo): *"Matheus Haddad ajuda CEOs e CTOs a redesenhar organizações para crescer com clareza — combinando estratégia de negócios, tecnologia e gestão de pessoas."* Pode usar?

### Considerações de segurança

- **Scripts inline:** só o de tema/destaque e os dos componentes, sem dados externos. Não há HTML montado a partir de entrada do usuário.
- **Compartilhar:** as URLs são montadas no build a partir da URL canônica (`encodeURIComponent`), não de `location.href`. A cópia usa `navigator.clipboard` com fallback silencioso.
- **Links externos:** `target="_blank" rel="noopener"` em LinkedIn, WhatsApp e `wa.me`.
- **Terceiros:** nenhum novo. As fontes passam a ser servidas pelo próprio site, então sai o Google Fonts do protótipo.
- **Supply chain:** `satori`, `@resvg/resvg-js` e os três `@fontsource` entram como dependências fixadas no lock. O `resvg-js` traz binário nativo, que roda só no build e no CI e é coberto pelo `npm audit` e pelo Dependabot.
- **Risco aceito pelo autor em 01/10/2026:** o `satori` (0.32 e 0.33) depende de `fflate` 0.7.x, que tem um alerta moderado (GHSA-px8p-9vwx-vf98: laço infinito no `unzipSync` com ZIP64 malformado). O satori só usa o `fflate` para descompactar as nossas próprias fontes WOFF no build; o `unzipSync` não é chamado e não há entrada externa. Forçar o `fflate` 0.8 por `overrides` quebra a leitura das fontes (testado). O `npm audit` mostra 2 alertas moderados até o satori atualizar; revisar a cada atualização do Dependabot.
- **Armazenamento local:** `localStorage` e `sessionStorage` guardam só a preferência de tema e a cor. Nenhum dado pessoal; o acesso fica em `try/catch`, porque navegação privada pode bloquear.

### Riscos

| Risco | Mitigação |
|---|---|
| Uma das 8 combinações de destaque reprovar no contraste AA | **Validado em 01/10:** todas passam; o menor valor é 4,73:1 (verde claro sobre `accent-subtle`). O teste mantém a garantia |
| O satori não aceita fontes variáveis nem `woff2` | **Validado em 01/10:** os arquivos estáticos `woff` de `@fontsource/fraunces` (600) e `@fontsource/jetbrains-mono` (500) renderizam corretamente, com acentos |
| A foto real tem proporção diferente de 3:4 | `object-fit: cover` com `astro:assets`, recorte centralizado |

## Tasks

> Código validado em protótipo em 01/10/2026: 107 testes passando (16 arquivos), `astro check` sem erros, avisos nem hints, e capturas de tela conferidas contra o Figma Make nos dois temas, no desktop (1440 px) e no celular (390 px).

> **TDD:** em cada squad, os arquivos `*.test.ts` são escritos e executados primeiro e devem falhar; depois vem a implementação. Os testes de integração (Task 1) ficam vermelhos até o squad que entrega cada parte.

### Squad: Design system
**Agent:** coder-frontend

- [ ] **Task 1: Testes de integração da Onda 2 (build com fixtures)**
  - Files: `tests/build.test.ts`, `tests/fixtures/articles/pt/primeiro-artigo.md`, `tests/fixtures/articles/en/first-article.md`
  - [ ] Substituir `tests/build.test.ts`:

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
        const paths = ['CNAME', 'favicon.ico', 'feedback-canvas/Feedback-Canvas-V1.pdf'];

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
          '<html lang="pt-BR" ',
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
          `<meta property="og:image" content="${SITE}/og/en/articles/first-article.png">`,
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
        const link = /<a class="language-switcher[^"]*"[^>]*>/.exec(html)?.[0] ?? '';

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
        const filters = (/<nav class="filters"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

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

    describe('design system', () => {
      it('deve sair em tema escuro com destaque verde e com o script de tema antes do CSS quando a página é gerada', () => {
        // Arrange
        const html = page('index.html');

        // Act
        const htmlTag = /<html[^>]*>/.exec(html)?.[0] ?? '';
        const themeScript = html.indexOf('mh-accent');
        const firstStylesheet = Math.min(
          ...['<style', '<link rel="stylesheet"'].map((tag) => html.indexOf(tag)).filter((index) => index >= 0),
        );

        // Assert
        expect(htmlTag).toContain('data-theme="dark"');
        expect(htmlTag).toContain('data-accent="green"');
        expect(themeScript).toBeGreaterThan(-1);
        expect(themeScript).toBeLessThan(firstStylesheet);
      });

      it('deve servir as fontes pelo próprio site quando a página é gerada', () => {
        // Arrange
        const html = page('index.html');

        // Act
        const preloads = [...html.matchAll(/<link rel="preload" href="(\/_astro\/fonts\/[^"]+\.woff2)"/g)].map((m) => m[1] ?? '');

        // Assert
        expect(html).not.toContain('fonts.googleapis.com');
        expect(preloads.length).toBeGreaterThan(0);
        expect(preloads.every((href) => exists(href.slice(1)))).toBe(true);
      });
    });

    describe('header e footer', () => {
      it('deve ter os 5 itens do menu nos caminhos do contrato e o item atual marcado quando a página é de artigos', () => {
        // Arrange
        const html = page('artigos/index.html');

        // Act
        const nav = /<nav class="desktop-nav"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '';
        const hrefs = [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
        const current = /<a href="([^"]+)" aria-current="page"/.exec(nav)?.[1];

        // Assert
        expect(hrefs).toEqual(['/artigos/', '/servicos/', '/empresas/', '/palestras/', '/sobre/']);
        expect(current).toBe('/artigos/');
      });

      it('deve ter o botão de WhatsApp com o número real e evento do GA quando a página é gerada', () => {
        // Arrange
        const html = page('en/index.html');

        // Act
        const links = [...html.matchAll(/<a [^>]*href="https:\/\/wa\.me\/5535988867870\?text=[^"]+"[^>]*>/g)].map((m) => m[0]);

        // Assert
        expect(links.length).toBeGreaterThanOrEqual(3);
        expect(links.every((link) => link.includes('data-ga-event="whatsapp_click"') && link.includes('rel="noopener"'))).toBe(true);
      });

      it('deve ter alternância de tema e menu mobile acessíveis quando a página é gerada', () => {
        // Arrange
        const html = page('index.html');

        // Act
        const toggle = /<button[^>]*data-theme-toggle[^>]*>/.exec(html)?.[0] ?? '';
        const menuButton = /<button[^>]*data-menu-toggle[^>]*>/.exec(html)?.[0] ?? '';

        // Assert
        expect(toggle).toContain('aria-label="Mudar para o modo claro"');
        expect(menuButton).toContain('aria-expanded="false"');
        expect(menuButton).toContain('aria-controls="mobile-menu"');
        expect(html).toMatch(/<div id="mobile-menu"[^>]*hidden/);
      });

      it('deve levar Livros e RSS no rodapé quando a página é gerada', () => {
        // Arrange
        const html = page('en/index.html');

        // Act
        const footer = /<footer[\s\S]*?<\/footer>/.exec(html)?.[0] ?? '';

        // Assert
        expect(footer).toContain('href="/en/books/"');
        expect(footer).toContain('href="/en/rss.xml"');
      });
    });

    describe('página de artigo — Onda 2', () => {
      it('deve gerar a imagem de prévia 1200×630 de cada artigo quando o build termina', () => {
        // Arrange
        const files = ['og/default.png', 'og/artigos/primeiro-artigo.png', 'og/en/articles/first-article.png'];

        // Act
        const sizes = files.map((file) => {
          const png = readFileSync(join(OUT_DIR, file));
          return [png.readUInt32BE(16), png.readUInt32BE(20)];
        });

        // Assert
        expect(sizes).toEqual(files.map(() => [1200, 630]));
        expect(exists('og/artigos/rascunho.png')).toBe(false);
      });

      it('deve compartilhar a URL canônica no LinkedIn e no WhatsApp quando a página é de artigo', () => {
        // Arrange
        const html = page('artigos/primeiro-artigo/index.html');
        const encoded = encodeURIComponent(`${SITE}/artigos/primeiro-artigo/`);

        // Act
        const shareBar = /<div class="share-bar"[\s\S]*?<\/div>/.exec(html)?.[0] ?? '';

        // Assert
        expect(shareBar).toContain(`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`);
        expect(shareBar).toContain(`https://wa.me/?text=Primeiro%20artigo%20de%20teste%20${encoded}`);
        expect(shareBar).toContain(`data-copy-link="${SITE}/artigos/primeiro-artigo/"`);
        expect(shareBar).toContain('role="status"');
      });

      it('deve mostrar o índice só quando o artigo tem duas ou mais seções', () => {
        // Arrange
        const withToc = page('artigos/primeiro-artigo/index.html');
        const withoutToc = page('artigos/segundo-artigo/index.html');

        // Act
        const links = [...withToc.matchAll(/data-toc-link="([^"]+)"/g)].map((m) => m[1]);

        // Assert
        expect([...new Set(links)]).toEqual(['um-subtítulo', 'outro-subtítulo']);
        expect(withoutToc).not.toContain('data-toc-link');
      });

      it('deve ter progresso de leitura e bloco "Quem escreve" com foto quando a página é de artigo', () => {
        // Arrange
        const html = page('en/articles/first-article/index.html');

        // Act
        const author = /<aside class="author"[\s\S]*?<\/aside>/.exec(html)?.[0] ?? '';

        // Assert
        expect(html).toContain('data-reading-progress');
        expect(author).toContain('About the author');
        expect(author).toMatch(/<img[^>]*alt="Matheus Haddad"/);
        expect(author).toContain('href="/en/about/"');
      });
    });

    describe('home', () => {
      it('deve mostrar hero com retrato, faixa de prova e os artigos mais recentes quando a home é gerada', () => {
        // Arrange
        const html = page('index.html');

        // Act
        const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1];
        const featured = html.indexOf('Segundo artigo de teste');
        const older = html.indexOf('Primeiro artigo de teste');

        // Assert
        expect(h1).toBe('Negócios, tecnologia e pessoas: como organizações crescem na era da IA.');
        expect(html).toMatch(/<img[^>]*alt="Matheus Haddad, empresário e consultor em negócios e tecnologia"/);
        expect(html).toContain('500+');
        expect(html).toContain('TugÁgil');
        expect(featured).toBeGreaterThan(-1);
        expect(older).toBeGreaterThan(featured);
        expect(html).not.toContain('Rascunho de teste');
      });
    });
    ```

  - [ ] Substituir `tests/fixtures/articles/pt/primeiro-artigo.md`:

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

    ## Outro subtítulo

    Mais texto do primeiro artigo.
    ```

  - [ ] Substituir `tests/fixtures/articles/en/first-article.md`:

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

    ## Another subtitle

    More text of the first article.
    ```

  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts`, esperado: falhas nos blocos `design system`, `header e footer`, `página de artigo — Onda 2` e `home` (o resto continua passando).

- [ ] **Task 2: Dependências e fontes servidas pelo próprio site**
  - Files: `package.json`, `package-lock.json`, `astro.config.mjs`
  - [ ] Instalar (versões consultadas em 01/10/2026):

    ```bash
    npm install @fontsource-variable/fraunces@5.3.0 @fontsource-variable/inter@5.3.0 @fontsource/jetbrains-mono@5.3.0 @fontsource/fraunces@5.3.0 satori@0.33.5 @resvg/resvg-js@2.6.2
    ```

  - [ ] Não usar `overrides` para o `fflate`: a versão 0.8 quebra a leitura das fontes no satori (risco aceito, ver *Considerações de segurança*).

  - [ ] Substituir `astro.config.mjs`:

    ```js
    // @ts-check
    import { defineConfig, fontProviders } from 'astro/config';
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
      integrations: [sitemap({ filter: (page) => !page.includes('/og/') })],
      // Fontes servidas pelo próprio site, a partir dos pacotes @fontsource (sem rede no build).
      fonts: [
        {
          provider: fontProviders.npm(),
          name: 'Fraunces Variable',
          cssVariable: '--font-display',
          weights: ['600'],
          styles: ['normal', 'italic'],
          subsets: ['latin'],
          fallbacks: ['Georgia', 'serif'],
        },
        {
          provider: fontProviders.npm(),
          name: 'Inter Variable',
          cssVariable: '--font-body',
          weights: ['400', '500', '600', '700'],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['system-ui', 'sans-serif'],
        },
        {
          provider: fontProviders.npm(),
          name: 'JetBrains Mono',
          cssVariable: '--font-mono',
          weights: ['400', '500'],
          styles: ['normal'],
          subsets: ['latin'],
          fallbacks: ['monospace'],
        },
      ],
    });
    ```

  - [ ] Verificar — rodar `npm ls satori @resvg/resvg-js @fontsource/fraunces`, esperado: as três versões acima sem `invalid`; `npm audit`, esperado: apenas os 2 alertas moderados do `fflate` (GHSA-px8p-9vwx-vf98).

- [ ] **Task 3: Tokens, estilos globais e contraste WCAG**
  - Files: `src/lib/contrast.test.ts`, `src/lib/contrast.ts`, `src/styles/tokens.css`, `src/styles/prose.css`, `src/styles/global.css`
  - [ ] Criar `src/lib/contrast.test.ts`:

    ```ts
    import { readFileSync } from 'node:fs';
    import { describe, expect, it } from 'vitest';
    import { ACCENTS, THEMES } from './theme';
    import { contrastRatio, parseTokens } from './contrast';

    const tokens = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));

    // WCAG 2.1 AA: 4.5:1 para texto normal. Todos os pares abaixo são texto.
    const AA = 4.5;

    describe('contrastRatio', () => {
      it('deve dar 21:1 quando compara preto e branco', () => {
        // Arrange
        const [black, white] = ['#000000', '#ffffff'];

        // Act
        const ratio = contrastRatio(black, white);

        // Assert
        expect(ratio).toBeCloseTo(21, 5);
      });

      it('deve dar 1:1 quando as cores são iguais', () => {
        // Arrange
        const color = '#007d4c';

        // Act
        const ratio = contrastRatio(color, color);

        // Assert
        expect(ratio).toBe(1);
      });
    });

    describe('tokens de cor', () => {
      it('deve definir os dois temas e as 4 cores de destaque em cada um quando lê tokens.css', () => {
        // Arrange
        const expectedThemes = [...THEMES].sort();

        // Act
        const themes = Object.keys(tokens.themes).sort();
        const accentsPerTheme = THEMES.map((theme) => Object.keys(tokens.accents[theme] ?? {}).sort());

        // Assert
        expect(themes).toEqual(expectedThemes);
        expect(accentsPerTheme).toEqual(THEMES.map(() => [...ACCENTS].sort()));
      });

      it.each(THEMES)('deve passar no AA quando o texto está sobre fundo e superfície no tema %s', (theme) => {
        // Arrange
        const t = tokens.themes[theme] as Record<string, string>;
        const pairs = [
          ['text', 'bg'],
          ['text', 'surface'],
          ['text-muted', 'bg'],
          ['text-muted', 'surface'],
        ] as const;

        // Act
        const failing = pairs.filter(([fg, bg]) => contrastRatio(t[fg] ?? '', t[bg] ?? '') < AA);

        // Assert
        expect(failing).toEqual([]);
      });

      it.each(THEMES.flatMap((theme) => ACCENTS.map((accent) => [theme, accent] as const)))(
        'deve passar no AA quando usa o destaque no tema %s com a cor %s',
        (theme, accent) => {
          // Arrange
          const t = tokens.themes[theme] as Record<string, string>;
          const a = tokens.accents[theme]?.[accent] as Record<string, string>;
          const pairs: [string, string, string][] = [
            ['accent sobre bg', a.accent ?? '', t.bg ?? ''],
            ['accent sobre surface', a.accent ?? '', t.surface ?? ''],
            ['accent sobre accent-subtle', a.accent ?? '', a['accent-subtle'] ?? ''],
            ['text sobre accent-subtle', t.text ?? '', a['accent-subtle'] ?? ''],
            ['text-muted sobre accent-subtle', t['text-muted'] ?? '', a['accent-subtle'] ?? ''],
            ['botão: accent-contrast sobre accent', a['accent-contrast'] ?? '', a.accent ?? ''],
            ['botão hover: accent-contrast sobre accent-hover', a['accent-contrast'] ?? '', a['accent-hover'] ?? ''],
          ];

          // Act
          const failing = pairs
            .map(([name, fg, bg]) => [name, contrastRatio(fg, bg).toFixed(2)] as const)
            .filter(([, ratio]) => Number(ratio) < AA);

          // Assert
          expect(failing).toEqual([]);
        },
      );
    });
    ```

  - [ ] Criar `src/lib/contrast.ts`:

    ```ts
    // Leitura dos tokens de cor e cálculo de contraste WCAG 2.1.

    export type ThemeTokens = Record<string, string>;

    export interface ParsedTokens {
      themes: Record<string, ThemeTokens>;
      accents: Record<string, Record<string, ThemeTokens>>;
    }

    const BLOCK = /:root\[data-theme='(\w+)'\](?:\[data-accent='(\w+)'\])?\s*\{([^}]*)\}/g;
    const DECLARATION = /--([\w-]+):\s*([^;]+);/g;

    export function parseTokens(css: string): ParsedTokens {
      const themes: ParsedTokens['themes'] = {};
      const accents: ParsedTokens['accents'] = {};
      for (const [, theme, accent, body] of css.matchAll(BLOCK)) {
        const vars = Object.fromEntries([...(body ?? '').matchAll(DECLARATION)].map(([, name, value]) => [name, value?.trim() ?? '']));
        if (!theme) continue;
        if (accent) {
          accents[theme] = { ...accents[theme], [accent]: vars };
        } else {
          themes[theme] = vars;
        }
      }
      return { themes, accents };
    }

    function channel(value: number): number {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    }

    export function luminance(hex: string): number {
      const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
      if (!match?.[1]) throw new Error(`Cor inválida para contraste: ${hex}`);
      const n = parseInt(match[1], 16);
      return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
    }

    export function contrastRatio(a: string, b: string): number {
      const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
      return (light + 0.05) / (dark + 0.05);
    }
    ```

  - [ ] Criar `src/styles/tokens.css`:

    ```css
    /*
     * Design system do site (Figma Make "High-Fidelity Prototype and Design System").
     * Tema e cor de destaque vêm de atributos no <html>: data-theme (dark | light) e
     * data-accent (green | yellow | blue | orange). O HTML sai com dark + green e o
     * script de tema (src/lib/theme.ts) ajusta antes da primeira pintura.
     * As famílias --font-display, --font-body e --font-mono são definidas pela API de
     * fontes do Astro (astro.config.mjs).
     */

    :root {
      /* Espaçamento — escala de 4px */
      --space-4: 4px;
      --space-8: 8px;
      --space-12: 12px;
      --space-16: 16px;
      --space-20: 20px;
      --space-24: 24px;
      --space-32: 32px;
      --space-40: 40px;
      --space-48: 48px;
      --space-64: 64px;
      --space-80: 80px;
      --space-96: 96px;
      --space-128: 128px;

      /* Tamanhos de fonte */
      --fs-10: 10px;
      --fs-11: 11px;
      --fs-12: 12px;
      --fs-13: 13px;
      --fs-14: 14px;
      --fs-15: 15px;
      --fs-16: 16px;
      --fs-17: 17px;
      --fs-18: 18px;
      --fs-19: 19px;
      --fs-20: 20px;
      --fs-22: 22px;
      --fs-24: 24px;
      --fs-26: 26px;
      --fs-32: 32px;
      --fs-36: 36px;
      --fs-40: 40px;
      --fs-44: 44px;
      --fs-48: 48px;
      --fs-56: 56px;

      /* Alturas de linha */
      --lh-none: 1;
      --lh-display: 1.08;
      --lh-heading: 1.18;
      --lh-snug: 1.4;
      --lh-body: 1.5;
      --lh-h3: 30px;
      --lh-article: 32px;
      --lh-article-mobile: 28px;

      /* Rótulos em mono */
      --tracking-mono: 0.08em;

      /* Raios */
      --radius-s: 2px;
      --radius-m: 6px;
      --radius-round: 50%;

      /* Bordas */
      --border-width: 1px;
      --border-strong: 2px;
      --border-quote: 3px;

      /* Larguras e alturas */
      --width-content: 1200px;
      --width-reading: 680px;
      --width-toc: 280px;
      --width-portrait: 380px;
      --width-portrait-tablet: 280px;
      --width-hero-title: 640px;
      --width-hero-text: 520px;
      --col-min-footer: 200px;
      --col-min-card: 300px;
      --gutter: 24px;
      --gutter-mobile: 20px;
      --header-height: 64px;
      --touch-target: 44px;
      --touch-target-l: 48px;
      --touch-target-xl: 56px;
      --underline-offset: 3px;
      --icon-s: 16px;
      --icon-m: 18px;
      --icon-l: 22px;
      --progress-height: 2px;

      /* Movimento */
      --duration-fast: 0.15s;
      --duration-menu: 0.2s;

      /* Camadas */
      --z-header: 50;
      --z-menu: 40;
      --z-progress: 100;
      --z-toast: 999;
    }

    /* Tema escuro (padrão) */
    :root[data-theme='dark'] {
      color-scheme: dark;
      --bg: #000000;
      --surface: #161618;
      --text: #ffffff;
      --text-muted: #b8b8b8;
      --border: #343438;
      --overlay: rgb(0 0 0 / 30%);
      --play-bg: rgb(255 255 255 / 90%);
    }

    /* Tema claro */
    :root[data-theme='light'] {
      color-scheme: light;
      --bg: #ffffff;
      --surface: #f5f5f4;
      --text: #111111;
      --text-muted: #57534e;
      --border: #e7e5e4;
      --overlay: rgb(0 0 0 / 30%);
      --play-bg: rgb(255 255 255 / 90%);
    }

    /* Cores de destaque — uma por visita, nos dois temas */
    :root[data-theme='dark'][data-accent='green'] {
      --accent: #00f993;
      --accent-hover: #52ffb3;
      --accent-subtle: #10251d;
      --accent-contrast: #071a12;
    }

    :root[data-theme='dark'][data-accent='yellow'] {
      --accent: #ffc132;
      --accent-hover: #ffd467;
      --accent-subtle: #2a2110;
      --accent-contrast: #241900;
    }

    :root[data-theme='dark'][data-accent='blue'] {
      --accent: #0097d7;
      --accent-hover: #27b6ee;
      --accent-subtle: #102431;
      --accent-contrast: #001e2b;
    }

    :root[data-theme='dark'][data-accent='orange'] {
      --accent: #f46036;
      --accent-hover: #ff845e;
      --accent-subtle: #2c1914;
      --accent-contrast: #260c04;
    }

    :root[data-theme='light'][data-accent='green'] {
      --accent: #007d4c;
      --accent-hover: #006b40;
      --accent-subtle: #e8f8ef;
      --accent-contrast: #ffffff;
    }

    :root[data-theme='light'][data-accent='yellow'] {
      --accent: #805600;
      --accent-hover: #684600;
      --accent-subtle: #fff6dc;
      --accent-contrast: #ffffff;
    }

    :root[data-theme='light'][data-accent='blue'] {
      --accent: #006695;
      --accent-hover: #00527a;
      --accent-subtle: #e9f5fa;
      --accent-contrast: #ffffff;
    }

    :root[data-theme='light'][data-accent='orange'] {
      --accent: #ad3d1d;
      --accent-hover: #913117;
      --accent-subtle: #fff0ea;
      --accent-contrast: #ffffff;
    }
    ```

  - [ ] Criar `src/styles/prose.css`:

    ```css
    /* Corpo do artigo (Markdown renderizado) */
    .prose {
      max-width: var(--width-reading);
    }

    .prose > * + * {
      margin-top: var(--space-24);
    }

    .prose p,
    .prose li {
      font-size: var(--fs-19);
      line-height: var(--lh-article);
    }

    .prose h2 {
      margin-top: var(--space-48);
      font-size: var(--fs-22);
      line-height: var(--lh-h3);
      scroll-margin-top: calc(var(--header-height) + var(--space-32));
    }

    .prose h3 {
      margin-top: var(--space-32);
      font-size: var(--fs-20);
      line-height: var(--lh-snug);
    }

    .prose a {
      color: var(--accent);
      text-decoration: underline;
      text-underline-offset: var(--underline-offset);
    }

    .prose a:hover {
      color: var(--accent-hover);
    }

    .prose blockquote {
      margin-inline: 0;
      padding-left: var(--space-24);
      border-left: var(--border-quote) solid var(--accent);
    }

    .prose blockquote p {
      font-family: var(--font-display);
      font-size: var(--fs-22);
      font-weight: 600;
      font-style: italic;
      line-height: var(--lh-article);
    }

    .prose ul,
    .prose ol {
      padding-left: var(--space-24);
    }

    .prose li + li {
      margin-top: var(--space-8);
    }

    .prose img {
      width: 100%;
      height: auto;
      border: var(--border-width) solid var(--border);
      border-radius: var(--radius-m);
    }

    .prose img + em,
    .prose p:has(> img) + p > em:only-child {
      display: block;
      font-size: var(--fs-14);
      color: var(--text-muted);
    }

    .prose hr {
      border: 0;
      border-top: var(--border-width) solid var(--border);
      margin-block: var(--space-48);
    }

    .prose strong {
      font-weight: 600;
    }

    @media (max-width: 767px) {
      .prose p,
      .prose li {
        font-size: var(--fs-17);
        line-height: var(--lh-article-mobile);
      }
    }
    ```

  - [ ] Substituir `src/styles/global.css`:

    ```css
    @import './tokens.css';
    @import './prose.css';

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    html {
      transition:
        background-color var(--duration-fast) ease,
        color var(--duration-fast) ease;
    }

    body {
      margin: 0;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      font-size: var(--fs-16);
      line-height: var(--lh-body);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    main {
      flex: 1;
    }

    a {
      color: inherit;
    }

    img,
    svg {
      display: block;
      max-width: 100%;
    }

    h1,
    h2,
    h3,
    h4 {
      font-family: var(--font-display);
      font-weight: 600;
      margin: 0;
    }

    p {
      margin: 0;
    }

    :focus-visible {
      outline: var(--border-strong) solid var(--accent);
      outline-offset: var(--border-strong);
      border-radius: var(--radius-s);
    }

    .container {
      width: 100%;
      max-width: var(--width-content);
      margin: 0 auto;
      padding-inline: var(--gutter);
    }

    @media (max-width: 767px) {
      .container {
        padding-inline: var(--gutter-mobile);
      }
    }

    .skip-link {
      position: absolute;
      top: -100%;
      left: var(--space-16);
      z-index: var(--z-toast);
      background: var(--accent);
      color: var(--accent-contrast);
      padding: var(--space-8) var(--space-16);
      border-radius: var(--radius-s);
      font-size: var(--fs-14);
      font-weight: 600;
      text-decoration: none;
      transition: top var(--duration-fast);
    }

    .skip-link:focus {
      top: var(--space-16);
    }

    /* Rótulos em mono (categoria, data, tempo de leitura) */
    .mono {
      font-family: var(--font-mono);
      font-size: var(--fs-11);
      font-weight: 500;
      letter-spacing: var(--tracking-mono);
      text-transform: uppercase;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }

    /* Botões e links com cara de botão */
    .button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-8);
      min-height: var(--touch-target);
      padding: var(--space-8) var(--space-16);
      border: var(--border-width) solid transparent;
      border-radius: var(--radius-s);
      font-family: var(--font-body);
      font-size: var(--fs-14);
      font-weight: 600;
      line-height: var(--lh-none);
      text-decoration: none;
      white-space: nowrap;
      cursor: pointer;
      transition:
        background-color var(--duration-fast),
        color var(--duration-fast),
        border-color var(--duration-fast);
    }

    .button--primary {
      background: var(--accent);
      color: var(--accent-contrast);
    }

    .button--primary:hover {
      background: var(--accent-hover);
    }

    .button--secondary {
      background: var(--accent-subtle);
      color: var(--accent);
      border-color: var(--accent);
    }

    .button--secondary:hover {
      background: var(--accent);
      color: var(--accent-contrast);
    }

    .button--outline {
      background: none;
      color: var(--text-muted);
      border-color: var(--border);
    }

    .button--outline:hover {
      color: var(--text);
    }

    .button--large {
      min-height: var(--touch-target-l);
      padding: var(--space-12) var(--space-24);
      font-size: var(--fs-15);
    }

    .button--icon {
      width: var(--touch-target);
      padding: 0;
    }

    /* Link com seta: "Ver todos os artigos →" */
    .arrow-link {
      display: inline-flex;
      align-items: center;
      gap: var(--space-4);
      color: var(--accent);
      font-size: var(--fs-14);
      font-weight: 500;
      text-decoration: none;
      transition: gap var(--duration-fast);
    }

    .arrow-link:hover {
      gap: var(--space-8);
    }

    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/contrast.test.ts` (depois da Task 4, que exporta `THEMES` e `ACCENTS`), esperado: `Tests  13 passed (13)`.

- [ ] **Task 4: Tema escuro por padrão e cor de destaque por visita, sem flash**
  - Files: `src/lib/theme.test.ts`, `src/lib/theme.ts`
  - [ ] Criar `src/lib/theme.test.ts`:

    ```ts
    import { runInNewContext } from 'node:vm';
    import { describe, expect, it } from 'vitest';
    import {
      ACCENTS,
      ACCENT_STORAGE_KEY,
      DEFAULT_ACCENT,
      DEFAULT_THEME,
      THEME_STORAGE_KEY,
      bootTheme,
      themeBootScript,
    } from './theme';

    function memoryStorage(initial: Record<string, string> = {}) {
      const data = new Map(Object.entries(initial));
      return {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => void data.set(key, value),
        data,
      };
    }

    const blocked = () => {
      throw new Error('SecurityError');
    };

    function run(local: () => ReturnType<typeof memoryStorage>, session: () => ReturnType<typeof memoryStorage>, random = 0) {
      const root = { dataset: {} as Record<string, string | undefined> };
      bootTheme(root, local, session, () => random);
      return root.dataset;
    }

    describe('bootTheme', () => {
      it('deve usar o tema escuro quando não há escolha salva', () => {
        // Arrange
        const local = memoryStorage();

        // Act
        const dataset = run(() => local, () => memoryStorage());

        // Assert
        expect(dataset.theme).toBe('dark');
        expect(DEFAULT_THEME).toBe('dark');
      });

      it('deve respeitar o tema salvo quando o visitante escolheu o claro', () => {
        // Arrange
        const local = memoryStorage({ [THEME_STORAGE_KEY]: 'light' });

        // Act
        const dataset = run(() => local, () => memoryStorage());

        // Assert
        expect(dataset.theme).toBe('light');
      });

      it('deve ignorar valor salvo inválido quando o armazenamento foi adulterado', () => {
        // Arrange
        const local = memoryStorage({ [THEME_STORAGE_KEY]: 'roxo' });

        // Act
        const dataset = run(() => local, () => memoryStorage());

        // Assert
        expect(dataset.theme).toBe('dark');
      });

      it('deve sortear uma das 4 cores e guardá-la quando é a primeira página da visita', () => {
        // Arrange
        const session = memoryStorage();

        // Act
        const dataset = run(() => memoryStorage(), () => session, 0.6);

        // Assert
        expect(dataset.accent).toBe('blue');
        expect(session.data.get(ACCENT_STORAGE_KEY)).toBe('blue');
      });

      it('deve manter a cor da visita quando o visitante navega para outra página', () => {
        // Arrange
        const session = memoryStorage({ [ACCENT_STORAGE_KEY]: 'orange' });

        // Act
        const dataset = run(() => memoryStorage(), () => session, 0);

        // Assert
        expect(dataset.accent).toBe('orange');
      });

      it('deve cobrir as 4 cores quando o sorteio percorre todo o intervalo', () => {
        // Arrange
        const randoms = [0, 0.25, 0.5, 0.75, 0.9999];

        // Act
        const accents = randoms.map((r) => run(() => memoryStorage(), () => memoryStorage(), r).accent);

        // Assert
        expect(accents).toEqual(['green', 'yellow', 'blue', 'orange', 'orange']);
        expect([...ACCENTS]).toEqual(['green', 'yellow', 'blue', 'orange']);
      });

      it('deve funcionar com tema padrão e cor sorteada quando o armazenamento está bloqueado', () => {
        // Arrange
        const local = blocked as never;
        const session = blocked as never;

        // Act
        const dataset = run(local, session, 0.3);

        // Assert
        expect(dataset).toEqual({ theme: 'dark', accent: 'yellow' });
        expect(DEFAULT_ACCENT).toBe('green');
      });
    });

    describe('themeBootScript', () => {
      it('deve rodar sozinho no navegador quando é injetado como script inline', () => {
        // Arrange
        const documentElement = { dataset: {} as Record<string, string> };
        const context = {
          document: { documentElement },
          localStorage: memoryStorage({ [THEME_STORAGE_KEY]: 'light' }),
          sessionStorage: memoryStorage(),
          Math: Object.assign(Object.create(Math), { random: () => 0 }),
        };

        // Act
        runInNewContext(themeBootScript(), context);

        // Assert
        expect(documentElement.dataset).toEqual({ theme: 'light', accent: 'green' });
      });
    });
    ```

  - [ ] Criar `src/lib/theme.ts`:

    ```ts
    export const THEMES = ['dark', 'light'] as const;
    export const ACCENTS = ['green', 'yellow', 'blue', 'orange'] as const;
    export type Theme = (typeof THEMES)[number];
    export type Accent = (typeof ACCENTS)[number];

    export const DEFAULT_THEME: Theme = 'dark';
    export const DEFAULT_ACCENT: Accent = 'green';
    export const THEME_STORAGE_KEY = 'mh-theme';
    export const ACCENT_STORAGE_KEY = 'mh-accent';

    interface StorageLike {
      getItem(key: string): string | null;
      setItem(key: string, value: string): void;
    }

    /**
     * Define tema e cor de destaque no <html> antes da primeira pintura.
     * É serializada com toString() para um script inline, por isso não pode
     * referenciar nada fora do próprio corpo (os valores repetem as constantes
     * acima e os testes garantem que continuam iguais).
     */
    export function bootTheme(
      root: { dataset: Record<string, string | undefined> },
      getLocal: () => StorageLike,
      getSession: () => StorageLike,
      random: () => number,
    ): void {
      var accents = ['green', 'yellow', 'blue', 'orange'];
      var theme = 'dark';
      try {
        var saved = getLocal().getItem('mh-theme');
        if (saved === 'dark' || saved === 'light') theme = saved;
      } catch (e) {
        // Armazenamento bloqueado (navegação privada): mantém o padrão.
      }
      root.dataset.theme = theme;

      var accent = accents[Math.floor(random() * accents.length)] || 'green';
      try {
        var session = getSession();
        var current = session.getItem('mh-accent');
        if (current && accents.indexOf(current) >= 0) {
          accent = current;
        } else {
          session.setItem('mh-accent', accent);
        }
      } catch (e) {
        // Sem sessionStorage: a cor sorteada vale só para esta página.
      }
      root.dataset.accent = accent;
    }

    export function themeBootScript(): string {
      return `(${bootTheme.toString()})(document.documentElement,function(){return localStorage},function(){return sessionStorage},Math.random);`;
    }
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/theme.test.ts src/lib/contrast.test.ts`, esperado: `Tests  21 passed (21)`.

### Squad: Layout
**Agent:** coder-frontend

- [ ] **Task 5: Dicionário, navegação e configuração**
  - Files: `src/i18n/ui.test.ts`, `src/i18n/ui.ts`, `src/i18n/navigation.ts`, `src/config.ts`
  - [ ] Substituir `src/i18n/ui.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { formatDate, formatShortDate, otherLang, t, ui } from './ui';

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
        expect(text).toBe('7 min');
      });

      it('deve manter o marcador quando a variável não é informada', () => {
        // Arrange
        const vars = {};

        // Act
        const text = t('en', 'article.readingTime', vars);

        // Assert
        expect(text).toBe('{minutes} min');
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

    describe('formatShortDate', () => {
      it('deve formatar como "25 AGO 2026" em português e "25 AUG 2026" em inglês quando recebe uma data', () => {
        // Arrange
        const date = new Date('2026-08-25');

        // Act
        const pt = formatShortDate('pt', date);
        const en = formatShortDate('en', date);

        // Assert
        expect(pt).toBe('25 AGO 2026');
        expect(en).toBe('25 AUG 2026');
      });

      it('deve usar dois dígitos no dia quando o dia tem um algarismo', () => {
        // Arrange
        const date = new Date('2018-02-01');

        // Act
        const pt = formatShortDate('pt', date);

        // Assert
        expect(pt).toBe('01 FEV 2018');
      });
    });
    ```

  - [ ] Substituir `src/i18n/ui.ts`:

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
      'nav.footerLabel': 'Navegação do rodapé',
      'nav.home': 'Matheus Haddad — ir para a home',
      'nav.articles': 'Artigos',
      'nav.services': 'Serviços',
      'nav.companies': 'Empresas',
      'nav.speaking': 'Palestras e Mídia',
      'nav.about': 'Sobre',
      'nav.books': 'Livros',
      'nav.menu': 'Abrir menu',
      'nav.close': 'Fechar menu',
      'lang.switch': 'EN',
      'lang.switchLabel': 'Read this page in English',
      'theme.toLight': 'Mudar para o modo claro',
      'theme.toDark': 'Mudar para o modo escuro',
      'theme.light': 'Modo claro',
      'theme.dark': 'Modo escuro',
      'whatsapp.label': 'Conversar no WhatsApp',
      'whatsapp.message': 'Olá, Matheus! Vim pelo seu site e gostaria de conversar.',
      'home.title': 'Matheus Haddad',
      'hero.label': 'Empresário · Consultor · Palestrante',
      'hero.title': 'Negócios, tecnologia e pessoas: como organizações crescem na era da IA.',
      'hero.subtitle':
        'Matheus Haddad ajuda CEOs e CTOs a redesenhar organizações para crescer com clareza — combinando estratégia de negócios, tecnologia e gestão de pessoas.',
      'hero.services': 'Ver serviços',
      'hero.portraitAlt': 'Matheus Haddad, empresário e consultor em negócios e tecnologia',
      'proof.label': 'Números e empresas',
      'proof.companies': 'empresas fundadas',
      'proof.years': 'anos de gestão',
      'proof.leaders': 'líderes apoiados',
      'proof.logos': 'Empresas e iniciativas',
      'home.featured': 'Artigos em destaque',
      'home.allArticles': 'Ver todos os artigos',
      'home.ctaTitle': 'Vamos conversar?',
      'home.ctaText':
        'Se você está redesenhando sua organização, adotando IA ou enfrentando um momento de transição — me escreva. Respondo pessoalmente.',
      'articles.title': 'Artigos',
      'articles.description':
        'Artigos de Matheus Haddad sobre gestão, liderança, AI e desenvolvimento de software.',
      'articles.filterLabel': 'Filtrar por tema',
      'articles.all': 'Todos',
      'articles.empty': 'Ainda não há artigos publicados.',
      'category.title': 'Artigos sobre {category}',
      'category.description': 'Artigos de Matheus Haddad sobre {category}.',
      'article.back': 'Todos os artigos',
      'article.readingTime': '{minutes} min',
      'article.updated': 'Atualizado em {date}',
      'article.originallyPublished': 'Publicado originalmente no {platform} em {date}',
      'article.toc': 'Neste artigo',
      'article.share': 'Compartilhar',
      'article.shareLinkedIn': 'Compartilhar no LinkedIn',
      'article.shareWhatsApp': 'Compartilhar no WhatsApp',
      'article.copyLink': 'Copiar link',
      'article.linkCopied': 'Link copiado!',
      'article.author': 'Quem escreve',
      'article.authorDesc':
        'Matheus Haddad é empresário, consultor e palestrante com 15+ anos de experiência em gestão e tecnologia. Fundou 5 empresas e apoiou 500+ líderes.',
      'article.authorLink': 'Conheça a trajetória',
      'footer.tagline': 'Negócios, tecnologia e pessoas.',
      'footer.rss': 'RSS',
      'footer.rights': '© {year} Matheus Haddad. Todos os direitos reservados.',
    } as const;

    export type UIKey = keyof typeof pt;

    const en: Record<UIKey, string> = {
      'site.description':
        'Business, technology and people: articles by Matheus Haddad on management, leadership, AI and software development.',
      'skip.toContent': 'Skip to content',
      'nav.label': 'Main navigation',
      'nav.footerLabel': 'Footer navigation',
      'nav.home': 'Matheus Haddad — go to the home page',
      'nav.articles': 'Articles',
      'nav.services': 'Services',
      'nav.companies': 'Companies',
      'nav.speaking': 'Talks & Media',
      'nav.about': 'About',
      'nav.books': 'Books',
      'nav.menu': 'Open menu',
      'nav.close': 'Close menu',
      'lang.switch': 'PT',
      'lang.switchLabel': 'Ler esta página em português',
      'theme.toLight': 'Switch to light mode',
      'theme.toDark': 'Switch to dark mode',
      'theme.light': 'Light mode',
      'theme.dark': 'Dark mode',
      'whatsapp.label': 'Chat on WhatsApp',
      'whatsapp.message': 'Hi Matheus! I found your website and would like to talk.',
      'home.title': 'Matheus Haddad',
      'hero.label': 'Entrepreneur · Consultant · Speaker',
      'hero.title': 'Business, technology, and people: how organizations grow in the AI era.',
      'hero.subtitle':
        'Matheus Haddad helps CEOs and CTOs redesign organizations to grow with clarity — combining business strategy, technology, and people management.',
      'hero.services': 'See services',
      'hero.portraitAlt': 'Matheus Haddad, entrepreneur and consultant in business and technology',
      'proof.label': 'Numbers and companies',
      'proof.companies': 'companies founded',
      'proof.years': 'years in management',
      'proof.leaders': 'leaders supported',
      'proof.logos': 'Companies & initiatives',
      'home.featured': 'Featured articles',
      'home.allArticles': 'See all articles',
      'home.ctaTitle': "Let's talk?",
      'home.ctaText':
        "If you're redesigning your organization, adopting AI, or facing a moment of transition — reach out. I respond personally.",
      'articles.title': 'Articles',
      'articles.description':
        'Articles by Matheus Haddad on management, leadership, AI and software development.',
      'articles.filterLabel': 'Filter by topic',
      'articles.all': 'All',
      'articles.empty': 'No articles published yet.',
      'category.title': 'Articles on {category}',
      'category.description': 'Articles by Matheus Haddad on {category}.',
      'article.back': 'All articles',
      'article.readingTime': '{minutes} min',
      'article.updated': 'Updated on {date}',
      'article.originallyPublished': 'Originally published on {platform} on {date}',
      'article.toc': 'In this article',
      'article.share': 'Share',
      'article.shareLinkedIn': 'Share on LinkedIn',
      'article.shareWhatsApp': 'Share on WhatsApp',
      'article.copyLink': 'Copy link',
      'article.linkCopied': 'Link copied!',
      'article.author': 'About the author',
      'article.authorDesc':
        'Matheus Haddad is an entrepreneur, consultant, and speaker with 15+ years of experience in management and technology. He founded 5 companies and supported 500+ leaders.',
      'article.authorLink': 'Read his story',
      'footer.tagline': 'Business, technology, and people.',
      'footer.rss': 'RSS',
      'footer.rights': '© {year} Matheus Haddad. All rights reserved.',
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

    // Formato dos rótulos em mono do design: "25 AGO 2026".
    export function formatShortDate(lang: Lang, date: Date): string {
      const part = (options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat(htmlLang[lang], { ...options, timeZone: 'UTC' }).format(date);
      const month = part({ month: 'short' }).replace('.', '').toUpperCase();
      return `${part({ day: '2-digit' })} ${month} ${part({ year: 'numeric' })}`;
    }
    ```

  - [ ] Criar `src/i18n/navigation.ts`:

    ```ts
    import { routePath, type RouteKey } from './routes';
    import type { Lang, UIKey } from './ui';

    export interface NavItem {
      route: RouteKey;
      label: UIKey;
    }

    export const mainNav: NavItem[] = [
      { route: 'articles', label: 'nav.articles' },
      { route: 'services', label: 'nav.services' },
      { route: 'companies', label: 'nav.companies' },
      { route: 'speaking', label: 'nav.speaking' },
      { route: 'about', label: 'nav.about' },
    ];

    export const footerNav: NavItem[] = [...mainNav, { route: 'books', label: 'nav.books' }];

    export function isCurrent(pathname: string, route: RouteKey, lang: Lang): boolean {
      return pathname.startsWith(routePath(route, lang));
    }
    ```

  - [ ] Substituir `src/config.ts`:

    ```ts
    export const SITE_URL = 'https://matheushaddad.com';
    export const SITE_NAME = 'Matheus Haddad';
    export const GA_ID = 'G-CPNE8N9WS3';
    export const WHATSAPP_NUMBER = '5535988867870';
    export const DEFAULT_OG_IMAGE = '/og/default.png';
    ```

  - [ ] Verificar — rodar `npx vitest run src/i18n`, esperado: todos passando (inclui `formatShortDate`).

- [ ] **Task 6: Ícones, WhatsApp, alternância de tema e seletor de idioma**
  - Files: `src/lib/whatsapp.test.ts`, `src/lib/whatsapp.ts`, `src/components/Icon.astro`, `src/components/WhatsAppButton.astro`, `src/components/ThemeToggle.astro`, `src/components/LanguageSwitcher.astro`
  - [ ] Criar `src/lib/whatsapp.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { whatsappUrl } from './whatsapp';

    describe('whatsappUrl', () => {
      it('deve apontar para o número real com a mensagem codificada quando recebe um texto', () => {
        // Arrange
        const message = 'Olá, Matheus! Vim pelo seu site & gostaria de conversar.';

        // Act
        const url = whatsappUrl(message);

        // Assert
        expect(url).toBe(
          'https://wa.me/5535988867870?text=Ol%C3%A1%2C%20Matheus!%20Vim%20pelo%20seu%20site%20%26%20gostaria%20de%20conversar.',
        );
      });
    });
    ```

  - [ ] Criar `src/lib/whatsapp.ts`:

    ```ts
    import { WHATSAPP_NUMBER } from '../config';

    export function whatsappUrl(message: string): string {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }
    ```

  - [ ] Criar `src/components/Icon.astro`:

    ```astro
    ---
    // Ícones do design system: traço de 1.5px e cantos retos; WhatsApp e LinkedIn
    // são as marcas preenchidas. Sempre decorativos (o rótulo fica no elemento pai).
    export type IconName =
      | 'arrow-left'
      | 'arrow-right'
      | 'chevron-down'
      | 'close'
      | 'copy'
      | 'linkedin'
      | 'menu'
      | 'moon'
      | 'sun'
      | 'whatsapp';

    interface Props {
      name: IconName;
      size?: 's' | 'm' | 'l';
    }

    const { name, size = 'm' } = Astro.props;
    const filled = name === 'whatsapp' || name === 'linkedin';
    ---

    <svg
      class:list={['icon', `icon--${size}`]}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      stroke-width="1.5"
      stroke-linecap="square"
      aria-hidden="true"
      focusable="false"
    >
      {name === 'arrow-left' && (<><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></>)}
      {name === 'arrow-right' && (<><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></>)}
      {name === 'chevron-down' && <polyline points="6 9 12 15 18 9" />}
      {name === 'close' && (<><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>)}
      {name === 'copy' && (<><rect x="9" y="9" width="13" height="13" rx="1" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>)}
      {name === 'menu' && (<><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>)}
      {name === 'moon' && <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />}
      {
        name === 'sun' && (
          <>
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
            <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
            <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
            <line x1="4.93" y1="19.07" x2="7.05" y2="16.95" />
            <line x1="16.95" y1="7.05" x2="19.07" y2="4.93" />
          </>
        )
      }
      {
        name === 'linkedin' && (
          <>
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
            <circle cx="4" cy="4" r="2" />
          </>
        )
      }
      {
        name === 'whatsapp' && (
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        )
      }
    </svg>

    <style>
      .icon {
        flex-shrink: 0;
      }

      .icon--s {
        width: var(--icon-s);
        height: var(--icon-s);
      }

      .icon--m {
        width: var(--icon-m);
        height: var(--icon-m);
      }

      .icon--l {
        width: var(--icon-l);
        height: var(--icon-l);
      }
    </style>
    ```

  - [ ] Criar `src/components/WhatsAppButton.astro`:

    ```astro
    ---
    import Icon from './Icon.astro';
    import { t, type Lang } from '../i18n/ui';
    import { gaEventAttrs } from '../lib/analytics';
    import { whatsappUrl } from '../lib/whatsapp';

    interface Props {
      lang: Lang;
      placement: string;
      variant?: 'full' | 'icon';
      size?: 'default' | 'large';
      message?: string;
      class?: string;
    }

    const { lang, placement, variant = 'full', size = 'default', message = t(lang, 'whatsapp.message'), class: className } = Astro.props;
    const label = t(lang, 'whatsapp.label');
    ---

    <a
      class:list={['button', 'button--primary', { 'button--icon': variant === 'icon', 'button--large': size === 'large' }, className]}
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener"
      aria-label={variant === 'icon' ? label : undefined}
      {...gaEventAttrs('whatsapp_click', { lang, placement, page_path: Astro.url.pathname })}
    >
      <Icon name="whatsapp" size={size === 'large' ? 'l' : 'm'} />
      {variant === 'full' && <span class="whatsapp-label">{label}</span>}
    </a>
    ```

  - [ ] Criar `src/components/ThemeToggle.astro`:

    ```astro
    ---
    import Icon from './Icon.astro';
    import { t, type Lang } from '../i18n/ui';

    interface Props {
      lang: Lang;
      withLabel?: boolean;
    }

    const { lang, withLabel = false } = Astro.props;
    ---

    <button
      type="button"
      class:list={['button', 'button--outline', 'theme-toggle', { 'button--icon': !withLabel }]}
      data-theme-toggle
      data-label-to-light={t(lang, 'theme.toLight')}
      data-label-to-dark={t(lang, 'theme.toDark')}
      aria-label={t(lang, 'theme.toLight')}
    >
      <span class="when-dark"><Icon name="sun" /></span>
      <span class="when-light"><Icon name="moon" /></span>
      {
        withLabel && (
          <>
            <span class="when-dark">{t(lang, 'theme.light')}</span>
            <span class="when-light">{t(lang, 'theme.dark')}</span>
          </>
        )
      }
    </button>

    <style>
      .theme-toggle {
        font-weight: 400;
      }

      :global(:root[data-theme='dark']) .when-light,
      :global(:root[data-theme='light']) .when-dark {
        display: none;
      }
    </style>

    <script>
      import { THEME_STORAGE_KEY } from '../lib/theme';

      function syncLabels(theme: string) {
        for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
          const label = theme === 'dark' ? button.dataset.labelToLight : button.dataset.labelToDark;
          if (label) button.setAttribute('aria-label', label);
        }
      }

      syncLabels(document.documentElement.dataset.theme ?? 'dark');

      for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
        button.addEventListener('click', () => {
          const root = document.documentElement;
          const next = root.dataset.theme === 'light' ? 'dark' : 'light';
          root.dataset.theme = next;
          syncLabels(next);
          try {
            localStorage.setItem(THEME_STORAGE_KEY, next);
          } catch {
            // Armazenamento bloqueado: a escolha vale só nesta página.
          }
        });
      }
    </script>
    ```

  - [ ] Substituir `src/components/LanguageSwitcher.astro`:

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
      class="language-switcher button button--outline button--icon mono"
      href={alternatePath}
      hreflang={htmlLang[target]}
      lang={htmlLang[target]}
      aria-label={t(lang, 'lang.switchLabel')}
      {...gaEventAttrs('language_switch', { from: lang, to: target, page_path: Astro.url.pathname })}
    >
      {t(lang, 'lang.switch')}
    </a>
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/whatsapp.test.ts`, esperado: `Tests  1 passed (1)`.

- [ ] **Task 7: Header com menu mobile, footer e layout base**
  - Files: `src/components/Header.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`
  - [ ] Substituir `src/components/Header.astro`:

    ```astro
    ---
    import Icon from './Icon.astro';
    import LanguageSwitcher from './LanguageSwitcher.astro';
    import ThemeToggle from './ThemeToggle.astro';
    import WhatsAppButton from './WhatsAppButton.astro';
    import { SITE_NAME } from '../config';
    import { isCurrent, mainNav } from '../i18n/navigation';
    import { routePath } from '../i18n/routes';
    import { t, type Lang } from '../i18n/ui';

    interface Props {
      lang: Lang;
      alternatePath: string;
    }

    const { lang, alternatePath } = Astro.props;
    const pathname = Astro.url.pathname;
    ---

    <header class="site-header">
      <div class="container header-bar">
        <a class="brand" href={routePath('home', lang)} aria-label={t(lang, 'nav.home')}>{SITE_NAME}</a>

        <nav class="desktop-nav" aria-label={t(lang, 'nav.label')}>
          {
            mainNav.map((item) => (
              <a href={routePath(item.route, lang)} aria-current={isCurrent(pathname, item.route, lang) ? 'page' : undefined}>
                {t(lang, item.label)}
              </a>
            ))
          }
        </nav>

        <div class="actions">
          <span class="desktop-only"><LanguageSwitcher lang={lang} alternatePath={alternatePath} /></span>
          <span class="desktop-only"><ThemeToggle lang={lang} /></span>
          <WhatsAppButton lang={lang} placement="header" class="whatsapp-header" />
          <button
            type="button"
            class="button button--outline button--icon menu-button"
            aria-expanded="false"
            aria-controls="mobile-menu"
            data-menu-toggle
            data-label-open={t(lang, 'nav.menu')}
            data-label-close={t(lang, 'nav.close')}
            aria-label={t(lang, 'nav.menu')}
          >
            <span class="icon-open"><Icon name="menu" size="l" /></span>
            <span class="icon-close"><Icon name="close" size="l" /></span>
          </button>
        </div>
      </div>

      <div id="mobile-menu" class="mobile-menu" hidden>
        <nav class="container" aria-label={t(lang, 'nav.label')}>
          {
            mainNav.map((item) => (
              <a href={routePath(item.route, lang)} aria-current={isCurrent(pathname, item.route, lang) ? 'page' : undefined}>
                {t(lang, item.label)}
              </a>
            ))
          }
        </nav>
        <div class="container mobile-actions">
          <LanguageSwitcher lang={lang} alternatePath={alternatePath} />
          <ThemeToggle lang={lang} withLabel />
        </div>
      </div>
    </header>

    <style>
      .site-header {
        position: sticky;
        top: 0;
        z-index: var(--z-header);
        background: var(--bg);
        border-bottom: var(--border-width) solid var(--border);
      }

      .header-bar {
        display: flex;
        align-items: center;
        gap: var(--space-32);
        height: var(--header-height);
      }

      .brand {
        font-size: var(--fs-18);
        font-weight: 600;
        text-transform: uppercase;
        text-decoration: none;
        white-space: nowrap;
      }

      .desktop-nav {
        display: flex;
        flex: 1;
        gap: var(--space-4);
      }

      .desktop-nav a {
        padding: var(--space-8) var(--space-12);
        border-radius: var(--radius-s);
        color: var(--text-muted);
        font-size: var(--fs-14);
        text-decoration: none;
        white-space: nowrap;
        transition: color var(--duration-fast);
      }

      .desktop-nav a:hover {
        color: var(--text);
      }

      .desktop-nav a[aria-current='page'] {
        color: var(--accent);
        font-weight: 600;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: var(--space-8);
        margin-left: auto;
      }

      .actions :global(.whatsapp-header) {
        font-size: var(--fs-13);
      }

      .menu-button[aria-expanded='false'] .icon-close,
      .menu-button[aria-expanded='true'] .icon-open {
        display: none;
      }

      .mobile-menu {
        position: fixed;
        inset: var(--header-height) 0 0;
        z-index: var(--z-menu);
        display: flex;
        flex-direction: column;
        background: var(--bg);
        animation: slide-in var(--duration-menu) ease;
      }

      .mobile-menu[hidden] {
        display: none;
      }

      .mobile-menu nav {
        flex: 1;
        padding-block: var(--space-24);
      }

      .mobile-menu nav a {
        display: block;
        padding-block: var(--space-16);
        border-bottom: var(--border-width) solid var(--border);
        font-family: var(--font-display);
        font-size: var(--fs-26);
        font-weight: 600;
        text-decoration: none;
      }

      .mobile-menu nav a[aria-current='page'] {
        color: var(--accent);
      }

      .mobile-actions {
        display: flex;
        gap: var(--space-12);
        padding-block: var(--space-24);
      }

      @keyframes slide-in {
        from {
          transform: translateX(100%);
        }

        to {
          transform: translateX(0);
        }
      }

      @media (min-width: 768px) {
        .menu-button {
          display: none;
        }
      }

      @media (max-width: 1023px) {
        .actions :global(.whatsapp-label) {
          display: none;
        }

        .actions :global(.whatsapp-header) {
          width: var(--touch-target);
          padding: 0;
        }
      }

      @media (max-width: 767px) {
        .desktop-nav,
        .desktop-only {
          display: none;
        }
      }
    </style>

    <script>
      const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
      const menu = document.getElementById('mobile-menu');

      function setOpen(open: boolean) {
        if (!toggle || !menu) return;
        menu.hidden = !open;
        toggle.setAttribute('aria-expanded', String(open));
        const label = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
        if (label) toggle.setAttribute('aria-label', label);
        document.body.style.overflow = open ? 'hidden' : '';
        if (open) menu.querySelector<HTMLElement>('a')?.focus();
      }

      toggle?.addEventListener('click', () => setOpen(Boolean(menu?.hidden)));

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu && !menu.hidden) {
          setOpen(false);
          toggle?.focus();
        }
      });
    </script>
    ```

  - [ ] Substituir `src/components/Footer.astro`:

    ```astro
    ---
    import WhatsAppButton from './WhatsAppButton.astro';
    import { SITE_NAME } from '../config';
    import { footerNav } from '../i18n/navigation';
    import { routePath } from '../i18n/routes';
    import { t, type Lang } from '../i18n/ui';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;
    ---

    <footer class="site-footer">
      <div class="container">
        <div class="columns">
          <div>
            <p class="brand">{SITE_NAME}</p>
            <p class="tagline">{t(lang, 'footer.tagline')}</p>
          </div>
          <nav aria-label={t(lang, 'nav.footerLabel')}>
            <ul>
              {
                footerNav.map((item) => (
                  <li>
                    <a href={routePath(item.route, lang)}>{t(lang, item.label)}</a>
                  </li>
                ))
              }
              <li><a href={routePath('rss', lang)}>{t(lang, 'footer.rss')}</a></li>
            </ul>
          </nav>
          <div>
            <WhatsAppButton lang={lang} placement="footer" />
          </div>
        </div>
        <p class="copyright mono">{t(lang, 'footer.rights', { year: new Date().getFullYear() })}</p>
      </div>
    </footer>

    <style>
      .site-footer {
        margin-top: var(--space-96);
        padding-block: var(--space-48);
        background: var(--surface);
        border-top: var(--border-width) solid var(--border);
      }

      .columns {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--col-min-footer), 1fr));
        gap: var(--space-48);
      }

      .brand {
        margin-bottom: var(--space-8);
        font-size: var(--fs-20);
        font-weight: 600;
        text-transform: uppercase;
      }

      .tagline,
      nav a {
        color: var(--text-muted);
        font-size: var(--fs-14);
      }

      nav ul {
        display: flex;
        flex-direction: column;
        gap: var(--space-12);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      nav a {
        text-decoration: none;
        transition: color var(--duration-fast);
      }

      nav a:hover {
        color: var(--text);
      }

      .copyright {
        margin-top: var(--space-48);
        padding-top: var(--space-24);
        border-top: var(--border-width) solid var(--border);
        color: var(--text-muted);
      }
    </style>
    ```

  - [ ] Substituir `src/layouts/BaseLayout.astro`:

    ```astro
    ---
    import { Font } from 'astro:assets';
    import '../styles/global.css';
    import Analytics from '../components/Analytics.astro';
    import Footer from '../components/Footer.astro';
    import Header from '../components/Header.astro';
    import Seo from '../components/Seo.astro';
    import { routePath } from '../i18n/routes';
    import { htmlLang, t } from '../i18n/ui';
    import type { SeoInput } from '../lib/seo';
    import { DEFAULT_ACCENT, DEFAULT_THEME, themeBootScript } from '../lib/theme';

    type Props = Omit<SeoInput, 'path'>;

    const props = Astro.props;
    const { lang, alternatePath } = props;
    ---

    <!doctype html>
    <html lang={htmlLang[lang]} data-theme={DEFAULT_THEME} data-accent={DEFAULT_ACCENT}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script is:inline set:html={themeBootScript()} />
        <Font cssVariable="--font-display" preload />
        <Font cssVariable="--font-body" preload />
        <Font cssVariable="--font-mono" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="application/rss+xml" title={t(lang, 'footer.rss')} href={routePath('rss', lang)} />
        <Seo {...props} path={Astro.url.pathname} />
        <Analytics />
      </head>
      <body>
        <a class="skip-link" href="#conteudo">{t(lang, 'skip.toContent')}</a>
        <Header lang={lang} alternatePath={alternatePath} />
        <main id="conteudo">
          <slot />
        </main>
        <Footer lang={lang} />
      </body>
    </html>
    ```

  - [ ] Verificar — rodar `npm run check`, esperado: `0 errors`; os testes `design system` e `header e footer` de `tests/build.test.ts` passam.

### Squad: Artigos
**Agent:** coder-frontend

- [ ] **Task 8: Padrões geométricos, metadados e chips de categoria**
  - Files: `src/lib/patterns.test.ts`, `src/lib/patterns.ts`, `src/components/GeometricPattern.astro`, `src/components/ArticleMeta.astro`, `src/components/CategoryChip.astro`
  - [ ] Criar `src/lib/patterns.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { patternSvg } from './patterns';

    describe('patternSvg', () => {
      it('deve gerar um SVG decorativo na cor pedida para cada categoria', () => {
        // Arrange
        const categories = ['gestao', 'coerencia', 'ai', 'software', 'educacao', 'hobbies'] as const;

        // Act
        const svgs = categories.map((category) => patternSvg(category, 'currentColor'));

        // Assert
        for (const svg of svgs) {
          expect(svg).toMatch(/^<svg [^>]*aria-hidden="true"/);
          expect(svg).toContain('currentColor');
        }
        expect(new Set(svgs).size).toBe(categories.length);
      });
    });
    ```

  - [ ] Criar `src/lib/patterns.ts`:

    ```ts
    import type { CategoryKey } from '../i18n/categories';

    // Padrões geométricos por categoria (Figma Make, GeometricPattern.tsx), como SVG em texto.
    // O mesmo SVG serve ao componente GeometricPattern e às imagens OG.
    const VIEWBOX = '0 0 400 260';

    const range = (n: number) => Array.from({ length: n }, (_, i) => i);

    const shapes: Record<CategoryKey, (c: string) => string> = {
      gestao: (c) =>
        range(5)
          .map((i) => `<rect x="${40 + i * 70}" y="40" width="50" height="180" rx="1" fill="none" stroke="${c}" stroke-width="1.5" opacity="${(0.15 + i * 0.1).toFixed(2)}"/>`)
          .join('') +
        `<line x1="40" y1="130" x2="360" y2="130" stroke="${c}" stroke-width="1.5" opacity="0.3"/>` +
        `<rect x="160" y="80" width="80" height="100" rx="1" fill="${c}" opacity="0.08"/>` +
        `<line x1="200" y1="40" x2="200" y2="220" stroke="${c}" stroke-width="2" opacity="0.4"/>`,
      coerencia: (c) =>
        [60, 130, 200, 270, 340]
          .map((cx, i) => `<circle cx="${cx}" cy="130" r="${20 + i * 8}" fill="none" stroke="${c}" stroke-width="1.5" opacity="${(0.08 + i * 0.06).toFixed(2)}"/>`)
          .join('') +
        `<circle cx="200" cy="130" r="8" fill="${c}" opacity="0.5"/>` +
        `<line x1="200" y1="40" x2="200" y2="220" stroke="${c}" stroke-width="1" opacity="0.2" stroke-dasharray="4 4"/>` +
        `<line x1="40" y1="130" x2="360" y2="130" stroke="${c}" stroke-width="1" opacity="0.2" stroke-dasharray="4 4"/>`,
      ai: (c) =>
        [[200, 60], [100, 150], [200, 150], [300, 150], [150, 230], [250, 230]]
          .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}" opacity="${(0.3 + i * 0.08).toFixed(2)}"/>`)
          .join('') +
        [[200, 60, 100, 150], [200, 60, 200, 150], [200, 60, 300, 150], [100, 150, 150, 230], [200, 150, 150, 230], [200, 150, 250, 230], [300, 150, 250, 230]]
          .map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.5" opacity="0.25"/>`)
          .join('') +
        `<circle cx="200" cy="130" r="40" fill="none" stroke="${c}" stroke-width="1" opacity="0.12" stroke-dasharray="3 3"/>`,
      software: (c) =>
        range(6)
          .map((i) => `<line x1="0" y1="${40 + i * 36}" x2="400" y2="${40 + i * 36}" stroke="${c}" stroke-width="1" opacity="0.1"/>`)
          .join('') +
        `<rect x="60" y="80" width="120" height="20" rx="1" fill="${c}" opacity="0.15"/>` +
        `<rect x="60" y="116" width="80" height="20" rx="1" fill="${c}" opacity="0.1"/>` +
        `<rect x="60" y="152" width="180" height="20" rx="1" fill="${c}" opacity="0.1"/>` +
        `<rect x="60" y="188" width="60" height="20" rx="1" fill="${c}" opacity="0.2"/>`,
      educacao: (c) =>
        ['200,50 320,130 200,130', '200,130 320,130 260,210', '80,130 200,50 200,130', '80,130 200,130 140,210']
          .map((points, i) => `<polygon points="${points}" fill="none" stroke="${c}" stroke-width="1.5" opacity="${i % 2 === 0 ? 0.2 : 0.15}"/>`)
          .join('') +
        `<circle cx="200" cy="130" r="12" fill="${c}" opacity="0.3"/>` +
        [[200, 50], [320, 130], [80, 130], [260, 210], [140, 210]]
          .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="6" fill="${c}" opacity="0.2"/>`)
          .join(''),
      hobbies: (c) =>
        range(4)
          .map((i) => `<rect x="${60 + i * 80}" y="${60 + (i % 2) * 40}" width="60" height="60" rx="1" fill="none" stroke="${c}" stroke-width="1.5" opacity="${(0.1 + i * 0.08).toFixed(2)}" transform="rotate(${i * 15}, ${90 + i * 80}, ${90 + (i % 2) * 40})"/>`)
          .join('') +
        `<circle cx="200" cy="140" r="30" fill="${c}" opacity="0.06"/>` +
        `<line x1="100" y1="200" x2="300" y2="200" stroke="${c}" stroke-width="1.5" opacity="0.2"/>`,
    };

    export function patternSvg(category: CategoryKey, color: string): string {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${shapes[category](color)}</svg>`;
    }
    ```

  - [ ] Criar `src/components/GeometricPattern.astro`:

    ```astro
    ---
    import type { CategoryKey } from '../i18n/categories';
    import { patternSvg } from '../lib/patterns';

    interface Props {
      category: CategoryKey;
    }

    const { category } = Astro.props;
    ---

    <div class="pattern" set:html={patternSvg(category, 'currentColor')} />

    <style>
      .pattern {
        width: 100%;
        height: 100%;
        background: var(--surface);
        color: var(--accent);
      }

      .pattern :global(svg) {
        width: 100%;
        height: 100%;
      }
    </style>
    ```

  - [ ] Criar `src/components/ArticleMeta.astro`:

    ```astro
    ---
    import { categories } from '../i18n/categories';
    import { categoryPath } from '../i18n/routes';
    import { formatShortDate, t } from '../i18n/ui';
    import { readingTime } from '../lib/articles';
    import type { Article } from '../lib/collections';

    interface Props {
      article: Article;
      linkCategory?: boolean;
      size?: 's' | 'm';
    }

    const { article, linkCategory = false, size = 'm' } = Astro.props;
    const { lang, category, pubDate } = article.data;
    const name = categories[category].name[lang];
    ---

    <p class:list={['article-meta', 'mono', `article-meta--${size}`]}>
      {linkCategory ? <a class="category" href={categoryPath(lang, category)}>{name}</a> : <span class="category">{name}</span>}
      <span class="separator" aria-hidden="true">·</span>
      <time datetime={pubDate.toISOString()}>{formatShortDate(lang, pubDate)}</time>
      <span class="separator" aria-hidden="true">·</span>
      <span>{t(lang, 'article.readingTime', { minutes: readingTime(article.body ?? '') })}</span>
    </p>

    <style>
      .article-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-8) var(--space-12);
        color: var(--text-muted);
      }

      .article-meta--s {
        gap: var(--space-8);
        font-size: var(--fs-10);
      }

      .category {
        color: var(--accent);
        text-decoration: none;
      }

      a.category:hover {
        text-decoration: underline;
      }

      .separator {
        color: var(--border);
      }
    </style>
    ```

  - [ ] Criar `src/components/CategoryChip.astro`:

    ```astro
    ---
    interface Props {
      href: string;
      label: string;
      count?: number;
      selected?: boolean;
    }

    const { href, label, count, selected = false } = Astro.props;
    ---

    <a class="chip mono" href={href} aria-current={selected ? 'page' : undefined}>
      {label}
      {count !== undefined && <span class="count">({count})</span>}
    </a>

    <style>
      .chip {
        display: inline-flex;
        align-items: center;
        gap: var(--space-4);
        min-height: var(--touch-target);
        padding: var(--space-8) var(--space-12);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-s);
        color: var(--text-muted);
        text-decoration: none;
        white-space: nowrap;
        transition:
          color var(--duration-fast),
          border-color var(--duration-fast),
          background-color var(--duration-fast);
      }

      .chip:hover {
        color: var(--accent);
        border-color: var(--accent);
      }

      .chip[aria-current='page'] {
        background: var(--accent);
        border-color: var(--accent);
        color: var(--accent-contrast);
      }

      .count {
        opacity: 0.7;
      }
    </style>
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/patterns.test.ts`, esperado: `Tests  1 passed (1)`.

- [ ] **Task 9: Cards (padrão e destaque) e lista de artigos**
  - Files: `src/components/ArticleCard.astro`, `src/components/ArticleList.astro`
  - [ ] Substituir `src/components/ArticleCard.astro`:

    ```astro
    ---
    import { Image } from 'astro:assets';
    import ArticleMeta from './ArticleMeta.astro';
    import GeometricPattern from './GeometricPattern.astro';
    import { articlePath } from '../i18n/routes';
    import { articleSlug } from '../lib/articles';
    import type { Article } from '../lib/collections';

    interface Props {
      article: Article;
      featured?: boolean;
      headingLevel?: 'h2' | 'h3';
    }

    const { article, featured = false, headingLevel = 'h3' } = Astro.props;
    const { lang, title, description, cover, coverAlt } = article.data;
    const Heading = featured ? 'h2' : headingLevel;
    ---

    <article class:list={['card', { 'card--featured': featured }]}>
      <div class="cover">
        {
          cover ? (
            <Image src={cover} alt={coverAlt ?? ''} widths={[480, 720, 960]} sizes="(max-width: 767px) 100vw, 600px" />
          ) : (
            <GeometricPattern category={article.data.category} />
          )
        }
      </div>
      <div class="body">
        <ArticleMeta article={article} size={featured ? 'm' : 's'} />
        <Heading class="title">
          <a href={articlePath(lang, articleSlug(article))}>{title}</a>
        </Heading>
        <p class="excerpt">{description}</p>
      </div>
    </article>

    <style>
      .card {
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--bg);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
        transition: border-color var(--duration-fast);
      }

      .card:hover,
      .card:focus-within {
        border-color: var(--accent);
      }

      .cover {
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background: var(--surface);
      }

      .cover :global(img) {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .body {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--space-12);
        padding: var(--space-24);
      }

      .title {
        color: var(--accent);
        font-size: var(--fs-20);
        line-height: var(--lh-snug);
      }

      .title a {
        color: inherit;
        text-decoration: none;
      }

      /* O card inteiro é clicável sem envolver tudo num link. */
      .title a::after {
        content: '';
        position: absolute;
        inset: 0;
      }

      .title a:focus-visible {
        outline: none;
      }

      .card:has(.title a:focus-visible) {
        outline: var(--border-strong) solid var(--accent);
        outline-offset: var(--border-strong);
      }

      .excerpt {
        flex: 1;
        color: var(--text-muted);
        font-size: var(--fs-15);
        line-height: var(--lh-body);
      }

      .card--featured {
        display: grid;
        grid-template-columns: 1fr 1fr;
      }

      .card--featured .cover {
        aspect-ratio: 4 / 3;
      }

      .card--featured .body {
        justify-content: center;
        gap: var(--space-16);
        padding: var(--space-40);
      }

      .card--featured .title {
        font-size: var(--fs-26);
        line-height: var(--lh-heading);
      }

      .card--featured .excerpt {
        flex: none;
        font-size: var(--fs-16);
      }

      @media (max-width: 767px) {
        .card--featured {
          grid-template-columns: 1fr;
        }

        .card--featured .body {
          padding: var(--space-24);
        }
      }
    </style>
    ```

  - [ ] Substituir `src/components/ArticleList.astro`:

    ```astro
    ---
    import ArticleCard from './ArticleCard.astro';
    import CategoryChip from './CategoryChip.astro';
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
    const list = publishedArticles(articles, lang).filter((article) => !current || article.data.category === current);
    const [featured, ...rest] = list;
    ---

    <div class="container article-list">
      <h1>{heading}</h1>
      <nav class="filters" aria-label={t(lang, 'articles.filterLabel')}>
        <CategoryChip href={routePath('articles', lang)} label={t(lang, 'articles.all')} selected={!current} />
        {
          filters.map(({ key, count }) => (
            <CategoryChip href={categoryPath(lang, key)} label={categories[key].name[lang]} count={count} selected={key === current} />
          ))
        }
      </nav>
      {
        featured ? (
          <>
            <ArticleCard article={featured} featured />
            {rest.length > 0 && (
              <div class="grid">
                {rest.map((article) => (
                  <ArticleCard article={article} headingLevel="h2" />
                ))}
              </div>
            )}
          </>
        ) : (
          <p class="empty">{t(lang, 'articles.empty')}</p>
        )
      }
    </div>

    <style>
      .article-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-32);
        padding-top: var(--space-64);
      }

      h1 {
        font-size: var(--fs-44);
        line-height: var(--lh-heading);
      }

      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-8);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-24);
      }

      .empty {
        color: var(--text-muted);
      }

      @media (max-width: 1023px) {
        .grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 767px) {
        .article-list {
          padding-top: var(--space-40);
        }

        h1 {
          font-size: var(--fs-36);
        }

        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
    ```

  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts -t "lista de artigos"`, esperado: os 2 testes passando.

### Squad: Página de artigo
**Agent:** coder-frontend

- [ ] **Task 10: Índice, progresso de leitura, compartilhar e bloco "Quem escreve"**
  - Files: `src/lib/toc.test.ts`, `src/lib/toc.ts`, `src/lib/share.test.ts`, `src/lib/share.ts`, `src/components/ReadingProgress.astro`, `src/components/TableOfContents.astro`, `src/components/ShareBar.astro`, `src/components/AuthorBlock.astro`, `src/assets/matheus-haddad.jpg`
  - [ ] Copiar o retrato real do site antigo:

    ```bash
    mkdir -p src/assets && cp images/matheus-haddad-2025.jpg src/assets/matheus-haddad.jpg
    ```

  - [ ] Criar `src/lib/toc.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { tocItems } from './toc';

    describe('tocItems', () => {
      it('deve listar só os títulos h2 quando há duas ou mais seções', () => {
        // Arrange
        const headings = [
          { depth: 2, slug: 'um', text: 'Um' },
          { depth: 3, slug: 'detalhe', text: 'Detalhe' },
          { depth: 2, slug: 'dois', text: 'Dois' },
        ];

        // Act
        const items = tocItems(headings);

        // Assert
        expect(items.map((item) => item.slug)).toEqual(['um', 'dois']);
      });

      it('deve omitir o índice quando o artigo tem menos de duas seções', () => {
        // Arrange
        const headings = [{ depth: 2, slug: 'unica', text: 'Única' }];

        // Act
        const items = tocItems(headings);

        // Assert
        expect(items).toEqual([]);
      });
    });
    ```

  - [ ] Criar `src/lib/toc.ts`:

    ```ts
    export interface Heading {
      depth: number;
      slug: string;
      text: string;
    }

    export const MIN_TOC_ITEMS = 2;

    export function tocItems(headings: Heading[]): Heading[] {
      const sections = headings.filter((heading) => heading.depth === 2);
      return sections.length >= MIN_TOC_ITEMS ? sections : [];
    }
    ```

  - [ ] Criar `src/lib/share.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { shareUrl } from './share';

    describe('shareUrl', () => {
      it('deve montar o link do LinkedIn com a URL canônica codificada quando a rede é linkedin', () => {
        // Arrange
        const url = 'https://matheushaddad.com/artigos/meu-artigo/';

        // Act
        const link = shareUrl('linkedin', url, 'Título');

        // Assert
        expect(link).toBe(
          'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fmatheushaddad.com%2Fartigos%2Fmeu-artigo%2F',
        );
      });

      it('deve montar o link do WhatsApp com título e URL quando a rede é whatsapp', () => {
        // Arrange
        const url = 'https://matheushaddad.com/en/articles/my-article/';

        // Act
        const link = shareUrl('whatsapp', url, 'AI & power');

        // Assert
        expect(link).toBe('https://wa.me/?text=AI%20%26%20power%20https%3A%2F%2Fmatheushaddad.com%2Fen%2Farticles%2Fmy-article%2F');
      });
    });
    ```

  - [ ] Criar `src/lib/share.ts`:

    ```ts
    export type ShareNetwork = 'linkedin' | 'whatsapp';

    export function shareUrl(network: ShareNetwork, url: string, title: string): string {
      if (network === 'linkedin') {
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      }
      return `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`;
    }
    ```

  - [ ] Criar `src/components/ReadingProgress.astro`:

    ```astro
    <div class="reading-progress" aria-hidden="true" data-reading-progress></div>

    <style>
      .reading-progress {
        position: fixed;
        inset: 0 0 auto;
        z-index: var(--z-progress);
        height: var(--progress-height);
        background: var(--accent);
        transform: scaleX(0);
        transform-origin: left;
        pointer-events: none;
      }
    </style>

    <script>
      const bar = document.querySelector<HTMLElement>('[data-reading-progress]');

      function update() {
        if (!bar) return;
        const root = document.documentElement;
        const total = root.scrollHeight - root.clientHeight;
        bar.style.transform = `scaleX(${total > 0 ? Math.min(1, root.scrollTop / total) : 0})`;
      }

      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update, { passive: true });
      update();
    </script>
    ```

  - [ ] Criar `src/components/TableOfContents.astro`:

    ```astro
    ---
    import Icon from './Icon.astro';
    import { t, type Lang } from '../i18n/ui';
    import type { Heading } from '../lib/toc';

    interface Props {
      lang: Lang;
      items: Heading[];
      variant: 'sidebar' | 'collapsible';
    }

    const { lang, items, variant } = Astro.props;
    const title = t(lang, 'article.toc');
    ---

    {
      variant === 'sidebar' ? (
        <nav class="toc toc--sidebar" aria-label={title}>
          <p class="toc-title mono">{title}</p>
          <ol>
            {items.map((item) => (
              <li>
                <a href={`#${item.slug}`} data-toc-link={item.slug}>
                  {item.text}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : (
        <details class="toc toc--collapsible">
          <summary class="mono">
            {title}
            <Icon name="chevron-down" size="s" />
          </summary>
          <nav aria-label={title}>
            <ol>
              {items.map((item) => (
                <li>
                  <a href={`#${item.slug}`} data-toc-link={item.slug}>
                    {item.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </details>
      )
    }

    <style>
      ol {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      a {
        display: block;
        color: var(--text-muted);
        text-decoration: none;
        transition:
          color var(--duration-fast),
          border-color var(--duration-fast);
      }

      a:hover {
        color: var(--text);
      }

      a[aria-current='true'] {
        color: var(--accent);
      }

      .toc--sidebar {
        position: sticky;
        top: calc(var(--header-height) + var(--space-16));
        padding-left: var(--space-24);
        border-left: var(--border-width) solid var(--border);
      }

      .toc-title {
        margin-bottom: var(--space-16);
        color: var(--text-muted);
        font-size: var(--fs-10);
      }

      .toc--sidebar a {
        margin-left: calc(-1 * var(--space-24) - var(--border-width));
        padding: var(--space-4) 0 var(--space-4) var(--space-24);
        border-left: var(--border-strong) solid transparent;
        font-size: var(--fs-13);
        line-height: var(--lh-snug);
      }

      .toc--sidebar a[aria-current='true'] {
        border-left-color: var(--accent);
      }

      .toc--collapsible {
        background: var(--surface);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-s);
      }

      summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: var(--touch-target);
        padding: var(--space-12) var(--space-16);
        color: var(--text-muted);
        cursor: pointer;
        list-style: none;
      }

      summary::-webkit-details-marker {
        display: none;
      }

      details[open] summary :global(.icon) {
        transform: rotate(180deg);
      }

      .toc--collapsible nav {
        padding: 0 var(--space-16) var(--space-8);
      }

      .toc--collapsible a {
        padding-block: var(--space-8);
        border-top: var(--border-width) solid var(--border);
        font-size: var(--fs-14);
      }
    </style>

    <script>
      const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
      const sections = [...new Set(links.map((link) => link.dataset.tocLink))]
        .map((slug) => (slug ? document.getElementById(slug) : null))
        .filter((section): section is HTMLElement => section !== null);

      function activate(slug: string) {
        for (const link of links) {
          link.setAttribute('aria-current', String(link.dataset.tocLink === slug));
        }
      }

      if (sections.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) activate(entry.target.id);
            }
          },
          { rootMargin: '-20% 0px -60% 0px' },
        );
        for (const section of sections) observer.observe(section);
      }

      for (const details of document.querySelectorAll<HTMLDetailsElement>('.toc--collapsible')) {
        details.addEventListener('click', (event) => {
          if (event.target instanceof HTMLAnchorElement) details.open = false;
        });
      }
    </script>
    ```

  - [ ] Criar `src/components/ShareBar.astro`:

    ```astro
    ---
    import Icon from './Icon.astro';
    import { t, type Lang } from '../i18n/ui';
    import { gaEventAttrs } from '../lib/analytics';
    import { shareUrl } from '../lib/share';

    interface Props {
      lang: Lang;
      url: string;
      title: string;
    }

    const { lang, url, title } = Astro.props;
    ---

    <div class="share-bar">
      <span class="label mono">{t(lang, 'article.share')}</span>
      <a
        class="button button--outline share-link"
        href={shareUrl('linkedin', url, title)}
        target="_blank"
        rel="noopener"
        aria-label={t(lang, 'article.shareLinkedIn')}
        {...gaEventAttrs('share', { network: 'linkedin', lang })}
      >
        <Icon name="linkedin" />LinkedIn
      </a>
      <a
        class="button button--outline share-link"
        href={shareUrl('whatsapp', url, title)}
        target="_blank"
        rel="noopener"
        aria-label={t(lang, 'article.shareWhatsApp')}
        {...gaEventAttrs('share', { network: 'whatsapp', lang })}
      >
        <Icon name="whatsapp" />WhatsApp
      </a>
      <button
        type="button"
        class="button button--outline"
        data-copy-link={url}
        data-copied-label={t(lang, 'article.linkCopied')}
        {...gaEventAttrs('share', { network: 'copy', lang })}
      >
        <Icon name="copy" />{t(lang, 'article.copyLink')}
      </button>
      <p class="toast" role="status" aria-live="polite" data-copy-toast></p>
    </div>

    <style>
      .share-bar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--space-8);
      }

      .label {
        margin-right: var(--space-4);
        color: var(--text-muted);
      }

      .share-bar .button {
        font-size: var(--fs-13);
        font-weight: 500;
      }

      .share-link {
        color: var(--accent);
      }

      .toast {
        position: fixed;
        bottom: var(--space-24);
        left: 50%;
        z-index: var(--z-toast);
        padding: var(--space-12) var(--space-20);
        border-radius: var(--radius-s);
        background: var(--text);
        color: var(--bg);
        font-size: var(--fs-14);
        font-weight: 500;
        transform: translateX(-50%);
      }

      .toast:empty {
        display: none;
      }
    </style>

    <script>
      const TOAST_MS = 2000;

      for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy-link]')) {
        const toast = button.parentElement?.querySelector<HTMLElement>('[data-copy-toast]');
        let timer: ReturnType<typeof setTimeout> | undefined;

        button.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(button.dataset.copyLink ?? location.href);
          } catch {
            // Sem permissão de área de transferência: o aviso aparece mesmo assim.
          }
          if (!toast) return;
          toast.textContent = button.dataset.copiedLabel ?? '';
          clearTimeout(timer);
          timer = setTimeout(() => (toast.textContent = ''), TOAST_MS);
        });
      }
    </script>
    ```

  - [ ] Criar `src/components/AuthorBlock.astro`:

    ```astro
    ---
    import { Image } from 'astro:assets';
    import Icon from './Icon.astro';
    import portrait from '../assets/matheus-haddad.jpg';
    import { SITE_NAME } from '../config';
    import { routePath } from '../i18n/routes';
    import { t, type Lang } from '../i18n/ui';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;
    ---

    <aside class="author" aria-label={t(lang, 'article.author')}>
      <Image class="photo" src={portrait} alt={SITE_NAME} width={128} height={128} />
      <div>
        <p class="label mono">{t(lang, 'article.author')}</p>
        <p class="name">{SITE_NAME}</p>
        <p class="description">{t(lang, 'article.authorDesc')}</p>
        <a class="arrow-link" href={routePath('about', lang)}>{t(lang, 'article.authorLink')}<Icon name="arrow-right" size="s" /></a>
      </div>
    </aside>

    <style>
      .author {
        display: flex;
        gap: var(--space-24);
        align-items: flex-start;
        padding: var(--space-32);
        background: var(--surface);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
      }

      .author :global(.photo) {
        flex-shrink: 0;
        width: var(--space-64);
        height: var(--space-64);
        object-fit: cover;
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-round);
      }

      .label {
        color: var(--text-muted);
        font-size: var(--fs-10);
      }

      .name {
        margin-block: var(--space-4) var(--space-8);
        font-family: var(--font-display);
        font-size: var(--fs-20);
        font-weight: 600;
      }

      .description {
        margin-bottom: var(--space-12);
        color: var(--text-muted);
        font-size: var(--fs-14);
        line-height: var(--lh-snug);
      }

      @media (max-width: 767px) {
        .author {
          flex-direction: column;
          padding: var(--space-24);
        }
      }
    </style>
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/toc.test.ts src/lib/share.test.ts`, esperado: `Tests  4 passed (4)`.

- [ ] **Task 11: Layout de artigo e páginas com os títulos do índice**
  - Files: `src/layouts/ArticleLayout.astro`, `src/pages/artigos/[slug].astro`, `src/pages/en/articles/[slug].astro`
  - [ ] Substituir `src/layouts/ArticleLayout.astro`:

    ```astro
    ---
    import BaseLayout from './BaseLayout.astro';
    import ArticleMeta from '../components/ArticleMeta.astro';
    import AuthorBlock from '../components/AuthorBlock.astro';
    import Icon from '../components/Icon.astro';
    import ReadingProgress from '../components/ReadingProgress.astro';
    import ShareBar from '../components/ShareBar.astro';
    import TableOfContents from '../components/TableOfContents.astro';
    import { absoluteUrl, articlePath, routePath } from '../i18n/routes';
    import { formatDate, otherLang, t } from '../i18n/ui';
    import { articleSlug, originalPlatform } from '../lib/articles';
    import type { Article } from '../lib/collections';
    import { ogImagePath } from '../lib/og';
    import { tocItems, type Heading } from '../lib/toc';

    interface Props {
      article: Article;
      translation?: Article;
      headings: Heading[];
    }

    const { article, translation, headings } = Astro.props;
    const { lang, title, description, pubDate, updatedDate, originalUrl } = article.data;
    const slug = articleSlug(article);
    const alternatePath = translation
      ? articlePath(otherLang(lang), articleSlug(translation))
      : routePath('articles', otherLang(lang));
    const platform = originalPlatform(originalUrl);
    const toc = tocItems(headings);
    ---

    <BaseLayout
      lang={lang}
      title={title}
      description={description}
      alternatePath={alternatePath}
      type="article"
      image={ogImagePath(lang, slug)}
      publishedTime={pubDate}
      modifiedTime={updatedDate}
    >
      <ReadingProgress />
      <div class:list={['container', 'article-grid', { 'article-grid--toc': toc.length > 0 }]}>
        <article class="article">
          <a class="back mono" href={routePath('articles', lang)}><Icon name="arrow-left" size="s" />{t(lang, 'article.back')}</a>
          <header class="article-header">
            <ArticleMeta article={article} linkCategory />
            <h1>{title}</h1>
            {updatedDate && <p class="updated mono">{t(lang, 'article.updated', { date: formatDate(lang, updatedDate) })}</p>}
          </header>

          {toc.length > 0 && <div class="toc-mobile"><TableOfContents lang={lang} items={toc} variant="collapsible" /></div>}

          <div class="prose">
            <slot />
          </div>

          {
            platform && originalUrl && (
              <p class="original">
                <a href={originalUrl} target="_blank" rel="noopener">
                  {t(lang, 'article.originallyPublished', { platform, date: formatDate(lang, pubDate) })}
                </a>
              </p>
            )
          }

          <div class="share">
            <ShareBar lang={lang} url={absoluteUrl(Astro.url.pathname)} title={title} />
          </div>

          <AuthorBlock lang={lang} />
        </article>

        {toc.length > 0 && <aside class="toc-sidebar"><TableOfContents lang={lang} items={toc} variant="sidebar" /></aside>}
      </div>
    </BaseLayout>

    <style>
      .article-grid {
        display: grid;
        grid-template-columns: minmax(0, var(--width-reading));
        gap: var(--space-80);
        align-items: start;
      }

      .article-grid--toc {
        grid-template-columns: minmax(0, 1fr) var(--width-toc);
      }

      .article {
        display: flex;
        flex-direction: column;
        gap: var(--space-48);
        max-width: var(--width-reading);
        padding-top: var(--space-64);
      }

      .back {
        display: inline-flex;
        align-items: center;
        gap: var(--space-8);
        align-self: flex-start;
        color: var(--text-muted);
        text-decoration: none;
        transition: color var(--duration-fast);
      }

      .back:hover {
        color: var(--text);
      }

      .article-header {
        display: flex;
        flex-direction: column;
        gap: var(--space-24);
        margin-top: calc(-1 * var(--space-16));
      }

      h1 {
        color: var(--accent);
        font-size: var(--fs-44);
        line-height: var(--lh-heading);
      }

      .updated {
        color: var(--text-muted);
      }

      .original {
        padding: var(--space-16) var(--space-20);
        background: var(--surface);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-s);
        color: var(--text-muted);
        font-size: var(--fs-14);
        font-weight: 500;
      }

      .original a {
        color: inherit;
      }

      .share {
        padding-top: var(--space-32);
        border-top: var(--border-width) solid var(--border);
      }

      .toc-sidebar {
        height: 100%;
        padding-top: var(--space-64);
      }

      .toc-mobile {
        display: none;
      }

      @media (max-width: 1023px) {
        .article-grid,
        .article-grid--toc {
          grid-template-columns: minmax(0, 1fr);
        }

        .toc-sidebar {
          display: none;
        }

        .toc-mobile {
          display: block;
        }
      }

      @media (max-width: 767px) {
        .article {
          gap: var(--space-32);
          padding-top: var(--space-40);
        }

        h1 {
          font-size: var(--fs-32);
        }
      }
    </style>
    ```

  - [ ] Substituir `src/pages/artigos/[slug].astro`:

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
    const { Content, headings } = await render(article);
    ---

    <ArticleLayout article={article} translation={translation} headings={headings}>
      <Content />
    </ArticleLayout>
    ```

  - [ ] Substituir `src/pages/en/articles/[slug].astro`:

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
    const { Content, headings } = await render(article);
    ---

    <ArticleLayout article={article} translation={translation} headings={headings}>
      <Content />
    </ArticleLayout>
    ```

  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts -t "SEO da página de artigo"`, esperado: os 4 testes passando, exceto o de `og:image` até a Task 12.

### Squad: Imagens OG
**Agent:** coder-frontend

- [ ] **Task 12: Imagem de prévia 1200×630 gerada no build para cada artigo**
  - Files: `src/lib/og.test.ts`, `src/lib/og.ts`, `src/pages/og/[...path].png.ts`, `src/lib/seo.test.ts`, `public/og-default.png` (remover)
  - [ ] Criar `src/lib/og.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { ogImagePath, ogPaths } from './og';

    describe('ogImagePath', () => {
      it('deve seguir o caminho do artigo em cada idioma quando recebe o slug', () => {
        // Arrange
        const slug = 'meu-artigo';

        // Act
        const pt = ogImagePath('pt', slug);
        const en = ogImagePath('en', 'my-article');

        // Assert
        expect(pt).toBe('/og/artigos/meu-artigo.png');
        expect(en).toBe('/og/en/articles/my-article.png');
      });
    });

    describe('ogPaths', () => {
      it('deve gerar uma imagem por artigo publicado e a imagem padrão quando recebe os artigos', () => {
        // Arrange
        const base = { translationKey: 'k', category: 'ai' as const, pubDate: new Date('2026-01-01') };
        const entries = [
          { id: 'pt/meu-artigo', data: { ...base, title: 'Meu', lang: 'pt' as const, draft: false } },
          { id: 'en/my-article', data: { ...base, title: 'Mine', lang: 'en' as const, draft: false } },
          { id: 'pt/rascunho', data: { ...base, translationKey: 'r', title: 'R', lang: 'pt' as const, draft: true } },
        ];

        // Act
        const paths = ogPaths(entries).map((entry) => entry.params.path);

        // Assert
        expect(paths).toEqual(['default', 'artigos/meu-artigo', 'en/articles/my-article']);
      });
    });
    ```

  - [ ] Criar `src/lib/og.ts`:

    ```ts
    import { readFileSync } from 'node:fs';
    import { join } from 'node:path';
    import { Resvg } from '@resvg/resvg-js';
    import satori from 'satori';
    import { SITE_NAME } from '../config';
    import { categories, type CategoryKey } from '../i18n/categories';
    import { t, type Lang } from '../i18n/ui';
    import { articleSlug, publishedArticles, type ArticleEntry } from './articles';
    import { patternSvg } from './patterns';

    export const OG_WIDTH = 1200;
    export const OG_HEIGHT = 630;

    // A imagem é estática e fica em cache no WhatsApp/LinkedIn: usa sempre o tema
    // escuro com o verde, que é o padrão da marca (tokens.css).
    const OG_COLORS = {
      bg: '#000000',
      surface: '#161618',
      text: '#ffffff',
      muted: '#b8b8b8',
      accent: '#00f993',
    };

    export interface OgCard {
      label: string;
      title: string;
      category: CategoryKey;
    }

    export function ogImagePath(lang: Lang, slug: string): string {
      return lang === 'pt' ? `/og/artigos/${slug}.png` : `/og/en/articles/${slug}.png`;
    }

    export function ogPaths(entries: ArticleEntry[]) {
      const defaultCard: OgCard = { label: t('pt', 'hero.label'), title: t('pt', 'hero.title'), category: 'gestao' };
      const articles = (['pt', 'en'] as const).flatMap((lang) =>
        publishedArticles(entries, lang).map((article) => ({
          params: { path: ogImagePath(lang, articleSlug(article)).replace(/^\/og\//, '').replace(/\.png$/, '') },
          props: {
            card: {
              label: categories[article.data.category].name[lang],
              title: article.data.title,
              category: article.data.category,
            } satisfies OgCard,
          },
        })),
      );
      return [{ params: { path: 'default' }, props: { card: defaultCard } }, ...articles];
    }

    export function titleFontSize(title: string): number {
      if (title.length > 90) return 44;
      if (title.length > 60) return 52;
      return 60;
    }

    let fonts: { name: string; data: Buffer; weight: 500 | 600; style: 'normal' }[] | undefined;

    function loadFonts() {
      const file = (path: string) => readFileSync(join(process.cwd(), 'node_modules', path));
      fonts ??= [
        { name: 'Fraunces', data: file('@fontsource/fraunces/files/fraunces-latin-600-normal.woff'), weight: 600, style: 'normal' },
        { name: 'JetBrains Mono', data: file('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'), weight: 500, style: 'normal' },
      ];
      return fonts;
    }

    const mono = { fontFamily: 'JetBrains Mono', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase' } as const;

    export async function renderOgImage(card: OgCard): Promise<Uint8Array> {
      const pattern = `data:image/svg+xml;base64,${Buffer.from(patternSvg(card.category, OG_COLORS.accent)).toString('base64')}`;
      const tree = {
        type: 'div',
        props: {
          style: { width: OG_WIDTH, height: OG_HEIGHT, display: 'flex', background: OG_COLORS.bg, color: OG_COLORS.text, fontFamily: 'Fraunces' },
          children: [
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, width: 720 },
                children: [
                  { type: 'div', props: { style: { ...mono, color: OG_COLORS.accent }, children: card.label } },
                  { type: 'div', props: { style: { fontSize: titleFontSize(card.title), lineHeight: 1.1 }, children: card.title } },
                  { type: 'div', props: { style: { ...mono, color: OG_COLORS.muted }, children: SITE_NAME } },
                ],
              },
            },
            {
              type: 'img',
              props: { src: pattern, width: OG_WIDTH - 720, height: OG_HEIGHT, style: { objectFit: 'cover', background: OG_COLORS.surface } },
            },
          ],
        },
      };
      const svg = await satori(tree as Parameters<typeof satori>[0], { width: OG_WIDTH, height: OG_HEIGHT, fonts: loadFonts() });
      return new Resvg(svg).render().asPng();
    }
    ```

  - [ ] Criar `src/pages/og/[...path].png.ts`:

    ```ts
    import type { APIRoute, GetStaticPaths } from 'astro';
    import { getAllArticles } from '../../lib/collections';
    import { ogPaths, renderOgImage, type OgCard } from '../../lib/og';

    export const getStaticPaths = (async () => ogPaths(await getAllArticles())) satisfies GetStaticPaths;

    export const GET: APIRoute = async ({ props }) => {
      const png = await renderOgImage(props.card as OgCard);
      return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
    };
    ```

  - [ ] Substituir `src/lib/seo.test.ts`:

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
        expect(metaContent(seo, 'og:image')).toBe('https://matheushaddad.com/og/default.png');
        expect(metaContent(seo, 'og:image:width')).toBe('1200');
        expect(metaContent(seo, 'og:image:height')).toBe('630');
        expect(metaContent(seo, 'twitter:card')).toBe('summary_large_image');
        expect(metaContent(seo, 'twitter:image')).toBe('https://matheushaddad.com/og/default.png');
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

  - [ ] Remover a imagem provisória da Onda 1 (substituída por `/og/default.png`):

    ```bash
    git rm public/og-default.png
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/og.test.ts src/lib/seo.test.ts`, esperado: todos passando; `npm run build` gera `dist/og/default.png` e um PNG por artigo em `dist/og/artigos/` e `dist/og/en/articles/` (conferir com `file dist/og/**/*.png`: `PNG image data, 1200 x 630`).

### Squad: Home
**Agent:** coder-frontend

- [ ] **Task 13: Hero, faixa de prova, artigos em destaque e chamada final**
  - Files: `src/components/home/Hero.astro`, `src/components/home/ProofBand.astro`, `src/components/home/FeaturedArticles.astro`, `src/components/home/FinalCta.astro`, `src/pages/index.astro`, `src/pages/en/index.astro`
  - [ ] Criar `src/components/home/Hero.astro`:

    ```astro
    ---
    import { Image } from 'astro:assets';
    import portrait from '../../assets/matheus-haddad.jpg';
    import Icon from '../Icon.astro';
    import WhatsAppButton from '../WhatsAppButton.astro';
    import { routePath } from '../../i18n/routes';
    import { t, type Lang } from '../../i18n/ui';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;
    ---

    <section class="hero">
      <div class="container hero-grid">
        <div class="text">
          <p class="label mono">{t(lang, 'hero.label')}</p>
          <h1>{t(lang, 'hero.title')}</h1>
          <p class="subtitle">{t(lang, 'hero.subtitle')}</p>
          <div class="ctas">
            <a class="button button--secondary button--large" href={routePath('services', lang)}>
              {t(lang, 'hero.services')}
              <Icon name="arrow-right" size="s" />
            </a>
            <WhatsAppButton lang={lang} placement="hero" size="large" />
          </div>
        </div>
        <div class="portrait">
          <Image
            src={portrait}
            alt={t(lang, 'hero.portraitAlt')}
            widths={[380, 760]}
            sizes="380px"
            loading="eager"
            fetchpriority="high"
          />
          <span class="corner" aria-hidden="true"></span>
        </div>
      </div>
    </section>

    <style>
      .hero {
        border-bottom: var(--border-width) solid var(--border);
      }

      .hero-grid {
        display: grid;
        grid-template-columns: 1fr var(--width-portrait);
        gap: var(--space-64);
        align-items: center;
        padding-block: var(--space-80) var(--space-96);
      }

      .label {
        margin-bottom: var(--space-24);
        color: var(--accent);
      }

      h1 {
        max-width: var(--width-hero-title);
        margin-bottom: var(--space-24);
        font-size: var(--fs-56);
        line-height: var(--lh-display);
      }

      .subtitle {
        max-width: var(--width-hero-text);
        margin-bottom: var(--space-40);
        color: var(--text-muted);
        font-size: var(--fs-18);
        line-height: var(--lh-snug);
      }

      .ctas {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-12);
      }

      .portrait {
        position: relative;
      }

      .portrait :global(img) {
        width: 100%;
        height: auto;
        aspect-ratio: 3 / 4;
        object-fit: cover;
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
        filter: grayscale(20%);
      }

      .corner {
        position: absolute;
        bottom: calc(-1 * var(--space-16));
        left: calc(-1 * var(--space-16));
        width: var(--space-64);
        height: var(--space-64);
        border-bottom: var(--border-strong) solid var(--accent);
        border-left: var(--border-strong) solid var(--accent);
      }

      @media (max-width: 1023px) {
        .hero-grid {
          grid-template-columns: 1fr var(--width-portrait-tablet);
          gap: var(--space-40);
        }

        h1 {
          font-size: var(--fs-44);
        }
      }

      @media (max-width: 767px) {
        .hero-grid {
          grid-template-columns: 1fr;
          padding-block: var(--space-48) var(--space-64);
        }

        h1 {
          font-size: var(--fs-36);
        }

        .portrait {
          display: none;
        }
      }
    </style>
    ```

  - [ ] Criar `src/components/home/ProofBand.astro`:

    ```astro
    ---
    import { t, type Lang, type UIKey } from '../../i18n/ui';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;

    // Números confirmados pelo autor em 01/10/2026.
    const stats: { value: string; label: UIKey }[] = [
      { value: '5', label: 'proof.companies' },
      { value: '15+', label: 'proof.years' },
      { value: '500+', label: 'proof.leaders' },
    ];

    const companies = [
      'Webgoal',
      'Ateliê de Software',
      'Granatum',
      'Lumiar',
      'Orgganica',
      'Aliança Empreendedora',
      'A Guarda-Chuva',
      'TugÁgil',
    ];
    ---

    <section class="proof" aria-label={t(lang, 'proof.label')}>
      <div class="container">
        <dl class="stats">
          {
            stats.map((stat) => (
              <div class="stat">
                <dt class="mono">{t(lang, stat.label)}</dt>
                <dd>{stat.value}</dd>
              </div>
            ))
          }
        </dl>
        <div class="companies">
          <p class="mono title">{t(lang, 'proof.logos')}</p>
          <ul>
            {companies.map((name) => <li>{name}</li>)}
          </ul>
        </div>
      </div>
    </section>

    <style>
      .proof {
        padding-block: var(--space-48);
        background: var(--surface);
        border-bottom: var(--border-width) solid var(--border);
      }

      .stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--space-32);
        margin: 0 0 var(--space-48);
      }

      .stat {
        display: flex;
        flex-direction: column-reverse;
        align-items: center;
        gap: var(--space-8);
        padding: var(--space-24);
        text-align: center;
      }

      dd {
        margin: 0;
        font-family: var(--font-display);
        font-size: var(--fs-48);
        font-weight: 600;
        line-height: var(--lh-none);
      }

      dt {
        color: var(--text-muted);
      }

      .companies {
        padding-top: var(--space-32);
        border-top: var(--border-width) solid var(--border);
      }

      .title {
        margin-bottom: var(--space-24);
        color: var(--text-muted);
        font-size: var(--fs-10);
      }

      ul {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-16);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      li {
        padding: var(--space-8) var(--space-16);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-s);
        color: var(--text-muted);
        font-size: var(--fs-13);
        font-weight: 600;
      }

      @media (max-width: 767px) {
        .stats {
          grid-template-columns: 1fr;
          gap: 0;
        }

        .stat {
          padding: var(--space-16);
        }
      }
    </style>
    ```

  - [ ] Criar `src/components/home/FeaturedArticles.astro`:

    ```astro
    ---
    import ArticleCard from '../ArticleCard.astro';
    import Icon from '../Icon.astro';
    import { routePath } from '../../i18n/routes';
    import { t, type Lang } from '../../i18n/ui';
    import { publishedArticles } from '../../lib/articles';
    import type { Article } from '../../lib/collections';

    interface Props {
      lang: Lang;
      articles: Article[];
    }

    const { lang, articles } = Astro.props;
    const [featured, ...others] = publishedArticles(articles, lang).slice(0, 3);
    ---

    {
      featured && (
        <section class="featured-articles" aria-labelledby="featured-heading">
          <div class="container">
            <div class="heading">
              <h2 id="featured-heading">{t(lang, 'home.featured')}</h2>
              <a class="arrow-link" href={routePath('articles', lang)}>
                {t(lang, 'home.allArticles')}
                <Icon name="arrow-right" size="s" />
              </a>
            </div>
            <ArticleCard article={featured} featured />
            {others.length > 0 && (
              <div class="grid">
                {others.map((article) => (
                  <ArticleCard article={article} />
                ))}
              </div>
            )}
          </div>
        </section>
      )
    }

    <style>
      .featured-articles {
        padding-block: var(--space-80);
        border-bottom: var(--border-width) solid var(--border);
      }

      .heading {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: var(--space-16);
        margin-bottom: var(--space-40);
      }

      h2 {
        font-size: var(--fs-32);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--col-min-card), 1fr));
        gap: var(--space-24);
        margin-top: var(--space-24);
      }

      @media (max-width: 767px) {
        .featured-articles {
          padding-block: var(--space-64);
        }

        h2 {
          font-size: var(--fs-26);
        }

        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
    ```

  - [ ] Criar `src/components/home/FinalCta.astro`:

    ```astro
    ---
    import WhatsAppButton from '../WhatsAppButton.astro';
    import { t, type Lang } from '../../i18n/ui';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;
    ---

    <section class="final-cta" aria-labelledby="cta-heading">
      <div class="container inner">
        <h2 id="cta-heading">{t(lang, 'home.ctaTitle')}</h2>
        <p>{t(lang, 'home.ctaText')}</p>
        <WhatsAppButton lang={lang} placement="home-cta" size="large" />
      </div>
    </section>

    <style>
      .final-cta {
        background: var(--accent-subtle);
        border-bottom: var(--border-width) solid var(--border);
      }

      .inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-16);
        max-width: var(--width-reading);
        padding-block: var(--space-96);
        text-align: center;
      }

      h2 {
        font-size: var(--fs-40);
        line-height: var(--lh-heading);
      }

      p {
        margin-bottom: var(--space-24);
        color: var(--text-muted);
        font-size: var(--fs-18);
        line-height: var(--lh-snug);
      }

      @media (max-width: 767px) {
        .inner {
          padding-block: var(--space-64);
        }

        h2 {
          font-size: var(--fs-32);
        }
      }
    </style>
    ```

  - [ ] Substituir `src/pages/index.astro`:

    ```astro
    ---
    import FeaturedArticles from '../components/home/FeaturedArticles.astro';
    import FinalCta from '../components/home/FinalCta.astro';
    import Hero from '../components/home/Hero.astro';
    import ProofBand from '../components/home/ProofBand.astro';
    import BaseLayout from '../layouts/BaseLayout.astro';
    import { routePath } from '../i18n/routes';
    import { t } from '../i18n/ui';
    import { getAllArticles } from '../lib/collections';

    const lang = 'pt';
    const articles = await getAllArticles();
    ---

    <BaseLayout lang={lang} title={t(lang, 'home.title')} description={t(lang, 'site.description')} alternatePath={routePath('home', 'en')}>
      <Hero lang={lang} />
      <ProofBand lang={lang} />
      <FeaturedArticles lang={lang} articles={articles} />
      <FinalCta lang={lang} />
    </BaseLayout>
    ```

  - [ ] Substituir `src/pages/en/index.astro`:

    ```astro
    ---
    import FeaturedArticles from '../../components/home/FeaturedArticles.astro';
    import FinalCta from '../../components/home/FinalCta.astro';
    import Hero from '../../components/home/Hero.astro';
    import ProofBand from '../../components/home/ProofBand.astro';
    import BaseLayout from '../../layouts/BaseLayout.astro';
    import { routePath } from '../../i18n/routes';
    import { t } from '../../i18n/ui';
    import { getAllArticles } from '../../lib/collections';

    const lang = 'en';
    const articles = await getAllArticles();
    ---

    <BaseLayout lang={lang} title={t(lang, 'home.title')} description={t(lang, 'site.description')} alternatePath={routePath('home', 'pt')}>
      <Hero lang={lang} />
      <ProofBand lang={lang} />
      <FeaturedArticles lang={lang} articles={articles} />
      <FinalCta lang={lang} />
    </BaseLayout>
    ```

  - [ ] Verificar — rodar `npm test`, esperado: `Test Files  16 passed (16)` e `Tests  107 passed (107)`.
  - [ ] Verificar — rodar `npm run check`, esperado: `0 errors`, `0 warnings`, `0 hints`.
  - [ ] Verificar — rodar `npm run build`, esperado: `Complete!` com as páginas dos 3 artigos reais e 7 imagens em `dist/og/`.
  - [ ] Verificação visual — `npm run preview` e capturas em 1440 px e 390 px da home, da lista e de um artigo, nos temas escuro e claro, comparadas com o Figma Make.


### Correções da revisão (iteração 1 → 2)

- **Fontes:** o provedor `npm` ignorava `subsets: ['latin']` e fazia preload de 10 arquivos (cirílico, grego, vietnamita). `astro.config.mjs` passou a usar `fontProviders.local()`, apontando para os arquivos `latin` dos mesmos pacotes `@fontsource`: Fraunces `opsz` normal e itálico, Inter `wght` normal e itálico (o itálico estava sendo simulado pelo navegador) e JetBrains Mono 400/500. `BaseLayout.astro` usa `preload={[{ style: 'normal' }]}`. Resultado: 6 arquivos de fonte (antes 16) e 2 em preload (115 KB). O teste de build exige exatamente 2 preloads.
- **Acessibilidade:** em `Header.astro`, o texto do botão de WhatsApp abaixo de 1024 px passou de `display: none` para ocultação só visual, mantendo o nome acessível do link. Um teste de build verifica o CSS gerado e foi validado contra o defeito antigo.
