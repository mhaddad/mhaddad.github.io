import { describe, expect, it } from 'vitest';
import { articleCta, articleWhatsappMessage } from './cta';

describe('articleCta', () => {
  it('deve levar à consultoria quando o artigo é de gestão, coerência ou AI', () => {
    // Arrange
    const categories = ['gestao', 'coerencia', 'ai'] as const;

    // Act
    const services = categories.map((category) => articleCta(category)?.service);

    // Assert
    expect(services).toEqual(['consultoria', 'consultoria', 'consultoria']);
  });

  it('deve levar à mentoria em software e às palestras em educação quando o artigo não define serviço', () => {
    // Arrange
    const categories = ['software', 'educacao'] as const;

    // Act
    const ctas = categories.map((category) => articleCta(category));

    // Assert
    expect(ctas).toEqual([
      { service: 'mentoria', title: 'cta.software.title', text: 'cta.software.text' },
      { service: 'palestras', title: 'cta.educacao.title', text: 'cta.educacao.text' },
    ]);
  });

  it('deve omitir a chamada quando o artigo é de hobbies e não define serviço', () => {
    // Arrange
    const category = 'hobbies' as const;

    // Act
    const cta = articleCta(category);

    // Assert
    expect(cta).toBeNull();
  });

  it('deve usar o serviço do artigo com os textos da categoria quando o artigo define service', () => {
    // Arrange
    const category = 'gestao' as const;

    // Act
    const cta = articleCta(category, 'mentoria');

    // Assert
    expect(cta).toEqual({ service: 'mentoria', title: 'cta.gestao.title', text: 'cta.gestao.text' });
  });

  it('deve usar os textos padrão quando a categoria não tem chamada mas o artigo define service', () => {
    // Arrange
    const category = 'hobbies' as const;

    // Act
    const cta = articleCta(category, 'palestras');

    // Assert
    expect(cta).toEqual({ service: 'palestras', title: 'cta.default.title', text: 'cta.default.text' });
  });
});

describe('articleWhatsappMessage', () => {
  it('deve citar o título do artigo e o serviço no idioma quando monta a mensagem', () => {
    // Arrange
    const title = 'A IA muda quase tudo na sua empresa, menos o jogo de poder';

    // Act
    const pt = articleWhatsappMessage('pt', title, 'consultoria');
    const en = articleWhatsappMessage('en', 'AI & power', 'palestras');

    // Assert
    expect(pt).toBe(
      'Olá, Matheus! Li o artigo "A IA muda quase tudo na sua empresa, menos o jogo de poder" no seu site e gostaria de conversar sobre consultoria.',
    );
    expect(en).toBe('Hi Matheus! I read the article "AI & power" on your website and would like to talk about talks and workshops.');
  });
});
