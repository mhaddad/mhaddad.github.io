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

  it('deve acender "Palestras e Workshops" quando a página é a de palestras', () => {
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
