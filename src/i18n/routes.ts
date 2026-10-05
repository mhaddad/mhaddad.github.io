import { SITE_URL } from '../config';
import { categories, type CategoryKey } from './categories';
import type { Lang } from './ui';

// Contrato de URLs do plano: nunca mudar caminhos já publicados.
export const routes = {
  home: { pt: '/', en: '/en/' },
  about: { pt: '/sobre/', en: '/en/about/' },
  mentoring: { pt: '/mentoria/', en: '/en/mentoring/' },
  speaking: { pt: '/palestras/', en: '/en/speaking/' },
  media: { pt: '/midia/', en: '/en/media/' },
  companies: { pt: '/empresas/', en: '/en/companies/' },
  books: { pt: '/livros/', en: '/en/books/' },
  articles: { pt: '/artigos/', en: '/en/articles/' },
  rss: { pt: '/rss.xml', en: '/en/rss.xml' },
} as const satisfies Record<string, Record<Lang, string>>;

export type RouteKey = keyof typeof routes;

export function routePath(key: RouteKey, lang: Lang): string {
  return routes[key][lang];
}

export function articlePath(lang: Lang, slug: string): string {
  return `${routes.articles[lang]}${slug}/`;
}

export function categoryPath(lang: Lang, key: CategoryKey): string {
  const segment = lang === 'pt' ? 'categoria' : 'category';
  return `${routes.articles[lang]}${segment}/${categories[key].slug[lang]}/`;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}
