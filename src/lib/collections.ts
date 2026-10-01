import { getCollection, type CollectionEntry } from 'astro:content';
import { validateArticles } from './articles';

export type Article = CollectionEntry<'articles'>;

export async function getAllArticles(): Promise<Article[]> {
  const entries = await getCollection('articles');
  validateArticles(entries);
  return entries;
}
