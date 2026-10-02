import type { APIRoute, GetStaticPaths } from 'astro';
import { articleCoverFile, getAllArticles, type Article } from '../../lib/collections';
import { ogPaths, renderOgImage, type OgCard } from '../../lib/og';

// Artigos com capa usam a rota .jpg; aqui ficam a imagem padrão e os artigos sem capa.
export const getStaticPaths = (async () =>
  ogPaths(await getAllArticles(), (entry) => articleCoverFile(entry as Article))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const png = await renderOgImage(props.card as OgCard);
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
