import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categoryKeys } from './i18n/categories';
import { languages } from './i18n/ui';
import { DESCRIPTION_MAX } from './lib/articles';
import { serviceKeys } from './lib/services';

// ARTICLES_DIR e SERVICES_DIR só são usados pelos testes de build (tests/fixtures).
const articlesBase = process.env.ARTICLES_DIR ?? './src/content/articles';
const servicesBase = process.env.SERVICES_DIR ?? './src/content/services';

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
      service: z.enum(serviceKeys).optional(),
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

const item = z.object({ title: z.string().min(1), text: z.string().min(1) });

const services = defineCollection({
  loader: glob({ pattern: '{pt,en}/**/*.md', base: servicesBase }),
  schema: z.object({
    key: z.enum(serviceKeys),
    lang: z.enum(languages),
    order: z.number().int(),
    label: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1).max(DESCRIPTION_MAX),
    subtitle: z.string().min(1),
    cardTitle: z.string().min(1),
    summary: z.string().min(1),
    audience: z.string().min(1),
    problem: z.string().min(1),
    topics: z.array(item).min(1),
    steps: z.array(item).length(3),
    format: z.string().optional(),
    formats: z.array(z.string().min(1)).optional(),
    ctaLabel: z.string().min(1),
    ctaText: z.string().min(1),
    whatsappMessage: z.string().min(1),
    relatedArticles: z.array(z.string()).default([]),
  }),
});

export const collections = { articles, talks, companies, services };
