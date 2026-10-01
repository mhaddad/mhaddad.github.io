import { DEFAULT_OG_IMAGE, SITE_NAME } from '../config';
import { absoluteUrl } from '../i18n/routes';
import { htmlLang, ogLocale, otherLang, type Lang } from '../i18n/ui';

export interface SeoInput {
  lang: Lang;
  title: string;
  description: string;
  path: string;
  alternatePath: string;
  type?: 'website' | 'article';
  image?: string;
  publishedTime?: Date;
  modifiedTime?: Date;
  // Páginas de erro: fora dos buscadores e sem par de idioma.
  noindex?: boolean;
}

export interface SeoData {
  title: string;
  description: string;
  canonical: string;
  alternates: { hreflang: string; href: string }[];
  meta: { property?: string; name?: string; content: string }[];
}

export function buildSeo(input: SeoInput): SeoData {
  const title = input.title === SITE_NAME ? SITE_NAME : `${input.title} · ${SITE_NAME}`;
  const canonical = absoluteUrl(input.path);
  const alternate = absoluteUrl(input.alternatePath);
  const ptUrl = input.lang === 'pt' ? canonical : alternate;
  const enUrl = input.lang === 'en' ? canonical : alternate;
  const image = absoluteUrl(input.image ?? DEFAULT_OG_IMAGE);
  const type = input.type ?? 'website';

  const meta: SeoData['meta'] = [
    { name: 'description', content: input.description },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: input.title },
    { property: 'og:description', content: input.description },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:locale', content: ogLocale[input.lang] },
    { property: 'og:locale:alternate', content: ogLocale[otherLang(input.lang)] },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: input.title },
    { name: 'twitter:description', content: input.description },
    { name: 'twitter:image', content: image },
  ];
  if (input.publishedTime) {
    meta.push({ property: 'article:published_time', content: input.publishedTime.toISOString() });
  }
  if (input.modifiedTime) {
    meta.push({ property: 'article:modified_time', content: input.modifiedTime.toISOString() });
  }
  if (input.noindex) {
    meta.push({ name: 'robots', content: 'noindex' });
  }

  return {
    title,
    description: input.description,
    canonical,
    alternates: input.noindex
      ? []
      : [
          { hreflang: htmlLang.pt, href: ptUrl },
          { hreflang: htmlLang.en, href: enUrl },
          { hreflang: 'x-default', href: ptUrl },
        ],
    meta,
  };
}
