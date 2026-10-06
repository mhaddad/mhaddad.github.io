import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import sharp from 'sharp';
import { parse } from 'yaml';
import { ui } from '../src/i18n/ui';
import { parseMapIframe } from '../src/lib/map-embed';

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

  it('deve manter cada iframe de mapa sozinho no parágrafo para ele só carregar no clique', () => {
    // Arrange
    const files = markdownFiles(CONTENT_DIR);

    // Act
    const loose = files.flatMap((file) => {
      const body = readFileSync(file, 'utf8');
      const all = [...body.matchAll(/<iframe\b[^>]*maps\/(?:d\/)?embed[^>]*>/gi)].length;
      const alone = body.split(/\n\s*\n/).filter((block) => parseMapIframe(block) !== undefined).length;
      return all === alone ? [] : [file];
    });

    // Assert
    expect(loose).toEqual([]);
  });
});

describe('serviço de palestras', () => {
  it('deve anunciar só palestras, sem workshops, na página, no menu e nas chamadas dos artigos', () => {
    // Arrange
    const pages = ['pt', 'en'].map((lang) => readFileSync(`src/content/services/${lang}/palestras.md`, 'utf8'));
    const texts = (['pt', 'en'] as const).flatMap((lang) => [ui[lang]['nav.speaking'], ui[lang]['cta.educacao.text'], ui[lang]['service.name.palestras']]);

    // Act
    const withWorkshop = [...pages, ...texts].filter((text) => /workshop/i.test(text));

    // Assert
    expect(withWorkshop).toEqual([]);
    expect(ui.pt['nav.speaking']).toBe('Palestras');
    expect(ui.en['nav.speaking']).toBe('Talks');
  });
});

describe('serviços oferecidos', () => {
  it('deve oferecer só mentoria e palestras, sem consultoria, nas páginas, no menu e nas chamadas', () => {
    // Arrange
    const serviceFiles = (lang: string) => readdirSync(`src/content/services/${lang}`).filter((file) => file.endsWith('.md')).sort();
    const files = (['pt', 'en'] as const).map(serviceFiles);
    const texts = (['pt', 'en'] as const).flatMap((lang) =>
      [
        ...serviceFiles(lang).map((file) => readFileSync(`src/content/services/${lang}/${file}`, 'utf8')),
        ui[lang]['hero.label'],
        ui[lang]['nav.mentoring'],
        ui[lang]['nav.media'],
      ],
    );

    // Act
    const withConsulting = texts.filter((text) => /consultoria|consulting/i.test(text));

    // Assert
    expect(files).toEqual([['mentoria.md', 'palestras.md'], ['mentoria.md', 'palestras.md']]);
    expect(withConsulting).toEqual([]);
    expect(Object.keys(ui.pt).filter((key) => key.includes('consultoria'))).toEqual([]);
    expect(ui.pt['nav.media']).toBe('Mídia');
    expect(ui.en['nav.media']).toBe('Media');
  });
});

describe('página Sobre', () => {
  const load = (path: string) => parse(readFileSync(path, 'utf8')) as Record<string, unknown>;
  const about = { pt: load('src/content/about/pt.yaml'), en: load('src/content/about/en.yaml') } as Record<'pt' | 'en', { title: string; description: string; bio: string[] }>;
  const companies = parse(readFileSync('src/content/companies/companies.yaml', 'utf8')) as { name: string; url: string }[];

  it('deve ter o nome do autor como título nos dois idiomas', () => {
    expect([about.pt.title, about.en.title]).toEqual(['Matheus Haddad', 'Matheus Haddad']);
  });

  it('deve levar cada empresa citada no texto para o site dela, nos dois idiomas', () => {
    // Arrange
    const founded = ['Webgoal', 'Granatum', 'Ateliê de Software', 'Orgganica', 'Escola Lumiar Poços de Caldas'];
    const urls = Object.fromEntries(companies.map((company) => [company.name.replace(' Financeiro', ''), company.url]));

    // Act
    const missing = (['pt', 'en'] as const).flatMap((lang) => {
      const text = about[lang].bio.join('\n');
      return founded.filter((name) => !text.includes(`[${name}](${urls[name]})`)).map((name) => `${lang}: ${name}`);
    });
    const unlinked = (['pt', 'en'] as const).flatMap((lang) => {
      const text = about[lang].bio.join('\n').replace(/\[[^\]]+\]\([^)]+\)/g, '');
      return founded.filter((name) => text.includes(name)).map((name) => `${lang}: ${name}`);
    });

    // Assert
    expect(missing).toEqual([]);
    expect(unlinked).toEqual([]);
  });

  it('deve cobrir formação, mestrado em IA, agilidade, ensino, Feedback Canvas, educação inovadora na Lumiar e IA', () => {
    // Arrange
    const topics: [string, RegExp, RegExp][] = [
      ['mestrado em IA', /[Mm]estre em Inteligência Artificial/, /master's in Artificial Intelligence/],
      ['ensino', /pós-graduação e MBA/, /graduate and MBA/],
      ['temas do ensino', /empreendedorismo digital, design organizacional e novas abordagens de gestão/, /digital entrepreneurship, organizational design and new approaches to management/],
      ['agilidade', /agilidade/, /[Aa]gility/],
      ['Feedback Canvas e livro de 2025', /Feedback Canvas[\s\S]*2025/, /Feedback Canvas[\s\S]*2025/],
      ['educação inovadora, Metodologia Lumiar, relevância e IA', /educação inovadora[\s\S]*Metodologia Lumiar[\s\S]*relevância[\s\S]*tempos de IA/, /[Ii]nnovative education[\s\S]*Lumiar Methodology[\s\S]*relevance[\s\S]*age of AI/],
      ['adoção de IA e agentes', /orquestração de agentes de IA/, /orchestration of AI agents/],
    ];

    // Act
    const missing = topics.flatMap(([name, pt, en]) => [
      ...(pt.test(about.pt.bio.join('\n')) ? [] : [`pt: ${name}`]),
      ...(en.test(about.en.bio.join('\n')) ? [] : [`en: ${name}`]),
    ]);

    // Assert
    expect(missing).toEqual([]);
  });

  it('deve citar a escola pelo nome completo só na abertura, e depois falar da Metodologia Lumiar', () => {
    // Arrange
    const count = (lang: 'pt' | 'en') => about[lang].bio.join('\n').split('Escola Lumiar Poços de Caldas').length - 1;

    // Assert
    expect([count('pt'), count('en')]).toEqual([1, 1]);
  });

  it('deve evitar travessão e linkar o livro pela página do próprio site', () => {
    // Arrange
    const text = (lang: 'pt' | 'en') => about[lang].bio.join('\n');

    // Assert
    expect(text('pt')).not.toMatch(/[—–]/);
    expect(text('en')).not.toMatch(/[—–]/);
    expect(text('pt')).toContain('](/livros/)');
    expect(text('en')).toContain('](/en/books/)');
  });
});

describe('serviço de mentoria', () => {
  const read = (lang: 'pt' | 'en') => readFileSync(`src/content/services/${lang}/mentoria.md`, 'utf8');

  it('deve manter o conteúdo original da página de mentoria do site anterior, nos dois idiomas', () => {
    // Arrange
    const expected: Record<'pt' | 'en', string[]> = {
      pt: [
        'Posicionamento executivo',
        'Gestão de cultura',
        'Tomada de decisão',
        'Resiliência cognitiva',
        'Liderança distribuída',
        'Execução com propósito',
        'Diagnóstico profundo',
        'Plano de voo',
        'Execução e ajuste',
        'Frameworks exclusivos e diagnósticos personalizados',
        'Estratégia e liderança de impacto',
      ],
      en: [
        'Executive positioning',
        'Culture management',
        'Decision making',
        'Cognitive resilience',
        'Distributed leadership',
        'Purposeful execution',
        'Deep diagnosis',
        'Flight plan',
        'Execution and adjustment',
        'Exclusive frameworks and personalized diagnostics',
        'Strategy and impactful leadership',
      ],
    };

    // Act
    const missing = (['pt', 'en'] as const).flatMap((lang) => expected[lang].filter((text) => !read(lang).includes(text)).map((text) => `${lang}: ${text}`));

    // Assert
    expect(missing).toEqual([]);
  });

  it('deve manter o público da nova versão, sem a seção O problema, e declarar a estrutura em duração, formato e materiais', () => {
    // Arrange
    const structure = (lang: 'pt' | 'en') => /structure:\n((?:  - title: .*\n    text: .*\n)+)/.exec(read(lang))?.[1].match(/title: (.*)/g) ?? [];

    // Assert
    expect(read('pt')).toContain('audience: Lideranças em transição de papel');
    expect(read('pt')).not.toMatch(/^problem:/m);
    expect(read('en')).not.toMatch(/^problem:/m);
    expect(structure('pt')).toEqual(['title: Duração', 'title: Formato', 'title: Materiais']);
    expect(structure('en')).toEqual(['title: Duration', 'title: Format', 'title: Materials']);
  });

  it('deve relacionar os artigos de IA no desenvolvimento de software e de IA e jogo de poder, além dos dois anteriores', () => {
    // Arrange
    const related = (lang: 'pt' | 'en') => /relatedArticles:\n((?:  - .*\n)+)/.exec(read(lang))?.[1].match(/- (.*)/g) ?? [];

    // Assert
    for (const lang of ['pt', 'en'] as const) {
      expect(related(lang)).toEqual([
        '- autonomia-para-transformar-organizacoes',
        '- coerencia-cognitiva',
        '- ia-no-processo-de-desenvolvimento-de-software',
        '- a-ia-muda-quase-tudo-na-sua-empresa-menos-o-jogo-de-poder',
      ]);
    }
  });

  it('deve abrir a página sem citar a duração no subtítulo, que fica só na seção de estrutura', () => {
    // Arrange
    const subtitle = (lang: 'pt' | 'en') => /^subtitle: (.*)$/m.exec(read(lang))?.[1];

    // Assert
    expect(subtitle('pt')).toBe(
      'Um acompanhamento personalizado desenhado para executivos e empreendedores que buscam clareza estratégica e refinamento da liderança.',
    );
    expect(subtitle('en')).toBe(
      'A personalized engagement designed for executives and entrepreneurs seeking strategic clarity and a more refined leadership.',
    );
  });
});

describe('serviço de palestras — mídias relacionadas', () => {
  const talks = parse(readFileSync('src/content/talks/talks.yaml', 'utf8')) as { id: string; type: string }[];
  const read = (lang: 'pt' | 'en') => readFileSync(`src/content/services/${lang}/palestras.md`, 'utf8');
  const ids = (lang: 'pt' | 'en') => (/relatedTalks:\n((?:  - .*\n)+)/.exec(read(lang))?.[1].match(/- (.*)/g) ?? []).map((item) => item.slice(2));

  it('deve relacionar 3 vídeos de palestra e 1 podcast do acervo, nos dois idiomas, sem problema nem artigos', () => {
    // Arrange
    const type = (id: string) => talks.find((talk) => talk.id === id)?.type;

    // Assert
    for (const lang of ['pt', 'en'] as const) {
      expect(ids(lang).map(type)).toEqual(['palestra', 'palestra', 'palestra', 'podcast']);
      expect(read(lang)).not.toMatch(/^problem:/m);
      expect(read(lang)).not.toMatch(/^relatedArticles:/m);
    }
    expect(ids('pt')).toEqual(ids('en'));
  });

  it('deve incluir a palestra Estruturas Organizacionais Ágeis e não a sobre o fim da avaliação individual', () => {
    expect(ids('pt')).toEqual(['vanguarda-em-foco', 'tdc-recife-2020', 'agile-in-the-jungle', 'podfalar']);
    expect(ids('pt')).not.toContain('agile-trends');
  });
});

describe('capa do artigo RH Ágil', () => {
  const KEY = 'rh-agil-muito-alem-da-adocao-dos-metodos-ageis';
  const files = { pt: `${CONTENT_DIR}/pt/${KEY}.md`, en: `${CONTENT_DIR}/en/agile-hr-far-beyond-adopting-agile-methods.md` };

  it('deve abrir o artigo, nos dois idiomas, com a imagem de capa antes do texto, com texto alternativo', () => {
    // Arrange
    const body = (path: string) => readFileSync(path, 'utf8').replace(/^---[\s\S]*?---\n+/, '');

    // Act
    const firsts = Object.values(files).map((path) => /^!\[([^\]]+)\]\(([^)]+)\)/.exec(body(path)));

    // Assert
    for (const match of firsts) {
      expect(match?.[2]).toBe(`../../../assets/articles/${KEY}/capa.jpg`);
      expect(match?.[1]?.length).toBeGreaterThan(20);
    }
    expect(firsts[0]?.[1]).not.toBe(firsts[1]?.[1]);
    expect(existsSync(`src/assets/articles/${KEY}/capa.jpg`)).toBe(true);
  });
});

describe('capa do artigo A educação e a escola mudarão para sempre', () => {
  const KEY = 'a-educacao-e-a-escola-mudarao-para-sempre';
  const files = [`${CONTENT_DIR}/pt/${KEY}.md`, `${CONTENT_DIR}/en/education-and-schools-will-change-forever.md`];

  it('deve abrir o artigo, nos dois idiomas, com a imagem do curta Alike, que aparece uma única vez', () => {
    // Arrange
    const body = (path: string) => readFileSync(path, 'utf8').replace(/^---[\s\S]*?---\n+/, '');

    // Assert
    for (const path of files) {
      const text = body(path);
      expect(/^!\[[^\]]{20,}\]\(\.\.\/\.\.\/\.\.\/assets\/articles\/[^)]+\/alike\.png\)/.test(text)).toBe(true);
      expect((text.match(/alike\.png/g) ?? []).length).toBe(1);
      expect(text.split('\n\n')[1]).toMatch(/^\*.*Alike/);
    }
  });
});

describe('capa do artigo Feedback em vez de avaliação de desempenho', () => {
  const files = [
    `${CONTENT_DIR}/pt/feedback-em-vez-de-avaliacao-de-desempenho.md`,
    `${CONTENT_DIR}/en/feedback-instead-of-performance-reviews.md`,
  ];

  it('deve abrir o artigo, nos dois idiomas, com a imagem do Feedback Canvas e repeti-la na seção que apresenta a ferramenta', () => {
    // Arrange
    const body = (path: string) => readFileSync(path, 'utf8').replace(/^---[\s\S]*?---\n+/, '');

    // Assert
    for (const path of files) {
      const text = body(path);
      expect(/^!\[[^\]]{20,}\]\(\.\.\/\.\.\/\.\.\/assets\/articles\/[^)]+\/feedback-canvas\.png\)/.test(text)).toBe(true);
      expect((text.match(/feedback-canvas\.png/g) ?? []).length).toBe(2);
      const section = text.slice(text.lastIndexOf('\n## '));
      expect(section).toContain('feedback-canvas.png');
    }
  });
});

describe('apresentação e vídeo no artigo Feedback em vez de avaliação de desempenho', () => {
  const files = [
    `${CONTENT_DIR}/pt/feedback-em-vez-de-avaliacao-de-desempenho.md`,
    `${CONTENT_DIR}/en/feedback-instead-of-performance-reviews.md`,
  ];

  it('deve incorporar a apresentação do SlideShare e o vídeo da entrevista logo após as frases que os anunciam, nos dois idiomas', () => {
    // Arrange
    const slides = '<iframe src="https://www.slideshare.net/slideshow/embed_code/key/azn2w3F2Y0OlBQ"';
    const video = '<iframe src="https://www.youtube-nocookie.com/embed/dJLKlPPhPCQ"';

    // Act
    const texts = files.map((path) => readFileSync(path, 'utf8'));

    // Assert
    for (const text of texts) {
      const paragraphs = text.split('\n\n');
      const at = (marker: string) => paragraphs.findIndex((paragraph) => paragraph.startsWith(marker));
      expect(paragraphs[at(slides) - 1]).toMatch(/:$/);
      expect(paragraphs[at(video) - 1]).toMatch(/:$/);
      expect(text).toMatch(/title="[^"]{10,}"/);
      expect((text.match(/<iframe/g) ?? []).length).toBe(2);
    }
  });
});

describe('logo do Ateliê de Software', () => {
  it('deve usar a versão nova (traço grosso, proporção 1500×492) no logo colorido, na máscara e na fonte', async () => {
    // Arrange
    const ratio = async (path: string) => {
      const { width = 0, height = 1 } = await sharp(path).metadata();
      return width / height;
    };

    // Act
    const ratios = await Promise.all(['src/assets/companies/atelie.png', 'src/assets/companies/mono/atelie.png', 'scripts/logos/atelie.png'].map(ratio));

    // Assert
    for (const value of ratios) expect(value).toBeCloseTo(1500 / 492, 1);
  });

  it('deve manter o logo colorido sem fundo branco aparente nas bordas e com o traço escuro', async () => {
    // Arrange
    const { data, info } = await sharp('src/assets/companies/atelie.png').raw().toBuffer({ resolveWithObject: true });

    // Act
    const dark = [...Array(info.width * info.height).keys()].filter((i) => data[i * info.channels]! < 80).length;

    // Assert
    expect(dark / (info.width * info.height)).toBeGreaterThan(0.12);
  });
});
