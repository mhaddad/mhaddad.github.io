import type { APIRoute, GetStaticPaths } from 'astro';
import { articleCoverFile, getAllArticles, type Article } from '../../lib/collections';
import { ogCoverPaths, renderOgCover } from '../../lib/og';

// Prévia (WhatsApp, LinkedIn) dos artigos que abrem com imagem: a própria capa, em 1200×630.
export const getStaticPaths = (async () =>
  ogCoverPaths(await getAllArticles(), (entry) => articleCoverFile(entry as Article))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const jpeg = await renderOgCover(props.file as string);
  return new Response(new Uint8Array(jpeg), { headers: { 'Content-Type': 'image/jpeg' } });
};
