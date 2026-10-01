import { describe, expect, it } from 'vitest';
import { buildSeo } from './seo';

const base = {
  lang: 'pt' as const,
  title: 'Meu artigo',
  description: 'Resumo do artigo.',
  path: '/artigos/meu-artigo/',
  alternatePath: '/en/articles/my-article/',
};

function metaContent(seo: ReturnType<typeof buildSeo>, key: string): string | undefined {
  return seo.meta.find((tag) => tag.property === key || tag.name === key)?.content;
}

describe('buildSeo', () => {
  it('deve acrescentar o nome do site ao título quando o título não é o próprio nome do site', () => {
    // Arrange
    const home = { ...base, title: 'Matheus Haddad' };

    // Act
    const article = buildSeo(base);
    const homeSeo = buildSeo(home);

    // Assert
    expect(article.title).toBe('Meu artigo · Matheus Haddad');
    expect(homeSeo.title).toBe('Matheus Haddad');
  });

  it('deve gerar canonical e hreflang absolutos com x-default em português quando a página é em português', () => {
    // Arrange
    const input = base;

    // Act
    const seo = buildSeo(input);

    // Assert
    expect(seo.canonical).toBe('https://matheushaddad.com/artigos/meu-artigo/');
    expect(seo.alternates).toEqual([
      { hreflang: 'pt-BR', href: 'https://matheushaddad.com/artigos/meu-artigo/' },
      { hreflang: 'en', href: 'https://matheushaddad.com/en/articles/my-article/' },
      { hreflang: 'x-default', href: 'https://matheushaddad.com/artigos/meu-artigo/' },
    ]);
  });

  it('deve apontar x-default para o português quando a página é em inglês', () => {
    // Arrange
    const input = { ...base, lang: 'en' as const, path: '/en/articles/my-article/', alternatePath: '/artigos/meu-artigo/' };

    // Act
    const seo = buildSeo(input);

    // Assert
    expect(seo.canonical).toBe('https://matheushaddad.com/en/articles/my-article/');
    expect(seo.alternates.at(-1)).toEqual({ hreflang: 'x-default', href: 'https://matheushaddad.com/artigos/meu-artigo/' });
    expect(metaContent(seo, 'og:locale')).toBe('en_US');
    expect(metaContent(seo, 'og:locale:alternate')).toBe('pt_BR');
  });

  it('deve usar a imagem padrão 1200×630 com URL absoluta quando a página não define imagem', () => {
    // Arrange
    const input = base;

    // Act
    const seo = buildSeo(input);

    // Assert
    expect(metaContent(seo, 'og:image')).toBe('https://matheushaddad.com/og/default.png');
    expect(metaContent(seo, 'og:image:width')).toBe('1200');
    expect(metaContent(seo, 'og:image:height')).toBe('630');
    expect(metaContent(seo, 'twitter:card')).toBe('summary_large_image');
    expect(metaContent(seo, 'twitter:image')).toBe('https://matheushaddad.com/og/default.png');
  });

  it('deve incluir datas de publicação e atualização quando a página é um artigo', () => {
    // Arrange
    const input = {
      ...base,
      type: 'article' as const,
      publishedTime: new Date('2026-08-25'),
      modifiedTime: new Date('2026-09-10'),
    };

    // Act
    const seo = buildSeo(input);

    // Assert
    expect(metaContent(seo, 'og:type')).toBe('article');
    expect(metaContent(seo, 'article:published_time')).toBe('2026-08-25T00:00:00.000Z');
    expect(metaContent(seo, 'article:modified_time')).toBe('2026-09-10T00:00:00.000Z');
  });

  it('deve omitir datas de artigo quando a página é comum', () => {
    // Arrange
    const input = base;

    // Act
    const seo = buildSeo(input);

    // Assert
    expect(metaContent(seo, 'og:type')).toBe('website');
    expect(metaContent(seo, 'article:published_time')).toBeUndefined();
  });
});
