/*
 * Fundo animado da primeira dobra da home: uma superfície de ondas feita de
 * pontos cinza, vista em perspectiva, que ocupa toda a altura do hero e passa por
 * trás do texto. As coordenadas de tela são normalizadas (0 a 1) e convertidas
 * para pixels só no desenho.
 */

export const LINES = 42;
const AMPLITUDE = 0.2;
const DOT_SPACING_PX = { far: 5, near: 12 };
const DOT_SIZE_PX = { far: 1, near: 2.4 };
const BUMP_HEIGHT = 0.06;
const BUMP_RADIUS = 0.15;

export interface Point {
  x: number;
  y: number;
}

export interface SurfacePoint {
  y: number;
  shade: number;
}

/** Profundidade da linha: 0 é a mais distante (alto da tela), 1 a mais próxima. */
export function lineDepth(line: number): number {
  return line / (LINES - 1);
}

/**
 * Altura de repouso da linha na tela. As linhas se juntam no fundo e se abrem na
 * frente, como um plano visto em perspectiva. As das pontas passam um pouco da
 * borda (o canvas corta o excesso), para a onda cobrir a altura toda.
 */
export function lineBase(line: number): number {
  return -0.1 + 1.35 * lineDepth(line) ** 1.35;
}

/**
 * Ponto da superfície na coluna `x` da tela, na linha `line`, no instante `time`
 * (segundos). A coluna é convertida para o mundo com a abertura da perspectiva;
 * duas ondas em direções diagonais diferentes formam as cristas, e a altura cresce
 * com a proximidade. `shade` (0,2 a 1) acende as cristas e apaga os vales.
 */
export function surfacePoint(x: number, line: number, time: number): SurfacePoint {
  const depth = lineDepth(line);
  const spread = 0.6 + 0.9 * depth;
  const worldX = 0.5 + (x - 0.5) / spread;
  const worldZ = depth * 2.2;
  const height =
    Math.sin(Math.PI * 2 * (worldX * 1.1 + worldZ * 0.45) + time * 0.6) * 0.65 +
    Math.sin(Math.PI * 2 * (worldX * 0.5 - worldZ * 0.7) - time * 0.4) * 0.35;
  const y = lineBase(line) - height * AMPLITUDE * (0.3 + 0.7 * depth);
  const shade = 0.2 + 0.8 * ((height + 1) / 2) ** 1.5;
  return { y, shade };
}

/** Opacidade de cada linha: as do fundo somem, as da frente aparecem mais. */
export function lineAlpha(line: number): number {
  return 0.15 + 0.6 * lineDepth(line);
}

/** Deformação causada pelo cursor: levanta a onda (y negativo) perto dele. */
export function pointerBump(x: number, y: number, pointer: Point | null): number {
  if (!pointer) return 0;
  const distance = (x - pointer.x) ** 2 + (y - pointer.y) ** 2;
  return -BUMP_HEIGHT * Math.exp(-distance / (BUMP_RADIUS * BUMP_RADIUS));
}

/** Liga o fundo a um <canvas>. Só roda no navegador. */
export function startHeroField(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  if (!context) return;

  const root = document.documentElement;
  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  // O cursor age a partir de qualquer ponto da primeira dobra.
  const area = canvas.closest('section') ?? canvas;
  let width = 0;
  let height = 0;
  let target: Point | null = null;
  let pointer: Point | null = null;
  let visible = true;
  let frame = 0;
  let color = currentColor();

  function currentColor() {
    return getComputedStyle(root).getPropertyValue('--text-muted').trim();
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context!.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  // O cursor é seguido com atraso, para a onda acompanhar sem tremer.
  function follow() {
    if (!target) {
      pointer = null;
      return;
    }
    pointer = pointer
      ? { x: pointer.x + (target.x - pointer.x) * 0.08, y: pointer.y + (target.y - pointer.y) * 0.08 }
      : { ...target };
  }

  function draw(time: number) {
    const seconds = time / 1000;
    const ctx = context!;
    ctx.clearRect(0, 0, width, height);
    if (width === 0 || height === 0) return;

    ctx.fillStyle = color;

    for (let line = 0; line < LINES; line++) {
      const depth = lineDepth(line);
      const alpha = lineAlpha(line);
      const spacing = DOT_SPACING_PX.far + (DOT_SPACING_PX.near - DOT_SPACING_PX.far) * depth;
      const size = DOT_SIZE_PX.far + (DOT_SIZE_PX.near - DOT_SIZE_PX.far) * depth;
      const half = size / 2;
      for (let px = 0; px <= width; px += spacing) {
        const x = px / width;
        const point = surfacePoint(x, line, seconds);
        const py = (point.y + pointerBump(x, point.y, pointer)) * height;
        ctx.globalAlpha = alpha * point.shade;
        ctx.fillRect(px - half, py - half, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(time: number) {
    follow();
    draw(time);
    frame = requestAnimationFrame(loop);
  }

  function sync() {
    cancelAnimationFrame(frame);
    if (still.matches) {
      draw(0);
    } else if (visible && !document.hidden) {
      frame = requestAnimationFrame(loop);
    }
  }

  new ResizeObserver(() => {
    resize();
    if (still.matches) draw(0);
  }).observe(canvas);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(canvas);

  new MutationObserver(() => {
    color = currentColor();
    if (still.matches) draw(0);
  }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  document.addEventListener('visibilitychange', sync);
  still.addEventListener('change', sync);

  area.addEventListener('pointermove', (event) => {
    if ((event as PointerEvent).pointerType !== 'mouse') return;
    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = event as PointerEvent;
    target = { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
  });
  area.addEventListener('pointerleave', () => {
    target = null;
  });

  resize();
  sync();
}
