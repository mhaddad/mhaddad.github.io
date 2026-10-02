import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
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
    env: {
      ...buildEnv,
      ARTICLES_DIR: './tests/fixtures/articles',
      SERVICES_DIR: './tests/fixtures/services',
      ABOUT_DIR: './tests/fixtures/about',
    },
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

describe('prévia com a capa do artigo', () => {
  it('deve usar a capa recortada em JPEG 1200×630 como og:image quando o artigo abre com imagem', async () => {
    // Arrange
    const html = page('artigos/primeiro-artigo/index.html');

    // Act
    const image = /<meta property="og:image" content="([^"]+)">/.exec(html)?.[1];
    const { width, height, format } = await sharp(join(OUT_DIR, 'og/artigos/primeiro-artigo.jpg')).metadata();

    // Assert
    expect(image).toBe(`${SITE}/og/artigos/primeiro-artigo.jpg`);
    expect([width, height, format]).toEqual([1200, 630, 'jpeg']);
    expect(exists('og/artigos/primeiro-artigo.png')).toBe(false);
    expect(exists('og/en/articles/first-article.png')).toBe(true);
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

  it('deve usar a imagem que abre o artigo como destaque do card e o padrão quando não há imagem', () => {
    // Arrange
    const html = page('artigos/index.html');

    // Act
    const cards = [...html.matchAll(/<article class="card[^"]*"[\s\S]*?<\/article>/g)].map((m) => m[0]);
    const primeiro = cards.find((card) => card.includes('Primeiro artigo de teste')) ?? '';
    const segundo = cards.find((card) => card.includes('Segundo artigo de teste')) ?? '';

    // Assert
    expect(primeiro).toMatch(/<img[^>]*alt="Capa de teste"/);
    expect(segundo).not.toContain('<img');
    expect(segundo).toContain('class="pattern"');
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
  it('deve gerar a arte de prévia 1200×630 de cada artigo sem capa quando o build termina', () => {
    // Arrange
    const files = ['og/default.png', 'og/artigos/segundo-artigo.png', 'og/en/articles/first-article.png'];

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
  it('deve mostrar hero com campo animado, faixa de prova e os artigos mais recentes quando a home é gerada', () => {
    // Arrange
    const html = page('index.html');

    // Act
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1];
    const featured = html.indexOf('Segundo artigo de teste');
    const older = html.indexOf('Primeiro artigo de teste');

    // Assert
    expect(h1).toBe('Negócios, tecnologia e pessoas: como organizações crescem na era da IA.');
    expect(html).toMatch(/<div class="waves"[^>]*aria-hidden="true"[^>]*>\s*<canvas/);
    expect(html).toContain('500+');
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

describe('home — Onda 4', () => {
  it('deve mostrar os 8 logos em máscara com o nome acessível quando a faixa de prova é gerada', () => {
    // Arrange
    const html = page('index.html');

    // Act
    const logos = [...html.matchAll(/<span class="logo"[^>]*role="img"[^>]*aria-label="([^"]+)"[^>]*style="--logo: url\(([^)]+)\)"/g)];

    // Assert
    expect(logos.map((m) => m[1])).toEqual([
      'Webgoal',
      'Granatum Financeiro',
      'Ateliê de Software',
      'Orgganica',
      'Escola Lumiar Poços de Caldas',
      'Aliança Empreendedora',
      'A Guarda-Chuva',
      'TugÁgil',
    ]);
    expect(logos.every((m) => m[2]?.startsWith('/_astro/'))).toBe(true);
  });
});

describe('páginas institucionais — Onda 4', () => {
  const pages = [
    ['sobre/index.html', 'en/about/index.html'],
    ['empresas/index.html', 'en/companies/index.html'],
    ['livros/index.html', 'en/books/index.html'],
  ];

  it('deve gerar Sobre, Empresas e Livros nos dois idiomas com hreflang cruzado quando o build termina', () => {
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
    expect(crossLinks).toEqual([true, true, true]);
  });

  it('deve mostrar retrato, trajetória com link para o artigo, formação e princípios quando a página é o Sobre', () => {
    // Arrange
    const html = page('en/about/index.html');

    // Act
    const headings = [...html.matchAll(/<h2 id="[a-z]+-heading"[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
    const timeline = /<section[^>]*aria-labelledby="timeline-heading"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

    // Assert
    expect(html).toMatch(/<img[^>]*alt="Matheus Haddad, entrepreneur and consultant in business and technology"/);
    expect(html).toContain('Test About title.');
    expect(headings).toEqual(['Journey', 'Education', 'Principles', 'Let&#39;s talk?']);
    expect((timeline.match(/<li/g) ?? []).length).toBe(2);
    expect(timeline).toContain('href="/en/articles/first-article/"');
    expect(html).toContain('href="/en/services/"');
  });

  it('deve listar as 8 empresas em 2 grupos com link externo seguro quando a página é Empresas', () => {
    // Arrange
    const html = page('empresas/index.html');

    // Act
    const founded = /<section[^>]*aria-labelledby="founded-heading"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    const board = /<section[^>]*aria-labelledby="board-heading"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    const external = [...html.matchAll(/<a class="arrow-link"[^>]*href="(https:[^"]+)"[^>]*>/g)].map((m) => m[0]);

    // Assert
    expect((founded.match(/<li class="row"/g) ?? []).length).toBe(5);
    expect((board.match(/<li class="row"/g) ?? []).length).toBe(3);
    expect(founded).toContain('2008 · Cofundador');
    expect(board).toContain('Voluntário');
    expect(external).toHaveLength(8);
    expect(external.every((tag) => tag.includes('rel="noopener"') && tag.includes('target="_blank"'))).toBe(true);
    expect(html).toMatch(/<img[^>]*alt="Logo: Granatum Financeiro"/);
  });

  it('deve apontar para a edição de cada idioma na Amazon quando a página é Livros', () => {
    // Arrange
    const pt = page('livros/index.html');
    const en = page('en/books/index.html');

    // Act
    const amazon = (html: string) => [...new Set([...html.matchAll(/href="(https:\/\/www\.amazon[^"]+)"/g)].map((m) => m[1]))];

    // Assert
    expect(amazon(pt)).toEqual(['https://www.amazon.com.br/Feedback-Canvas-cultura-feedback-organiza%C3%A7%C3%A3o-ebook/dp/B0FBGWMFSZ/']);
    expect(amazon(en)).toEqual(['https://www.amazon.com/dp/B0FNLM47WB/']);
    expect(en).toContain('Create a feedback culture in your organization');
  });
});

describe('Palestras e Mídia — Onda 4', () => {
  it('deve mostrar os 23 itens do acervo com o filtro por tipo abaixo do bloco de serviço', () => {
    // Arrange
    const html = page('palestras/index.html');

    // Act
    const cards = [...html.matchAll(/<li class="card"[^>]*data-type="([a-z]+)"/g)].map((m) => m[1]);
    const filters = [...html.matchAll(/<button class="filter mono"[^>]*data-filter="([a-z]+)"/g)].map((m) => m[1]);
    const service = html.indexOf('id="steps-heading"');
    const archive = html.indexOf('id="talks-heading"');

    // Assert
    expect(cards).toHaveLength(23);
    expect(filters).toEqual(['all', 'palestra', 'webinar', 'podcast', 'entrevista']);
    expect(archive).toBeGreaterThan(service);
  });

  it('deve carregar o YouTube só no clique, com miniaturas locais, quando o acervo é gerado', () => {
    // Arrange
    const html = page('en/speaking/index.html');

    // Act
    const plays = (html.match(/<button class="play"[^>]*data-youtube="[A-Za-z0-9_-]{11}"/g) ?? []).length;
    const spotify = (html.match(/href="https:\/\/open\.spotify\.com\/episode\/[A-Za-z0-9]{22}"/g) ?? []).length;

    // Assert
    expect(plays).toBe(20);
    expect(spotify).toBe(3);
    expect(html).not.toContain('<iframe');
    expect(html).not.toMatch(/<img[^>]*src="https?:/);
    expect(html).toContain('In Portuguese');
  });
});

describe('404 — Onda 4', () => {
  it('deve gerar a 404 bilíngue fora dos buscadores e do sitemap quando o build termina', () => {
    // Arrange
    const html = page('404.html');
    const sitemap = page('sitemap-0.xml');

    // Act
    const headings = [...html.matchAll(/<h[12][^>]*>([^<]+)<\/h[12]>/g)].map((m) => m[1]);

    // Assert
    expect(headings).toEqual(['Página não encontrada', 'Page not found']);
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).not.toMatch(/<link rel="alternate" hreflang=/);
    expect(html).toContain('<div class="english" lang="en"');
    expect(sitemap).not.toContain('404');
  });
});

