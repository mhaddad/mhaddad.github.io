import { describe, expect, it } from 'vitest';
import { feedItems } from './feed';

function entry(id: string, lang: 'pt' | 'en', pubDate: string, draft = false) {
  return {
    id,
    data: {
      title: `Título ${id}`,
      description: `Resumo ${id}`,
      lang,
      translationKey: id,
      category: 'ai' as const,
      pubDate: new Date(pubDate),
      draft,
    },
  };
}

describe('feedItems', () => {
  it('deve gerar itens só do idioma, sem rascunhos e do mais recente ao mais antigo quando há artigos misturados', () => {
    // Arrange
    const entries = [
      entry('pt/antigo', 'pt', '2025-01-01'),
      entry('pt/novo', 'pt', '2026-01-01'),
      entry('pt/rascunho', 'pt', '2026-02-01', true),
      entry('en/english', 'en', '2026-03-01'),
    ];

    // Act
    const items = feedItems(entries, 'pt');

    // Assert
    expect(items.map((item) => item.link)).toEqual(['/artigos/novo/', '/artigos/antigo/']);
  });

  it('deve incluir título, resumo, data e categoria no idioma quando o artigo é publicado', () => {
    // Arrange
    const entries = [entry('en/english', 'en', '2026-03-01')];

    // Act
    const [item] = feedItems(entries, 'en');

    // Assert
    expect(item).toEqual({
      title: 'Título en/english',
      description: 'Resumo en/english',
      pubDate: new Date('2026-03-01'),
      link: '/en/articles/english/',
      categories: ['AI, Work & Organizations'],
    });
  });
});
