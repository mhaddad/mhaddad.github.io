// Mapas do Google nos artigos. No Markdown, o artigo traz o <iframe> do mapa (como no
// Medium, ou do jeito que o Google gera em "Compartilhar > Incorporar um mapa"), sozinho
// num parágrafo. No build, o plugin do Sätteri (o processador de Markdown do Astro 7)
// troca esse iframe por uma versão padronizada: carregamento preguiçoso (só quando a
// pessoa rola até perto do mapa), título acessível e estilo do site.
// Valem dois formatos, e nenhum outro: o My Maps (maps/d/embed?mid=) e o embed padrão
// do Google Maps (maps/embed?pb=).

const MY_MAPS_SRC = /^https:\/\/www\.google\.com\/maps\/d\/embed\?mid=[A-Za-z0-9_-]+$/;
const MAPS_SRC = /^https:\/\/www\.google\.com\/maps\/embed\?pb=[A-Za-z0-9!%._:,+=~-]+$/;

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
  pt: { link: 'Abrir no Google Maps', title: 'Mapa interativo' },
  en: { link: 'Open in Google Maps', title: 'Interactive map' },
} as const;

export type MapLang = keyof typeof labels;

export function isMapEmbedSrc(src: string): boolean {
  return MY_MAPS_SRC.test(src) || MAPS_SRC.test(src);
}

/** Página do My Maps em tela cheia; o embed padrão do Google Maps não tem uma. */
export function mapViewerUrl(src: string): string | undefined {
  return MY_MAPS_SRC.test(src) ? src.replace('/maps/d/embed?', '/maps/d/viewer?') : undefined;
}

function attribute(attributes: string, name: string): string | undefined {
  return new RegExp(`(?:^|\\s)${name}\\s*=\\s*"([^"]*)"`, 'i').exec(attributes)?.[1];
}

/** Lê o HTML bruto e devolve o mapa quando ele é exatamente um iframe de mapa permitido. */
export function parseMapIframe(html: string): { src: string; title?: string } | undefined {
  const attributes = MAP_IFRAME.exec(html)?.[1];
  const src = attributes && attribute(attributes, 'src');
  return src && isMapEmbedSrc(src) ? { src, title: attribute(attributes, 'title') } : undefined;
}

export function mapEmbed(map: { src: string; title?: string }, lang: MapLang): HastNode {
  const t = labels[lang];
  const viewer = mapViewerUrl(map.src);
  const children: HastNode[] = [
    {
      type: 'element',
      tagName: 'iframe',
      properties: {
        src: map.src,
        title: map.title || t.title,
        loading: 'lazy',
        referrerPolicy: 'strict-origin-when-cross-origin',
        allowFullScreen: true,
      },
      children: [],
    },
  ];
  if (viewer) {
    children.push({
      type: 'element',
      tagName: 'a',
      properties: { href: viewer, target: '_blank', rel: 'noopener', className: ['map-embed__link'] },
      children: [{ type: 'text', value: t.link }],
    });
  }
  return { type: 'element', tagName: 'figure', properties: { className: ['map-embed'] }, children };
}

/** Idioma do artigo, pela pasta (src/content/articles/en/... ou pt/...). */
export function langOf(fileURL: URL | undefined): MapLang {
  return /\/en\//.test(fileURL?.pathname ?? '') ? 'en' : 'pt';
}

/** Plugin hast do Sätteri (hastPlugins): iframe de mapa vira o mapa padronizado do site. */
export function mapEmbedPlugin(context: { fileURL: URL | undefined }) {
  const lang = langOf(context.fileURL);
  return {
    name: 'map-embed',
    raw(node: HastNode, ctx: { replaceNode(node: HastNode, replacement: HastNode): void }) {
      const map = parseMapIframe(node.value ?? '');
      if (map) ctx.replaceNode(node, mapEmbed(map, lang));
    },
  };
}
