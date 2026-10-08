import { describe, expect, it } from 'vitest';
import type { ArticleEntry } from './articles';
import { BookValidationError, validateBooks, type BookEntry } from './books';

function book(id: string, data: Partial<BookEntry['data']> = {}): BookEntry {
  const lang = id.startsWith('en/') ? 'en' : 'pt';
  return { id, data: { lang, relatedArticles: [], relatedTalks: [], ...data } };
}

function article(id: string, translationKey: string, draft = false): ArticleEntry {
  const lang = id.startsWith('en/') ? 'en' : 'pt';
  return { id, data: { title: id, lang, translationKey, category: 'gestao', pubDate: new Date('2026-01-01'), draft } };
}

function problemsOf(books: BookEntry[], articles: ArticleEntry[], talkIds: Set<string>): string[] {
  try {
    validateBooks(books, articles, talkIds);
    return [];
  } catch (error) {
    if (error instanceof BookValidationError) return error.problems;
    throw error;
  }
}

describe('validateBooks', () => {
  const articles = [article('pt/a', 'a'), article('pt/rascunho', 'rascunho', true), article('en/a', 'a')];
  const talks = new Set(['palestra-1', 'podcast-2']);

  it('deve aceitar quando os artigos estão publicados no idioma e as mídias existem no acervo', () => {
    // Arrange
    const books = [book('pt/livro', { relatedArticles: ['a'], relatedTalks: ['palestra-1', 'podcast-2'] }), book('en/livro', { relatedArticles: ['a'] })];

    // Act
    const problems = problemsOf(books, articles, talks);

    // Assert
    expect(problems).toEqual([]);
  });

  it('deve listar o artigo que não existe, o rascunho e a mídia que não está no acervo', () => {
    // Arrange
    const books = [book('pt/livro', { relatedArticles: ['a', 'rascunho', 'inexistente'], relatedTalks: ['palestra-1', 'fantasma'] })];

    // Act
    const problems = problemsOf(books, articles, talks);

    // Assert
    expect(problems).toEqual([
      'pt/livro: artigo relacionado "rascunho" não está publicado em pt',
      'pt/livro: artigo relacionado "inexistente" não está publicado em pt',
      'pt/livro: mídia relacionada "fantasma" não existe no acervo',
    ]);
  });
});
