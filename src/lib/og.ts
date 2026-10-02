import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import sharp from 'sharp';
import { SITE_NAME } from '../config';
import { categories, type CategoryKey } from '../i18n/categories';
import { t, type Lang } from '../i18n/ui';
import { articleSlug, publishedArticles, type ArticleEntry } from './articles';
import { patternSvg } from './patterns';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

// A imagem é estática e fica em cache no WhatsApp/LinkedIn: usa sempre o tema
// escuro com o verde, que é o padrão da marca (tokens.css).
const OG_COLORS = {
  bg: '#000000',
  surface: '#161618',
  text: '#ffffff',
  muted: '#b8b8b8',
  accent: '#00f993',
};

export interface OgCard {
  label: string;
  title: string;
  category: CategoryKey;
}

export type OgFormat = 'png' | 'jpg';

// Arquivo da capa do artigo no disco, ou undefined quando ele não abre com imagem.
export type CoverFile = (entry: ArticleEntry) => string | undefined;

/** Artigo com capa usa a própria capa como prévia (JPEG); sem capa, a arte gerada (PNG). */
export function ogImagePath(lang: Lang, slug: string, format: OgFormat = 'png'): string {
  return lang === 'pt' ? `/og/artigos/${slug}.${format}` : `/og/en/articles/${slug}.${format}`;
}

function ogParam(lang: Lang, entry: ArticleEntry): string {
  return ogImagePath(lang, articleSlug(entry)).replace(/^\/og\//, '').replace(/\.png$/, '');
}

function publishedBothLangs(entries: ArticleEntry[]) {
  return (['pt', 'en'] as const).flatMap((lang) => publishedArticles(entries, lang).map((article) => ({ lang, article })));
}

/** Prévias com a capa do artigo, recortada por renderOgCover. */
export function ogCoverPaths(entries: ArticleEntry[], coverFile: CoverFile) {
  return publishedBothLangs(entries)
    .map(({ lang, article }) => ({ lang, article, file: coverFile(article) }))
    .filter((item): item is typeof item & { file: string } => item.file !== undefined)
    .map(({ lang, article, file }) => ({ params: { path: ogParam(lang, article) }, props: { file } }));
}

export function ogPaths(entries: ArticleEntry[], coverFile: CoverFile = () => undefined) {
  const defaultCard: OgCard = { label: t('pt', 'hero.label'), title: t('pt', 'hero.title'), category: 'gestao' };
  const articles = publishedBothLangs(entries)
    .filter(({ article }) => coverFile(article) === undefined)
    .map(({ lang, article }) => ({
      params: { path: ogParam(lang, article) },
      props: {
        card: {
          label: categories[article.data.category].name[lang],
          title: article.data.title,
          category: article.data.category,
        } satisfies OgCard,
      },
    }));
  return [{ params: { path: 'default' }, props: { card: defaultCard } }, ...articles];
}

export function titleFontSize(title: string): number {
  if (title.length > 90) return 44;
  if (title.length > 60) return 52;
  return 60;
}

let fonts: { name: string; data: Buffer; weight: 500 | 600; style: 'normal' }[] | undefined;

function loadFonts() {
  const file = (path: string) => readFileSync(join(process.cwd(), 'node_modules', path));
  fonts ??= [
    { name: 'Fraunces', data: file('@fontsource/fraunces/files/fraunces-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'JetBrains Mono', data: file('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff'), weight: 500, style: 'normal' },
  ];
  return fonts;
}

const mono = { fontFamily: 'JetBrains Mono', fontSize: 24, letterSpacing: 2, textTransform: 'uppercase' } as const;

export async function renderOgImage(card: OgCard): Promise<Uint8Array> {
  const pattern = `data:image/svg+xml;base64,${Buffer.from(patternSvg(card.category, OG_COLORS.accent)).toString('base64')}`;
  const tree = {
    type: 'div',
    props: {
      style: { width: OG_WIDTH, height: OG_HEIGHT, display: 'flex', background: OG_COLORS.bg, color: OG_COLORS.text, fontFamily: 'Fraunces' },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, width: 720 },
            children: [
              { type: 'div', props: { style: { ...mono, color: OG_COLORS.accent }, children: card.label } },
              { type: 'div', props: { style: { fontSize: titleFontSize(card.title), lineHeight: 1.1 }, children: card.title } },
              { type: 'div', props: { style: { ...mono, color: OG_COLORS.muted }, children: SITE_NAME } },
            ],
          },
        },
        {
          type: 'img',
          props: { src: pattern, width: OG_WIDTH - 720, height: OG_HEIGHT, style: { objectFit: 'cover', background: OG_COLORS.surface } },
        },
      ],
    },
  };
  const svg = await satori(tree as Parameters<typeof satori>[0], { width: OG_WIDTH, height: OG_HEIGHT, fonts: loadFonts() });
  return new Resvg(svg).render().asPng();
}

// O WhatsApp deixa de mostrar a miniatura de imagens grandes: JPEG de até ~300 KB.
const OG_JPEG_QUALITY = 80;

/** Recorta a capa no formato da prévia (1200×630), ampliando se ela for menor. */
export async function renderOgCover(file: string): Promise<Buffer> {
  return sharp(file)
    .flatten({ background: OG_COLORS.bg })
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: OG_JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}
