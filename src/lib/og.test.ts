import { describe, expect, it } from 'vitest';
import { ogImagePath, ogPaths } from './og';

describe('ogImagePath', () => {
  it('deve seguir o caminho do artigo em cada idioma quando recebe o slug', () => {
    // Arrange
    const slug = 'meu-artigo';

    // Act
    const pt = ogImagePath('pt', slug);
    const en = ogImagePath('en', 'my-article');

    // Assert
    expect(pt).toBe('/og/artigos/meu-artigo.png');
    expect(en).toBe('/og/en/articles/my-article.png');
  });
});

describe('ogPaths', () => {
  it('deve gerar uma imagem por artigo publicado e a imagem padrão quando recebe os artigos', () => {
    // Arrange
    const base = { translationKey: 'k', category: 'ai' as const, pubDate: new Date('2026-01-01') };
    const entries = [
      { id: 'pt/meu-artigo', data: { ...base, title: 'Meu', lang: 'pt' as const, draft: false } },
      { id: 'en/my-article', data: { ...base, title: 'Mine', lang: 'en' as const, draft: false } },
      { id: 'pt/rascunho', data: { ...base, translationKey: 'r', title: 'R', lang: 'pt' as const, draft: true } },
    ];

    // Act
    const paths = ogPaths(entries).map((entry) => entry.params.path);

    // Assert
    expect(paths).toEqual(['default', 'artigos/meu-artigo', 'en/articles/my-article']);
  });
});
