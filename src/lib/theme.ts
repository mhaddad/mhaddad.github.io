export const THEMES = ['dark', 'light'] as const;
export const ACCENTS = ['green', 'yellow', 'blue', 'orange'] as const;
export type Theme = (typeof THEMES)[number];
export type Accent = (typeof ACCENTS)[number];

export const DEFAULT_THEME: Theme = 'dark';
export const DEFAULT_ACCENT: Accent = 'green';
export const THEME_STORAGE_KEY = 'mh-theme';
export const ACCENT_STORAGE_KEY = 'mh-accent';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/**
 * Define tema e cor de destaque no <html> antes da primeira pintura.
 * É serializada com toString() para um script inline, por isso não pode
 * referenciar nada fora do próprio corpo (os valores repetem as constantes
 * acima e os testes garantem que continuam iguais).
 */
export function bootTheme(
  root: { dataset: Record<string, string | undefined> },
  getLocal: () => StorageLike,
  getSession: () => StorageLike,
  random: () => number,
): void {
  var accents = ['green', 'yellow', 'blue', 'orange'];
  var theme = 'dark';
  try {
    var saved = getLocal().getItem('mh-theme');
    if (saved === 'dark' || saved === 'light') theme = saved;
  } catch (e) {
    // Armazenamento bloqueado (navegação privada): mantém o padrão.
  }
  root.dataset.theme = theme;

  var accent = accents[Math.floor(random() * accents.length)] || 'green';
  try {
    var session = getSession();
    var current = session.getItem('mh-accent');
    if (current && accents.indexOf(current) >= 0) {
      accent = current;
    } else {
      session.setItem('mh-accent', accent);
    }
  } catch (e) {
    // Sem sessionStorage: a cor sorteada vale só para esta página.
  }
  root.dataset.accent = accent;
}

export function themeBootScript(): string {
  return `(${bootTheme.toString()})(document.documentElement,function(){return localStorage},function(){return sessionStorage},Math.random);`;
}
