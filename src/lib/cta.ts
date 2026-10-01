import type { CategoryKey } from '../i18n/categories';
import { t, type Lang, type UIKey } from '../i18n/ui';
import type { ServiceKey } from './services';

export interface ArticleCta {
  service: ServiceKey;
  title: UIKey;
  text: UIKey;
}

// Serviço e textos da chamada no fim do artigo, por categoria (copy aprovada em 01/10/2026).
// Hobbies fica sem chamada.
const byCategory: Partial<Record<CategoryKey, ArticleCta>> = {
  gestao: { service: 'consultoria', title: 'cta.gestao.title', text: 'cta.gestao.text' },
  coerencia: { service: 'consultoria', title: 'cta.coerencia.title', text: 'cta.coerencia.text' },
  ai: { service: 'consultoria', title: 'cta.ai.title', text: 'cta.ai.text' },
  software: { service: 'mentoria', title: 'cta.software.title', text: 'cta.software.text' },
  educacao: { service: 'palestras', title: 'cta.educacao.title', text: 'cta.educacao.text' },
};

/** O campo `service` do artigo vence o padrão da categoria. */
export function articleCta(category: CategoryKey, service?: ServiceKey): ArticleCta | null {
  const fromCategory = byCategory[category];
  if (service) {
    return fromCategory ? { ...fromCategory, service } : { service, title: 'cta.default.title', text: 'cta.default.text' };
  }
  return fromCategory ?? null;
}

export function articleWhatsappMessage(lang: Lang, title: string, service: ServiceKey): string {
  return t(lang, 'whatsapp.articleMessage', { title, service: t(lang, `service.name.${service}`) });
}
