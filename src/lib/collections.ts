import { getCollection, type CollectionEntry } from 'astro:content';
import { validateArticles } from './articles';
import { validateServices } from './services';

export type Article = CollectionEntry<'articles'>;
export type Service = CollectionEntry<'services'>;

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
