import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
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
