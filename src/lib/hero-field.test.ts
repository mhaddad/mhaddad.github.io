import { describe, expect, it } from 'vitest';
import { LINES, lineAlpha, lineBase, pointerBump, surfacePoint } from './hero-field';

describe('lineBase', () => {
  it('deve juntar as linhas no fundo e abrir na frente quando percorre as linhas', () => {
    const far = lineBase(1) - lineBase(0);
    const near = lineBase(LINES - 1) - lineBase(LINES - 2);
    expect(far).toBeGreaterThan(0);
    expect(near).toBeGreaterThan(far * 2);
  });

  it('deve passar das duas bordas quando recebe a primeira e a última linha', () => {
    expect(lineBase(0)).toBeLessThan(0);
    expect(lineBase(LINES - 1)).toBeGreaterThan(1);
  });
});

describe('surfacePoint', () => {
  it('deve repetir o ponto quando recebe os mesmos argumentos', () => {
    expect(surfacePoint(0.3, 5, 2.5)).toEqual(surfacePoint(0.3, 5, 2.5));
  });

  it('deve mudar com o tempo quando a superfície ondula', () => {
    expect(surfacePoint(0.3, 20, 0).y).not.toBe(surfacePoint(0.3, 20, 1).y);
  });

  it('deve cobrir a altura toda quando percorre a largura e o tempo', () => {
    for (let x = 0; x <= 1; x += 0.05) {
      for (const time of [0, 3.7, 12.1, 40]) {
        const ys = Array.from({ length: LINES }, (_, line) => surfacePoint(x, line, time).y);
        expect(Math.min(...ys)).toBeLessThan(0.05);
        expect(Math.max(...ys)).toBeGreaterThan(0.95);
      }
    }
  });

  it('deve ondular mais na frente do que no fundo quando percorre a largura', () => {
    const range = (line: number) => {
      const ys: number[] = [];
      for (let x = 0; x <= 1; x += 0.02) ys.push(surfacePoint(x, line, 0).y);
      return Math.max(...ys) - Math.min(...ys);
    };
    expect(range(LINES - 1)).toBeGreaterThan(range(0));
  });

  it('deve manter a luz entre 0,2 e 1 e variar ao longo da linha quando percorre a largura', () => {
    const shades: number[] = [];
    for (let x = 0; x <= 1; x += 0.02) shades.push(surfacePoint(x, 30, 1.5).shade);
    for (const shade of shades) {
      expect(shade).toBeGreaterThanOrEqual(0.2);
      expect(shade).toBeLessThanOrEqual(1);
    }
    expect(Math.max(...shades) - Math.min(...shades)).toBeGreaterThan(0.4);
  });
});

describe('lineAlpha', () => {
  it('deve ficar entre 0 e 1 e crescer para as linhas da frente quando percorre as linhas', () => {
    const values = Array.from({ length: LINES }, (_, line) => lineAlpha(line));
    for (const value of values) {
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThanOrEqual(1);
    }
    expect(values[LINES - 1]).toBeGreaterThan(values[0]);
  });
});

describe('pointerBump', () => {
  it('deve levantar a onda quando o cursor está em cima do ponto', () => {
    expect(pointerBump(0.5, 0.5, { x: 0.5, y: 0.5 })).toBeLessThan(0);
  });

  it('deve ser zero quando o cursor está ausente ou longe', () => {
    expect(pointerBump(0.5, 0.5, null)).toBe(0);
    expect(Math.abs(pointerBump(0.05, 0.05, { x: 0.95, y: 0.95 }))).toBeLessThan(1e-6);
  });
});
