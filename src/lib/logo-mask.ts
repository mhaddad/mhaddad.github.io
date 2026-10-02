// Converte um logo colorido sobre fundo branco numa máscara de opacidade.
// A "tinta" de cada pixel é a distância dele até o branco (1 - menor canal), e não
// a luminância: assim cores claras e saturadas, como o amarelo da Lumiar, continuam
// visíveis. O resultado é preto com alpha, para usar como mask-image no CSS.
// `logoColor` faz o contrário: tira o branco do fundo e mantém as cores do logo.

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

const COLOR_NOISE_FLOOR = 0.04;

// Remove o branco do fundo ("cor para alpha"): a opacidade é a distância até o branco e a cor
// é recomposta sem o branco misturado, então as bordas suavizadas ficam limpas em qualquer fundo.
export function logoColor(rgba: Uint8Array): Uint8Array {
  const result = new Uint8Array(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    const alpha = 1 - Math.min(rgba[i], rgba[i + 1], rgba[i + 2]) / 255;
    if (alpha < COLOR_NOISE_FLOOR) continue;
    for (let channel = 0; channel < 3; channel++) {
      result[i + channel] = Math.round((rgba[i + channel] - 255 * (1 - alpha)) / alpha);
    }
    result[i + 3] = Math.round(alpha * rgba[i + 3]);
  }
  return result;
}
