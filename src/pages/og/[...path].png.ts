import type { APIRoute, GetStaticPaths } from 'astro';
import { getAllArticles } from '../../lib/collections';
import { ogPaths, renderOgImage, type OgCard } from '../../lib/og';

export const getStaticPaths = (async () => ogPaths(await getAllArticles())) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props.card as OgCard);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
