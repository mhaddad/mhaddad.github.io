export const SITE_URL = 'https://matheushaddad.com';
export const SITE_NAME = 'Matheus Haddad';
export const GA_ID = 'G-CPNE8N9WS3';
export const WHATSAPP_NUMBER = '5535988867870';
export const DEFAULT_OG_IMAGE = '/og/default.png';

export interface ExternalLink {
  name: string;
  url: string;
}

// Colunas Social e Links úteis do rodapé. Os nomes não mudam de idioma.
export const SOCIAL_LINKS: ExternalLink[] = [
  { name: 'LinkedIn', url: 'https://www.linkedin.com/in/matheushaddad/' },
  { name: 'Instagram', url: 'https://www.instagram.com/matheushaddad' },
  { name: 'X (Twitter)', url: 'https://x.com/mhaddad' },
];

export const USEFUL_LINKS: ExternalLink[] = [
  { name: 'Feedback Canvas', url: 'https://feedbackcanvas.digital/livro' },
  { name: 'WorkFit.me', url: 'https://po-fit.vercel.app/' },
];
