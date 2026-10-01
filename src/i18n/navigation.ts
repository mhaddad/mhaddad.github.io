import { routePath, type RouteKey } from './routes';
import type { Lang, UIKey } from './ui';

export interface NavItem {
  route: RouteKey;
  label: UIKey;
}

export const mainNav: NavItem[] = [
  { route: 'articles', label: 'nav.articles' },
  { route: 'services', label: 'nav.services' },
  { route: 'companies', label: 'nav.companies' },
  { route: 'speaking', label: 'nav.speaking' },
  { route: 'about', label: 'nav.about' },
];

export const footerNav: NavItem[] = [...mainNav, { route: 'books', label: 'nav.books' }];

export function isCurrent(pathname: string, route: RouteKey, lang: Lang): boolean {
  return pathname.startsWith(routePath(route, lang));
}
