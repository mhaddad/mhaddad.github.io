import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ui } from '../src/i18n/ui';
import { parseMapIframe } from '../src/lib/map-embed';

const CONTENT_DIR = 'src/content/articles';

function markdownFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.md'))
    .map((file) => join(dir, file));
}

describe('conteúdo real', () => {
  it('deve não conter fixtures quando lê o conteúdo real', () => {
    // Arrange
    const files = markdownFiles(CONTENT_DIR);

    // Act
    const fixtures = files.filter((file) => /translationKey:\s*fixture-/.test(readFileSync(file, 'utf8')));

    // Assert
    expect(fixtures).toEqual([]);
  });

  it('deve manter cada iframe de mapa sozinho no parágrafo para ele só carregar no clique', () => {
    // Arrange
    const files = markdownFiles(CONTENT_DIR);

    // Act
    const loose = files.flatMap((file) => {
      const body = readFileSync(file, 'utf8');
      const all = [...body.matchAll(/<iframe\b[^>]*maps\/(?:d\/)?embed[^>]*>/gi)].length;
      const alone = body.split(/\n\s*\n/).filter((block) => parseMapIframe(block) !== undefined).length;
      return all === alone ? [] : [file];
    });

    // Assert
    expect(loose).toEqual([]);
  });
});

describe('serviço de palestras', () => {
  it('deve anunciar só palestras, sem workshops, na página, no menu e nas chamadas dos artigos', () => {
    // Arrange
    const pages = ['pt', 'en'].map((lang) => readFileSync(`src/content/services/${lang}/palestras.md`, 'utf8'));
    const texts = (['pt', 'en'] as const).flatMap((lang) => [ui[lang]['nav.speaking'], ui[lang]['cta.educacao.text'], ui[lang]['service.name.palestras']]);

    // Act
    const withWorkshop = [...pages, ...texts].filter((text) => /workshop/i.test(text));

    // Assert
    expect(withWorkshop).toEqual([]);
    expect(ui.pt['nav.speaking']).toBe('Palestras');
    expect(ui.en['nav.speaking']).toBe('Talks');
  });
});
