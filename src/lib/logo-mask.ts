// Converte um logo colorido sobre fundo branco numa máscara de opacidade.
// A "tinta" de cada pixel é a distância dele até o branco (1 - menor canal), e não
// a luminância: assim cores claras e saturadas, como o amarelo da Lumiar, continuam
// visíveis. O resultado é preto com alpha, para usar como mask-image no CSS.

const CONTRAST = 1.6;
const NOISE_FLOOR = 0.08;

export function logoMask(rgba: Uint8Array): Uint8Array {
  const result = new Uint8Array(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    const ink = 1 - Math.min(rgba[i], rgba[i + 1], rgba[i + 2]) / 255;
    const strength = ink < NOISE_FLOOR ? 0 : Math.min(1, ink * CONTRAST);
    result[i + 3] = Math.round(strength * rgba[i + 3]);
  }
  return result;
}
