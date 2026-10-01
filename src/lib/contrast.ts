// Leitura dos tokens de cor e cálculo de contraste WCAG 2.1.

export type ThemeTokens = Record<string, string>;

export interface ParsedTokens {
  themes: Record<string, ThemeTokens>;
  accents: Record<string, Record<string, ThemeTokens>>;
}

const BLOCK = /:root\[data-theme='(\w+)'\](?:\[data-accent='(\w+)'\])?\s*\{([^}]*)\}/g;
const DECLARATION = /--([\w-]+):\s*([^;]+);/g;

export function parseTokens(css: string): ParsedTokens {
  const themes: ParsedTokens['themes'] = {};
  const accents: ParsedTokens['accents'] = {};
  for (const [, theme, accent, body] of css.matchAll(BLOCK)) {
    const vars = Object.fromEntries([...(body ?? '').matchAll(DECLARATION)].map(([, name, value]) => [name, value?.trim() ?? '']));
    if (!theme) continue;
    if (accent) {
      accents[theme] = { ...accents[theme], [accent]: vars };
    } else {
      themes[theme] = vars;
    }
  }
  return { themes, accents };
}

function channel(value: number): number {
  const v = value / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match?.[1]) throw new Error(`Cor inválida para contraste: ${hex}`);
  const n = parseInt(match[1], 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}
