// Mapas do Google My Maps nos artigos, com carregamento só depois do clique.
// No Markdown, o artigo traz o <iframe> do mapa (como no Medium), sozinho no parágrafo.
// No build, o plugin do Sätteri (o processador de Markdown do Astro 7) troca o iframe por
// um bloco com botão: o Google só é chamado quando a pessoa clica (script em
// ArticleLayout.astro), sem cookies nem scripts de terceiros antes disso.

export const MAP_EMBED_SRC = /^https:\/\/www\.google\.com\/maps\/d\/embed\?mid=([A-Za-z0-9_-]+)$/;

// O bloco inteiro precisa ser só o iframe do mapa; qualquer outra coisa fica como está.
const MAP_IFRAME = /^\s*<iframe\b([^>]*)>\s*<\/iframe>\s*$/i;

export interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const labels = {
  pt: { button: 'Carregar mapa interativo', link: 'Abrir no Google Maps', title: 'Mapa interativo' },
  en: { button: 'Load interactive map', link: 'Open in Google Maps', title: 'Interactive map' },
} as const;

export type MapLang = keyof typeof labels;

export function mapViewerUrl(src: string): string {
  return src.replace('/maps/d/embed?', '/maps/d/viewer?');
}

function attribute(attributes: string, name: string): string | undefined {
  return new RegExp(`\\b${name}\\s*=\\s*"([^"]*)"`, 'i').exec(attributes)?.[1];
}

/** Lê o HTML bruto e devolve o mapa quando ele é exatamente um iframe do My Maps. */
export function parseMapIframe(html: string): { src: string; title?: string } | undefined {
  const attributes = MAP_IFRAME.exec(html)?.[1];
  const src = attributes && attribute(attributes, 'src');
  return src && MAP_EMBED_SRC.test(src) ? { src, title: attribute(attributes, 'title') } : undefined;
}

function text(value: string): HastNode {
  return { type: 'text', value };
}

export function mapFacade(map: { src: string; title?: string }, lang: MapLang): HastNode {
  const t = labels[lang];
  return {
    type: 'element',
    tagName: 'figure',
    properties: { className: ['map-embed'], dataMapEmbed: '', dataSrc: map.src, dataTitle: map.title || t.title },
    children: [
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['map-embed__stage'] },
        children: [
          {
            type: 'element',
            tagName: 'button',
            properties: { type: 'button', className: ['button', 'button--secondary', 'button--large'] },
            children: [text(t.button)],
          },
        ],
      },
      {
        type: 'element',
        tagName: 'a',
        properties: { href: mapViewerUrl(map.src), target: '_blank', rel: 'noopener', className: ['map-embed__link'] },
        children: [text(t.link)],
      },
    ],
  };
}

/** Idioma do artigo, pela pasta (src/content/articles/en/... ou pt/...). */
export function langOf(fileURL: URL | undefined): MapLang {
  return /\/en\//.test(fileURL?.pathname ?? '') ? 'en' : 'pt';
}

/** Plugin hast do Sätteri (hastPlugins): iframe do My Maps vira bloco com botão. */
export function mapEmbedPlugin(context: { fileURL: URL | undefined }) {
  const lang = langOf(context.fileURL);
  return {
    name: 'map-embed',
    raw(node: HastNode, ctx: { replaceNode(node: HastNode, replacement: HastNode): void }) {
      const map = parseMapIframe(node.value ?? '');
      if (map) ctx.replaceNode(node, mapFacade(map, lang));
    },
  };
}
