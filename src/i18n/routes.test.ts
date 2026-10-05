import { describe, expect, it } from 'vitest';
import { absoluteUrl, articlePath, categoryPath, routePath } from './routes';

describe('mapa de rotas', () => {
  it('deve seguir o contrato de URLs do plano quando consultado por chave e idioma', () => {
    // Arrange
    const expected = [
      ['/', '/en/'],
      ['/sobre/', '/en/about/'],
      ['/mentoria/', '/en/mentoring/'],
      ['/palestras/', '/en/speaking/'],
      ['/midia/', '/en/media/'],
      ['/empresas/', '/en/companies/'],
      ['/livros/', '/en/books/'],
      ['/artigos/', '/en/articles/'],
      ['/rss.xml', '/en/rss.xml'],
    ];
    const keys = ['home', 'about', 'mentoring', 'speaking', 'media', 'companies', 'books', 'articles', 'rss'] as const;

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
