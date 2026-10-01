import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categoryKeys } from './i18n/categories';
import { languages } from './i18n/ui';
import { DESCRIPTION_MAX } from './lib/articles';
import { companyGroups } from './lib/companies';
import { serviceKeys } from './lib/services';
import { SPOTIFY_ID, YOUTUBE_ID, talkTypes } from './lib/talks';

// ARTICLES_DIR, SERVICES_DIR e ABOUT_DIR só são usados pelos testes de build (tests/fixtures).
const articlesBase = process.env.ARTICLES_DIR ?? './src/content/articles';
const servicesBase = process.env.SERVICES_DIR ?? './src/content/services';
const aboutBase = process.env.ABOUT_DIR ?? './src/content/about';

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
  loader: file('src/content/talks/talks.yaml'),
  schema: z.object({
    order: z.number().int(),
    type: z.enum(talkTypes),
    event: z.string().min(1),
    title: z.string().min(1),
    youtubeId: z.string().regex(YOUTUBE_ID).optional(),
    spotifyId: z.string().regex(SPOTIFY_ID).optional(),
    lang: z.enum(languages),
  }),
});

const companies = defineCollection({
  loader: file('src/content/companies/companies.yaml'),
  schema: ({ image }) =>
    z.object({
      order: z.number().int(),
      group: z.enum(companyGroups),
      year: z.number().int().optional(),
      name: z.string().min(1),
      logo: image(),
      url: z.url(),
      role: localized,
      description: localized,
    }),
});

const about = defineCollection({
  loader: glob({ pattern: '{pt,en}.yaml', base: aboutBase }),
  schema: z.object({
    lang: z.enum(languages),
    title: z.string().min(1),
    description: z.string().min(1).max(DESCRIPTION_MAX),
    bio: z.array(z.string().min(1)).min(1),
    timeline: z
      .array(
        z.object({
          year: z.number().int(),
          title: z.string().min(1),
          text: z.string().min(1),
          article: z.string().optional(),
        }),
      )
      .min(1),
    education: z.array(z.object({ degree: z.string().min(1), school: z.string().min(1), period: z.string().min(1) })).min(1),
    principles: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(1),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: '{pt,en}/*.yaml', base: './src/content/books' }),
  schema: ({ image }) =>
    z.object({
      lang: z.enum(languages),
      order: z.number().int(),
      title: z.string().min(1),
      subtitle: z.string().min(1),
      description: z.string().min(1).max(DESCRIPTION_MAX),
      cover: image(),
      coverAlt: z.string().min(1),
      buyUrl: z.url(),
      siteUrl: z.url(),
      about: z.array(z.string().min(1)).min(1),
      audience: z.array(z.string().min(1)).min(1),
      contents: z.array(z.string().min(1)).min(1),
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

export const collections = { articles, talks, companies, services, about, books };
