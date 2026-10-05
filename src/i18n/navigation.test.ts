import { describe, expect, it } from 'vitest';
import { footerNav, isCurrent, mainNav } from './navigation';

function current(pathname: string, lang: 'pt' | 'en') {
  return mainNav.filter((item) => isCurrent(pathname, item, lang)).map((item) => item.route);
}

describe('isCurrent', () => {
  it('deve acender "Mentoria" quando a página é a de mentoria', () => {
    // Arrange
    const paths = ['/mentoria/', '/en/mentoring/'];

    // Act
    const result = paths.map((path) => current(path, path.startsWith('/en/') ? 'en' : 'pt'));

    // Assert
    expect(result).toEqual([['mentoring'], ['mentoring']]);
  });

  it('deve acender "Mídia" quando a página é a de mídia', () => {
    // Arrange
    const paths = ['/midia/', '/en/media/'];

    // Act
    const result = paths.map((path) => current(path, path.startsWith('/en/') ? 'en' : 'pt'));

    // Assert
    expect(result).toEqual([['media'], ['media']]);
  });

  it('deve acender "Palestras" quando a página é a de palestras', () => {
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

describe('mainNav e footerNav', () => {
  it('deve ter Livros no menu, antes de Sobre, e acendê-lo nas páginas do livro', () => {
    // Arrange
    const routes = mainNav.map((item) => item.route);

    // Act
    const pt = current('/livros/', 'pt');
    const en = current('/en/books/', 'en');

    // Assert
    expect(routes).toEqual(['articles', 'speaking', 'mentoring', 'companies', 'media', 'books', 'about']);
    expect(pt).toEqual(['books']);
    expect(en).toEqual(['books']);
  });

  it('deve repetir no rodapé os mesmos itens do menu, sem duplicar Livros', () => {
    expect(footerNav.map((item) => item.route)).toEqual(mainNav.map((item) => item.route));
  });
});
