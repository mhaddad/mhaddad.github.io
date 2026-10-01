import { describe, expect, it } from 'vitest';
import {
  TalkValidationError,
  sortTalks,
  spotifyUrl,
  talkCounts,
  validateTalks,
  youtubeEmbedUrl,
  youtubeWatchUrl,
  type TalkEntry,
} from './talks';

function talk(id: string, data: Partial<TalkEntry['data']> = {}): TalkEntry {
  return { id, data: { order: 1, type: 'palestra', youtubeId: 'MSiNEksvWO8', ...data } };
}

describe('validateTalks', () => {
  it('deve aceitar o acervo quando cada vídeo tem miniatura e cada item tem uma plataforma', () => {
    // Arrange
    const talks = [talk('a', { order: 1 }), talk('b', { order: 2, youtubeId: undefined, spotifyId: '3VBLEkeDhOxAk5BKMFz7FR' })];

    // Act
    const run = () => validateTalks(talks, new Set(['MSiNEksvWO8']));

    // Assert
    expect(run).not.toThrow();
  });

  it('deve listar os problemas quando falta plataforma, há duas ou falta miniatura', () => {
    // Arrange
    const talks = [
      talk('sem-plataforma', { order: 1, youtubeId: undefined }),
      talk('duas-plataformas', { order: 2, spotifyId: '3VBLEkeDhOxAk5BKMFz7FR' }),
      talk('sem-miniatura', { order: 3, youtubeId: 'aLpG1ydJ6r0' }),
    ];

    // Act
    const run = () => validateTalks(talks, new Set(['MSiNEksvWO8']));

    // Assert
    expect(run).toThrow(TalkValidationError);
    try {
      run();
    } catch (error) {
      const { problems } = error as TalkValidationError;
      expect(problems).toHaveLength(3);
      expect(problems[0]).toContain('sem-plataforma');
      expect(problems[1]).toContain('duas-plataformas');
      expect(problems[2]).toContain('aLpG1ydJ6r0');
    }
  });

  it('deve recusar a ordem repetida quando dois itens têm o mesmo order', () => {
    // Arrange
    const talks = [talk('a', { order: 1 }), talk('b', { order: 1 })];

    // Act
    const run = () => validateTalks(talks, new Set(['MSiNEksvWO8']));

    // Assert
    expect(run).toThrow(/order 1/);
  });
});

describe('sortTalks e talkCounts', () => {
  it('deve ordenar pelo campo order e contar por tipo quando recebe o acervo', () => {
    // Arrange
    const talks = [
      talk('c', { order: 3, type: 'podcast' }),
      talk('a', { order: 1, type: 'palestra' }),
      talk('b', { order: 2, type: 'podcast' }),
    ];

    // Act
    const sorted = sortTalks(talks).map((entry) => entry.id);
    const counts = talkCounts(talks);

    // Assert
    expect(sorted).toEqual(['a', 'b', 'c']);
    expect(counts).toEqual({ palestra: 1, webinar: 0, podcast: 2, entrevista: 0 });
  });
});

describe('links das plataformas', () => {
  it('deve usar o domínio sem cookies com autoplay quando monta o embed do YouTube', () => {
    expect(youtubeEmbedUrl('MSiNEksvWO8')).toBe('https://www.youtube-nocookie.com/embed/MSiNEksvWO8?autoplay=1');
  });

  it('deve montar os links públicos quando recebe os IDs', () => {
    expect(youtubeWatchUrl('MSiNEksvWO8')).toBe('https://www.youtube.com/watch?v=MSiNEksvWO8');
    expect(spotifyUrl('3VBLEkeDhOxAk5BKMFz7FR')).toBe('https://open.spotify.com/episode/3VBLEkeDhOxAk5BKMFz7FR');
  });
});
