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
  'nav.footerLabel': 'Navegação do rodapé',
  'nav.home': 'Matheus Haddad — ir para a home',
  'nav.articles': 'Artigos',
  'nav.services': 'Serviços',
  'nav.companies': 'Empresas',
  'nav.speaking': 'Palestras e Mídia',
  'nav.about': 'Sobre',
  'nav.books': 'Livros',
  'nav.menu': 'Abrir menu',
  'nav.close': 'Fechar menu',
  'lang.switch': 'EN',
  'lang.switchLabel': 'Read this page in English',
  'theme.toLight': 'Mudar para o modo claro',
  'theme.toDark': 'Mudar para o modo escuro',
  'theme.light': 'Modo claro',
  'theme.dark': 'Modo escuro',
  'whatsapp.label': 'Conversar no WhatsApp',
  'whatsapp.message': 'Olá, Matheus! Vim pelo seu site e gostaria de conversar.',
  'home.title': 'Matheus Haddad',
  'hero.label': 'Empresário · Consultor · Palestrante',
  'hero.title': 'Negócios, tecnologia e pessoas: como organizações crescem na era da IA.',
  'hero.subtitle':
    'Matheus Haddad ajuda CEOs e CTOs a redesenhar organizações para crescer com clareza — combinando estratégia de negócios, tecnologia e gestão de pessoas.',
  'hero.services': 'Ver serviços',
  'hero.portraitAlt': 'Matheus Haddad, empresário e consultor em negócios e tecnologia',
  'proof.label': 'Números e empresas',
  'proof.companies': 'empresas fundadas',
  'proof.years': 'anos de gestão',
  'proof.leaders': 'líderes apoiados',
  'proof.logos': 'Empresas e iniciativas',
  'home.featured': 'Artigos em destaque',
  'home.allArticles': 'Ver todos os artigos',
  'home.ctaTitle': 'Vamos conversar?',
  'home.ctaText':
    'Se você está redesenhando sua organização, adotando IA ou enfrentando um momento de transição — me escreva. Respondo pessoalmente.',
  'articles.title': 'Artigos',
  'articles.description':
    'Artigos de Matheus Haddad sobre gestão, liderança, AI e desenvolvimento de software.',
  'articles.filterLabel': 'Filtrar por tema',
  'articles.all': 'Todos',
  'articles.empty': 'Ainda não há artigos publicados.',
  'category.title': 'Artigos sobre {category}',
  'category.description': 'Artigos de Matheus Haddad sobre {category}.',
  'article.back': 'Todos os artigos',
  'article.readingTime': '{minutes} min',
  'article.updated': 'Atualizado em {date}',
  'article.originallyPublished': 'Publicado originalmente no {platform} em {date}',
  'article.toc': 'Neste artigo',
  'article.share': 'Compartilhar',
  'article.shareLinkedIn': 'Compartilhar no LinkedIn',
  'article.shareWhatsApp': 'Compartilhar no WhatsApp',
  'article.copyLink': 'Copiar link',
  'article.linkCopied': 'Link copiado!',
  'article.author': 'Quem escreve',
  'article.authorDesc':
    'Matheus Haddad é empresário, consultor e palestrante com 15+ anos de experiência em gestão e tecnologia. Fundou 5 empresas e apoiou 500+ líderes.',
  'article.authorLink': 'Conheça a trajetória',
  'footer.tagline': 'Negócios, tecnologia e pessoas.',
  'footer.rss': 'RSS',
  'footer.rights': '© {year} Matheus Haddad. Todos os direitos reservados.',
} as const;

export type UIKey = keyof typeof pt;

const en: Record<UIKey, string> = {
  'site.description':
    'Business, technology and people: articles by Matheus Haddad on management, leadership, AI and software development.',
  'skip.toContent': 'Skip to content',
  'nav.label': 'Main navigation',
  'nav.footerLabel': 'Footer navigation',
  'nav.home': 'Matheus Haddad — go to the home page',
  'nav.articles': 'Articles',
  'nav.services': 'Services',
  'nav.companies': 'Companies',
  'nav.speaking': 'Talks & Media',
  'nav.about': 'About',
  'nav.books': 'Books',
  'nav.menu': 'Open menu',
  'nav.close': 'Close menu',
  'lang.switch': 'PT',
  'lang.switchLabel': 'Ler esta página em português',
  'theme.toLight': 'Switch to light mode',
  'theme.toDark': 'Switch to dark mode',
  'theme.light': 'Light mode',
  'theme.dark': 'Dark mode',
  'whatsapp.label': 'Chat on WhatsApp',
  'whatsapp.message': 'Hi Matheus! I found your website and would like to talk.',
  'home.title': 'Matheus Haddad',
  'hero.label': 'Entrepreneur · Consultant · Speaker',
  'hero.title': 'Business, technology, and people: how organizations grow in the AI era.',
  'hero.subtitle':
    'Matheus Haddad helps CEOs and CTOs redesign organizations to grow with clarity — combining business strategy, technology, and people management.',
  'hero.services': 'See services',
  'hero.portraitAlt': 'Matheus Haddad, entrepreneur and consultant in business and technology',
  'proof.label': 'Numbers and companies',
  'proof.companies': 'companies founded',
  'proof.years': 'years in management',
  'proof.leaders': 'leaders supported',
  'proof.logos': 'Companies & initiatives',
  'home.featured': 'Featured articles',
  'home.allArticles': 'See all articles',
  'home.ctaTitle': "Let's talk?",
  'home.ctaText':
    "If you're redesigning your organization, adopting AI, or facing a moment of transition — reach out. I respond personally.",
  'articles.title': 'Articles',
  'articles.description':
    'Articles by Matheus Haddad on management, leadership, AI and software development.',
  'articles.filterLabel': 'Filter by topic',
  'articles.all': 'All',
  'articles.empty': 'No articles published yet.',
  'category.title': 'Articles on {category}',
  'category.description': 'Articles by Matheus Haddad on {category}.',
  'article.back': 'All articles',
  'article.readingTime': '{minutes} min',
  'article.updated': 'Updated on {date}',
  'article.originallyPublished': 'Originally published on {platform} on {date}',
  'article.toc': 'In this article',
  'article.share': 'Share',
  'article.shareLinkedIn': 'Share on LinkedIn',
  'article.shareWhatsApp': 'Share on WhatsApp',
  'article.copyLink': 'Copy link',
  'article.linkCopied': 'Link copied!',
  'article.author': 'About the author',
  'article.authorDesc':
    'Matheus Haddad is an entrepreneur, consultant, and speaker with 15+ years of experience in management and technology. He founded 5 companies and supported 500+ leaders.',
  'article.authorLink': 'Read his story',
  'footer.tagline': 'Business, technology, and people.',
  'footer.rss': 'RSS',
  'footer.rights': '© {year} Matheus Haddad. All rights reserved.',
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

// Formato dos rótulos em mono do design: "25 AGO 2026".
export function formatShortDate(lang: Lang, date: Date): string {
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(htmlLang[lang], { ...options, timeZone: 'UTC' }).format(date);
  const month = part({ month: 'short' }).replace('.', '').toUpperCase();
  return `${part({ day: '2-digit' })} ${month} ${part({ year: 'numeric' })}`;
}
