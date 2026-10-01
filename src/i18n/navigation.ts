import { routePath, type RouteKey } from './routes';
import type { Lang, UIKey } from './ui';

export interface NavItem {
  route: RouteKey;
  label: UIKey;
  // Rotas que também acendem este item (ex.: Consultoria e Mentoria em "Serviços").
  also?: RouteKey[];
}

export const mainNav: NavItem[] = [
  { route: 'articles', label: 'nav.articles' },
  { route: 'services', label: 'nav.services', also: ['consulting', 'mentoring'] },
  { route: 'companies', label: 'nav.companies' },
  { route: 'speaking', label: 'nav.speaking' },
  { route: 'about', label: 'nav.about' },
];

export const footerNav: NavItem[] = [...mainNav, { route: 'books', label: 'nav.books' }];

export function isCurrent(pathname: string, item: NavItem, lang: Lang): boolean {
  return [item.route, ...(item.also ?? [])].some((route) => pathname.startsWith(routePath(route, lang)));
}
