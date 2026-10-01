import { describe, expect, it } from 'vitest';
import { tocItems } from './toc';

describe('tocItems', () => {
  it('deve listar só os títulos h2 quando há duas ou mais seções', () => {
    // Arrange
    const headings = [
      { depth: 2, slug: 'um', text: 'Um' },
      { depth: 3, slug: 'detalhe', text: 'Detalhe' },
      { depth: 2, slug: 'dois', text: 'Dois' },
    ];

    // Act
    const items = tocItems(headings);

    // Assert
    expect(items.map((item) => item.slug)).toEqual(['um', 'dois']);
  });

  it('deve omitir o índice quando o artigo tem menos de duas seções', () => {
    // Arrange
    const headings = [{ depth: 2, slug: 'unica', text: 'Única' }];

    // Act
    const items = tocItems(headings);

    // Assert
    expect(items).toEqual([]);
  });
});
