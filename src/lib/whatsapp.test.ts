import { describe, expect, it } from 'vitest';
import { whatsappUrl } from './whatsapp';

describe('whatsappUrl', () => {
  it('deve apontar para o número real com a mensagem codificada quando recebe um texto', () => {
    // Arrange
    const message = 'Olá, Matheus! Vim pelo seu site & gostaria de conversar.';

    // Act
    const url = whatsappUrl(message);

    // Assert
    expect(url).toBe(
      'https://wa.me/5535988867870?text=Ol%C3%A1%2C%20Matheus!%20Vim%20pelo%20seu%20site%20%26%20gostaria%20de%20conversar.',
    );
  });
});
