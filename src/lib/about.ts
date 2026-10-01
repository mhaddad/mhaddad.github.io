// Página Sobre (src/content/about/{pt,en}.yaml).
import { languages, type Lang } from '../i18n/ui';
import { publishedArticles, type ArticleEntry } from './articles';

export interface AboutData {
  lang: Lang;
  timeline: { year: number; article?: string }[];
  education: unknown[];
  principles: unknown[];
}

export interface AboutEntry<TData extends AboutData = AboutData> {
  id: string;
  data: TData;
}

export class AboutValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Página Sobre inválida:\n- ${problems.join('\n- ')}`);
    this.name = 'AboutValidationError';
  }
}

export function validateAbout(entries: AboutEntry[], articles: ArticleEntry[]): void {
  const problems: string[] = [];
  const byLang = new Map(entries.map((entry) => [entry.data.lang, entry.data]));

  for (const lang of languages) {
    if (!byLang.has(lang)) problems.push(`sobre: falta a versão em ${lang}`);
  }

  const pt = byLang.get('pt');
  const en = byLang.get('en');
  if (pt && en) {
    const years = (data: AboutData) => data.timeline.map((item) => item.year).join(',');
    if (years(pt) !== years(en)) problems.push('sobre: a trajetória tem anos diferentes entre pt e en');
    for (const field of ['education', 'principles'] as const) {
      if (pt[field].length !== en[field].length) {
        problems.push(`sobre: ${field} tem ${pt[field].length} itens em pt e ${en[field].length} em en`);
      }
    }
  }

  for (const [lang, data] of byLang) {
    for (const { article } of data.timeline) {
      if (article && !timelineArticle(article, articles, lang)) {
        problems.push(`sobre (${lang}): o artigo "${article}" da trajetória não está publicado`);
      }
    }
  }

  if (problems.length > 0) throw new AboutValidationError(problems);
}

export function timelineArticle<T extends ArticleEntry>(
  translationKey: string | undefined,
  articles: T[],
  lang: Lang,
): T | undefined {
  if (!translationKey) return undefined;
  return publishedArticles(articles, lang).find((entry) => entry.data.translationKey === translationKey);
}
