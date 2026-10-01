import { describe, expect, it } from 'vitest';
import { gaEventAttrs, parseGaParams } from './analytics';

describe('gaEventAttrs', () => {
  it('deve gerar os atributos data-ga-* com parâmetros em JSON quando recebe um evento', () => {
    // Arrange
    const params = { from: 'pt', to: 'en' };

    // Act
    const attrs = gaEventAttrs('language_switch', params);

    // Assert
    expect(attrs).toEqual({
      'data-ga-event': 'language_switch',
      'data-ga-params': '{"from":"pt","to":"en"}',
    });
  });
});

describe('parseGaParams', () => {
  it('deve ler os parâmetros quando o texto veio de gaEventAttrs', () => {
    // Arrange
    const raw = gaEventAttrs('share', { network: 'linkedin' })['data-ga-params'];

    // Act
    const params = parseGaParams(raw);

    // Assert
    expect(params).toEqual({ network: 'linkedin' });
  });

  it('deve devolver objeto vazio quando a entrada é ausente, inválida ou não é objeto', () => {
    // Arrange
    const inputs = [undefined, '', '{quebrado', '[1,2]', 'null', '"texto"'];

    // Act
    const results = inputs.map(parseGaParams);

    // Assert
    expect(results).toEqual([{}, {}, {}, {}, {}, {}]);
  });

  it('deve descartar valores quando eles não são texto', () => {
    // Arrange
    const raw = '{"ok":"sim","numero":1,"objeto":{}}';

    // Act
    const params = parseGaParams(raw);

    // Assert
    expect(params).toEqual({ ok: 'sim' });
  });
});
