import { routePath, type RouteKey } from '../i18n/routes';
import { languages, type Lang } from '../i18n/ui';
import { publishedArticles, type ArticleEntry } from './articles';

export const serviceKeys = ['consultoria', 'mentoria', 'palestras'] as const;
export type ServiceKey = (typeof serviceKeys)[number];

// Cada serviço tem rota própria no contrato de URLs.
export const serviceRoutes: Record<ServiceKey, RouteKey> = {
  consultoria: 'consulting',
  mentoria: 'mentoring',
  palestras: 'speaking',
};

export function servicePath(key: ServiceKey, lang: Lang): string {
  return routePath(serviceRoutes[key], lang);
}

export interface ServiceData {
  key: ServiceKey;
  lang: Lang;
  order: number;
  relatedArticles: string[];
}

export interface ServiceEntry<TData extends ServiceData = ServiceData> {
  id: string;
  data: TData;
}

export class ServiceValidationError extends Error {
  constructor(readonly problems: string[]) {
    super(`Serviços inválidos:\n- ${problems.join('\n- ')}`);
    this.name = 'ServiceValidationError';
  }
}

export function validateServices(services: ServiceEntry[], articles: ArticleEntry[]): void {
  const problems: string[] = [];

  for (const service of services) {
    const [folder, file] = service.id.split('/');
    const { key, lang, relatedArticles } = service.data;
    if (folder !== lang) problems.push(`${service.id}: está na pasta "${folder}" mas declara lang "${lang}"`);
    if (file !== key) problems.push(`${service.id}: o arquivo deve se chamar "${key}.md"`);

    const published = new Set(publishedArticles(articles, lang).map((article) => article.data.translationKey));
    for (const translationKey of relatedArticles) {
      if (!published.has(translationKey)) {
        problems.push(`${service.id}: artigo relacionado "${translationKey}" não está publicado em ${lang}`);
      }
    }
  }

  for (const key of serviceKeys) {
    for (const lang of languages) {
      const count = services.filter((service) => service.data.key === key && service.data.lang === lang).length;
      if (count !== 1) problems.push(`serviço "${key}": esperado 1 arquivo em ${lang}, encontrados ${count}`);
    }
  }

  if (problems.length > 0) throw new ServiceValidationError(problems);
}

export function servicesFor<T extends ServiceEntry>(services: T[], lang: Lang): T[] {
  return services.filter((service) => service.data.lang === lang).sort((a, b) => a.data.order - b.data.order);
}

export function serviceFor<T extends ServiceEntry>(services: T[], key: ServiceKey, lang: Lang): T {
  const service = services.find((entry) => entry.data.key === key && entry.data.lang === lang);
  if (!service) throw new ServiceValidationError([`serviço "${key}" não encontrado em ${lang}`]);
  return service;
}

export function relatedArticlesFor<T extends ArticleEntry>(service: ServiceEntry, articles: T[]): T[] {
  const published = publishedArticles(articles, service.data.lang);
  return service.data.relatedArticles
    .map((translationKey) => published.find((article) => article.data.translationKey === translationKey))
    .filter((article): article is T => article !== undefined);
}
