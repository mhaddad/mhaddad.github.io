import type { Lang } from './ui';

export const categoryKeys = ['gestao', 'coerencia', 'ai', 'software', 'educacao', 'hobbies'] as const;
export type CategoryKey = (typeof categoryKeys)[number];

export interface Category {
  key: CategoryKey;
  name: Record<Lang, string>;
  slug: Record<Lang, string>;
  vaultName: string;
}

// Slugs entram nas URLs: nunca mudar depois de publicados.
export const categories: Record<CategoryKey, Category> = {
  gestao: {
    key: 'gestao',
    name: { pt: 'Gestão e Design Organizacional', en: 'Management & Organizational Design' },
    slug: { pt: 'gestao', en: 'management' },
    vaultName: 'Gestão e Design Organizacional',
  },
  coerencia: {
    key: 'coerencia',
    name: { pt: 'Coerência Cognitiva e P-O Fit', en: 'Cognitive Coherence & P-O Fit' },
    slug: { pt: 'coerencia-cognitiva', en: 'cognitive-coherence' },
    vaultName: 'Coerência Cognitiva e P-O Fit',
  },
  ai: {
    key: 'ai',
    name: { pt: 'AI, Trabalho e Organizações', en: 'AI, Work & Organizations' },
    slug: { pt: 'ai', en: 'ai' },
    vaultName: 'IA, Trabalho e Organizações',
  },
  software: {
    key: 'software',
    name: { pt: 'Desenvolvimento de Software', en: 'Software Development' },
    slug: { pt: 'software', en: 'software' },
    vaultName: 'Agilidade e Desenvolvimento de Software',
  },
  educacao: {
    key: 'educacao',
    name: { pt: 'Educação', en: 'Education' },
    slug: { pt: 'educacao', en: 'education' },
    vaultName: 'Educação e Aprendizagem',
  },
  hobbies: {
    key: 'hobbies',
    name: { pt: 'Hobbies', en: 'Hobbies' },
    slug: { pt: 'hobbies', en: 'hobbies' },
    vaultName: 'História, Simbolismo e Caminho de Santiago',
  },
};

export function categoryFromSlug(lang: Lang, slug: string): Category | undefined {
  return Object.values(categories).find((category) => category.slug[lang] === slug);
}
