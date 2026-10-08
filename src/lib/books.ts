import type { Lang } from '../i18n/ui';
import { publishedArticles, type ArticleEntry } from './articles';

export interface BookData {
  lang: Lang;
  relatedArticles: string[];
  relatedTalks: string[];
}

export interface BookEntry<TData extends BookData = BookData> {
  id: string;
  data: TData;
}

export class BookValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Livros inválidos:\n- ${problems.join('\n- ')}`);
    this.name = 'BookValidationError';
  }
}

/** Artigos relacionados precisam estar publicados no idioma do livro e as mídias, no acervo. */
export function validateBooks(books: BookEntry[], articles: ArticleEntry[], talkIds: Set<string>): void {
  const problems: string[] = [];

  for (const book of books) {
    const published = new Set(publishedArticles(articles, book.data.lang).map((article) => article.data.translationKey));
    for (const translationKey of book.data.relatedArticles) {
      if (!published.has(translationKey)) problems.push(`${book.id}: artigo relacionado "${translationKey}" não está publicado em ${book.data.lang}`);
    }
    for (const talkId of book.data.relatedTalks) {
      if (!talkIds.has(talkId)) problems.push(`${book.id}: mídia relacionada "${talkId}" não existe no acervo`);
    }
  }

  if (problems.length > 0) throw new BookValidationError(problems);
}
