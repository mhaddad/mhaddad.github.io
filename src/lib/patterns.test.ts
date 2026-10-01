import { describe, expect, it } from 'vitest';
import { patternSvg } from './patterns';

describe('patternSvg', () => {
  it('deve gerar um SVG decorativo na cor pedida para cada categoria', () => {
    // Arrange
    const categories = ['gestao', 'coerencia', 'ai', 'software', 'educacao', 'hobbies'] as const;

    // Act
    const svgs = categories.map((category) => patternSvg(category, 'currentColor'));

    // Assert
    for (const svg of svgs) {
      expect(svg).toMatch(/^<svg [^>]*aria-hidden="true"/);
      expect(svg).toContain('currentColor');
    }
    expect(new Set(svgs).size).toBe(categories.length);
  });
});
