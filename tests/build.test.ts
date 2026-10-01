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
