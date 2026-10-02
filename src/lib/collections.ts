import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/ui';
import { validateAbout } from './about';
import { leadImage, validateArticles } from './articles';
import { validateCompanies } from './companies';
import { validateServices } from './services';
import { validateTalks } from './talks';

export type Article = CollectionEntry<'articles'>;
export type Service = CollectionEntry<'services'>;
export type Talk = CollectionEntry<'talks'>;
export type Company = CollectionEntry<'companies'>;
export type About = CollectionEntry<'about'>;
export type Book = CollectionEntry<'books'>;

// Imagens preparadas por `npm run assets`, indexadas pelo nome do arquivo.
const thumbnailFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/talks/*.jpg', { eager: true });
const maskFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/companies/mono/*.png', { eager: true });

function byBasename(files: Record<string, { default: ImageMetadata }>): Map<string, ImageMetadata> {
  return new Map(
    Object.entries(files).map(([path, module]) => [path.replace(/^.*\/([^/]+)\.\w+$/, '$1'), module.default]),
  );
}

export const talkThumbnails = byBasename(thumbnailFiles);

// Imagens dos artigos, pelo caminho dentro de src/assets/ (ex.: articles/x/capa.png).
const articleImageFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/articles/**/*.{png,jpg,jpeg,webp,gif}', {
  eager: true,
});
const articleImages = new Map(
  Object.entries(articleImageFiles).map(([path, module]) => [path.replace('../assets/', ''), module.default]),
);

/** Arquivo da capa no disco (para a prévia do WhatsApp e do LinkedIn), ou undefined sem capa. */
export function articleCoverFile(article: Article): string | undefined {
  const cover = article.data.cover as (ImageMetadata & { fsPath?: string }) | undefined;
  if (cover) return cover.fsPath;
  const lead = leadImage(article.body);
  return lead && articleImages.has(lead.asset) ? `src/assets/${lead.asset}` : undefined;
}

/** Imagem de destaque do card: `cover` do frontmatter ou, na falta dele, a imagem que abre o artigo. */
export function articleCover(article: Article): { src: ImageMetadata; alt: string } | undefined {
  if (article.data.cover) return { src: article.data.cover, alt: article.data.coverAlt ?? '' };
  const lead = leadImage(article.body);
  const src = lead && articleImages.get(lead.asset);
  return lead && src ? { src, alt: lead.alt } : undefined;
}
export const companyMasks = byBasename(maskFiles);

export async function getAllArticles(): Promise<Article[]> {
  const entries = await getCollection('articles');
  validateArticles(entries);
  return entries;
}

export async function getAllServices(): Promise<Service[]> {
  const [services, articles] = await Promise.all([getCollection('services'), getAllArticles()]);
  validateServices(services, articles);
  return services;
}

export async function getAllTalks(): Promise<Talk[]> {
  const talks = await getCollection('talks');
  validateTalks(talks, new Set(talkThumbnails.keys()));
  return talks;
}

export async function getAllCompanies(): Promise<Company[]> {
  const companies = await getCollection('companies');
  validateCompanies(companies, new Set(companyMasks.keys()));
  return companies;
}

export async function getAbout(lang: Lang): Promise<About> {
  const [entries, articles] = await Promise.all([getCollection('about'), getAllArticles()]);
  validateAbout(entries, articles);
  return entries.find((entry) => entry.data.lang === lang)!;
}

export async function getBooks(lang: Lang): Promise<Book[]> {
  const books = await getCollection('books', (entry) => entry.data.lang === lang);
  if (books.length === 0) throw new Error(`Nenhum livro em ${lang} (src/content/books/${lang}/)`);
  return books.sort((a, b) => a.data.order - b.data.order);
}
