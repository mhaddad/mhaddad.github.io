import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ACCENTS, THEMES } from './theme';
import { contrastRatio, parseTokens } from './contrast';

const tokens = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));

// WCAG 2.1 AA: 4.5:1 para texto normal. Todos os pares abaixo são texto.
const AA = 4.5;

describe('contrastRatio', () => {
  it('deve dar 21:1 quando compara preto e branco', () => {
    // Arrange
    const [black, white] = ['#000000', '#ffffff'];

    // Act
    const ratio = contrastRatio(black, white);

    // Assert
    expect(ratio).toBeCloseTo(21, 5);
  });

  it('deve dar 1:1 quando as cores são iguais', () => {
    // Arrange
    const color = '#007d4c';

    // Act
    const ratio = contrastRatio(color, color);

    // Assert
    expect(ratio).toBe(1);
  });
});

describe('tokens de cor', () => {
  it('deve definir os dois temas e as 4 cores de destaque em cada um quando lê tokens.css', () => {
    // Arrange
    const expectedThemes = [...THEMES].sort();

    // Act
    const themes = Object.keys(tokens.themes).sort();
    const accentsPerTheme = THEMES.map((theme) => Object.keys(tokens.accents[theme] ?? {}).sort());

    // Assert
    expect(themes).toEqual(expectedThemes);
    expect(accentsPerTheme).toEqual(THEMES.map(() => [...ACCENTS].sort()));
  });

  it.each(THEMES)('deve passar no AA quando o texto está sobre fundo e superfície no tema %s', (theme) => {
    // Arrange
    const t = tokens.themes[theme] as Record<string, string>;
    const pairs = [
      ['text', 'bg'],
      ['text', 'surface'],
      ['text-muted', 'bg'],
      ['text-muted', 'surface'],
    ] as const;

    // Act
    const failing = pairs.filter(([fg, bg]) => contrastRatio(t[fg] ?? '', t[bg] ?? '') < AA);

    // Assert
    expect(failing).toEqual([]);
  });

  it.each(THEMES.flatMap((theme) => ACCENTS.map((accent) => [theme, accent] as const)))(
    'deve passar no AA quando usa o destaque no tema %s com a cor %s',
    (theme, accent) => {
      // Arrange
      const t = tokens.themes[theme] as Record<string, string>;
      const a = tokens.accents[theme]?.[accent] as Record<string, string>;
      const pairs: [string, string, string][] = [
        ['accent sobre bg', a.accent ?? '', t.bg ?? ''],
        ['accent sobre surface', a.accent ?? '', t.surface ?? ''],
        ['accent sobre accent-subtle', a.accent ?? '', a['accent-subtle'] ?? ''],
        ['text sobre accent-subtle', t.text ?? '', a['accent-subtle'] ?? ''],
        ['text-muted sobre accent-subtle', t['text-muted'] ?? '', a['accent-subtle'] ?? ''],
        ['botão: accent-contrast sobre accent', a['accent-contrast'] ?? '', a.accent ?? ''],
        ['botão hover: accent-contrast sobre accent-hover', a['accent-contrast'] ?? '', a['accent-hover'] ?? ''],
      ];

      // Act
      const failing = pairs
        .map(([name, fg, bg]) => [name, contrastRatio(fg, bg).toFixed(2)] as const)
        .filter(([, ratio]) => Number(ratio) < AA);

      // Assert
      expect(failing).toEqual([]);
    },
  );
});
