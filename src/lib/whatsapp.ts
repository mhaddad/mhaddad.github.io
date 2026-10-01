import { WHATSAPP_NUMBER } from '../config';
import { t, type Lang } from '../i18n/ui';

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Mensagem que identifica a página de origem; sem título (home), usa a genérica. */
export function pageWhatsappMessage(lang: Lang, pageTitle?: string): string {
  return pageTitle ? t(lang, 'whatsapp.messageFrom', { page: pageTitle }) : t(lang, 'whatsapp.message');
}
