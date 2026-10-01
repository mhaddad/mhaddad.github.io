import { describe, expect, it } from 'vitest';
import { pageWhatsappMessage, whatsappUrl } from './whatsapp';

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

describe('pageWhatsappMessage', () => {
  it('deve citar a página de origem quando recebe o título da página', () => {
    // Arrange
    const title = 'Coerência Cognitiva: quando a forma de pensar, decidir e agir encontra a forma de trabalhar';

    // Act
    const pt = pageWhatsappMessage('pt', title);
    const en = pageWhatsappMessage('en', 'Articles');

    // Assert
    expect(pt).toBe(`Olá, Matheus! Vim pela página "${title}" do seu site e gostaria de conversar.`);
    expect(en).toBe('Hi Matheus! I came from the "Articles" page on your website and would like to talk.');
  });

  it('deve usar a mensagem genérica quando a página não tem título próprio', () => {
    // Arrange
    const title = undefined;

    // Act
    const message = pageWhatsappMessage('pt', title);

    // Assert
    expect(message).toBe('Olá, Matheus! Vim pelo seu site e gostaria de conversar.');
  });

  it('deve gerar URL válida quando o título tem aspas, & e #', () => {
    // Arrange
    const message = pageWhatsappMessage('en', 'Q&A #1 "AI"');

    // Act
    const url = new URL(whatsappUrl(message));

    // Assert
    expect(url.searchParams.get('text')).toBe(message);
    expect(url.hash).toBe('');
  });
});
