import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
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
