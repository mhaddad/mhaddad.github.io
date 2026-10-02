import { describe, expect, it } from 'vitest';
import {
  ArticleValidationError,
  articleSlug,
  articleStaticPaths,
  categoriesInUse,
  categoryStaticPaths,
  findTranslation,
  leadImage,
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

describe('leadImage', () => {
  it('deve devolver o caminho dentro de assets e o texto alternativo quando o artigo começa com uma imagem', () => {
    // Arrange
    const body = '\n![Pessoas em roda](../../../assets/articles/meu-artigo/capa.png)\n\n*Legenda*\n\nTexto.';

    // Act
    const image = leadImage(body);

    // Assert
    expect(image).toEqual({ alt: 'Pessoas em roda', asset: 'articles/meu-artigo/capa.png' });
  });

  it('deve ignorar a imagem quando o artigo começa com texto', () => {
    // Arrange
    const body = 'Primeiro parágrafo.\n\n![Imagem](../../../assets/articles/meu-artigo/capa.png)';

    // Act
    const image = leadImage(body);

    // Assert
    expect(image).toBeUndefined();
  });

  it('deve ignorar a imagem quando ela não está em assets ou o corpo está vazio', () => {
    expect(leadImage('![Remota](https://exemplo.com/capa.png)\n\nTexto.')).toBeUndefined();
    expect(leadImage(undefined)).toBeUndefined();
  });
});
