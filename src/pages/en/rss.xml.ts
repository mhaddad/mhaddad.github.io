import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_NAME } from '../../config';
import { htmlLang, t } from '../../i18n/ui';
import { getAllArticles } from '../../lib/collections';
import { feedItems } from '../../lib/feed';

export async function GET(context: APIContext) {
  const lang = 'en';
  return rss({
    title: SITE_NAME,
    description: t(lang, 'articles.description'),
    site: context.site ?? '',
    items: feedItems(await getAllArticles(), lang),
    customData: `<language>${htmlLang[lang]}</language>`,
  });
}
