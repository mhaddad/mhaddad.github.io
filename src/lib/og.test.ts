import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { ogCoverPaths, ogImagePath, ogPaths, renderOgCover } from './og';

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

describe('prévia com a capa do artigo', () => {
  const base = { translationKey: 'k', category: 'ai' as const, pubDate: new Date('2026-01-01'), draft: false };
  const entries = [
    { id: 'pt/com-capa', data: { ...base, title: 'Com capa', lang: 'pt' as const } },
    { id: 'pt/sem-capa', data: { ...base, translationKey: 's', title: 'Sem capa', lang: 'pt' as const } },
  ];
  const coverFile = (entry: { id: string }) => (entry.id === 'pt/com-capa' ? 'src/assets/articles/coerencia-cognitiva/capa.png' : undefined);

  it('deve usar JPEG no caminho da prévia quando o artigo tem capa', () => {
    expect(ogImagePath('pt', 'com-capa', 'jpg')).toBe('/og/artigos/com-capa.jpg');
    expect(ogImagePath('en', 'with-cover', 'jpg')).toBe('/og/en/articles/with-cover.jpg');
  });

  it('deve gerar a arte só para os artigos sem capa e a capa só para os que têm', () => {
    // Act
    const art = ogPaths(entries, coverFile).map((entry) => entry.params.path);
    const covers = ogCoverPaths(entries, coverFile).map((entry) => [entry.params.path, entry.props.file]);

    // Assert
    expect(art).toEqual(['default', 'artigos/sem-capa']);
    expect(covers).toEqual([['artigos/com-capa', 'src/assets/articles/coerencia-cognitiva/capa.png']]);
  });

  it('deve recortar a capa em 1200×630 e gerar um JPEG leve quando renderiza a prévia', async () => {
    // Act
    const jpeg = await renderOgCover('src/assets/articles/coerencia-cognitiva/capa.png');
    const { width, height, format } = await sharp(jpeg).metadata();

    // Assert
    expect([width, height, format]).toEqual([1200, 630, 'jpeg']);
    expect(jpeg.length).toBeLessThan(300 * 1024);
  });
});
