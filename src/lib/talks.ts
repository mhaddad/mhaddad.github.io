// Acervo de Palestras e Mídia (src/content/talks/talks.yaml).

export const talkTypes = ['palestra', 'webinar', 'podcast', 'entrevista'] as const;
export type TalkType = (typeof talkTypes)[number];

export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
export const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;

export interface TalkData {
  order: number;
  type: TalkType;
  youtubeId?: string;
  spotifyId?: string;
}

export interface TalkEntry<TData extends TalkData = TalkData> {
  id: string;
  data: TData;
}

export class TalkValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Acervo de palestras inválido:\n- ${problems.join('\n- ')}`);
    this.name = 'TalkValidationError';
  }
}

/** `thumbnails`: IDs do YouTube com miniatura em src/assets/talks/. */
export function validateTalks(talks: TalkEntry[], thumbnails: Set<string>): void {
  const problems: string[] = [];
  const orders = new Map<number, string>();

  for (const { id, data } of sortTalks(talks)) {
    const platforms = [data.youtubeId, data.spotifyId].filter(Boolean).length;
    if (platforms !== 1) problems.push(`${id}: precisa de youtubeId ou spotifyId, e só de um deles`);
    if (data.youtubeId && !thumbnails.has(data.youtubeId)) {
      problems.push(`${id}: falta a miniatura src/assets/talks/${data.youtubeId}.jpg (rode npm run assets)`);
    }
    const repeated = orders.get(data.order);
    if (repeated) problems.push(`${id}: order ${data.order} repetido com "${repeated}"`);
    orders.set(data.order, id);
  }

  if (problems.length > 0) throw new TalkValidationError(problems);
}

export function sortTalks<T extends TalkEntry>(talks: T[]): T[] {
  return [...talks].sort((a, b) => a.data.order - b.data.order);
}

export function talkCounts(talks: TalkEntry[]): Record<TalkType, number> {
  const counts = Object.fromEntries(talkTypes.map((type) => [type, 0])) as Record<TalkType, number>;
  for (const { data } of talks) counts[data.type] += 1;
  return counts;
}

export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
}

export function youtubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function spotifyUrl(id: string): string {
  return `https://open.spotify.com/episode/${id}`;
}
