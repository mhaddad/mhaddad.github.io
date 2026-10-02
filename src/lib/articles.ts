import { categories, categoryKeys, type CategoryKey } from '../i18n/categories';
import { languages, type Lang } from '../i18n/ui';
import { MAP_EMBED_SRC } from './map-embed';

export const DESCRIPTION_MAX = 160;
export const WORDS_PER_MINUTE = 200;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const YOUTUBE_IFRAME_SRC = /^https:\/\/www\.youtube-nocookie\.com\/embed\//;
// Mapas do My Maps viram um bloco com botão no build (src/lib/map-embed.ts).
const ALLOWED_IFRAME_SRC = { test: (src: string) => YOUTUBE_IFRAME_SRC.test(src) || MAP_EMBED_SRC.test(src) };

export interface ArticleData {
  title: string;
  lang: Lang;
  translationKey: string;
  category: CategoryKey;
  pubDate: Date;
  draft: boolean;
}

export interface ArticleEntry<TData extends ArticleData = ArticleData> {
  id: string;
  body?: string;
  data: TData;
}

export class ArticleValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Artigos inválidos:\n- ${problems.join('\n- ')}`);
    this.name = 'ArticleValidationError';
  }
}

export function articleSlug(entry: ArticleEntry): string {
  return entry.id.split('/').slice(1).join('/');
}

function folderLang(entry: ArticleEntry): string {
  return entry.id.split('/')[0] ?? '';
}

// Imagem que abre o corpo do artigo, como no Medium e no LinkedIn: vira a imagem de
// destaque na listagem. `asset` é o caminho dentro de src/assets/ (ex.: articles/x/capa.png).
const LEAD_IMAGE = /^\s*!\[([^\]]*)\]\(([^)\s]+)\)/;

export function leadImage(body: string | undefined): { alt: string; asset: string } | undefined {
  const match = LEAD_IMAGE.exec(body ?? '');
  const asset = match?.[2].split('/assets/')[1];
  return match && asset ? { alt: match[1], asset } : undefined;
}

export function unsafeHtmlProblems(body: string): string[] {
  const problems: string[] = [];
  if (/<script\b/i.test(body)) problems.push('contém <script>');
  for (const match of body.matchAll(/<iframe\b[^>]*>/gi)) {
    const src = /\bsrc\s*=\s*["']([^"']*)["']/i.exec(match[0])?.[1] ?? '';
    if (!ALLOWED_IFRAME_SRC.test(src)) problems.push(`contém iframe não permitido (${src || 'sem src'})`);
  }
  return problems;
}

export function validateArticles(entries: ArticleEntry[]): void {
  const problems: string[] = [];
  const byKey = new Map<string, Partial<Record<Lang, ArticleEntry>>>();

  for (const entry of entries) {
    const slug = articleSlug(entry);
    const { lang, translationKey } = entry.data;

    if (folderLang(entry) !== lang) {
      problems.push(`${entry.id}: está na pasta "${folderLang(entry)}" mas declara lang "${lang}"`);
    }
    if (!SLUG_PATTERN.test(slug)) {
      problems.push(`${entry.id}: slug "${slug}" deve ser kebab-case, sem acentos e sem subpastas`);
    }
    for (const problem of unsafeHtmlProblems(entry.body ?? '')) {
      problems.push(`${entry.id}: ${problem}`);
    }

    const pair = byKey.get(translationKey) ?? {};
    const existing = pair[lang];
    if (existing) {
      problems.push(`${entry.id}: translationKey "${translationKey}" repetida em ${lang} (também em ${existing.id})`);
    } else {
      pair[lang] = entry;
    }
    byKey.set(translationKey, pair);
  }

  for (const [key, pair] of byKey) {
    const missing = languages.filter((lang) => !pair[lang]);
    if (missing.length > 0) {
      problems.push(`translationKey "${key}": falta a versão em ${missing.join(', ')}`);
      continue;
    }
    if (pair.pt?.data.draft !== pair.en?.data.draft) {
      problems.push(`translationKey "${key}": campo draft diferente entre PT e EN`);
    }
    if (pair.pt?.data.category !== pair.en?.data.category) {
      problems.push(`translationKey "${key}": categoria diferente entre PT e EN`);
    }
  }

  if (problems.length > 0) throw new ArticleValidationError(problems);
}

export function publishedArticles<T extends ArticleEntry>(entries: T[], lang: Lang): T[] {
  return entries
    .filter((entry) => entry.data.lang === lang && !entry.data.draft)
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function findTranslation<T extends ArticleEntry>(entries: T[], entry: T): T | undefined {
  return entries.find(
    (other) =>
      other.data.translationKey === entry.data.translationKey && other.data.lang !== entry.data.lang,
  );
}

export function categoriesInUse(entries: ArticleEntry[], lang: Lang): { key: CategoryKey; count: number }[] {
  const published = publishedArticles(entries, lang);
  return categoryKeys
    .map((key) => ({ key, count: published.filter((entry) => entry.data.category === key).length }))
    .filter(({ count }) => count > 0);
}

export function readingTime(body: string): number {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~-]/g, ' ');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function originalPlatform(url: string | undefined): 'LinkedIn' | 'Medium' | undefined {
  if (!url) return undefined;
  const host = new URL(url).hostname;
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'LinkedIn';
  if (host === 'medium.com' || host.endsWith('.medium.com')) return 'Medium';
  return undefined;
}

export function articleStaticPaths<T extends ArticleEntry>(entries: T[], lang: Lang) {
  return publishedArticles(entries, lang).map((article) => ({
    params: { slug: articleSlug(article) },
    props: { article, translation: findTranslation(entries, article) },
  }));
}

export function categoryStaticPaths(entries: ArticleEntry[], lang: Lang) {
  return categoriesInUse(entries, lang).map(({ key }) => ({
    params: { category: categories[key].slug[lang] },
    props: { categoryKey: key },
  }));
}
