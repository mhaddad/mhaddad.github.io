import { describe, expect, it } from 'vitest';
import { formatDate, formatShortDate, otherLang, t, ui } from './ui';

describe('dicionário de interface', () => {
  it('deve ter as mesmas chaves quando compara português e inglês', () => {
    // Arrange
    const ptKeys = Object.keys(ui.pt).sort();

    // Act
    const enKeys = Object.keys(ui.en).sort();

    // Assert
    expect(enKeys).toEqual(ptKeys);
  });

  it('deve ter todos os textos preenchidos quando percorre os dois idiomas', () => {
    // Arrange
    const values = [...Object.values(ui.pt), ...Object.values(ui.en)];

    // Act
    const empty = values.filter((value) => value.trim() === '');

    // Assert
    expect(empty).toEqual([]);
  });

  it('deve substituir variáveis quando elas são informadas', () => {
    // Arrange
    const vars = { minutes: 7 };

    // Act
    const text = t('pt', 'article.readingTime', vars);

    // Assert
    expect(text).toBe('7 min');
  });

  it('deve manter o marcador quando a variável não é informada', () => {
    // Arrange
    const vars = {};

    // Act
    const text = t('en', 'article.readingTime', vars);

    // Assert
    expect(text).toBe('{minutes} min');
  });
});

describe('otherLang', () => {
  it('deve devolver o outro idioma quando recebe pt ou en', () => {
    // Arrange
    const langs = ['pt', 'en'] as const;

    // Act
    const result = langs.map(otherLang);

    // Assert
    expect(result).toEqual(['en', 'pt']);
  });
});

describe('formatDate', () => {
  it('deve formatar a data por extenso sem deslocar o dia quando o fuso local é diferente de UTC', () => {
    // Arrange
    const date = new Date('2026-08-25');

    // Act
    const pt = formatDate('pt', date);
    const en = formatDate('en', date);

    // Assert
    expect(pt).toBe('25 de agosto de 2026');
    expect(en).toBe('August 25, 2026');
  });
});

describe('formatShortDate', () => {
  it('deve formatar como "25 AGO 2026" em português e "25 AUG 2026" em inglês quando recebe uma data', () => {
    // Arrange
    const date = new Date('2026-08-25');

    // Act
    const pt = formatShortDate('pt', date);
    const en = formatShortDate('en', date);

    // Assert
    expect(pt).toBe('25 AGO 2026');
    expect(en).toBe('25 AUG 2026');
  });

  it('deve usar dois dígitos no dia quando o dia tem um algarismo', () => {
    // Arrange
    const date = new Date('2018-02-01');

    // Act
    const pt = formatShortDate('pt', date);

    // Assert
    expect(pt).toBe('01 FEV 2018');
  });
});
