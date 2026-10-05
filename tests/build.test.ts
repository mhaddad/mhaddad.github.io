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

describe('favicon', () => {
  it('deve declarar o favicon SVG, o ICO e o ícone do iPhone no head quando a página é gerada', () => {
    // Arrange
    const html = page('index.html');

    // Act
    const links = [...html.matchAll(/<link rel="(icon|apple-touch-icon)"[^>]*>/g)].map((m) => m[0]);

    // Assert
    expect(links.some((tag) => tag.includes('href="/favicon.svg"') && tag.includes('type="image/svg+xml"'))).toBe(true);
    expect(links.some((tag) => tag.includes('href="/favicon.ico"'))).toBe(true);
    expect(links.some((tag) => tag.includes('rel="apple-touch-icon"') && tag.includes('href="/apple-touch-icon.png"'))).toBe(true);
  });

  it('deve ter fundo preto e a letra M em branco no SVG', () => {
    // Arrange
    const svg = page('favicon.svg');

    // Act
    const background = /<rect[^>]*fill="#000(?:000)?"/.test(svg);
    const letter = /<path[^>]*fill="#fff(?:fff)?"/.test(svg);

    // Assert
    expect(background).toBe(true);
    expect(letter).toBe(true);
    expect(svg).not.toContain('<text');
  });

  it('deve gerar o ICO com 16, 32 e 48 px e o ícone do iPhone com 180 px, em preto com M branco', async () => {
    // Arrange
    const ico = readFileSync(join(OUT_DIR, 'favicon.ico'));
    const apple = await sharp(join(OUT_DIR, 'apple-touch-icon.png')).metadata();
    const raw = await sharp(join(OUT_DIR, 'apple-touch-icon.png')).removeAlpha().raw().toBuffer({ resolveWithObject: true });

    // Act
    const count = ico.readUInt16LE(4);
    const sizes = Array.from({ length: count }, (_, i) => ico[6 + i * 16] || 256).sort((a, b) => a - b);
    const pixel = (x: number, y: number) => [...raw.data.subarray((y * raw.info.width + x) * 3, (y * raw.info.width + x) * 3 + 3)];

    // Assert
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(sizes).toEqual([16, 32, 48]);
    expect([apple.width, apple.height]).toEqual([180, 180]);
    expect(pixel(2, 2)).toEqual([0, 0, 0]);
    expect(pixel(90, 100)).toEqual([255, 255, 255]);
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

  it('deve publicar o robots.txt liberando os buscadores e apontando para o sitemap quando o build termina', () => {
    // Arrange
    const robots = page('robots.txt');

    // Act
    const lines = robots.split('\n').map((line) => line.trim());

    // Assert
    expect(lines).toContain('User-agent: *');
    expect(lines).toContain('Allow: /');
    expect(lines).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
    expect(robots).not.toMatch(/Disallow:\s*\//);
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
  it('deve ter no menu e no rodapé Palestras, Mentoria e Mídia, e não Serviços, nos dois idiomas', () => {
    // Arrange
    const labels = (html: string, selector: RegExp) =>
      [...(selector.exec(html)?.[0] ?? '').matchAll(/<a [^>]*>([^<]+)<\/a>/g)].map((m) => m[1]);

    // Act
    const pt = page('index.html');
    const en = page('en/index.html');

    // Assert
    expect(labels(pt, /<nav class="desktop-nav"[\s\S]*?<\/nav>/)).toEqual(['Artigos', 'Palestras', 'Mentoria', 'Empresas', 'Mídia', 'Livros', 'Sobre']);
    expect(labels(en, /<nav class="desktop-nav"[\s\S]*?<\/nav>/)).toEqual(['Articles', 'Talks', 'Mentoring', 'Companies', 'Media', 'Books', 'About']);
    expect(labels(pt, /<footer[\s\S]*?<\/footer>/)).toContain('Palestras');
    expect(labels(pt, /<nav class="desktop-nav"[\s\S]*?<\/nav>/)).not.toContain('Serviços');
    expect(pt).not.toMatch(/Palestras e (Mídia|Workshops)/);
    expect(en).not.toMatch(/Talks &amp; (Media|Workshops)/);
  });

  it('deve ter os 7 itens do menu nos caminhos do contrato e o item atual marcado quando a página é de artigos', () => {
    // Arrange
    const html = page('artigos/index.html');

    // Act
    const nav = /<nav class="desktop-nav"[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '';
    const hrefs = [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    const current = /<a href="([^"]+)" aria-current="page"/.exec(nav)?.[1];

    // Assert
    expect(hrefs).toEqual(['/artigos/', '/palestras/', '/mentoria/', '/empresas/', '/midia/', '/livros/', '/sobre/']);
    expect(current).toBe('/artigos/');
  });

  it('deve ter no cabeçalho só o ícone do WhatsApp, com o texto como nome acessível e dica, e evento do GA', () => {
    // Arrange
    const html = page('en/index.html');

    // Act
    const header = /<header[\s\S]*?<\/header>/.exec(html)?.[0] ?? '';
    const link = /<a [^>]*href="https:\/\/wa\.me\/5535988867870\?text=[^"]+"[^>]*>[\s\S]*?<\/a>/.exec(header)?.[0] ?? '';

    // Assert
    expect(link).toContain('button--icon');
    expect(link).toContain('aria-label="Chat on WhatsApp"');
    expect(link).toContain('title="Chat on WhatsApp"');
    expect(link).toContain('data-ga-event="whatsapp_click"');
    expect(link).toContain('rel="noopener"');
    expect(link).toContain('<svg');
    expect(link).not.toContain('whatsapp-label');
    expect(header).not.toContain('>Chat on WhatsApp<');
  });

  it('deve deixar só o ícone do cabeçalho como botão de WhatsApp, com o número real e o evento do GA, quando a página é a home', () => {
    // Arrange
    const html = page('en/index.html');

    // Act
    const links = [...html.matchAll(/<a [^>]*href="https:\/\/wa\.me\/5535988867870\?text=[^"]+"[^>]*>/g)].map((m) => m[0]);

    // Assert
    expect(links).toHaveLength(1);
    expect(links[0]).toContain('button--icon');
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

  it('deve levar os 7 links do menu na coluna Navegação, sem RSS e sem botão de WhatsApp, quando a página é gerada', () => {
    // Arrange
    const html = page('en/index.html');

    // Act
    const footer = /<footer[\s\S]*?<\/footer>/.exec(html)?.[0] ?? '';
    const hrefs = [...(/<nav[\s\S]*?<\/nav>/.exec(footer)?.[0] ?? '').matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

    // Assert
    expect(hrefs).toEqual(['/en/articles/', '/en/speaking/', '/en/mentoring/', '/en/companies/', '/en/media/', '/en/books/', '/en/about/']);
    expect(footer).not.toContain('wa.me');
    expect(footer).not.toContain('button');
  });
});

describe('rodapé em 3 colunas', () => {
  const footer = (path: string) => /<footer[\s\S]*?<\/footer>/.exec(page(path))?.[0] ?? '';
  const column = (html: string, title: string) => {
    const start = html.indexOf(`>${title}</h2>`);
    const end = html.indexOf('</ul>', start);
    return start < 0 ? '' : html.slice(start, end);
  };
  const links = (html: string) =>
    [...html.matchAll(/<a ([^>]*)>([^<]+)<\/a>/g)].map((m) => ({
      href: /href="([^"]+)"/.exec(m[1] ?? '')?.[1],
      text: m[2],
      external: (m[1] ?? '').includes('target="_blank"') && (m[1] ?? '').includes('rel="noopener"'),
    }));

  it('deve ter as colunas Navegação, Social e Links úteis, nessa ordem, nos dois idiomas', () => {
    // Arrange
    const titles = (path: string) => [...footer(path).matchAll(/<h2 class="column-title[^"]*"[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);

    // Assert
    expect(titles('index.html')).toEqual(['Navegação', 'Social', 'Links úteis']);
    expect(titles('en/index.html')).toEqual(['Navigation', 'Social', 'Useful links']);
  });

  it('deve levar a coluna Social ao LinkedIn, Instagram e X, abrindo em nova aba', () => {
    // Act
    const found = links(column(footer('index.html'), 'Social'));

    // Assert
    expect(found.map((item) => [item.text, item.href])).toEqual([
      ['LinkedIn', 'https://www.linkedin.com/in/matheushaddad/'],
      ['Instagram', 'https://www.instagram.com/matheushaddad'],
      ['X (Twitter)', 'https://x.com/mhaddad'],
    ]);
    expect(found.every((item) => item.external)).toBe(true);
  });

  it('deve levar Links úteis ao Feedback Canvas, ao WorkFit.me e ao RSS, sem o Fale comigo, nos dois idiomas', () => {
    // Act
    const pt = links(column(footer('index.html'), 'Links úteis'));
    const en = links(column(footer('en/index.html'), 'Useful links'));

    // Assert
    for (const [found, rss] of [[pt, '/rss.xml'], [en, '/en/rss.xml']] as const) {
      expect(found.map((item) => [item.text, item.href])).toEqual([
        ['Feedback Canvas', 'https://feedbackcanvas.digital/livro'],
        ['WorkFit.me', 'https://po-fit.vercel.app/'],
        ['RSS', rss],
      ]);
      expect(found.map((item) => item.external)).toEqual([true, true, false]);
    }
    expect(footer('index.html')).not.toMatch(/Fale comigo|contato/i);
  });

  it('deve apresentar o autor na coluna da marca, nos dois idiomas', () => {
    // Assert
    expect(footer('index.html')).toContain('Empresário, palestrante e pesquisador em tecnologia, gestão e educação.');
    expect(footer('en/index.html')).toContain('Entrepreneur, speaker and researcher in technology, management and education.');
  });
});

describe('faixa "Conversar sobre..." no topo das páginas de serviço', () => {
  it('deve ficar fora de todas as páginas de serviço nos dois idiomas, mas continuar na coluna lateral', () => {
    // Arrange
    const pages = [
      'mentoria/index.html',
      'en/mentoring/index.html',
      'palestras/index.html',
      'en/speaking/index.html',
    ];

    // Act
    const html = pages.map((path) => page(path));

    // Assert
    expect(html.filter((content) => content.includes('class="band"'))).toEqual([]);
    expect(html.every((content) => content.includes('data-ga-params') && content.includes('service-sidebar'))).toBe(true);
    expect(html.every((content) => !content.includes('service-band'))).toBe(true);
  });
});

describe('faixa "Vamos conversar?"', () => {
  it('deve ficar fora da home, de Empresas e do Sobre nos dois idiomas', () => {
    // Arrange
    const pages = ['index.html', 'en/index.html', 'empresas/index.html', 'en/companies/index.html', 'sobre/index.html', 'en/about/index.html'];

    // Act
    const withBand = pages.filter((path) => page(path).includes('id="cta-heading"'));

    // Assert
    expect(withBand).toEqual([]);
  });

  it('deve continuar nas páginas de serviço e no fim do artigo', () => {
    // Assert
    expect(page('mentoria/index.html')).toContain('Vamos conversar?');
    expect(page('artigos/primeiro-artigo/index.html')).toContain('class="article-cta"');
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

  it('deve usar no bloco do autor o retrato recortado no rosto, e não a foto inteira', () => {
    // Arrange
    const html = page('artigos/primeiro-artigo/index.html');

    // Act
    const photo = /<aside class="author"[\s\S]*?<img[^>]*class="photo"[^>]*>/.exec(html)?.[0] ?? '';
    const src = /src="([^"]+)"/.exec(photo)?.[1] ?? '';

    // Assert
    expect(src).toContain('/_astro/matheus-haddad-rosto.');
  });

  it('deve descrever o autor com 20+ anos de experiência, sem os números antigos, nos dois idiomas', () => {
    // Arrange
    const pages = ['artigos/primeiro-artigo/index.html', 'en/articles/first-article/index.html'];

    // Act
    const descriptions = pages.map((path) => /<aside class="author"[\s\S]*?<p class="description"[^>]*>([\s\S]*?)<\/p>/.exec(page(path))?.[1]);

    // Assert
    expect(descriptions).toEqual([
      'Empresário, mentor e palestrante com 20+ anos de experiência em gestão, tecnologia e educação.',
      'Entrepreneur, mentor and speaker with 20+ years of experience in management, technology and education.',
    ]);
    expect(descriptions.every((text) => !/15\+|500\+|5 empresas|5 companies/.test(text ?? ''))).toBe(true);
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
    expect(h1).toBe('Empresário, palestrante e pesquisador em tecnologia, gestão e educação.');
    expect(html).toMatch(/<div class="waves"[^>]*aria-hidden="true"[^>]*>\s*<canvas/);
    expect(featured).toBeGreaterThan(-1);
    expect(older).toBeGreaterThan(featured);
    expect(html).not.toContain('Rascunho de teste');
  });
});

describe('botões do hero da home', () => {
  const ctas = (html: string) =>
    [...(/<div class="ctas"[\s\S]*?<\/div>/.exec(html)?.[0] ?? '').matchAll(/<a ([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
      class: /class="([^"]*)"/.exec(m[1] ?? '')?.[1] ?? '',
      href: /href="([^"]*)"/.exec(m[1] ?? '')?.[1],
      text: (m[2] ?? '').replace(/<[^>]+>/g, '').trim(),
    }));

  it('deve levar ao Sobre e às Palestras, com destaque em Palestras, e não ao WhatsApp, em português', () => {
    // Act
    const buttons = ctas(page('index.html'));

    // Assert
    expect(buttons.map((b) => [b.href, b.text])).toEqual([
      ['/sobre/', 'Saber mais'],
      ['/palestras/', 'Ver palestras'],
    ]);
    expect(buttons[0]?.class).toContain('button--secondary');
    expect(buttons[1]?.class).toContain('button--primary');
  });

  it('deve levar ao Sobre e às Palestras, com destaque em Palestras, e não ao WhatsApp, em inglês', () => {
    // Act
    const buttons = ctas(page('en/index.html'));

    // Assert
    expect(buttons.map((b) => [b.href, b.text])).toEqual([
      ['/en/about/', 'Learn more'],
      ['/en/speaking/', 'See talks'],
    ]);
    expect(buttons[1]?.class).toContain('button--primary');
  });
});

describe('texto principal da home', () => {
  const hero = (html: string) => ({
    label: />([^<]+)<\/p>\s*<h1/.exec(html)?.[1],
    title: /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html)?.[1],
    subtitle: /<p class="subtitle"[^>]*>([\s\S]*?)<\/p>/.exec(html)?.[1],
  });

  it('deve apresentar o autor, os serviços e o que ele faz, em português, quando a home é gerada', () => {
    // Act
    const { label, title, subtitle } = hero(page('index.html'));

    // Assert
    expect(label).toBe('Mentoria · Palestras');
    expect(title).toBe('Empresário, palestrante e pesquisador em tecnologia, gestão e educação.');
    expect(subtitle).toBe(
      'Ajudo CEOs e CTOs a repensar suas organizações, combinando gestão de pessoas, estratégia de negócios, desenvolvimento de software e inteligência artificial.',
    );
  });

  it('deve manter o mesmo sentido em inglês quando a home em inglês é gerada', () => {
    // Act
    const { label, title, subtitle } = hero(page('en/index.html'));

    // Assert
    expect(label).toBe('Mentoring · Talks');
    expect(title).toBe('Entrepreneur, speaker and researcher in technology, management and education.');
    expect(subtitle).toBe(
      'I help CEOs and CTOs rethink their organizations, combining people management, business strategy, software development and artificial intelligence.',
    );
  });
});

describe('descrição da home para buscadores e prévias', () => {
  it('deve seguir o título e a descrição do hero, com até 160 caracteres, nos dois idiomas', () => {
    // Arrange
    const pages = ['index.html', 'en/index.html'];

    // Act
    const descriptions = pages.map((path) => /<meta name="description" content="([^"]*)"/.exec(page(path))?.[1]);

    // Assert
    expect(descriptions).toEqual([
      'Empresário, palestrante e pesquisador em tecnologia, gestão e educação. Ajudo CEOs e CTOs a repensar suas organizações com pessoas, estratégia, software e IA.',
      'Entrepreneur, speaker and researcher in technology, management and education. I help CEOs and CTOs rethink organizations with people, strategy, software and AI.',
    ]);
    expect(descriptions.every((text) => (text ?? '').length <= 160)).toBe(true);
  });
});

describe('faixa de prova da home', () => {
  it('deve mostrar só as empresas e iniciativas, sem os números de empresas, anos e líderes, nos dois idiomas', () => {
    // Arrange
    const pages = [page('index.html'), page('en/index.html')];

    // Act
    const sections = pages.map((html) => /<section class="proof"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '');

    // Assert
    expect(sections.every((section) => section.includes('class="logo"'))).toBe(true);
    expect(sections.map((section) => (section.match(/class="logo"/g) ?? []).length)).toEqual([8, 8]);
    expect(sections[0]).toContain('Empresas e iniciativas');
    expect(sections[1]).toContain('Companies &amp; initiatives');
    for (const html of pages) {
      const visible = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, '');
      expect(visible).not.toMatch(/500\+|15\+|empresas fundadas|anos de gestão|líderes apoiados|companies founded|years in management|leaders supported/);
      expect(visible).not.toContain('<dl');
    }
    // A faixa é nomeada pelo próprio título, sem um segundo texto só para leitores de tela.
    expect(sections[0]).toMatch(/<section class="proof"[^>]*aria-labelledby="proof-title"/);
    expect(sections[0]).toContain('id="proof-title"');
  });
});

describe('páginas de serviço — Onda 3', () => {
  const pages = [
    ['mentoria/index.html', 'en/mentoring/index.html'],
    ['palestras/index.html', 'en/speaking/index.html'],
  ];

  it('deve gerar os 2 serviços nos dois idiomas com hreflang cruzado quando o build termina', () => {
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
    expect(crossLinks).toEqual([true, true]);
  });

  it('deve mostrar as seções, os 3 passos e os artigos relacionados quando a página é de serviço', () => {
    // Arrange
    const html = page('mentoria/index.html');

    // Act
    const sections = [...html.matchAll(/<h2 id="[a-z]+-heading" class="section-title mono"[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
    const steps = (html.match(/<li[^>]*><span class="number mono"/g) ?? []).length;
    const related = /<section aria-labelledby="related-heading"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

    // Assert
    expect(sections).toEqual(['Para quem é', 'Temas e abordagens', 'Estrutura da mentoria', 'Como funciona', 'Artigos relacionados']);
    expect(steps).toBe(3);
    expect(related).toContain('href="/artigos/primeiro-artigo/"');
    expect(related).toContain('href="/artigos/segundo-artigo/"');
  });

  it('deve mostrar a estrutura da mentoria entre os temas e os passos, e só nela', () => {
    // Arrange
    const mentoria = page('mentoria/index.html');
    const mentoring = page('en/mentoring/index.html');
    const palestras = page('palestras/index.html');

    // Act
    const items = (html: string) =>
      [...(/<ul class="structure"[\s\S]*?<\/ul>/.exec(html)?.[0] ?? '').matchAll(/<h3[^>]*>([^<]+)<\/h3>/g)].map((m) => m[1]);
    const order = ['topics-heading', 'structure-heading', 'steps-heading'].map((id) => mentoria.indexOf(`id="${id}"`));

    // Assert
    expect(items(mentoria)).toEqual(['Duração de teste (pt)', 'Formato de teste (pt)', 'Materiais de teste (pt)']);
    expect(items(mentoring)).toEqual(['Duration de teste (en)', 'Format de teste (en)', 'Materials de teste (en)']);
    expect(order[0]).toBeGreaterThan(0);
    expect(order[1]).toBeGreaterThan(order[0] ?? 0);
    expect(order[2]).toBeGreaterThan(order[1] ?? 0);
    expect(palestras).not.toContain('structure-heading');
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
    const html = page('mentoria/index.html');
    const encoded = encodeURIComponent('Mensagem de mentoria em pt & teste');

    // Act
    const links = [...html.matchAll(new RegExp(`<a [^>]*href="https://wa\\.me/5535988867870\\?text=${encoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`, 'g'))].map((m) => m[0]);

    // Assert
    // Cabeçalho (ícone) e coluna lateral.
    expect(links).toHaveLength(2);
    expect(links.filter((link) => link.includes('&quot;service&quot;:&quot;mentoria&quot;')).length).toBe(1);
  });

  it('deve acender o item do próprio serviço no menu quando a página é de mentoria, de palestras ou de mídia', () => {
    // Arrange
    const pages = ['mentoria/index.html', 'palestras/index.html', 'midia/index.html'];

    // Act
    const current = pages.map((path) => {
      const nav = /<nav class="desktop-nav"[\s\S]*?<\/nav>/.exec(page(path))?.[0] ?? '';
      return /<a href="([^"]+)" aria-current="page"/.exec(nav)?.[1];
    });

    // Assert
    expect(current).toEqual(['/mentoria/', '/palestras/', '/midia/']);
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
    const message = 'Olá, Matheus! Li o artigo "Primeiro artigo de teste" no seu site e gostaria de conversar sobre palestras.';

    // Act
    const cta = /<section class="article-cta"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

    // Assert
    expect(cta).toContain('data-cta-service="palestras"');
    expect(cta).toContain('Sua empresa está redesenhando a gestão com IA?');
    expect(cta).toContain(`text=${encodeURIComponent(message)}`);
    expect(cta).toContain('href="/palestras/"');
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

describe('empresas e iniciativas na home', () => {
  const tiles = (html: string) =>
    [...(/<section class="proof"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '').matchAll(/<a ([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
      attrs: m[1] ?? '',
      inner: m[2] ?? '',
      name: /aria-label="([^"]+)"/.exec(m[1] ?? '')?.[1],
      href: /href="([^"]+)"/.exec(m[1] ?? '')?.[1],
    })).filter((tile) => tile.attrs.includes('class="tile"'));

  it('deve mostrar os 8 logos em quadrados que levam, em nova aba, ao site de cada empresa ou iniciativa', () => {
    // Arrange
    const found = tiles(page('index.html'));

    // Assert
    expect(found.map((tile) => tile.name)).toEqual([
      'Webgoal',
      'Granatum Financeiro',
      'Ateliê de Software',
      'Orgganica',
      'Escola Lumiar Poços de Caldas',
      'Aliança Empreendedora',
      'A Guarda-Chuva',
      'TugÁgil',
    ]);
    expect(found[0]?.href).toBe('https://www.webgoal.com.br');
    expect(found.every((tile) => tile.href?.startsWith('https://'))).toBe(true);
    expect(found.every((tile) => tile.attrs.includes('target="_blank"') && tile.attrs.includes('rel="noopener"'))).toBe(true);
    expect(found.every((tile) => tile.attrs.includes(`title="${tile.name}"`))).toBe(true);
    expect(found.every((tile) => tile.attrs.includes('class="tile"'))).toBe(true);
  });

  it('deve levar em cada quadrado só o logo em máscara, sem imagem colorida', () => {
    // Arrange
    const found = tiles(page('index.html'));

    // Act
    const masks = found.map((tile) => /<span class="logo"[^>]*aria-hidden="true"[^>]*style="--logo: url\((\/_astro\/[^)]+)\)"/.exec(tile.inner)?.[1]);

    // Assert
    expect(masks.every((src) => src !== undefined)).toBe(true);
    expect(new Set(masks).size).toBe(8);
    expect(found.every((tile) => !tile.inner.includes('<img'))).toBe(true);
  });

  it('deve ajustar sozinho o número de quadrados por linha, com a última linha centralizada, e empilhar um por linha no celular', () => {
    // Arrange
    const html = page('index.html');
    const css = [
      ...[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? ''),
      ...[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => readFileSync(join(OUT_DIR, m[1] ?? ''), 'utf8')),
    ].join('');

    // Act
    const list = /ul\[data-astro-cid-[a-z0-9]+\]\{[^}]*\}/.exec(css)?.[0] ?? '';
    const item = /li\[data-astro-cid-[a-z0-9]+\]\{[^}]*\}/.exec(css)?.[0] ?? '';
    const cid = /data-astro-cid-([a-z0-9]+)/.exec(list)?.[1] ?? '';
    const phoneItem = new RegExp(`(?:max-width:\\s*767px|width\\s*<=\\s*767px)\\)\\s*\\{ul\\[data-astro-cid-${cid}\\]\\{[^}]*\\}li\\[data-astro-cid-${cid}\\]\\{[^}]*\\}`).exec(css)?.[0] ?? '';

    // Assert
    expect(list).toMatch(/display:\s*flex/);
    expect(list).toMatch(/flex-wrap:\s*wrap/);
    expect(list).toMatch(/justify-content:\s*center/);
    expect(list).not.toMatch(/--per-row|max-width/);
    expect(item).toMatch(/flex:\s*0 0 var\(--logo-tile\)/);
    expect(phoneItem).toMatch(/flex-basis:\s*100%|flex:\s*0 0 100%/);
  });

  it('deve manter o fundo e o logo do quadrado ao passar o mouse, mudando só a borda', () => {
    // Arrange
    const html = page('index.html');
    const css = [
      ...[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? ''),
      ...[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => readFileSync(join(OUT_DIR, m[1] ?? ''), 'utf8')),
    ].join('');

    // Act
    const hover = /\.tile\[data-astro-cid-[a-z0-9]+\]:hover(?:,\.tile\[data-astro-cid-[a-z0-9]+\]:focus-visible)?\{[^}]*\}/.exec(css)?.[0] ?? '';

    // Assert
    expect(hover).toMatch(/border-color/);
    expect(hover).not.toMatch(/background/);
    expect(css).not.toMatch(/\.tile\[data-astro-cid-[a-z0-9]+\]:hover \./);
  });

  it('deve mostrar os logos em quadrados maiores que 144px', () => {
    // Arrange
    const tokens = readFileSync(join(process.cwd(), 'src/styles/tokens.css'), 'utf8');

    // Act
    const size = Number(/--logo-tile:\s*(\d+)px/.exec(tokens)?.[1]);

    // Assert
    expect(size).toBeGreaterThan(144);
  });

  it('deve deixar a faixa de empresas sem botão, nos dois idiomas', () => {
    // Arrange
    const section = (html: string) => /<section class="proof"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';

    // Act
    const pt = section(page('index.html'));
    const en = section(page('en/index.html'));

    // Assert
    expect(pt).not.toContain('class="button');
    expect(en).not.toContain('class="button');
    expect(pt).not.toContain('Conhecer empresas');
    expect(en).not.toContain('Explore companies');
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
    expect(html).toMatch(/<img[^>]*alt="Matheus Haddad, entrepreneur and mentor in business and technology"/);
    expect(html).toContain('Test About title.');
    expect(headings).toEqual(['Journey', 'Education', 'Principles']);
    expect((timeline.match(/<li/g) ?? []).length).toBe(2);
    expect(timeline).toContain('href="/en/articles/first-article/"');
    expect(html).toContain('href="/en/speaking/"');
  });

  it('deve transformar os links do texto sobre o autor em âncoras, com o site externo em nova aba e o interno na mesma', () => {
    // Arrange
    const pt = page('sobre/index.html');
    const en = page('en/about/index.html');

    // Act
    const anchor = (html: string, label: string) => new RegExp(`<a [^>]*>${label}</a>`).exec(html)?.[0] ?? '';
    const externalPt = anchor(pt, 'Empresa de teste');
    const internalPt = anchor(pt, 'livro');
    const internalEn = anchor(en, 'book');

    // Assert
    expect(externalPt).toContain('href="https://empresa.example.com"');
    expect(externalPt).toContain('target="_blank"');
    expect(externalPt).toContain('rel="noopener"');
    expect(internalPt).toContain('href="/livros/"');
    expect(internalPt).not.toContain('target=');
    expect(internalEn).toContain('href="/en/books/"');
  });

  it('deve apresentar as cinco empresas em tecnologia, consultoria e educação no texto de abertura de Empresas, nos dois idiomas', () => {
    // Arrange
    const intro = (path: string) => /<p class="lead"[^>]*>([\s\S]*?)<\/p>/.exec(page(path))?.[1];

    // Act
    const pt = intro('empresas/index.html');
    const en = intro('en/companies/index.html');

    // Assert
    expect(pt).toBe(
      'Desde 2008 cofundei cinco empresas nos setores de tecnologia, consultoria e educação, e é delas que vem boa parte do que escrevo e ensino sobre gestão e IA. Também contribuo como conselheiro e voluntário em organizações de empreendedorismo e de agilidade.',
    );
    expect(en).toBe(
      'Since 2008 I have co-founded five companies in the technology, consulting and education sectors, and they are the source of much of what I write and teach about management and AI. I also contribute as a board member and volunteer to entrepreneurship and agility organizations.',
    );
  });

  it('deve descrever as empresas em tecnologia, consultoria e educação na descrição de Empresas, nos dois idiomas', () => {
    // Arrange
    const description = (path: string) => /<meta name="description" content="([^"]*)"/.exec(page(path))?.[1];

    // Act
    const pt = description('empresas/index.html');
    const en = description('en/companies/index.html');

    // Assert
    expect(pt).toContain('Empresas de tecnologia, consultoria e educação');
    expect(en).toContain('Technology, consulting and education companies');
    expect(`${pt} ${en}`).not.toMatch(/finanças|finance/i);
  });

  it('deve ficar sem a linha entre o texto de abertura e o primeiro grupo de empresas na página Empresas', () => {
    // Arrange
    const html = page('empresas/index.html');
    const css = [
      ...[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? ''),
      ...[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => readFileSync(join(OUT_DIR, m[1] ?? ''), 'utf8')),
    ].join('');

    // Act
    const intro = /\.intro\[data-astro-cid-[a-z0-9]+\]\{[^}]*\}/.exec(css)?.[0] ?? '';

    // Assert
    expect(html).toContain('<header class="intro"');
    expect(intro).not.toMatch(/border/);
  });

  it('deve ficar sem a linha embaixo da última empresa de cada grupo, antes do título do grupo seguinte', () => {
    // Arrange
    const html = page('empresas/index.html');
    const css = [
      ...[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? ''),
      ...[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => readFileSync(join(OUT_DIR, m[1] ?? ''), 'utf8')),
    ].join('');

    // Act
    const row = /\.row\[data-astro-cid-[a-z0-9]+\]\{[^}]*\}/.exec(css)?.[0] ?? '';
    const last = /\.row\[data-astro-cid-[a-z0-9]+\]:last-child\{[^}]*\}/.exec(css)?.[0] ?? '';

    // Assert
    expect(row).toMatch(/border-bottom/);
    expect(last).toMatch(/border-bottom:\s*(none|0)/);
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

  it('deve mostrar a capa de cada edição, azul na inglesa, quando a página é Livros', () => {
    // Arrange
    const pt = page('livros/index.html');
    const en = page('en/books/index.html');

    // Act
    const cover = (html: string) => /<img[^>]*src="(\/_astro\/feedback-canvas-[a-z]+\.[^"]+)"/.exec(html)?.[1] ?? '';

    // Assert
    expect(cover(pt)).toContain('feedback-canvas-pt.');
    expect(cover(en)).toContain('feedback-canvas-en.');
    expect(pt).not.toContain('feedback-canvas-en.');
    expect(en).not.toContain('feedback-canvas-pt.');
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

describe('Palestras — mídias relacionadas', () => {
  const related = (path: string) => /<section aria-labelledby="related-media-heading"[\s\S]*?<\/section>/.exec(page(path))?.[0] ?? '';

  it('deve listar 3 vídeos de palestra e 1 podcast no lugar de O problema, Palestras anteriores e Artigos relacionados', () => {
    // Arrange
    const pages = ['palestras/index.html', 'en/speaking/index.html'];

    // Act
    const found = pages.map((path) => {
      const section = related(path);
      return {
        types: [...section.matchAll(/<li class="card"[^>]*data-type="([a-z]+)"/g)].map((m) => m[1]),
        heading: /<h2 id="related-media-heading"[^>]*>\s*([^<]+?)\s*<\/h2>/.exec(section)?.[1],
        html: page(path),
      };
    });

    // Assert
    expect(found.map((item) => item.types)).toEqual([
      ['palestra', 'palestra', 'palestra', 'podcast'],
      ['palestra', 'palestra', 'palestra', 'podcast'],
    ]);
    expect(found.map((item) => item.heading)).toEqual(['Mídias relacionadas', 'Related media']);
    for (const { html } of found) {
      expect(html).not.toContain('id="problem-heading"');
      expect(html).not.toContain('id="media-heading"');
      expect(html).not.toContain('id="related-heading"');
    }
  });

  it('deve carregar o YouTube só no clique nas mídias relacionadas, sem iframe na página', () => {
    // Arrange
    const html = page('palestras/index.html');

    // Act
    const plays = (related('palestras/index.html').match(/<button class="play"[^>]*data-youtube="[A-Za-z0-9_-]{11}"/g) ?? []).length;

    // Assert
    expect(plays).toBe(4);
    expect(html).not.toContain('<iframe');
    expect(html).toContain('youtube-nocookie.com');
  });

  it('deve manter os artigos relacionados na mentoria e não mostrar mídias lá', () => {
    // Arrange
    const html = page('mentoria/index.html');

    // Assert
    expect(html).toContain('id="related-heading"');
    expect(html).not.toContain('related-media-heading');
  });
});

describe('página do livro — separadores', () => {
  it('deve ficar sem a linha entre a abertura e a seção Sobre o livro, nos dois idiomas', () => {
    // Arrange
    const css = (html: string) =>
      [
        ...[...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1] ?? ''),
        ...[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map((m) => readFileSync(join(OUT_DIR, m[1] ?? ''), 'utf8')),
      ].join('');

    // Act
    const intros = ['livros/index.html', 'en/books/index.html'].map((path) => {
      const html = page(path);
      const cid = /<section class="intro"[^>]*data-astro-cid-([a-z0-9]+)/.exec(html)?.[1] ?? '';
      return new RegExp(`\\.intro\\[data-astro-cid-${cid}\\]\\{[^}]*\\}`).exec(css(html))?.[0] ?? '';
    });

    // Assert
    for (const intro of intros) {
      expect(intro).not.toBe('');
      expect(intro).not.toMatch(/border/);
    }
  });
});

describe('Mídia — acervo de vídeos e podcasts', () => {
  it('deve mostrar os 23 itens do acervo com o filtro por tipo na página de mídia, nos dois idiomas', () => {
    // Arrange
    const pages = ['midia/index.html', 'en/media/index.html'];

    // Act
    const found = pages.map((path) => {
      const html = page(path);
      return {
        cards: [...html.matchAll(/<li class="card"[^>]*data-type="([a-z]+)"/g)].map((m) => m[1]),
        filters: [...html.matchAll(/<button class="filter mono"[^>]*data-filter="([a-z]+)"/g)].map((m) => m[1]),
        title: /<h1[^>]*>([^<]+)<\/h1>/.exec(html)?.[1],
      };
    });

    // Assert
    expect(found.map((item) => item.cards.length)).toEqual([23, 23]);
    expect(found.map((item) => item.filters)).toEqual([
      ['all', 'palestra', 'webinar', 'podcast', 'entrevista'],
      ['all', 'palestra', 'webinar', 'podcast', 'entrevista'],
    ]);
    expect(found.map((item) => item.title)).toEqual(['Mídia', 'Media']);
  });

  it('deve manter o acervo fora das páginas de palestras, que só descrevem o serviço', () => {
    // Arrange
    const pages = ['palestras/index.html', 'en/speaking/index.html'];

    // Act
    const html = pages.map((path) => page(path));

    // Assert
    expect(html.every((content) => !content.includes('id="talks-heading"') && !content.includes('data-talks'))).toBe(true);
    expect(html.every((content) => content.includes('id="steps-heading"'))).toBe(true);
  });

  it('deve gerar mídia e palestras nos dois idiomas com hreflang cruzado e fora das antigas rotas de serviços', () => {
    // Arrange
    const pairs = [
      ['midia/index.html', 'en/media/index.html'],
      ['palestras/index.html', 'en/speaking/index.html'],
    ];
    const removed = ['servicos/index.html', 'en/services/index.html', 'consultoria/index.html', 'en/consulting/index.html'];

    // Act
    const crossLinks = pairs.map(([pt = '', en = '']) => {
      const ptPath = `/${pt.replace('index.html', '')}`;
      const enPath = `/${en.replace('index.html', '')}`;
      return page(pt).includes(`hreflang="en" href="${SITE}${enPath}"`) && page(en).includes(`hreflang="pt-BR" href="${SITE}${ptPath}"`);
    });

    // Assert
    expect(crossLinks).toEqual([true, true]);
    expect(removed.filter(exists)).toEqual([]);
  });

  it('deve carregar o YouTube só no clique, com miniaturas locais, quando o acervo é gerado', () => {
    // Arrange
    const html = page('en/media/index.html');

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

describe('mapas do Google no artigo', () => {
  const figures = (html: string) => [...html.matchAll(/<figure class="map-embed">[\s\S]*?<\/figure>/g)].map((m) => m[0]);

  it('deve gerar cada mapa já no HTML, com carregamento preguiçoso e sem botão, quando o artigo traz mapas', () => {
    // Arrange
    const pt = figures(page('artigos/segundo-artigo/index.html'));

    // Act
    const iframes = pt.map((figure) => /<iframe[^>]*>/.exec(figure)?.[0] ?? '');

    // Assert
    expect(pt).toHaveLength(2);
    expect(iframes[0]).toContain('src="https://www.google.com/maps/d/embed?mid=1sET9YDELCtNMjR9M6hGqK8ml2iroXGg"');
    expect(iframes[0]).toContain('title="Mapa de teste"');
    expect(iframes[1]).toContain('src="https://www.google.com/maps/embed?pb=');
    expect(iframes[1]).toContain('title="Mapa padrão de teste"');
    expect(iframes.every((tag) => tag.includes('loading="lazy"') && tag.includes('referrerpolicy="strict-origin-when-cross-origin"'))).toBe(true);
    expect(pt.join('')).not.toContain('<button');
    expect(page('artigos/segundo-artigo/index.html')).not.toContain('data-map-embed');
  });

  it('deve levar o link para abrir o My Maps só no mapa que tem página própria, no idioma do artigo', () => {
    // Arrange
    const pt = figures(page('artigos/segundo-artigo/index.html'));
    const en = figures(page('en/articles/second-article/index.html'));

    // Assert
    expect(pt[0]).toContain('href="https://www.google.com/maps/d/viewer?mid=1sET9YDELCtNMjR9M6hGqK8ml2iroXGg"');
    expect(pt[0]).toContain('>Abrir no Google Maps</a>');
    expect(pt[1]).not.toContain('<a ');
    expect(en[0]).toContain('>Open in Google Maps</a>');
    expect(en[1]).toContain('title="Standard test map"');
  });
});

describe('404 — Onda 4', () => {
  it('deve gerar a 404 bilíngue fora dos buscadores e do sitemap quando o build termina', () => {
    // Arrange
    const html = page('404.html');
    const sitemap = page('sitemap-0.xml');

    // Act
    const content = html.replace(/<footer[\s\S]*?<\/footer>/, '');
    const headings = [...content.matchAll(/<h[12][^>]*>([^<]+)<\/h[12]>/g)].map((m) => m[1]);

    // Assert
    expect(headings).toEqual(['Página não encontrada', 'Page not found']);
    expect(html).toContain('<meta name="robots" content="noindex">');
    expect(html).not.toMatch(/<link rel="alternate" hreflang=/);
    expect(html).toContain('<div class="english" lang="en"');
    expect(sitemap).not.toContain('404');
  });
});

