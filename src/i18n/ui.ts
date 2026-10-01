export const languages = ['pt', 'en'] as const;
export type Lang = (typeof languages)[number];
export const defaultLang: Lang = 'pt';

export const htmlLang: Record<Lang, string> = { pt: 'pt-BR', en: 'en' };
export const ogLocale: Record<Lang, string> = { pt: 'pt_BR', en: 'en_US' };

const pt = {
  'site.description':
    'Negócios, tecnologia e pessoas: artigos de Matheus Haddad sobre gestão, liderança, AI e desenvolvimento de software.',
  'skip.toContent': 'Pular para o conteúdo',
  'nav.label': 'Navegação principal',
  'nav.articles': 'Artigos',
  'lang.switch': 'English',
  'lang.switchLabel': 'Read this page in English',
  'home.title': 'Matheus Haddad',
  'home.intro':
    'Empresário, consultor e palestrante. Escrevo sobre como organizações crescem na era da AI.',
  'home.cta': 'Ler os artigos',
  'articles.title': 'Artigos',
  'articles.description':
    'Artigos de Matheus Haddad sobre gestão, liderança, AI e desenvolvimento de software.',
  'articles.filterLabel': 'Filtrar por tema',
  'articles.all': 'Todos',
  'articles.empty': 'Ainda não há artigos publicados.',
  'category.title': 'Artigos sobre {category}',
  'category.description': 'Artigos de Matheus Haddad sobre {category}.',
  'article.readingTime': '{minutes} min de leitura',
  'article.updated': 'Atualizado em {date}',
  'article.originallyPublished': 'Publicado originalmente no {platform} em {date}',
  'footer.rss': 'RSS',
  'footer.rights': '© {year} Matheus Haddad',
} as const;

export type UIKey = keyof typeof pt;

const en: Record<UIKey, string> = {
  'site.description':
    'Business, technology and people: articles by Matheus Haddad on management, leadership, AI and software development.',
  'skip.toContent': 'Skip to content',
  'nav.label': 'Main navigation',
  'nav.articles': 'Articles',
  'lang.switch': 'Português',
  'lang.switchLabel': 'Ler esta página em português',
  'home.title': 'Matheus Haddad',
  'home.intro':
    'Entrepreneur, consultant and speaker. I write about how organizations grow in the age of AI.',
  'home.cta': 'Read the articles',
  'articles.title': 'Articles',
  'articles.description':
    'Articles by Matheus Haddad on management, leadership, AI and software development.',
  'articles.filterLabel': 'Filter by topic',
  'articles.all': 'All',
  'articles.empty': 'No articles published yet.',
  'category.title': 'Articles on {category}',
  'category.description': 'Articles by Matheus Haddad on {category}.',
  'article.readingTime': '{minutes} min read',
  'article.updated': 'Updated on {date}',
  'article.originallyPublished': 'Originally published on {platform} on {date}',
  'footer.rss': 'RSS',
  'footer.rights': '© {year} Matheus Haddad',
};

export const ui: Record<Lang, Record<UIKey, string>> = { pt, en };

export function t(lang: Lang, key: UIKey, vars: Record<string, string | number> = {}): string {
  return ui[lang][key].replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export function otherLang(lang: Lang): Lang {
  return lang === 'pt' ? 'en' : 'pt';
}

export function formatDate(lang: Lang, date: Date): string {
  return new Intl.DateTimeFormat(htmlLang[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
