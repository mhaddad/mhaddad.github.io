import type { CategoryKey } from '../i18n/categories';

// Padrões geométricos por categoria (Figma Make, GeometricPattern.tsx), como SVG em texto.
// O mesmo SVG serve ao componente GeometricPattern e às imagens OG.
const VIEWBOX = '0 0 400 260';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const shapes: Record<CategoryKey, (c: string) => string> = {
  gestao: (c) =>
    range(5)
      .map((i) => `<rect x="${40 + i * 70}" y="40" width="50" height="180" rx="1" fill="none" stroke="${c}" stroke-width="1.5" opacity="${(0.15 + i * 0.1).toFixed(2)}"/>`)
      .join('') +
    `<line x1="40" y1="130" x2="360" y2="130" stroke="${c}" stroke-width="1.5" opacity="0.3"/>` +
    `<rect x="160" y="80" width="80" height="100" rx="1" fill="${c}" opacity="0.08"/>` +
    `<line x1="200" y1="40" x2="200" y2="220" stroke="${c}" stroke-width="2" opacity="0.4"/>`,
  coerencia: (c) =>
    [60, 130, 200, 270, 340]
      .map((cx, i) => `<circle cx="${cx}" cy="130" r="${20 + i * 8}" fill="none" stroke="${c}" stroke-width="1.5" opacity="${(0.08 + i * 0.06).toFixed(2)}"/>`)
      .join('') +
    `<circle cx="200" cy="130" r="8" fill="${c}" opacity="0.5"/>` +
    `<line x1="200" y1="40" x2="200" y2="220" stroke="${c}" stroke-width="1" opacity="0.2" stroke-dasharray="4 4"/>` +
    `<line x1="40" y1="130" x2="360" y2="130" stroke="${c}" stroke-width="1" opacity="0.2" stroke-dasharray="4 4"/>`,
  ai: (c) =>
    [[200, 60], [100, 150], [200, 150], [300, 150], [150, 230], [250, 230]]
      .map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="6" fill="${c}" opacity="${(0.3 + i * 0.08).toFixed(2)}"/>`)
      .join('') +
    [[200, 60, 100, 150], [200, 60, 200, 150], [200, 60, 300, 150], [100, 150, 150, 230], [200, 150, 150, 230], [200, 150, 250, 230], [300, 150, 250, 230]]
      .map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="1.5" opacity="0.25"/>`)
      .join('') +
    `<circle cx="200" cy="130" r="40" fill="none" stroke="${c}" stroke-width="1" opacity="0.12" stroke-dasharray="3 3"/>`,
  software: (c) =>
    range(6)
      .map((i) => `<line x1="0" y1="${40 + i * 36}" x2="400" y2="${40 + i * 36}" stroke="${c}" stroke-width="1" opacity="0.1"/>`)
      .join('') +
    `<rect x="60" y="80" width="120" height="20" rx="1" fill="${c}" opacity="0.15"/>` +
    `<rect x="60" y="116" width="80" height="20" rx="1" fill="${c}" opacity="0.1"/>` +
    `<rect x="60" y="152" width="180" height="20" rx="1" fill="${c}" opacity="0.1"/>` +
    `<rect x="60" y="188" width="60" height="20" rx="1" fill="${c}" opacity="0.2"/>`,
  educacao: (c) =>
    ['200,50 320,130 200,130', '200,130 320,130 260,210', '80,130 200,50 200,130', '80,130 200,130 140,210']
      .map((points, i) => `<polygon points="${points}" fill="none" stroke="${c}" stroke-width="1.5" opacity="${i % 2 === 0 ? 0.2 : 0.15}"/>`)
      .join('') +
    `<circle cx="200" cy="130" r="12" fill="${c}" opacity="0.3"/>` +
    [[200, 50], [320, 130], [80, 130], [260, 210], [140, 210]]
      .map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="6" fill="${c}" opacity="0.2"/>`)
      .join(''),
  hobbies: (c) =>
    range(4)
      .map((i) => `<rect x="${60 + i * 80}" y="${60 + (i % 2) * 40}" width="60" height="60" rx="1" fill="none" stroke="${c}" stroke-width="1.5" opacity="${(0.1 + i * 0.08).toFixed(2)}" transform="rotate(${i * 15}, ${90 + i * 80}, ${90 + (i % 2) * 40})"/>`)
      .join('') +
    `<circle cx="200" cy="140" r="30" fill="${c}" opacity="0.06"/>` +
    `<line x1="100" y1="200" x2="300" y2="200" stroke="${c}" stroke-width="1.5" opacity="0.2"/>`,
};

export function patternSvg(category: CategoryKey, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${shapes[category](color)}</svg>`;
}
