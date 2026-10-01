import { describe, expect, it } from 'vitest';
import { categories, categoryFromSlug, categoryKeys } from './categories';

describe('categorias', () => {
  it('deve ter as 6 categorias do vault na ordem de exibição quando listadas', () => {
    // Arrange
    const expected = ['gestao', 'coerencia', 'ai', 'software', 'educacao', 'hobbies'];

    // Act
    const keys = [...categoryKeys];

    // Assert
    expect(keys).toEqual(expected);
  });

  it('deve usar os slugs curtos aprovados em 01/10/2026 quando monta URLs', () => {
    // Arrange
    const expected = {
      gestao: { pt: 'gestao', en: 'management' },
      coerencia: { pt: 'coerencia-cognitiva', en: 'cognitive-coherence' },
      ai: { pt: 'ai', en: 'ai' },
      software: { pt: 'software', en: 'software' },
      educacao: { pt: 'educacao', en: 'education' },
      hobbies: { pt: 'hobbies', en: 'hobbies' },
    };

    // Act
    const slugs = Object.fromEntries(categoryKeys.map((key) => [key, categories[key].slug]));

    // Assert
    expect(slugs).toEqual(expected);
  });

  it('deve ter slugs únicos quando comparados no mesmo idioma', () => {
    // Arrange
    const all = Object.values(categories);

    // Act
    const ptSlugs = new Set(all.map((category) => category.slug.pt));
    const enSlugs = new Set(all.map((category) => category.slug.en));

    // Assert
    expect(ptSlugs.size).toBe(all.length);
    expect(enSlugs.size).toBe(all.length);
  });

  it('deve encontrar a categoria quando o slug é do idioma informado', () => {
    // Arrange
    const slug = 'management';

    // Act
    const category = categoryFromSlug('en', slug);

    // Assert
    expect(category?.key).toBe('gestao');
  });

  it('deve não encontrar categoria quando o slug é de outro idioma', () => {
    // Arrange
    const slug = 'gestao';

    // Act
    const category = categoryFromSlug('en', slug);

    // Assert
    expect(category).toBeUndefined();
  });
});
