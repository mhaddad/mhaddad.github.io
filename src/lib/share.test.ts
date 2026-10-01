import { describe, expect, it } from 'vitest';
import { shareUrl } from './share';

describe('shareUrl', () => {
  it('deve montar o link do LinkedIn com a URL canônica codificada quando a rede é linkedin', () => {
    // Arrange
    const url = 'https://matheushaddad.com/artigos/meu-artigo/';

    // Act
    const link = shareUrl('linkedin', url, 'Título');

    // Assert
    expect(link).toBe(
      'https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fmatheushaddad.com%2Fartigos%2Fmeu-artigo%2F',
    );
  });

  it('deve montar o link do WhatsApp com título e URL quando a rede é whatsapp', () => {
    // Arrange
    const url = 'https://matheushaddad.com/en/articles/my-article/';

    // Act
    const link = shareUrl('whatsapp', url, 'AI & power');

    // Assert
    expect(link).toBe('https://wa.me/?text=AI%20%26%20power%20https%3A%2F%2Fmatheushaddad.com%2Fen%2Farticles%2Fmy-article%2F');
  });
});
