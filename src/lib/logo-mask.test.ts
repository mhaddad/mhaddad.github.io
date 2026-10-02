import { describe, expect, it } from 'vitest';
import { logoMask } from './logo-mask';

const pixel = (r: number, g: number, b: number, a = 255) => new Uint8Array([r, g, b, a]);
const alphaOf = (r: number, g: number, b: number, a = 255) => logoMask(pixel(r, g, b, a))[3];

describe('logoMask', () => {
  it('deve tornar transparente o fundo branco quando recebe um pixel branco', () => {
    expect(alphaOf(255, 255, 255)).toBe(0);
  });

  it('deve deixar opaco o traço escuro quando recebe um pixel preto ou cinza-escuro', () => {
    expect(alphaOf(0, 0, 0)).toBe(255);
    expect(alphaOf(68, 68, 68)).toBe(255);
  });

  it('deve manter visível uma cor clara e saturada quando recebe o amarelo da Lumiar', () => {
    expect(alphaOf(253, 185, 19)).toBeGreaterThan(200);
  });

  it('deve zerar o ruído quase branco quando recebe um pixel de compressão', () => {
    expect(alphaOf(250, 250, 248)).toBe(0);
  });

  it('deve respeitar a transparência original quando o pixel já é transparente', () => {
    expect(alphaOf(0, 0, 0, 0)).toBe(0);
    expect(alphaOf(0, 0, 0, 128)).toBe(128);
  });

  it('deve pintar a cor de preto e manter o tamanho quando recebe vários pixels', () => {
    const result = logoMask(new Uint8Array([10, 20, 30, 255, 255, 255, 255, 255]));
    expect(result).toHaveLength(8);
    expect([...result.slice(0, 3), ...result.slice(4, 7)]).toEqual([0, 0, 0, 0, 0, 0]);
  });
});
