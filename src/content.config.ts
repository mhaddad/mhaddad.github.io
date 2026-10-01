import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categoryKeys } from './i18n/categories';
import { languages } from './i18n/ui';
import { DESCRIPTION_MAX } from './lib/articles';

// ARTICLES_DIR só é usado pelos testes de build (tests/fixtures/articles).
const articlesBase = process.env.ARTICLES_DIR ?? './src/content/articles';

const localized = z.object({ pt: z.string().min(1), en: z.string().min(1) });

const articles = defineCollection({
  loader: glob({ pattern: '{pt,en}/**/*.md', base: articlesBase }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1),
      description: z.string().min(1).max(DESCRIPTION_MAX),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.enum(categoryKeys),
      lang: z.enum(languages),
      translationKey: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      service: z.enum(['consultoria', 'mentoria', 'palestras']).optional(),
      originalUrl: z.url().optional(),
      draft: z.boolean().default(false),
    }),
});

const talks = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/talks' }),
  schema: z.object({
    title: z.string().min(1),
    description: localized.optional(),
    type: z.enum(['palestra', 'podcast', 'webinar', 'entrevista']),
    event: z.string().min(1),
    date: z.coerce.date().optional(),
    url: z.url(),
    youtubeId: z.string().optional(),
    lang: z.enum(languages),
  }),
});

const companies = defineCollection({
  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/companies' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      logo: image(),
      url: z.url(),
      role: localized,
      description: localized,
      order: z.number().int(),
    }),
});

const services = defineCollection({
  loader: glob({ pattern: '{pt,en}/**/*.md', base: './src/content/services' }),
  schema: z.object({
    key: z.enum(['consultoria', 'mentoria', 'palestras']),
    lang: z.enum(languages),
    title: z.string().min(1),
    description: z.string().min(1).max(DESCRIPTION_MAX),
    audience: z.string().min(1),
    whatsappMessage: z.string().min(1),
  }),
});

export const collections = { articles, talks, companies, services };
