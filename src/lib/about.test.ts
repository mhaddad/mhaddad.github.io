import { describe, expect, it } from 'vitest';
import type { ArticleEntry } from './articles';
import { AboutValidationError, bioSegments, timelineArticle, validateAbout, type AboutEntry } from './about';

function about(lang: 'pt' | 'en', data: Partial<AboutEntry['data']> = {}): AboutEntry {
  return {
    id: lang,
    data: {
      lang,
      timeline: [{ year: 2008 }, { year: 2026, article: 'coerencia-cognitiva' }],
      education: [{}, {}],
      principles: [{}],
      ...data,
    },
  };
}

function article(lang: 'pt' | 'en', translationKey: string, draft = false): ArticleEntry {
  return {
    id: `${lang}/${translationKey}`,
    data: { title: translationKey, lang, translationKey, category: 'coerencia', pubDate: new Date('2026-01-01'), draft },
  };
}

const articles = [article('pt', 'coerencia-cognitiva'), article('en', 'coerencia-cognitiva')];

function problemsOf(entries: AboutEntry[], list: ArticleEntry[] = articles): string[] {
  try {
    validateAbout(entries, list);
    return [];
  } catch (error) {
    if (error instanceof AboutValidationError) return error.problems;
    throw error;
  }
}

describe('validateAbout', () => {
  it('deve aceitar o Sobre quando os dois idiomas estão alinhados e o artigo está publicado', () => {
    expect(problemsOf([about('pt'), about('en')])).toEqual([]);
  });

  it('deve recusar quando falta um idioma', () => {
    expect(problemsOf([about('pt')])).toEqual(['sobre: falta a versão em en']);
  });

  it('deve recusar quando as listas têm tamanhos ou anos diferentes entre os idiomas', () => {
    // Arrange
    const en = about('en', { timeline: [{ year: 2009 }, { year: 2026, article: 'coerencia-cognitiva' }], principles: [{}, {}] });

    // Act
    const problems = problemsOf([about('pt'), en]);

    // Assert
    expect(problems).toEqual([
      'sobre: a trajetória tem anos diferentes entre pt e en',
      'sobre: principles tem 1 itens em pt e 2 em en',
    ]);
  });

  it('deve recusar quando o artigo da trajetória não está publicado no idioma', () => {
    // Arrange
    const list = [article('pt', 'coerencia-cognitiva'), article('en', 'coerencia-cognitiva', true)];

    // Act
    const problems = problemsOf([about('pt'), about('en')], list);

    // Assert
    expect(problems).toEqual(['sobre (en): o artigo "coerencia-cognitiva" da trajetória não está publicado']);
  });
});

describe('timelineArticle', () => {
  it('deve achar o artigo publicado no idioma quando o item aponta um translationKey', () => {
    expect(timelineArticle('coerencia-cognitiva', articles, 'en')?.id).toBe('en/coerencia-cognitiva');
    expect(timelineArticle(undefined, articles, 'en')).toBeUndefined();
  });
});

describe('bioSegments', () => {
  it('deve devolver um único trecho de texto quando o parágrafo não tem link', () => {
    expect(bioSegments('Texto simples.')).toEqual([{ text: 'Texto simples.' }]);
  });

  it('deve separar o texto e os links no formato [texto](endereço) quando o parágrafo tem links', () => {
    // Arrange
    const text = 'Comecei na [Webgoal](https://www.webgoal.com.br) e escrevi um [livro](/livros/).';

    // Act
    const segments = bioSegments(text);

    // Assert
    expect(segments).toEqual([
      { text: 'Comecei na ' },
      { text: 'Webgoal', href: 'https://www.webgoal.com.br' },
      { text: ' e escrevi um ' },
      { text: 'livro', href: '/livros/' },
      { text: '.' },
    ]);
  });

  it('deve recusar o link quando o endereço não é https nem um caminho do próprio site', () => {
    // Arrange
    const unsafe = ['[x](javascript:alert(1))', '[x](http://exemplo.com)', '[x](//exemplo.com)', '[x](data:text/html,oi)'];

    // Act
    const results = unsafe.map((text) => {
      try {
        bioSegments(text);
        return 'aceitou';
      } catch (error) {
        return error instanceof AboutValidationError ? 'recusou' : 'outro erro';
      }
    });

    // Assert
    expect(results).toEqual(['recusou', 'recusou', 'recusou', 'recusou']);
  });
});
