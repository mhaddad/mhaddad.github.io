# Novo site em Astro — Onda 3: Converter

**Tech Design Plan:** `.darkside/tech-design/2026-09-28-novo-site-astro-plan.md`
**Copy aprovada:** `.darkside/content/2026-10-01-copy-servicos.md`
**Fonte de design:** Figma Make `Qc3aGJIstqsCK6jdI415l2`, tela `Services.tsx` (hub e página de serviço)

## Order

### Escopo

Passos 11 a 13 da Onda 3 do plano, com a copy aprovada em 01/10/2026.

| # | Passo do plano | O que entra |
|---|---|---|
| 11 | Páginas de serviço | Hub `/servicos/`, `/consultoria/`, `/mentoria/` e o bloco de serviço de `/palestras/`, em PT e EN, a partir da coleção `services` |
| 12 | Botão de WhatsApp por página + GA4 | A mensagem pré-preenchida cita a página ou o artigo de origem; o evento `whatsapp_click` passa a levar `service` |
| 13 | Chamada no fim do artigo | Bloco "Vamos conversar" por categoria (ou pelo campo `service` do artigo), com mensagem que cita o título do artigo |
| — | Correção de estilo | Remover os 3 travessões de `ui.ts` em PT e EN (decisão do autor, regra 2.1 do estilo) |

**Fora do escopo:**
- Onda 4: o acervo de vídeos em `/palestras/` e os logos reais das empresas.
- Onda 5: artigos relacionados por tema no fim do artigo.
- UTMs nos links distribuídos. O GA4 já lê UTMs sozinho; montá-los é tarefa de quem distribui os links.

### Abordagem e arquitetura

- **Conteúdo dos serviços em coleção**, como o plano prevê: `src/content/services/{pt,en}/<chave>.md`, com chaves `consultoria`, `mentoria` e `palestras`. O frontmatter traz rótulo, título, subtítulo, resumo do card, para quem é, problema, temas, passos, formato (mentoria e palestras), texto e rótulo do botão, mensagem do WhatsApp e `translationKey` dos artigos relacionados. O schema em `content.config.ts` é reescrito; a coleção estava vazia.
- **Regras entre arquivos no build**, no mesmo molde de `validateArticles`. A função `validateServices` exige as 3 chaves nos 2 idiomas e que os artigos relacionados existam e estejam publicados. Se falhar, o build falha.
- **Rotas do contrato:** cada serviço tem rota própria (`/consultoria/` e `/en/consulting/`, `/mentoria/` e `/en/mentoring/`, `/palestras/` e `/en/speaking/`), via o mapa `serviceRoutes` (chave do serviço → `RouteKey`). As páginas são wrappers finos de um componente `ServicePage`.
- **`/palestras/` é "Palestras e Mídia":** nesta onda recebe o bloco de serviço (temas, formatos, como funciona); o acervo de vídeos entra embaixo na Onda 4. Fica uma página só sobre palestras, sem duplicata.
- **Mensagem de WhatsApp por página:** o helper `pageWhatsappMessage(lang, pageTitle?)` monta "Olá, Matheus! Vim pela página "<título>" do seu site...". A home usa a mensagem genérica. O `BaseLayout` repassa o título ao header e ao footer. Serviços e chamadas de artigo usam mensagens próprias.
- **Evento do GA4:** `whatsapp_click` com `lang`, `placement`, `page_path` e `service` (`consultoria`, `mentoria`, `palestras` ou `none`), conforme o critério técnico "GA4 registra o evento de clique no WhatsApp com página, idioma e serviço".
- **Chamada no fim do artigo:** `articleCta(category, service?)` resolve o serviço (campo do artigo ou mapa da categoria) e os textos. Hobbies não tem chamada. O componente `ArticleCta` entra depois do bloco "Quem escreve", como no Figma.
- **Navegação:** "Serviços" fica ativo no hub, em Consultoria e em Mentoria; "Palestras e Mídia" fica ativo em `/palestras/` (campo `also` em `mainNav`).
- **Visual:** fiel ao `Services.tsx`, só com tokens existentes (novos tokens apenas para a largura da coluna lateral e o diâmetro do número dos passos).

### Componentes e arquivos

| Área | Arquivos |
|---|---|
| Conteúdo | `src/content.config.ts` (schema `services`), `src/content/services/{pt,en}/{consultoria,mentoria,palestras}.md` |
| Regras | `src/lib/services.ts` (`validateServices`, `serviceRoutes`, `servicePath`), `src/lib/collections.ts` (`getAllServices`), `src/lib/cta.ts` (`articleCta`), `src/lib/whatsapp.ts` (`pageWhatsappMessage`), `src/i18n/categories.ts` (serviço padrão por categoria), `src/i18n/navigation.ts` (`also`) |
| Componentes | `ServicePage.astro`, `ServicesHub.astro`, `ServiceCard.astro`, `ServiceSteps.astro`, `CheckList.astro`, `ArticleCta.astro`, `WhatsAppButton.astro` (prop `service`), `Icon.astro` (ícone `check`), `Header.astro`, `Footer.astro`, `BaseLayout.astro`, `ArticleLayout.astro` |
| Páginas | `src/pages/servicos/`, `consultoria/`, `mentoria/`, `palestras/` e os equivalentes em `src/pages/en/` |
| i18n | `src/i18n/ui.ts`: textos novos + correção dos travessões |

### Ordem de implementação e justificativa

1. **Conteúdo e regras.** Schema, os 6 arquivos de serviço e `validateServices`. Todo o resto lê daqui.
2. **WhatsApp por página e GA4.** Muda o botão usado em todas as páginas; precisa estar pronto antes das páginas de serviço.
3. **Páginas de serviço.** Hub e as 3 páginas, nos dois idiomas.
4. **Chamada no fim do artigo.** Depende do mapa categoria → serviço e das rotas de serviço.
5. **Correção dos travessões.** Isolada, por último, com teste que impede o retorno.

### Estratégia de testes

- **Unitários:**
  - `validateServices`: chave ou idioma faltando, artigo relacionado inexistente ou em rascunho.
  - `servicePath`: as rotas do contrato.
  - `pageWhatsappMessage`: mensagem com título e mensagem genérica.
  - `articleCta`: campo `service` vence a categoria, Hobbies fica sem chamada e a mensagem cita o artigo.
  - `isCurrent`: o item ativo nas páginas de serviço.
  - Dicionário: nenhum texto com travessão (—), nos dois idiomas.
- **De build (fixtures):**
  - As 4 páginas nos 2 idiomas, nos caminhos do contrato, com `hreflang` cruzado.
  - Seções e passos presentes.
  - Botão de WhatsApp com a mensagem do serviço e `service` no evento.
  - Artigos relacionados linkados.
  - Chamada no fim do artigo com o serviço certo e o título do artigo na mensagem.
  - O botão do header de um artigo cita o título.
  - Fixtures de serviço em `tests/fixtures/services/`, via `SERVICES_DIR`, com o mesmo mecanismo do `ARTICLES_DIR`.
- **Revisão visual:** capturas do hub e de uma página de serviço nos dois temas, no desktop e no celular, comparadas com o Figma.

### Decisões técnicas e trade-offs

| Decisão | Alternativa | Motivo |
|---|---|---|
| Serviços em Markdown com frontmatter estruturado | Textos no dicionário `ui.ts` | Plano prevê a coleção; conteúdo editável sem tocar em código; schema valida a estrutura |
| `translationKey` para artigos relacionados | Slug | O `translationKey` vale nos dois idiomas e não muda |
| Mensagem do header com o título da página | Mensagem genérica em todo lugar | Discovery: a mensagem identifica a página de origem, que é como o autor mede o risco 1 |
| `/palestras/` com o bloco de serviço + acervo (Onda 4) | Página de serviço separada | Contrato de URLs não prevê outra rota; evita duas páginas sobre o mesmo assunto |
| Chamada por categoria com `service` opcional no artigo | Só pelo campo do artigo | Funciona para os 35 artigos sem editar cada um; o campo resolve exceções |

### Considerações de segurança

- As mensagens do WhatsApp passam por `encodeURIComponent` (`whatsappUrl`). Títulos de artigo com aspas, `&` ou `#` não quebram a URL, e um teste cobre esse caso.
- Não entra nenhum terceiro novo, nenhum script novo e nenhuma dependência nova.
- O conteúdo dos serviços é do autor e entra no repositório, renderizado como texto (sem `set:html`).

### Riscos

| Risco | Mitigação |
|---|---|
| Tradução da copy para EN sem revisão | Tradução feita aqui, com o glossário da skill; Matheus revisa junto com os 3 artigos |
| Artigo relacionado ainda não publicado (os 32 restantes chegam na Onda 4) | `validateServices` exige artigo publicado; por ora, só os 3 já publicados |

## Tasks

> Código validado em protótipo em 01/10/2026: 140 testes passando (19 arquivos), `astro check` sem erros, avisos nem hints, e capturas conferidas contra o `Services.tsx` do Figma Make (hub e Consultoria no desktop, Mentoria no celular, chamada no fim do artigo, nos dois temas).

> **TDD:** em cada squad, os `*.test.ts` são escritos e executados primeiro e devem falhar; depois vem a implementação. Os testes de build da Task 1 ficam vermelhos até o squad que entrega cada parte.

### Squad: Conteúdo e regras
**Agent:** coder-frontend

- [ ] **Task 1: Testes de integração da Onda 3 e fixtures de serviço**
  - Files: `tests/build.test.ts`, `tests/fixtures/articles/pt/segundo-artigo.md`, `tests/fixtures/articles/en/second-article.md`, `tests/fixtures/services/en/consultoria.md`, `tests/fixtures/services/en/mentoria.md`, `tests/fixtures/services/en/palestras.md`, `tests/fixtures/services/pt/consultoria.md`, `tests/fixtures/services/pt/mentoria.md`, `tests/fixtures/services/pt/palestras.md`
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
        env: { ...buildEnv, ARTICLES_DIR: './tests/fixtures/articles', SERVICES_DIR: './tests/fixtures/services' },
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
        // Só título e texto, no subconjunto latin: mais que isso disputa banda no 4G.
        expect(preloads.length).toBe(2);
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
        // No celular o texto some da tela, mas precisa continuar sendo o nome acessível:
        // display:none tiraria o texto da árvore de acessibilidade.
        const css = [
          ...[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? ''),
          ...[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => readFileSync(join(OUT_DIR, m[1] ?? ''), 'utf8')),
        ].join('');
        const labelRules = [...css.matchAll(/[^{}]*whatsapp-label[^{}]*\{([^}]*)\}/g)].map((m) => m[1] ?? '');
        expect(html).toMatch(/whatsapp-header"[^>]*>[\s\S]*?<span class="whatsapp-label">Chat on WhatsApp<\/span>/);
        expect(labelRules.length).toBeGreaterThan(0);
        expect(labelRules.some((rule) => /display:\s*none/.test(rule))).toBe(false);
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

    describe('páginas de serviço — Onda 3', () => {
      const pages = [
        ['servicos/index.html', 'en/services/index.html'],
        ['consultoria/index.html', 'en/consulting/index.html'],
        ['mentoria/index.html', 'en/mentoring/index.html'],
        ['palestras/index.html', 'en/speaking/index.html'],
      ];

      it('deve gerar o hub e os 3 serviços nos dois idiomas com hreflang cruzado quando o build termina', () => {
        // Arrange
        const pairs = pages;

        // Act
        const crossLinks = pairs.map(([pt = '', en = '']) => {
          const ptPath = `/${pt.replace('index.html', '')}`;
          const enPath = `/${en.replace('index.html', '')}`;
          return (
            page(pt).includes(`hreflang="en" href="${SITE}${enPath}"`) && page(en).includes(`hreflang="pt-BR" href="${SITE}${ptPath}"`)
          );
        });

        // Assert
        expect(crossLinks).toEqual([true, true, true, true]);
      });

      it('deve listar os 3 serviços na ordem com link para cada página quando o hub é gerado', () => {
        // Arrange
        const html = page('servicos/index.html');

        // Act
        const links = [...html.matchAll(/<article class="service-card"[\s\S]*?<h2[^>]*><a href="([^"]+)"/g)].map((m) => m[1]);

        // Assert
        expect(links).toEqual(['/consultoria/', '/mentoria/', '/palestras/']);
      });

      it('deve mostrar as seções, os 3 passos e os artigos relacionados quando a página é de serviço', () => {
        // Arrange
        const html = page('consultoria/index.html');

        // Act
        const sections = [...html.matchAll(/<h2 id="[a-z]+-heading" class="section-title mono"[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
        const steps = (html.match(/<li[^>]*><span class="number mono"/g) ?? []).length;
        const related = /<section aria-labelledby="related-heading"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

        // Assert
        expect(sections).toEqual(['Para quem é', 'O problema', 'Temas e abordagens', 'Como funciona', 'Artigos relacionados']);
        expect(steps).toBe(3);
        expect(related).toContain('href="/artigos/primeiro-artigo/"');
        expect(related).toContain('href="/artigos/segundo-artigo/"');
      });

      it('deve mostrar o formato na mentoria e a lista de formatos nas palestras quando o serviço os define', () => {
        // Arrange
        const mentoria = page('en/mentoring/index.html');
        const palestras = page('palestras/index.html');

        // Act
        const format = /<p class="format mono"[^>]*>([^<]+)<\/p>/.exec(mentoria)?.[1];
        const formats = /<ul class="formats"[\s\S]*?<\/ul>/.exec(palestras)?.[0] ?? '';

        // Assert
        expect(format).toBe('Formato de teste (en)');
        expect(formats).toContain('Formato A (pt)');
        expect(formats).toContain('Formato B (pt)');
      });

      it('deve levar a mensagem e o serviço no WhatsApp quando a página é de serviço', () => {
        // Arrange
        const html = page('consultoria/index.html');
        const encoded = encodeURIComponent('Mensagem de consultoria em pt & teste');

        // Act
        const links = [...html.matchAll(new RegExp(`<a [^>]*href="https://wa\\.me/5535988867870\\?text=${encoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g'))].map((m) => m[0]);

        // Assert
        expect(links.length).toBeGreaterThanOrEqual(4);
        expect(links.filter((link) => link.includes('&quot;service&quot;:&quot;consultoria&quot;')).length).toBe(2);
      });

      it('deve acender "Serviços" no menu quando a página é de consultoria', () => {
        // Arrange
        const html = page('consultoria/index.html');

        // Act
        const nav = /<nav class="desktop-nav"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '';
        const current = /<a href="([^"]+)" aria-current="page"/.exec(nav)?.[1];

        // Assert
        expect(current).toBe('/servicos/');
      });
    });

    describe('WhatsApp por página e chamada no fim do artigo — Onda 3', () => {
      it('deve citar o título do artigo na mensagem do header quando a página é de artigo', () => {
        // Arrange
        const html = page('artigos/primeiro-artigo/index.html');
        const message = 'Olá, Matheus! Vim pela página "Primeiro artigo de teste" do seu site e gostaria de conversar.';

        // Act
        const header = /<header class="site-header"[\s\S]*?<\/header>/.exec(html)?.[0] ?? '';

        // Assert
        expect(header).toContain(`text=${encodeURIComponent(message)}`);
      });

      it('deve usar a mensagem genérica no header quando a página é a home', () => {
        // Arrange
        const html = page('index.html');
        const message = 'Olá, Matheus! Vim pelo seu site e gostaria de conversar.';

        // Act
        const header = /<header class="site-header"[\s\S]*?<\/header>/.exec(html)?.[0] ?? '';

        // Assert
        expect(header).toContain(`text=${encodeURIComponent(message)}`);
      });

      it('deve mostrar a chamada da categoria com o título do artigo na mensagem quando o artigo não define serviço', () => {
        // Arrange
        const html = page('artigos/primeiro-artigo/index.html');
        const message = 'Olá, Matheus! Li o artigo "Primeiro artigo de teste" no seu site e gostaria de conversar sobre consultoria.';

        // Act
        const cta = /<section class="article-cta"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

        // Assert
        expect(cta).toContain('data-cta-service="consultoria"');
        expect(cta).toContain('Sua empresa está redesenhando a gestão com IA?');
        expect(cta).toContain(`text=${encodeURIComponent(message)}`);
        expect(cta).toContain('href="/consultoria/"');
      });

      it('deve usar o serviço do artigo quando o frontmatter define service', () => {
        // Arrange
        const html = page('en/articles/second-article/index.html');

        // Act
        const cta = /<section class="article-cta"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

        // Assert
        expect(cta).toContain('data-cta-service="mentoria"');
        expect(cta).toContain('Is your company rethinking its management model?');
        expect(cta).toContain(encodeURIComponent('would like to talk about mentoring.'));
        expect(cta).toContain('href="/en/mentoring/"');
      });
    });
    ```

  - [ ] Substituir `tests/fixtures/articles/pt/segundo-artigo.md`:

    ```markdown
    ---
    title: Segundo artigo de teste
    description: Descrição do segundo artigo de teste.
    pubDate: 2026-09-15
    category: gestao
    service: mentoria
    lang: pt
    translationKey: fixture-segundo
    ---

    Texto do segundo artigo.
    ```

  - [ ] Substituir `tests/fixtures/articles/en/second-article.md`:

    ```markdown
    ---
    title: Second test article
    description: Description of the second test article.
    pubDate: 2026-09-15
    category: gestao
    service: mentoria
    lang: en
    translationKey: fixture-segundo
    ---

    Text of the second article.
    ```

  - [ ] Criar `tests/fixtures/services/en/consultoria.md`:

    ```markdown
    ---
    key: consultoria
    lang: en
    order: 1
    label: Rótulo consultoria en
    title: Título de consultoria em en
    description: Descrição de consultoria em en.
    subtitle: Subtítulo de consultoria em en.
    cardTitle: Card consultoria en
    summary: Resumo de consultoria em en.
    audience: Público de consultoria em en.
    problem: Problema de consultoria em en.
    topics:
      - title: Tema 1 de consultoria
        text: Texto do tema 1.
      - title: Tema 2 de consultoria
        text: Texto do tema 2.
    steps:
      - title: Passo 1 de consultoria
        text: Texto do passo 1.
      - title: Passo 2 de consultoria
        text: Texto do passo 2.
      - title: Passo 3 de consultoria
        text: Texto do passo 3.

    ctaLabel: Botão de consultoria en
    ctaText: Texto lateral de consultoria en.
    whatsappMessage: Mensagem de consultoria em en & teste
    relatedArticles:
      - fixture-primeiro
      - fixture-segundo
    ---
    ```

  - [ ] Criar `tests/fixtures/services/en/mentoria.md`:

    ```markdown
    ---
    key: mentoria
    lang: en
    order: 2
    label: Rótulo mentoria en
    title: Título de mentoria em en
    description: Descrição de mentoria em en.
    subtitle: Subtítulo de mentoria em en.
    cardTitle: Card mentoria en
    summary: Resumo de mentoria em en.
    audience: Público de mentoria em en.
    problem: Problema de mentoria em en.
    topics:
      - title: Tema 1 de mentoria
        text: Texto do tema 1.
      - title: Tema 2 de mentoria
        text: Texto do tema 2.
    steps:
      - title: Passo 1 de mentoria
        text: Texto do passo 1.
      - title: Passo 2 de mentoria
        text: Texto do passo 2.
      - title: Passo 3 de mentoria
        text: Texto do passo 3.
    format: Formato de teste (en)
    ctaLabel: Botão de mentoria en
    ctaText: Texto lateral de mentoria en.
    whatsappMessage: Mensagem de mentoria em en & teste
    relatedArticles:
      - fixture-segundo
    ---
    ```

  - [ ] Criar `tests/fixtures/services/en/palestras.md`:

    ```markdown
    ---
    key: palestras
    lang: en
    order: 3
    label: Rótulo palestras en
    title: Título de palestras em en
    description: Descrição de palestras em en.
    subtitle: Subtítulo de palestras em en.
    cardTitle: Card palestras en
    summary: Resumo de palestras em en.
    audience: Público de palestras em en.
    problem: Problema de palestras em en.
    topics:
      - title: Tema 1 de palestras
        text: Texto do tema 1.
      - title: Tema 2 de palestras
        text: Texto do tema 2.
    steps:
      - title: Passo 1 de palestras
        text: Texto do passo 1.
      - title: Passo 2 de palestras
        text: Texto do passo 2.
      - title: Passo 3 de palestras
        text: Texto do passo 3.
    formats:
      - Formato A (en)
      - Formato B (en)
    ctaLabel: Botão de palestras en
    ctaText: Texto lateral de palestras en.
    whatsappMessage: Mensagem de palestras em en & teste
    relatedArticles:
      - fixture-segundo
    ---
    ```

  - [ ] Criar `tests/fixtures/services/pt/consultoria.md`:

    ```markdown
    ---
    key: consultoria
    lang: pt
    order: 1
    label: Rótulo consultoria pt
    title: Título de consultoria em pt
    description: Descrição de consultoria em pt.
    subtitle: Subtítulo de consultoria em pt.
    cardTitle: Card consultoria pt
    summary: Resumo de consultoria em pt.
    audience: Público de consultoria em pt.
    problem: Problema de consultoria em pt.
    topics:
      - title: Tema 1 de consultoria
        text: Texto do tema 1.
      - title: Tema 2 de consultoria
        text: Texto do tema 2.
    steps:
      - title: Passo 1 de consultoria
        text: Texto do passo 1.
      - title: Passo 2 de consultoria
        text: Texto do passo 2.
      - title: Passo 3 de consultoria
        text: Texto do passo 3.

    ctaLabel: Botão de consultoria pt
    ctaText: Texto lateral de consultoria pt.
    whatsappMessage: Mensagem de consultoria em pt & teste
    relatedArticles:
      - fixture-primeiro
      - fixture-segundo
    ---
    ```

  - [ ] Criar `tests/fixtures/services/pt/mentoria.md`:

    ```markdown
    ---
    key: mentoria
    lang: pt
    order: 2
    label: Rótulo mentoria pt
    title: Título de mentoria em pt
    description: Descrição de mentoria em pt.
    subtitle: Subtítulo de mentoria em pt.
    cardTitle: Card mentoria pt
    summary: Resumo de mentoria em pt.
    audience: Público de mentoria em pt.
    problem: Problema de mentoria em pt.
    topics:
      - title: Tema 1 de mentoria
        text: Texto do tema 1.
      - title: Tema 2 de mentoria
        text: Texto do tema 2.
    steps:
      - title: Passo 1 de mentoria
        text: Texto do passo 1.
      - title: Passo 2 de mentoria
        text: Texto do passo 2.
      - title: Passo 3 de mentoria
        text: Texto do passo 3.
    format: Formato de teste (pt)
    ctaLabel: Botão de mentoria pt
    ctaText: Texto lateral de mentoria pt.
    whatsappMessage: Mensagem de mentoria em pt & teste
    relatedArticles:
      - fixture-segundo
    ---
    ```

  - [ ] Criar `tests/fixtures/services/pt/palestras.md`:

    ```markdown
    ---
    key: palestras
    lang: pt
    order: 3
    label: Rótulo palestras pt
    title: Título de palestras em pt
    description: Descrição de palestras em pt.
    subtitle: Subtítulo de palestras em pt.
    cardTitle: Card palestras pt
    summary: Resumo de palestras em pt.
    audience: Público de palestras em pt.
    problem: Problema de palestras em pt.
    topics:
      - title: Tema 1 de palestras
        text: Texto do tema 1.
      - title: Tema 2 de palestras
        text: Texto do tema 2.
    steps:
      - title: Passo 1 de palestras
        text: Texto do passo 1.
      - title: Passo 2 de palestras
        text: Texto do passo 2.
      - title: Passo 3 de palestras
        text: Texto do passo 3.
    formats:
      - Formato A (pt)
      - Formato B (pt)
    ctaLabel: Botão de palestras pt
    ctaText: Texto lateral de palestras pt.
    whatsappMessage: Mensagem de palestras em pt & teste
    relatedArticles:
      - fixture-segundo
    ---
    ```

  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts`, esperado: os testes dos blocos `páginas de serviço — Onda 3` e `WhatsApp por página e chamada no fim do artigo — Onda 3` falham; os das ondas anteriores continuam passando.

- [ ] **Task 2: Regras dos serviços (rotas, validação, relacionados)**
  - Files: `src/lib/services.test.ts`, `src/lib/services.ts`
  - [ ] Criar `src/lib/services.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import type { ArticleEntry } from './articles';
    import {
      ServiceValidationError,
      relatedArticlesFor,
      serviceFor,
      servicePath,
      servicesFor,
      validateServices,
      type ServiceData,
      type ServiceEntry,
    } from './services';

    function service(id: string, data: Partial<ServiceData> = {}): ServiceEntry {
      const [lang, key] = id.split('/') as [ServiceData['lang'], ServiceData['key']];
      return { id, data: { key, lang, order: 1, relatedArticles: [], ...data } };
    }

    function article(id: string, translationKey: string, draft = false): ArticleEntry {
      const lang = id.startsWith('en/') ? 'en' : 'pt';
      return {
        id,
        data: { title: id, lang, translationKey, category: 'gestao', pubDate: new Date('2026-01-01'), draft },
      };
    }

    const complete = ['pt', 'en'].flatMap((lang) =>
      ['consultoria', 'mentoria', 'palestras'].map((key, index) => service(`${lang}/${key}`, { order: index + 1 })),
    );

    function problemsOf(services: ServiceEntry[], articles: ArticleEntry[] = []): string[] {
      try {
        validateServices(services, articles);
        return [];
      } catch (error) {
        if (error instanceof ServiceValidationError) return error.problems;
        throw error;
      }
    }

    describe('servicePath', () => {
      it('deve seguir o contrato de URLs quando recebe a chave e o idioma', () => {
        // Arrange
        const keys = ['consultoria', 'mentoria', 'palestras'] as const;

        // Act
        const paths = keys.map((key) => [servicePath(key, 'pt'), servicePath(key, 'en')]);

        // Assert
        expect(paths).toEqual([
          ['/consultoria/', '/en/consulting/'],
          ['/mentoria/', '/en/mentoring/'],
          ['/palestras/', '/en/speaking/'],
        ]);
      });
    });

    describe('validateServices', () => {
      it('deve aceitar quando os 3 serviços existem nos 2 idiomas', () => {
        // Arrange
        const services = complete;

        // Act
        const problems = problemsOf(services);

        // Assert
        expect(problems).toEqual([]);
      });

      it('deve falhar quando falta um serviço em um idioma', () => {
        // Arrange
        const services = complete.filter((entry) => entry.id !== 'en/mentoria');

        // Act
        const problems = problemsOf(services);

        // Assert
        expect(problems).toEqual(['serviço "mentoria": esperado 1 arquivo em en, encontrados 0']);
      });

      it('deve falhar quando o nome do arquivo não é a chave do serviço', () => {
        // Arrange
        const services = complete.map((entry) => (entry.id === 'pt/mentoria' ? { ...entry, id: 'pt/mentorias' } : entry));

        // Act
        const problems = problemsOf(services);

        // Assert
        expect(problems).toContain('pt/mentorias: o arquivo deve se chamar "mentoria.md"');
      });

      it('deve falhar quando a pasta não bate com o idioma declarado', () => {
        // Arrange
        const services = complete.map((entry) => (entry.id === 'pt/palestras' ? { ...entry, id: 'en/palestras' } : entry));

        // Act
        const problems = problemsOf(services);

        // Assert
        expect(problems).toContain('en/palestras: está na pasta "en" mas declara lang "pt"');
      });

      it('deve falhar quando o artigo relacionado não existe ou é rascunho no idioma', () => {
        // Arrange
        const services = complete.map((entry) =>
          entry.id === 'pt/consultoria' ? service('pt/consultoria', { relatedArticles: ['publicado', 'rascunho', 'inexistente'] }) : entry,
        );
        const articles = [article('pt/publicado', 'publicado'), article('pt/rascunho', 'rascunho', true)];

        // Act
        const problems = problemsOf(services, articles);

        // Assert
        expect(problems).toEqual([
          'pt/consultoria: artigo relacionado "rascunho" não está publicado em pt',
          'pt/consultoria: artigo relacionado "inexistente" não está publicado em pt',
        ]);
      });
    });

    describe('servicesFor e serviceFor', () => {
      it('deve listar os serviços do idioma na ordem definida quando recebe todos', () => {
        // Arrange
        const services = [...complete].reverse();

        // Act
        const ids = servicesFor(services, 'en').map((entry) => entry.id);

        // Assert
        expect(ids).toEqual(['en/consultoria', 'en/mentoria', 'en/palestras']);
      });

      it('deve encontrar o serviço pela chave e idioma quando ele existe', () => {
        // Arrange
        const services = complete;

        // Act
        const found = serviceFor(services, 'palestras', 'en');

        // Assert
        expect(found.id).toBe('en/palestras');
      });
    });

    describe('relatedArticlesFor', () => {
      it('deve devolver os artigos publicados do idioma na ordem do serviço quando há relacionados', () => {
        // Arrange
        const entry = service('en/consultoria', { relatedArticles: ['b', 'a', 'rascunho'] });
        const articles = [article('en/a', 'a'), article('en/b', 'b'), article('pt/b', 'b'), article('en/r', 'rascunho', true)];

        // Act
        const related = relatedArticlesFor(entry, articles).map((item) => item.id);

        // Assert
        expect(related).toEqual(['en/b', 'en/a']);
      });
    });
    ```

  - [ ] Criar `src/lib/services.ts`:

    ```ts
    import { routePath, type RouteKey } from '../i18n/routes';
    import { languages, type Lang } from '../i18n/ui';
    import { publishedArticles, type ArticleEntry } from './articles';

    export const serviceKeys = ['consultoria', 'mentoria', 'palestras'] as const;
    export type ServiceKey = (typeof serviceKeys)[number];

    // Cada serviço tem rota própria no contrato de URLs.
    export const serviceRoutes: Record<ServiceKey, RouteKey> = {
      consultoria: 'consulting',
      mentoria: 'mentoring',
      palestras: 'speaking',
    };

    export function servicePath(key: ServiceKey, lang: Lang): string {
      return routePath(serviceRoutes[key], lang);
    }

    export interface ServiceData {
      key: ServiceKey;
      lang: Lang;
      order: number;
      relatedArticles: string[];
    }

    export interface ServiceEntry<TData extends ServiceData = ServiceData> {
      id: string;
      data: TData;
    }

    export class ServiceValidationError extends Error {
      constructor(readonly problems: string[]) {
        super(`Serviços inválidos:\n- ${problems.join('\n- ')}`);
        this.name = 'ServiceValidationError';
      }
    }

    export function validateServices(services: ServiceEntry[], articles: ArticleEntry[]): void {
      const problems: string[] = [];

      for (const service of services) {
        const [folder, file] = service.id.split('/');
        const { key, lang, relatedArticles } = service.data;
        if (folder !== lang) problems.push(`${service.id}: está na pasta "${folder}" mas declara lang "${lang}"`);
        if (file !== key) problems.push(`${service.id}: o arquivo deve se chamar "${key}.md"`);

        const published = new Set(publishedArticles(articles, lang).map((article) => article.data.translationKey));
        for (const translationKey of relatedArticles) {
          if (!published.has(translationKey)) {
            problems.push(`${service.id}: artigo relacionado "${translationKey}" não está publicado em ${lang}`);
          }
        }
      }

      for (const key of serviceKeys) {
        for (const lang of languages) {
          const count = services.filter((service) => service.data.key === key && service.data.lang === lang).length;
          if (count !== 1) problems.push(`serviço "${key}": esperado 1 arquivo em ${lang}, encontrados ${count}`);
        }
      }

      if (problems.length > 0) throw new ServiceValidationError(problems);
    }

    export function servicesFor<T extends ServiceEntry>(services: T[], lang: Lang): T[] {
      return services.filter((service) => service.data.lang === lang).sort((a, b) => a.data.order - b.data.order);
    }

    export function serviceFor<T extends ServiceEntry>(services: T[], key: ServiceKey, lang: Lang): T {
      const service = services.find((entry) => entry.data.key === key && entry.data.lang === lang);
      if (!service) throw new ServiceValidationError([`serviço "${key}" não encontrado em ${lang}`]);
      return service;
    }

    export function relatedArticlesFor<T extends ArticleEntry>(service: ServiceEntry, articles: T[]): T[] {
      const published = publishedArticles(articles, service.data.lang);
      return service.data.relatedArticles
        .map((translationKey) => published.find((article) => article.data.translationKey === translationKey))
        .filter((article): article is T => article !== undefined);
    }
    ```

  - [ ] Verificar — rodar `npx vitest run src/lib/services.test.ts`, esperado: `Tests  9 passed (9)`.

- [ ] **Task 3: Schema da coleção, leitura validada e conteúdo dos serviços (copy aprovada, PT e EN)**
  - Files: `src/content.config.ts`, `src/lib/collections.ts`, `src/content/services/en/consultoria.md`, `src/content/services/en/mentoria.md`, `src/content/services/en/palestras.md`, `src/content/services/pt/consultoria.md`, `src/content/services/pt/mentoria.md`, `src/content/services/pt/palestras.md`
  - [ ] Substituir `src/content.config.ts`:

    ```ts
    import { defineCollection } from 'astro:content';
    import { glob } from 'astro/loaders';
    import { z } from 'astro/zod';
    import { categoryKeys } from './i18n/categories';
    import { languages } from './i18n/ui';
    import { DESCRIPTION_MAX } from './lib/articles';
    import { serviceKeys } from './lib/services';

    // ARTICLES_DIR e SERVICES_DIR só são usados pelos testes de build (tests/fixtures).
    const articlesBase = process.env.ARTICLES_DIR ?? './src/content/articles';
    const servicesBase = process.env.SERVICES_DIR ?? './src/content/services';

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
          service: z.enum(serviceKeys).optional(),
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

    const item = z.object({ title: z.string().min(1), text: z.string().min(1) });

    const services = defineCollection({
      loader: glob({ pattern: '{pt,en}/**/*.md', base: servicesBase }),
      schema: z.object({
        key: z.enum(serviceKeys),
        lang: z.enum(languages),
        order: z.number().int(),
        label: z.string().min(1),
        title: z.string().min(1),
        description: z.string().min(1).max(DESCRIPTION_MAX),
        subtitle: z.string().min(1),
        cardTitle: z.string().min(1),
        summary: z.string().min(1),
        audience: z.string().min(1),
        problem: z.string().min(1),
        topics: z.array(item).min(1),
        steps: z.array(item).length(3),
        format: z.string().optional(),
        formats: z.array(z.string().min(1)).optional(),
        ctaLabel: z.string().min(1),
        ctaText: z.string().min(1),
        whatsappMessage: z.string().min(1),
        relatedArticles: z.array(z.string()).default([]),
      }),
    });

    export const collections = { articles, talks, companies, services };
    ```

  - [ ] Substituir `src/lib/collections.ts`:

    ```ts
    import { getCollection, type CollectionEntry } from 'astro:content';
    import { validateArticles } from './articles';
    import { validateServices } from './services';

    export type Article = CollectionEntry<'articles'>;
    export type Service = CollectionEntry<'services'>;

    export async function getAllArticles(): Promise<Article[]> {
      const entries = await getCollection('articles');
      validateArticles(entries);
      return entries;
    }

    export async function getAllServices(): Promise<Service[]> {
      const [services, articles] = await Promise.all([getCollection('services'), getAllArticles()]);
      validateServices(services, articles);
      return services;
    }
    ```

  - [ ] Criar `src/content/services/en/consultoria.md`:

    ```markdown
    ---
    key: consultoria
    lang: en
    order: 1
    label: Consulting
    title: Organizational design for companies that grow with technology
    description: Organizational design consulting for CEOs and CTOs on decisions, autonomy and the place of AI in the work of companies that grow with technology.
    subtitle: I help CEOs and CTOs redesign how the company makes decisions, distributes autonomy and brings AI into the work, starting from what already works and what gets stuck.
    cardTitle: Consulting
    summary: "For companies that need to redesign how they are managed: structure, roles, decisions and the place of AI in the work."
    audience: CEOs, CTOs and leaders of companies with technology at the core of the business, at moments such as fast growth, restructuring, adopting self-management or using AI at scale.
    problem: Almost every company that grows carries a management model designed for another size and another moment. Layers multiply, decisions move up and the most autonomous people start spending energy working around the structure. AI speeds up this tension, because it changes who knows what, but on its own it doesn't change who decides.
    topics:
      - title: Organizational design and self-management
        text: Structure, roles, agreements and decision flows for teams with more autonomy and responsibility.
      - title: AI and the governance of work
        text: Where AI comes in, who defines the criteria it applies and how to keep new scarce resources, such as access, workflows and agents, from being distributed without a conscious decision.
      - title: Cognitive Coherence and P-O Fit
        text: A diagnosis of the fit between how people think, decide and act and what the organization demands of them.
      - title: Feedback instead of performance reviews
        text: Ongoing feedback conversations with the Feedback Canvas, instead of annual review cycles.
    steps:
      - title: Diagnosis
        text: Conversations with the leadership and a reading of how the company makes decisions and coordinates work today.
      - title: Design
        text: A prioritized proposal for change, built together with the people who will live the new model.
      - title: Follow-up
        text: Cycles of implementation and adjustment, with periodic reviews of what worked and what needs to change.
    ctaLabel: Talk about consulting
    ctaText: Tell me about your company's context.
    whatsappMessage: Hi Matheus! I saw the Consulting page on your website and would like to talk about my company.
    relatedArticles:
      - autonomia-para-transformar-organizacoes
      - a-ia-muda-quase-tudo-na-sua-empresa-menos-o-jogo-de-poder
      - coerencia-cognitiva
    ---
    ```

  - [ ] Criar `src/content/services/en/mentoria.md`:

    ```markdown
    ---
    key: mentoria
    lang: en
    order: 2
    label: Mentoring
    title: One-on-one mentoring for those who lead people and decisions
    description: One-on-one mentoring over 3 to 6 months for leaders, founders and executives who want more clarity to decide and lead.
    subtitle: A 3 to 6 month engagement for leaders, founders and executives who want more clarity to decide and lead.
    cardTitle: Mentoring
    summary: One-on-one support over 3 to 6 months for those who lead people and technical decisions.
    audience: Leaders in a role transition, founders taking on management, newly promoted heads of engineering and executives who start leading increasingly autonomous teams.
    problem: The promotion usually arrives before the repertoire. Someone who was the technical reference becomes responsible for people, priorities and conflicts, and finds out that what got them there is only part of what the next step asks for.
    topics:
      - title: Role and positioning
        text: Clarity about your leadership role and about how to communicate what you propose.
      - title: Culture and team agreements
        text: How to evolve the team's culture intentionally, with explicit agreements.
      - title: Deciding under uncertainty
        text: Criteria for deciding faster and with more coherence between values and strategy.
      - title: Focus under pressure
        text: Tools to stay focused when the environment is uncertain and demands compete with each other.
      - title: Distributed leadership
        text: How to build teams that lead without depending on a rigid hierarchy, with autonomy and responsibility.
      - title: From strategy to execution
        text: How to turn priorities into action consistently.
    steps:
      - title: Diagnosis
        text: We map your challenges, context and goals to understand where you are and where you want to go.
      - title: Plan
        text: We put together a roadmap with the development priorities for the period.
      - title: Sessions and adjustment
        text: Live online sessions of 60 minutes every two weeks, with follow-up in between and course corrections as you move forward.
    format: 3 to 6 months · live online · 60 min every two weeks
    ctaLabel: Request a trial session
    ctaText: Tell me about your leadership moment.
    whatsappMessage: Hi Matheus! I saw the Mentoring page on your website and would like to schedule a trial session.
    relatedArticles:
      - autonomia-para-transformar-organizacoes
      - coerencia-cognitiva
    ---
    ```

  - [ ] Criar `src/content/services/en/palestras.md`:

    ```markdown
    ---
    key: palestras
    lang: en
    order: 3
    label: Talks and workshops
    title: Talks and workshops on the future of work and organizations
    description: Talks and workshops by Matheus Haddad on AI in organizations, the future of work, emergent leadership and feedback culture.
    subtitle: Each talk is tailored to the event's context and audience.
    cardTitle: Talks and workshops
    summary: For events, leadership gatherings and internal programs on the future of work and organizations.
    audience: Conference organizers, HR and leadership development teams and companies that want to open an internal conversation about management and AI.
    problem: A generic talk about transformation rarely changes anything the following Monday. What stays is content that speaks to the organization's moment and leaves questions the team keeps discussing after the event.
    topics:
      - title: AI in organizations
        text: What AI changes in management and what stays the same, such as the fight over power and decision criteria.
      - title: The future of work
        text: How new ways of coordinating work change people management, performance reviews and career plans.
      - title: Emergent leadership
        text: Leadership in complex environments, where power is distributed and teams self-organize.
      - title: Feedback Canvas
        text: The methodology behind the book and how to implement it in teams and organizations of any size.
      - title: Organic management and self-organization
        text: Principles and practices for companies that want to move beyond traditional hierarchical management and build more autonomous teams.
      - title: Cognitive Coherence and P-O Fit
        text: Why declared values say little about behavior at work and what to look at instead.
    steps:
      - title: Briefing
        text: We understand the context, the audience and the goal of the event.
      - title: Tailoring
        text: The content is adjusted to the audience's moment and industry.
      - title: Delivery
        text: A talk or workshop with time for questions and supporting material.
    formats:
      - Keynote (45 to 90 min)
      - Workshop (3 to 8 h)
      - Webinar (60 to 90 min)
      - Roundtable or panel
    ctaLabel: Talk about an event
    ctaText: Tell me about your event and your audience.
    whatsappMessage: Hi Matheus! I saw the Talks page on your website and would like to talk about an event.
    relatedArticles:
      - a-ia-muda-quase-tudo-na-sua-empresa-menos-o-jogo-de-poder
      - coerencia-cognitiva
    ---
    ```

  - [ ] Criar `src/content/services/pt/consultoria.md`:

    ```markdown
    ---
    key: consultoria
    lang: pt
    order: 1
    label: Consultoria
    title: Design organizacional para empresas que crescem com tecnologia
    description: Consultoria de design organizacional para CEOs e CTOs sobre decisões, autonomia e o lugar da IA no trabalho de empresas que crescem com tecnologia.
    subtitle: Ajudo CEOs e CTOs a redesenhar como a empresa decide, distribui autonomia e incorpora a IA no trabalho, partindo do que já funciona e do que trava.
    cardTitle: Consultoria
    summary: "Para empresas que precisam redesenhar a gestão: estrutura, papéis, decisões e o lugar da IA no trabalho."
    audience: CEOs, CTOs e lideranças de empresas com tecnologia no centro do negócio, em momentos como crescimento acelerado, reestruturação, adoção de autogestão ou uso de IA em escala.
    problem: Quase toda empresa que cresce carrega um modelo de gestão desenhado para outro tamanho e outro momento. As camadas se multiplicam, as decisões sobem e as pessoas mais autônomas passam a gastar energia contornando a estrutura. A IA acelera essa tensão, porque muda quem sabe o quê, mas sozinha não muda quem decide.
    topics:
      - title: Design organizacional e autogestão
        text: Estrutura, papéis, acordos e fluxos de decisão para equipes com mais autonomia e responsabilidade.
      - title: IA e governança do trabalho
        text: Onde a IA entra, quem define os critérios que ela aplica e como evitar que novos recursos escassos, como acesso, fluxos e agentes, sejam distribuídos sem decisão consciente.
      - title: Coerência Cognitiva e P-O Fit
        text: Diagnóstico da compatibilidade entre a forma como as pessoas pensam, decidem e agem e o que a organização exige delas.
      - title: Feedback no lugar da avaliação de desempenho
        text: Conversas contínuas de feedback com o Feedback Canvas, em vez de ciclos anuais de avaliação.
    steps:
      - title: Diagnóstico
        text: Conversas com as lideranças e leitura de como a empresa decide e coordena o trabalho hoje.
      - title: Desenho
        text: Proposta de mudanças priorizadas, construída junto com quem vai viver o novo modelo.
      - title: Acompanhamento
        text: Ciclos de implementação e ajuste, com revisões periódicas do que funcionou e do que precisa mudar.
    ctaLabel: Conversar sobre consultoria
    ctaText: Me conta o contexto da sua empresa.
    whatsappMessage: Olá, Matheus! Vi a página de Consultoria no seu site e gostaria de conversar sobre a minha empresa.
    relatedArticles:
      - autonomia-para-transformar-organizacoes
      - a-ia-muda-quase-tudo-na-sua-empresa-menos-o-jogo-de-poder
      - coerencia-cognitiva
    ---
    ```

  - [ ] Criar `src/content/services/pt/mentoria.md`:

    ```markdown
    ---
    key: mentoria
    lang: pt
    order: 2
    label: Mentoria
    title: Mentoria individual para quem lidera pessoas e decisões
    description: Mentoria individual de 3 a 6 meses para líderes, fundadores e executivos que querem mais clareza para decidir e liderar.
    subtitle: Um acompanhamento de 3 a 6 meses para líderes, fundadores e executivos que querem mais clareza para decidir e liderar.
    cardTitle: Mentoria
    summary: Acompanhamento individual de 3 a 6 meses para quem lidera pessoas e decisões técnicas.
    audience: Lideranças em transição de papel, fundadores assumindo a gestão, heads de engenharia recém-promovidos e executivos que passam a liderar equipes cada vez mais autônomas.
    problem: A promoção costuma chegar antes do repertório. Quem era referência técnica passa a responder por pessoas, prioridades e conflitos, e descobre que aquilo que o trouxe até ali é só parte do que o próximo passo pede.
    topics:
      - title: Papel e posicionamento
        text: Clareza sobre o seu papel de liderança e sobre como comunicar o que você propõe.
      - title: Cultura e acordos de equipe
        text: Como evoluir a cultura do time de forma intencional, com acordos explícitos.
      - title: Decisão sob incerteza
        text: Critérios para decidir mais rápido e com mais coerência entre valores e estratégia.
      - title: Foco sob pressão
        text: Ferramentas para manter o foco quando o ambiente é incerto e as demandas competem entre si.
      - title: Liderança distribuída
        text: Como formar times que lideram sem depender de hierarquia rígida, com autonomia e responsabilidade.
      - title: Da estratégia à execução
        text: Como transformar prioridades em ação de forma consistente.
    steps:
      - title: Diagnóstico
        text: Mapeamos seus desafios, o contexto e os objetivos para entender onde você está e aonde quer chegar.
      - title: Plano
        text: Montamos um roteiro com as prioridades de desenvolvimento para o período.
      - title: Encontros e ajuste
        text: Encontros online ao vivo de 60 minutos a cada duas semanas, com acompanhamento entre eles e ajustes de rota conforme você avança.
    format: 3 a 6 meses · online ao vivo · 60 min a cada duas semanas
    ctaLabel: Pedir uma sessão experimental
    ctaText: Me conta o seu momento de liderança.
    whatsappMessage: Olá, Matheus! Vi a página de Mentoria no seu site e gostaria de agendar uma sessão experimental.
    relatedArticles:
      - autonomia-para-transformar-organizacoes
      - coerencia-cognitiva
    ---
    ```

  - [ ] Criar `src/content/services/pt/palestras.md`:

    ```markdown
    ---
    key: palestras
    lang: pt
    order: 3
    label: Palestras e workshops
    title: Palestras e workshops sobre o futuro do trabalho e das organizações
    description: Palestras e workshops de Matheus Haddad sobre IA nas organizações, futuro do trabalho, liderança emergente e cultura de feedback.
    subtitle: Cada palestra é adaptada ao contexto e ao público do evento.
    cardTitle: Palestras e workshops
    summary: Para eventos, encontros de liderança e programas internos sobre o futuro do trabalho e das organizações.
    audience: Organizadores de conferências, áreas de RH e de desenvolvimento de lideranças e empresas que querem abrir uma conversa interna sobre gestão e IA.
    problem: Palestra genérica sobre transformação raramente muda alguma coisa na segunda-feira seguinte. O que fica é o conteúdo que conversa com o momento da organização e deixa perguntas que a equipe continua discutindo depois do evento.
    topics:
      - title: IA nas organizações
        text: O que a IA muda na gestão e o que continua igual, como a disputa por poder e por critérios de decisão.
      - title: O futuro do trabalho
        text: Como novas formas de coordenar o trabalho mudam a gestão de pessoas, a avaliação de desempenho e os planos de carreira.
      - title: Liderança emergente
        text: Liderança em ambientes complexos, onde o poder é distribuído e as equipes se auto-organizam.
      - title: Feedback Canvas
        text: A metodologia do livro e como implementá-la em equipes e organizações de qualquer porte.
      - title: Gestão orgânica e auto-organização
        text: Princípios e práticas para empresas que querem sair da gestão hierárquica tradicional e formar times mais autônomos.
      - title: Coerência Cognitiva e P-O Fit
        text: Por que valores declarados predizem pouco o comportamento no trabalho e o que observar no lugar deles.
    steps:
      - title: Briefing
        text: Entendemos o contexto, o público e o objetivo do evento.
      - title: Adaptação
        text: O conteúdo é ajustado ao momento e ao setor da audiência.
      - title: Apresentação
        text: Palestra ou workshop com tempo para perguntas e material de apoio.
    formats:
      - Keynote (45 a 90 min)
      - Workshop (3 a 8 h)
      - Webinar (60 a 90 min)
      - Mesa-redonda ou painel
    ctaLabel: Conversar sobre um evento
    ctaText: Me conta sobre o seu evento e o seu público.
    whatsappMessage: Olá, Matheus! Vi a página de Palestras no seu site e gostaria de conversar sobre um evento.
    relatedArticles:
      - a-ia-muda-quase-tudo-na-sua-empresa-menos-o-jogo-de-poder
      - coerencia-cognitiva
    ---
    ```

  - [ ] Verificar — rodar `npx astro sync`, esperado: `Synced content` sem erros; `npm run check`, esperado: `0 errors`.

### Squad: WhatsApp por página e textos
**Agent:** coder-frontend

- [ ] **Task 4: Dicionário (textos novos e correção dos travessões) e navegação**
  - Files: `src/i18n/ui.test.ts`, `src/i18n/ui.ts`, `src/i18n/navigation.test.ts`, `src/i18n/navigation.ts`
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

    describe('estilo do dicionário', () => {
      it('deve dispensar o travessão quando percorre os textos dos dois idiomas', () => {
        // Arrange
        const values = [...Object.entries(ui.pt), ...Object.entries(ui.en)];

        // Act
        const withDash = values.filter(([, value]) => value.includes('—')).map(([key]) => key);

        // Assert
        expect(withDash).toEqual([]);
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
      'nav.home': 'Matheus Haddad, página inicial',
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
        'Matheus Haddad ajuda CEOs e CTOs a redesenhar organizações para crescer com clareza, combinando estratégia de negócios, tecnologia e gestão de pessoas.',
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
        'Se você está redesenhando sua organização, adotando IA ou enfrentando um momento de transição, me escreva. Respondo pessoalmente.',
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
      'whatsapp.messageFrom': 'Olá, Matheus! Vim pela página "{page}" do seu site e gostaria de conversar.',
      'whatsapp.articleMessage': 'Olá, Matheus! Li o artigo "{title}" no seu site e gostaria de conversar sobre {service}.',
      'service.name.consultoria': 'consultoria',
      'service.name.mentoria': 'mentoria',
      'service.name.palestras': 'palestras',
      'services.pageTitle': 'Serviços',
      'services.title': 'Como posso ajudar',
      'services.description':
        'Consultoria, mentoria e palestras de Matheus Haddad para lideranças que redesenham a gestão das empresas na era da IA.',
      'services.intro':
        'Trabalho com lideranças que estão redesenhando a forma como a empresa decide, coordena o trabalho e adota IA. São três formatos. A primeira conversa serve para descobrir qual faz sentido para o seu momento.',
      'services.learnMore': 'Saiba mais',
      'services.notSureTitle': 'Não sabe por onde começar?',
      'services.notSureText': 'Me conta o contexto da sua empresa e a gente descobre junto qual formato faz sentido.',
      'services.audience': 'Para quem é',
      'services.problem': 'O problema',
      'services.topics': 'Temas e abordagens',
      'services.formats': 'Formatos',
      'services.steps': 'Como funciona',
      'services.related': 'Artigos relacionados',
      'services.ctaTitle': 'Vamos conversar?',
      'cta.label': 'Vamos conversar',
      'cta.howItWorks': 'Saiba como funciona',
      'cta.gestao.title': 'Sua empresa está repensando o modelo de gestão?',
      'cta.gestao.text': 'Vamos conversar sobre o que faz sentido para o seu momento.',
      'cta.coerencia.title': 'As pessoas certas estão nos lugares certos da sua empresa?',
      'cta.coerencia.text': 'Vamos conversar sobre como diagnosticar essa coerência.',
      'cta.ai.title': 'Sua empresa está redesenhando a gestão com IA?',
      'cta.ai.text': 'Vamos conversar sobre o que está em jogo.',
      'cta.software.title': 'Você lidera times de tecnologia?',
      'cta.software.text': 'A mentoria ajuda a tomar melhores decisões técnicas e de pessoas.',
      'cta.educacao.title': 'Quer levar essa conversa para a sua organização?',
      'cta.educacao.text': 'Palestras e workshops adaptados ao seu público.',
      'cta.default.title': 'Quer levar essa conversa para a sua empresa?',
      'cta.default.text': 'Vamos conversar sobre o seu contexto.',
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
      'nav.home': 'Matheus Haddad, home page',
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
        'Matheus Haddad helps CEOs and CTOs redesign organizations to grow with clarity, combining business strategy, technology, and people management.',
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
        "If you're redesigning your organization, adopting AI, or facing a moment of transition, reach out. I respond personally.",
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
      'whatsapp.messageFrom': 'Hi Matheus! I came from the "{page}" page on your website and would like to talk.',
      'whatsapp.articleMessage': 'Hi Matheus! I read the article "{title}" on your website and would like to talk about {service}.',
      'service.name.consultoria': 'consulting',
      'service.name.mentoria': 'mentoring',
      'service.name.palestras': 'talks and workshops',
      'services.pageTitle': 'Services',
      'services.title': 'How I can help',
      'services.description':
        'Consulting, mentoring and talks by Matheus Haddad for leaders redesigning how their companies are managed in the AI era.',
      'services.intro':
        "I work with leaders who are redesigning how their company makes decisions, coordinates work and adopts AI. There are three formats. The first conversation is where we find out which one fits your moment.",
      'services.learnMore': 'Learn more',
      'services.notSureTitle': 'Not sure where to start?',
      'services.notSureText': "Tell me about your company's context and we'll figure out together which format makes sense.",
      'services.audience': "Who it's for",
      'services.problem': 'The problem',
      'services.topics': 'Topics and approaches',
      'services.formats': 'Formats',
      'services.steps': 'How it works',
      'services.related': 'Related articles',
      'services.ctaTitle': "Let's talk?",
      'cta.label': "Let's talk",
      'cta.howItWorks': 'See how it works',
      'cta.gestao.title': 'Is your company rethinking its management model?',
      'cta.gestao.text': "Let's talk about what makes sense for where you are now.",
      'cta.coerencia.title': 'Are the right people in the right places in your company?',
      'cta.coerencia.text': "Let's talk about how to diagnose that coherence.",
      'cta.ai.title': 'Is your company redesigning management with AI?',
      'cta.ai.text': "Let's talk about what's at stake.",
      'cta.software.title': 'Do you lead technology teams?',
      'cta.software.text': 'Mentoring helps you make better technical and people decisions.',
      'cta.educacao.title': 'Want to bring this conversation to your organization?',
      'cta.educacao.text': 'Talks and workshops tailored to your audience.',
      'cta.default.title': 'Want to bring this conversation to your company?',
      'cta.default.text': "Let's talk about your context.",
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

  - [ ] Criar `src/i18n/navigation.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { isCurrent, mainNav } from './navigation';

    function current(pathname: string, lang: 'pt' | 'en') {
      return mainNav.filter((item) => isCurrent(pathname, item, lang)).map((item) => item.route);
    }

    describe('isCurrent', () => {
      it('deve acender "Serviços" quando a página é o hub, Consultoria ou Mentoria', () => {
        // Arrange
        const paths = ['/servicos/', '/consultoria/', '/en/mentoring/'];

        // Act
        const result = paths.map((path) => current(path, path.startsWith('/en/') ? 'en' : 'pt'));

        // Assert
        expect(result).toEqual([['services'], ['services'], ['services']]);
      });

      it('deve acender "Palestras e Mídia" quando a página é a de palestras', () => {
        // Arrange
        const path = '/en/speaking/';

        // Act
        const result = current(path, 'en');

        // Assert
        expect(result).toEqual(['speaking']);
      });

      it('deve acender "Artigos" quando a página é um artigo ou uma categoria', () => {
        // Arrange
        const paths = ['/artigos/meu-artigo/', '/artigos/categoria/ai/'];

        // Act
        const result = paths.map((path) => current(path, 'pt'));

        // Assert
        expect(result).toEqual([['articles'], ['articles']]);
      });

      it('deve deixar tudo apagado quando a página é a home', () => {
        // Arrange
        const path = '/';

        // Act
        const result = current(path, 'pt');

        // Assert
        expect(result).toEqual([]);
      });
    });
    ```

  - [ ] Substituir `src/i18n/navigation.ts`:

    ```ts
    import { routePath, type RouteKey } from './routes';
    import type { Lang, UIKey } from './ui';

    export interface NavItem {
      route: RouteKey;
      label: UIKey;
      // Rotas que também acendem este item (ex.: Consultoria e Mentoria em "Serviços").
      also?: RouteKey[];
    }

    export const mainNav: NavItem[] = [
      { route: 'articles', label: 'nav.articles' },
      { route: 'services', label: 'nav.services', also: ['consulting', 'mentoring'] },
      { route: 'companies', label: 'nav.companies' },
      { route: 'speaking', label: 'nav.speaking' },
      { route: 'about', label: 'nav.about' },
    ];

    export const footerNav: NavItem[] = [...mainNav, { route: 'books', label: 'nav.books' }];

    export function isCurrent(pathname: string, item: NavItem, lang: Lang): boolean {
      return [item.route, ...(item.also ?? [])].some((route) => pathname.startsWith(routePath(route, lang)));
    }
    ```

  - [ ] Verificar — rodar `npx vitest run src/i18n`, esperado: todos passando, inclusive `deve dispensar o travessão`.

- [ ] **Task 5: Mensagem por página, botão com serviço e layout**
  - Files: `src/lib/whatsapp.test.ts`, `src/lib/whatsapp.ts`, `src/components/Icon.astro`, `src/components/WhatsAppButton.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`, `src/styles/tokens.css`
  - [ ] Substituir `src/lib/whatsapp.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { pageWhatsappMessage, whatsappUrl } from './whatsapp';

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

    describe('pageWhatsappMessage', () => {
      it('deve citar a página de origem quando recebe o título da página', () => {
        // Arrange
        const title = 'Coerência Cognitiva: quando a forma de pensar, decidir e agir encontra a forma de trabalhar';

        // Act
        const pt = pageWhatsappMessage('pt', title);
        const en = pageWhatsappMessage('en', 'Articles');

        // Assert
        expect(pt).toBe(`Olá, Matheus! Vim pela página "${title}" do seu site e gostaria de conversar.`);
        expect(en).toBe('Hi Matheus! I came from the "Articles" page on your website and would like to talk.');
      });

      it('deve usar a mensagem genérica quando a página não tem título próprio', () => {
        // Arrange
        const title = undefined;

        // Act
        const message = pageWhatsappMessage('pt', title);

        // Assert
        expect(message).toBe('Olá, Matheus! Vim pelo seu site e gostaria de conversar.');
      });

      it('deve gerar URL válida quando o título tem aspas, & e #', () => {
        // Arrange
        const message = pageWhatsappMessage('en', 'Q&A #1 "AI"');

        // Act
        const url = new URL(whatsappUrl(message));

        // Assert
        expect(url.searchParams.get('text')).toBe(message);
        expect(url.hash).toBe('');
      });
    });
    ```

  - [ ] Substituir `src/lib/whatsapp.ts`:

    ```ts
    import { WHATSAPP_NUMBER } from '../config';
    import { t, type Lang } from '../i18n/ui';

    export function whatsappUrl(message: string): string {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    }

    /** Mensagem que identifica a página de origem; sem título (home), usa a genérica. */
    export function pageWhatsappMessage(lang: Lang, pageTitle?: string): string {
      return pageTitle ? t(lang, 'whatsapp.messageFrom', { page: pageTitle }) : t(lang, 'whatsapp.message');
    }
    ```

  - [ ] Substituir `src/components/Icon.astro`:

    ```astro
    ---
    // Ícones do design system: traço de 1.5px e cantos retos; WhatsApp e LinkedIn
    // são as marcas preenchidas. Sempre decorativos (o rótulo fica no elemento pai).
    export type IconName =
      | 'arrow-left'
      | 'arrow-right'
      | 'check'
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
      {name === 'check' && <polyline points="20 6 9 17 4 12" />}
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

  - [ ] Substituir `src/components/WhatsAppButton.astro`:

    ```astro
    ---
    import Icon from './Icon.astro';
    import { t, type Lang } from '../i18n/ui';
    import { gaEventAttrs } from '../lib/analytics';
    import type { ServiceKey } from '../lib/services';
    import { whatsappUrl } from '../lib/whatsapp';

    interface Props {
      lang: Lang;
      placement: string;
      variant?: 'full' | 'icon';
      size?: 'default' | 'large';
      message?: string;
      label?: string;
      service?: ServiceKey;
      class?: string;
    }

    const {
      lang,
      placement,
      variant = 'full',
      size = 'default',
      message = t(lang, 'whatsapp.message'),
      label = t(lang, 'whatsapp.label'),
      service,
      class: className,
    } = Astro.props;
    ---

    <a
      class:list={['button', 'button--primary', { 'button--icon': variant === 'icon', 'button--large': size === 'large' }, className]}
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener"
      aria-label={variant === 'icon' ? label : undefined}
      {...gaEventAttrs('whatsapp_click', { lang, placement, service: service ?? 'none', page_path: Astro.url.pathname })}
    >
      <Icon name="whatsapp" size={size === 'large' ? 'l' : 'm'} />
      {variant === 'full' && <span class="whatsapp-label">{label}</span>}
    </a>
    ```

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
      whatsappMessage: string;
    }

    const { lang, alternatePath, whatsappMessage } = Astro.props;
    const pathname = Astro.url.pathname;
    ---

    <header class="site-header">
      <div class="container header-bar">
        <a class="brand" href={routePath('home', lang)} aria-label={t(lang, 'nav.home')}>{SITE_NAME}</a>

        <nav class="desktop-nav" aria-label={t(lang, 'nav.label')}>
          {
            mainNav.map((item) => (
              <a href={routePath(item.route, lang)} aria-current={isCurrent(pathname, item, lang) ? 'page' : undefined}>
                {t(lang, item.label)}
              </a>
            ))
          }
        </nav>

        <div class="actions">
          <span class="desktop-only"><LanguageSwitcher lang={lang} alternatePath={alternatePath} /></span>
          <span class="desktop-only"><ThemeToggle lang={lang} /></span>
          <WhatsAppButton lang={lang} placement="header" message={whatsappMessage} class="whatsapp-header" />
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
              <a href={routePath(item.route, lang)} aria-current={isCurrent(pathname, item, lang) ? 'page' : undefined}>
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
        /* Some da tela, mas continua sendo o nome acessível do link. */
        .actions :global(.whatsapp-label) {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
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
      whatsappMessage: string;
    }

    const { lang, whatsappMessage } = Astro.props;
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
            <WhatsAppButton lang={lang} placement="footer" message={whatsappMessage} />
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
    import { pageWhatsappMessage } from '../lib/whatsapp';
    import { SITE_NAME } from '../config';

    type Props = Omit<SeoInput, 'path'> & {
      // Mensagem do WhatsApp do header e do footer; por padrão, cita a página de origem.
      whatsappMessage?: string;
    };

    const { whatsappMessage, ...props } = Astro.props;
    const { lang, alternatePath, title } = props;
    const message = whatsappMessage ?? pageWhatsappMessage(lang, title === SITE_NAME ? undefined : title);
    ---

    <!doctype html>
    <html lang={htmlLang[lang]} data-theme={DEFAULT_THEME} data-accent={DEFAULT_ACCENT}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script is:inline set:html={themeBootScript()} />
        <Font cssVariable="--font-display" preload={[{ style: 'normal' }]} />
        <Font cssVariable="--font-body" preload={[{ style: 'normal' }]} />
        <Font cssVariable="--font-mono" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" type="application/rss+xml" title={t(lang, 'footer.rss')} href={routePath('rss', lang)} />
        <Seo {...props} path={Astro.url.pathname} />
        <Analytics />
      </head>
      <body>
        <a class="skip-link" href="#conteudo">{t(lang, 'skip.toContent')}</a>
        <Header lang={lang} alternatePath={alternatePath} whatsappMessage={message} />
        <main id="conteudo">
          <slot />
        </main>
        <Footer lang={lang} whatsappMessage={message} />
      </body>
    </html>
    ```

  - [ ] Substituir `src/styles/tokens.css`:

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
      --width-aside: 360px;
      --step-size: 40px;
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

  - [ ] Verificar — rodar `npx vitest run src/lib/whatsapp.test.ts`, esperado: `Tests  4 passed (4)`.

### Squad: Páginas de serviço
**Agent:** coder-frontend

- [ ] **Task 6: Componentes e páginas: hub, Consultoria, Mentoria e Palestras**
  - Files: `src/components/CheckList.astro`, `src/components/ServiceSteps.astro`, `src/components/ServiceCard.astro`, `src/components/ServicesHub.astro`, `src/components/ServicePage.astro`, `src/pages/servicos/index.astro`, `src/pages/consultoria/index.astro`, `src/pages/mentoria/index.astro`, `src/pages/palestras/index.astro`, `src/pages/en/services/index.astro`, `src/pages/en/consulting/index.astro`, `src/pages/en/mentoring/index.astro`, `src/pages/en/speaking/index.astro`
  - [ ] Criar `src/components/CheckList.astro`:

    ```astro
    ---
    import Icon from './Icon.astro';

    interface Props {
      items: { title: string; text?: string }[];
      compact?: boolean;
    }

    const { items, compact = false } = Astro.props;
    ---

    <ul class:list={['check-list', { 'check-list--compact': compact }]}>
      {
        items.map((item) => (
          <li>
            <span class="mark">
              <Icon name="check" size="s" />
            </span>
            <span>
              <strong>{item.title}</strong>
              {!compact && item.text && <span class="text">{item.text}</span>}
            </span>
          </li>
        ))
      }
    </ul>

    <style>
      .check-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-16);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      li {
        display: flex;
        gap: var(--space-12);
        align-items: flex-start;
      }

      .mark {
        flex-shrink: 0;
        padding-top: var(--space-4);
        color: var(--accent);
      }

      strong {
        display: block;
        font-weight: 600;
      }

      .text {
        display: block;
        margin-top: var(--space-4);
        color: var(--text-muted);
        font-size: var(--fs-15);
        line-height: var(--lh-body);
      }

      .check-list--compact {
        gap: var(--space-8);
      }

      .check-list--compact li {
        color: var(--text-muted);
        font-size: var(--fs-14);
      }

      .check-list--compact strong {
        font-weight: 400;
      }

      .check-list--compact .mark {
        padding-top: var(--border-strong);
      }
    </style>
    ```

  - [ ] Criar `src/components/ServiceSteps.astro`:

    ```astro
    ---
    interface Props {
      steps: { title: string; text: string }[];
    }

    const { steps } = Astro.props;
    ---

    <ol class="steps">
      {
        steps.map((step, index) => (
          <li>
            <span class="number mono" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </li>
        ))
      }
    </ol>

    <style>
      .steps {
        display: flex;
        flex-direction: column;
        gap: var(--space-24);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      li {
        display: flex;
        gap: var(--space-24);
        align-items: flex-start;
      }

      .number {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: var(--step-size);
        height: var(--step-size);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-round);
        color: var(--accent);
        font-size: var(--fs-13);
        letter-spacing: 0;
      }

      h3 {
        margin-bottom: var(--space-4);
        font-size: var(--fs-18);
      }

      p {
        color: var(--text-muted);
        font-size: var(--fs-15);
        line-height: var(--lh-body);
      }
    </style>
    ```

  - [ ] Criar `src/components/ServiceCard.astro`:

    ```astro
    ---
    import CheckList from './CheckList.astro';
    import Icon from './Icon.astro';
    import { t } from '../i18n/ui';
    import type { Service } from '../lib/collections';
    import { servicePath } from '../lib/services';

    interface Props {
      service: Service;
      index: number;
    }

    const { service, index } = Astro.props;
    const { key, lang, cardTitle, summary, topics } = service.data;
    ---

    <article class="service-card">
      <p class="number mono">{String(index + 1).padStart(2, '0')}</p>
      <h2><a href={servicePath(key, lang)}>{cardTitle}</a></h2>
      <p class="summary">{summary}</p>
      <CheckList items={topics.slice(0, 3)} compact />
      <span class="more" aria-hidden="true">{t(lang, 'services.learnMore')}<Icon name="arrow-right" size="s" /></span>
    </article>

    <style>
      .service-card {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: var(--space-16);
        padding: var(--space-40);
        background: var(--bg);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
        transition: border-color var(--duration-fast);
      }

      .service-card:hover,
      .service-card:focus-within {
        border-color: var(--accent);
      }

      .number {
        color: var(--accent);
        font-size: var(--fs-13);
      }

      h2 {
        font-size: var(--fs-26);
        line-height: var(--lh-heading);
      }

      h2 a {
        text-decoration: none;
      }

      h2 a::after {
        content: '';
        position: absolute;
        inset: 0;
      }

      .summary {
        margin-bottom: var(--space-16);
        color: var(--text-muted);
        line-height: var(--lh-body);
      }

      .more {
        display: inline-flex;
        gap: var(--space-4);
        align-items: center;
        margin-top: auto;
        padding-top: var(--space-16);
        color: var(--accent);
        font-size: var(--fs-13);
        font-weight: 600;
      }

      @media (max-width: 767px) {
        .service-card {
          padding: var(--space-24);
        }
      }
    </style>
    ```

  - [ ] Criar `src/components/ServicesHub.astro`:

    ```astro
    ---
    import ServiceCard from './ServiceCard.astro';
    import WhatsAppButton from './WhatsAppButton.astro';
    import BaseLayout from '../layouts/BaseLayout.astro';
    import { routePath } from '../i18n/routes';
    import { otherLang, t, type Lang } from '../i18n/ui';
    import type { Service } from '../lib/collections';
    import { servicesFor } from '../lib/services';

    interface Props {
      lang: Lang;
      services: Service[];
    }

    const { lang, services } = Astro.props;
    ---

    <BaseLayout
      lang={lang}
      title={t(lang, 'services.pageTitle')}
      description={t(lang, 'services.description')}
      alternatePath={routePath('services', otherLang(lang))}
    >
      <div class="container hub">
        <header class="intro">
          <h1>{t(lang, 'services.title')}</h1>
          <p>{t(lang, 'services.intro')}</p>
        </header>
        <div class="grid">
          {servicesFor(services, lang).map((service, index) => <ServiceCard service={service} index={index} />)}
        </div>
        <section class="not-sure" aria-labelledby="not-sure-heading">
          <h2 id="not-sure-heading">{t(lang, 'services.notSureTitle')}</h2>
          <p>{t(lang, 'services.notSureText')}</p>
          <WhatsAppButton lang={lang} placement="services-hub" size="large" />
        </section>
      </div>
    </BaseLayout>

    <style>
      .hub {
        padding-top: var(--space-64);
      }

      .intro {
        padding-bottom: var(--space-48);
        margin-bottom: var(--space-64);
        border-bottom: var(--border-width) solid var(--border);
      }

      h1 {
        margin-bottom: var(--space-12);
        font-size: var(--fs-44);
        line-height: var(--lh-heading);
      }

      .intro p {
        max-width: var(--width-reading);
        color: var(--text-muted);
        font-size: var(--fs-18);
        line-height: var(--lh-snug);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--col-min-card), 1fr));
        gap: var(--space-32);
      }

      .not-sure {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-12);
        margin-top: var(--space-64);
        padding: var(--space-48);
        background: var(--accent-subtle);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
        text-align: center;
      }

      .not-sure h2 {
        font-size: var(--fs-32);
      }

      .not-sure p {
        margin-bottom: var(--space-16);
        color: var(--text-muted);
        font-size: var(--fs-17);
      }

      @media (max-width: 767px) {
        .hub {
          padding-top: var(--space-40);
        }

        h1 {
          font-size: var(--fs-36);
        }

        .grid {
          grid-template-columns: 1fr;
        }

        .not-sure {
          padding: var(--space-32) var(--space-24);
        }

        .not-sure h2 {
          font-size: var(--fs-26);
        }
      }
    </style>
    ```

  - [ ] Criar `src/components/ServicePage.astro`:

    ```astro
    ---
    import ArticleCard from './ArticleCard.astro';
    import CheckList from './CheckList.astro';
    import Icon from './Icon.astro';
    import ServiceSteps from './ServiceSteps.astro';
    import WhatsAppButton from './WhatsAppButton.astro';
    import BaseLayout from '../layouts/BaseLayout.astro';
    import { routePath } from '../i18n/routes';
    import { otherLang, t, type Lang } from '../i18n/ui';
    import type { Article, Service } from '../lib/collections';
    import { relatedArticlesFor, serviceFor, servicePath, type ServiceKey } from '../lib/services';

    interface Props {
      lang: Lang;
      serviceKey: ServiceKey;
      services: Service[];
      articles: Article[];
    }

    const { lang, serviceKey, services, articles } = Astro.props;
    const service = serviceFor(services, serviceKey, lang);
    const { label, title, description, subtitle, audience, problem, topics, steps, format, formats, ctaLabel, ctaText, whatsappMessage } =
      service.data;
    const related = relatedArticlesFor(service, articles);
    ---

    <BaseLayout
      lang={lang}
      title={title}
      description={description}
      alternatePath={servicePath(serviceKey, otherLang(lang))}
      whatsappMessage={whatsappMessage}
    >
      <div class="band">
        <div class="container band-inner">
          <WhatsAppButton
            lang={lang}
            placement="service-band"
            service={serviceKey}
            message={whatsappMessage}
            label={ctaLabel}
            class="band-button"
          />
        </div>
      </div>

      <div class="container service-grid">
        <div class="content">
          <a class="back mono" href={routePath('services', lang)}><Icon name="arrow-left" size="s" />{t(lang, 'services.pageTitle')}</a>

          <header class="service-header">
            <p class="label mono">{label}</p>
            <h1>{title}</h1>
            <p class="subtitle">{subtitle}</p>
            {format && <p class="format mono">{format}</p>}
          </header>

          <section aria-labelledby="audience-heading">
            <h2 id="audience-heading" class="section-title mono">{t(lang, 'services.audience')}</h2>
            <p class="lead">{audience}</p>
          </section>

          <section aria-labelledby="problem-heading">
            <h2 id="problem-heading" class="section-title mono">{t(lang, 'services.problem')}</h2>
            <blockquote class="problem"><p>{problem}</p></blockquote>
          </section>

          <section aria-labelledby="topics-heading">
            <h2 id="topics-heading" class="section-title mono">{t(lang, 'services.topics')}</h2>
            <CheckList items={topics} />
          </section>

          {
            formats && (
              <section aria-labelledby="formats-heading">
                <h2 id="formats-heading" class="section-title mono">{t(lang, 'services.formats')}</h2>
                <ul class="formats">
                  {formats.map((item) => (
                    <li>{item}</li>
                  ))}
                </ul>
              </section>
            )
          }

          <section aria-labelledby="steps-heading">
            <h2 id="steps-heading" class="section-title mono">{t(lang, 'services.steps')}</h2>
            <ServiceSteps steps={steps} />
          </section>

          {
            related.length > 0 && (
              <section aria-labelledby="related-heading">
                <h2 id="related-heading" class="section-title mono">{t(lang, 'services.related')}</h2>
                <div class="related">
                  {related.map((article) => (
                    <ArticleCard article={article} />
                  ))}
                </div>
              </section>
            )
          }

          <slot />
        </div>

        <aside class="sidebar" aria-labelledby="sidebar-heading">
          <div class="cta-box">
            <h2 id="sidebar-heading">{t(lang, 'services.ctaTitle')}</h2>
            <p>{ctaText}</p>
            <WhatsAppButton
              lang={lang}
              placement="service-sidebar"
              service={serviceKey}
              message={whatsappMessage}
              label={ctaLabel}
              size="large"
              class="cta-button"
            />
          </div>
        </aside>
      </div>
    </BaseLayout>

    <style>
      .band {
        padding-block: var(--space-12);
        background: var(--accent);
      }

      .band-inner {
        display: flex;
        justify-content: flex-end;
      }

      .band :global(.band-button) {
        min-height: auto;
        padding: var(--space-4) 0;
        background: none;
        color: var(--accent-contrast);
      }

      .band :global(.band-button:hover) {
        background: none;
        text-decoration: underline;
      }

      .service-grid {
        display: grid;
        grid-template-columns: minmax(0, 1fr) var(--width-aside);
        gap: var(--space-80);
        align-items: start;
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: var(--space-48);
        padding-top: var(--space-64);
      }

      .back {
        display: inline-flex;
        gap: var(--space-8);
        align-items: center;
        align-self: flex-start;
        color: var(--text-muted);
        text-decoration: none;
      }

      .back:hover {
        color: var(--text);
      }

      .service-header {
        display: flex;
        flex-direction: column;
        gap: var(--space-16);
        margin-top: calc(-1 * var(--space-16));
      }

      .label {
        color: var(--accent);
      }

      h1 {
        font-size: var(--fs-44);
        line-height: var(--lh-heading);
      }

      .subtitle {
        color: var(--text-muted);
        font-size: var(--fs-18);
        line-height: var(--lh-snug);
      }

      .format {
        align-self: flex-start;
        padding: var(--space-8) var(--space-12);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-s);
        color: var(--text);
      }

      .section-title {
        margin-bottom: var(--space-16);
        color: var(--text-muted);
        font-family: var(--font-mono);
        font-size: var(--fs-11);
        font-weight: 500;
      }

      .lead {
        font-size: var(--fs-17);
        line-height: var(--lh-snug);
      }

      .problem {
        margin: 0;
        padding-left: var(--space-24);
        border-left: var(--border-quote) solid var(--accent);
      }

      .problem p {
        font-family: var(--font-display);
        font-size: var(--fs-20);
        font-style: italic;
        font-weight: 600;
        line-height: var(--lh-h3);
      }

      .formats {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-8);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .formats li {
        padding: var(--space-8) var(--space-12);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-s);
        font-size: var(--fs-14);
      }

      .related {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--width-portrait-tablet), 1fr));
        gap: var(--space-24);
      }

      .sidebar {
        position: sticky;
        top: calc(var(--header-height) + var(--space-16));
        padding-top: var(--space-64);
      }

      .cta-box {
        display: flex;
        flex-direction: column;
        gap: var(--space-12);
        padding: var(--space-32);
        background: var(--surface);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
      }

      .cta-box h2 {
        font-size: var(--fs-22);
      }

      .cta-box p {
        margin-bottom: var(--space-12);
        color: var(--text-muted);
        font-size: var(--fs-15);
        line-height: var(--lh-body);
      }

      .cta-box :global(.cta-button) {
        white-space: normal;
      }

      @media (max-width: 1023px) {
        .service-grid {
          grid-template-columns: minmax(0, 1fr);
          gap: 0;
        }

        .sidebar {
          position: static;
          padding-top: var(--space-48);
        }
      }

      @media (max-width: 767px) {
        .content {
          gap: var(--space-40);
          padding-top: var(--space-40);
        }

        h1 {
          font-size: var(--fs-32);
        }
      }
    </style>
    ```

  - [ ] Criar `src/pages/servicos/index.astro`:

    ```astro
    ---
    import ServicesHub from '../../components/ServicesHub.astro';
    import { getAllServices } from '../../lib/collections';

    const services = await getAllServices();
    ---

    <ServicesHub lang="pt" services={services} />
    ```

  - [ ] Criar `src/pages/consultoria/index.astro`:

    ```astro
    ---
    import ServicePage from '../../components/ServicePage.astro';
    import { getAllArticles, getAllServices } from '../../lib/collections';

    const [services, articles] = await Promise.all([getAllServices(), getAllArticles()]);
    ---

    <ServicePage lang="pt" serviceKey="consultoria" services={services} articles={articles} />
    ```

  - [ ] Criar `src/pages/mentoria/index.astro`:

    ```astro
    ---
    import ServicePage from '../../components/ServicePage.astro';
    import { getAllArticles, getAllServices } from '../../lib/collections';

    const [services, articles] = await Promise.all([getAllServices(), getAllArticles()]);
    ---

    <ServicePage lang="pt" serviceKey="mentoria" services={services} articles={articles} />
    ```

  - [ ] Criar `src/pages/palestras/index.astro`:

    ```astro
    ---
    import ServicePage from '../../components/ServicePage.astro';
    import { getAllArticles, getAllServices } from '../../lib/collections';

    const [services, articles] = await Promise.all([getAllServices(), getAllArticles()]);
    ---

    <ServicePage lang="pt" serviceKey="palestras" services={services} articles={articles} />
    ```

  - [ ] Criar `src/pages/en/services/index.astro`:

    ```astro
    ---
    import ServicesHub from '../../../components/ServicesHub.astro';
    import { getAllServices } from '../../../lib/collections';

    const services = await getAllServices();
    ---

    <ServicesHub lang="en" services={services} />
    ```

  - [ ] Criar `src/pages/en/consulting/index.astro`:

    ```astro
    ---
    import ServicePage from '../../../components/ServicePage.astro';
    import { getAllArticles, getAllServices } from '../../../lib/collections';

    const [services, articles] = await Promise.all([getAllServices(), getAllArticles()]);
    ---

    <ServicePage lang="en" serviceKey="consultoria" services={services} articles={articles} />
    ```

  - [ ] Criar `src/pages/en/mentoring/index.astro`:

    ```astro
    ---
    import ServicePage from '../../../components/ServicePage.astro';
    import { getAllArticles, getAllServices } from '../../../lib/collections';

    const [services, articles] = await Promise.all([getAllServices(), getAllArticles()]);
    ---

    <ServicePage lang="en" serviceKey="mentoria" services={services} articles={articles} />
    ```

  - [ ] Criar `src/pages/en/speaking/index.astro`:

    ```astro
    ---
    import ServicePage from '../../../components/ServicePage.astro';
    import { getAllArticles, getAllServices } from '../../../lib/collections';

    const [services, articles] = await Promise.all([getAllServices(), getAllArticles()]);
    ---

    <ServicePage lang="en" serviceKey="palestras" services={services} articles={articles} />
    ```

  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts -t "páginas de serviço"`, esperado: os 6 testes passando.

### Squad: Chamada no fim do artigo
**Agent:** coder-frontend

- [ ] **Task 7: Chamada por categoria ou pelo campo service, com mensagem que cita o artigo**
  - Files: `src/lib/cta.test.ts`, `src/lib/cta.ts`, `src/components/ArticleCta.astro`, `src/layouts/ArticleLayout.astro`
  - [ ] Criar `src/lib/cta.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { articleCta, articleWhatsappMessage } from './cta';

    describe('articleCta', () => {
      it('deve levar à consultoria quando o artigo é de gestão, coerência ou AI', () => {
        // Arrange
        const categories = ['gestao', 'coerencia', 'ai'] as const;

        // Act
        const services = categories.map((category) => articleCta(category)?.service);

        // Assert
        expect(services).toEqual(['consultoria', 'consultoria', 'consultoria']);
      });

      it('deve levar à mentoria em software e às palestras em educação quando o artigo não define serviço', () => {
        // Arrange
        const categories = ['software', 'educacao'] as const;

        // Act
        const ctas = categories.map((category) => articleCta(category));

        // Assert
        expect(ctas).toEqual([
          { service: 'mentoria', title: 'cta.software.title', text: 'cta.software.text' },
          { service: 'palestras', title: 'cta.educacao.title', text: 'cta.educacao.text' },
        ]);
      });

      it('deve omitir a chamada quando o artigo é de hobbies e não define serviço', () => {
        // Arrange
        const category = 'hobbies' as const;

        // Act
        const cta = articleCta(category);

        // Assert
        expect(cta).toBeNull();
      });

      it('deve usar o serviço do artigo com os textos da categoria quando o artigo define service', () => {
        // Arrange
        const category = 'gestao' as const;

        // Act
        const cta = articleCta(category, 'mentoria');

        // Assert
        expect(cta).toEqual({ service: 'mentoria', title: 'cta.gestao.title', text: 'cta.gestao.text' });
      });

      it('deve usar os textos padrão quando a categoria não tem chamada mas o artigo define service', () => {
        // Arrange
        const category = 'hobbies' as const;

        // Act
        const cta = articleCta(category, 'palestras');

        // Assert
        expect(cta).toEqual({ service: 'palestras', title: 'cta.default.title', text: 'cta.default.text' });
      });
    });

    describe('articleWhatsappMessage', () => {
      it('deve citar o título do artigo e o serviço no idioma quando monta a mensagem', () => {
        // Arrange
        const title = 'A IA muda quase tudo na sua empresa, menos o jogo de poder';

        // Act
        const pt = articleWhatsappMessage('pt', title, 'consultoria');
        const en = articleWhatsappMessage('en', 'AI & power', 'palestras');

        // Assert
        expect(pt).toBe(
          'Olá, Matheus! Li o artigo "A IA muda quase tudo na sua empresa, menos o jogo de poder" no seu site e gostaria de conversar sobre consultoria.',
        );
        expect(en).toBe('Hi Matheus! I read the article "AI & power" on your website and would like to talk about talks and workshops.');
      });
    });
    ```

  - [ ] Criar `src/lib/cta.ts`:

    ```ts
    import type { CategoryKey } from '../i18n/categories';
    import { t, type Lang, type UIKey } from '../i18n/ui';
    import type { ServiceKey } from './services';

    export interface ArticleCta {
      service: ServiceKey;
      title: UIKey;
      text: UIKey;
    }

    // Serviço e textos da chamada no fim do artigo, por categoria (copy aprovada em 01/10/2026).
    // Hobbies fica sem chamada.
    const byCategory: Partial<Record<CategoryKey, ArticleCta>> = {
      gestao: { service: 'consultoria', title: 'cta.gestao.title', text: 'cta.gestao.text' },
      coerencia: { service: 'consultoria', title: 'cta.coerencia.title', text: 'cta.coerencia.text' },
      ai: { service: 'consultoria', title: 'cta.ai.title', text: 'cta.ai.text' },
      software: { service: 'mentoria', title: 'cta.software.title', text: 'cta.software.text' },
      educacao: { service: 'palestras', title: 'cta.educacao.title', text: 'cta.educacao.text' },
    };

    /** O campo `service` do artigo vence o padrão da categoria. */
    export function articleCta(category: CategoryKey, service?: ServiceKey): ArticleCta | null {
      const fromCategory = byCategory[category];
      if (service) {
        return fromCategory ? { ...fromCategory, service } : { service, title: 'cta.default.title', text: 'cta.default.text' };
      }
      return fromCategory ?? null;
    }

    export function articleWhatsappMessage(lang: Lang, title: string, service: ServiceKey): string {
      return t(lang, 'whatsapp.articleMessage', { title, service: t(lang, `service.name.${service}`) });
    }
    ```

  - [ ] Criar `src/components/ArticleCta.astro`:

    ```astro
    ---
    import Icon from './Icon.astro';
    import WhatsAppButton from './WhatsAppButton.astro';
    import { t } from '../i18n/ui';
    import type { Article } from '../lib/collections';
    import { articleCta, articleWhatsappMessage } from '../lib/cta';
    import { servicePath } from '../lib/services';

    interface Props {
      article: Article;
    }

    const { article } = Astro.props;
    const { lang, title, category, service } = article.data;
    const cta = articleCta(category, service);
    ---

    {
      cta && (
        <section class="article-cta" aria-labelledby="article-cta-heading" data-cta-service={cta.service}>
          <p class="label mono">{t(lang, 'cta.label')}</p>
          <h2 id="article-cta-heading">{t(lang, cta.title)}</h2>
          <p class="text">{t(lang, cta.text)}</p>
          <div class="actions">
            <WhatsAppButton
              lang={lang}
              placement="article-cta"
              service={cta.service}
              message={articleWhatsappMessage(lang, title, cta.service)}
              size="large"
            />
            <a class="arrow-link" href={servicePath(cta.service, lang)}>
              {t(lang, 'cta.howItWorks')}
              <Icon name="arrow-right" size="s" />
            </a>
          </div>
        </section>
      )
    }

    <style>
      .article-cta {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-12);
        padding: var(--space-40);
        background: var(--accent-subtle);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
        text-align: center;
      }

      .label {
        color: var(--accent);
      }

      h2 {
        font-size: var(--fs-24);
        line-height: var(--lh-heading);
      }

      .text {
        color: var(--text-muted);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-24);
        align-items: center;
        justify-content: center;
        margin-top: var(--space-12);
      }

      @media (max-width: 767px) {
        .article-cta {
          padding: var(--space-24);
        }
      }
    </style>
    ```

  - [ ] Substituir `src/layouts/ArticleLayout.astro`:

    ```astro
    ---
    import BaseLayout from './BaseLayout.astro';
    import ArticleCta from '../components/ArticleCta.astro';
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

          <ArticleCta article={article} />
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

  - [ ] Verificar — rodar `npm test`, esperado: `Test Files  19 passed (19)` e `Tests  140 passed (140)`; `npm run check`, esperado: `0 errors`, `0 warnings`, `0 hints`; `npm run build`, esperado: `Complete!` com `/servicos/`, `/consultoria/`, `/mentoria/`, `/palestras/` e os equivalentes em `/en/`.
  - [ ] Verificação visual — `npm run preview` e capturas do hub, de uma página de serviço e do fim de um artigo, em 1440 px e 390 px, nos dois temas.

