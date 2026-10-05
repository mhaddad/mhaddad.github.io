import { routePath, type RouteKey } from './routes';
import type { Lang, UIKey } from './ui';

export interface NavItem {
  route: RouteKey;
  label: UIKey;
}

export const mainNav: NavItem[] = [
  { route: 'articles', label: 'nav.articles' },
  { route: 'speaking', label: 'nav.speaking' },
  { route: 'mentoring', label: 'nav.mentoring' },
  { route: 'companies', label: 'nav.companies' },
  { route: 'media', label: 'nav.media' },
  { route: 'books', label: 'nav.books' },
  { route: 'about', label: 'nav.about' },
];

export const footerNav: NavItem[] = [...mainNav];

export function isCurrent(pathname: string, item: NavItem, lang: Lang): boolean {
  return pathname.startsWith(routePath(item.route, lang));
}
