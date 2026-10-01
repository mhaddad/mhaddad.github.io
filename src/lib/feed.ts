import { articlePath } from '../i18n/routes';
import { categories } from '../i18n/categories';
import type { Lang } from '../i18n/ui';
import { articleSlug, publishedArticles, type ArticleEntry } from './articles';

interface FeedData {
  description: string;
}

export function feedItems<T extends ArticleEntry<ArticleEntry['data'] & FeedData>>(entries: T[], lang: Lang) {
  return publishedArticles(entries, lang).map((article) => ({
    title: article.data.title,
    description: article.data.description,
    pubDate: article.data.pubDate,
    link: articlePath(lang, articleSlug(article)),
    categories: [categories[article.data.category].name[lang]],
  }));
}
