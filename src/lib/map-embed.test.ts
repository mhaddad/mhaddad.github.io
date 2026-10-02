import { describe, expect, it } from 'vitest';
import { MAP_EMBED_SRC, langOf, mapEmbedPlugin, mapFacade, mapViewerUrl, parseMapIframe, type HastNode } from './map-embed';

const MID = '1sET9YDELCtNMjR9M6hGqK8ml2iroXGg';
const SRC = `https://www.google.com/maps/d/embed?mid=${MID}`;

const find = (node: HastNode, tag: string): HastNode[] =>
  (node.children ?? []).flatMap((child) => [...(child.tagName === tag ? [child] : []), ...find(child, tag)]);
const text = (node: HastNode): string => (node.value ?? '') + (node.children ?? []).map(text).join('');

describe('MAP_EMBED_SRC', () => {
  it('deve aceitar só o embed do My Maps com o identificador do mapa', () => {
    expect(MAP_EMBED_SRC.test(SRC)).toBe(true);
    expect(MAP_EMBED_SRC.test('https://www.google.com/maps/d/embed')).toBe(false);
    expect(MAP_EMBED_SRC.test(`${SRC}&x=1`)).toBe(false);
    expect(MAP_EMBED_SRC.test('https://www.youtube.com/embed/abc')).toBe(false);
  });
});

describe('mapViewerUrl', () => {
  it('deve trocar embed por viewer quando monta o link para abrir o mapa', () => {
    expect(mapViewerUrl(SRC)).toBe(`https://www.google.com/maps/d/viewer?mid=${MID}`);
  });
});

describe('parseMapIframe', () => {
  it('deve devolver o endereço e o título quando o bloco é só o iframe do mapa', () => {
    expect(parseMapIframe(`<iframe src="${SRC}" title="Mapa da rota"></iframe>`)).toEqual({ src: SRC, title: 'Mapa da rota' });
    expect(parseMapIframe(`\n<iframe src="${SRC}"></iframe>\n`)).toEqual({ src: SRC, title: undefined });
  });

  it('deve recusar quando o iframe não é de mapa ou o bloco tem mais coisa junto', () => {
    expect(parseMapIframe('<iframe src="https://www.youtube-nocookie.com/embed/abc123"></iframe>')).toBeUndefined();
    expect(parseMapIframe(`<iframe src="${SRC}"></iframe>\n<p>texto</p>`)).toBeUndefined();
    expect(parseMapIframe('<div>texto</div>')).toBeUndefined();
  });
});

describe('mapFacade', () => {
  it('deve montar o bloco com botão e link para abrir o mapa, em português', () => {
    // Act
    const figure = mapFacade({ src: SRC, title: 'Mapa da rota' }, 'pt');

    // Assert
    expect(figure.properties).toMatchObject({ className: ['map-embed'], dataMapEmbed: '', dataSrc: SRC, dataTitle: 'Mapa da rota' });
    expect(text(find(figure, 'button')[0])).toBe('Carregar mapa interativo');
    expect(find(figure, 'iframe')).toHaveLength(0);
    const [link] = find(figure, 'a');
    expect(link.properties).toMatchObject({ href: `https://www.google.com/maps/d/viewer?mid=${MID}`, target: '_blank', rel: 'noopener' });
    expect(text(link)).toBe('Abrir no Google Maps');
  });

  it('deve usar os textos em inglês e o título padrão quando o artigo é em inglês e o iframe não tem título', () => {
    // Act
    const figure = mapFacade({ src: SRC }, 'en');

    // Assert
    expect(text(find(figure, 'button')[0])).toBe('Load interactive map');
    expect(text(find(figure, 'a')[0])).toBe('Open in Google Maps');
    expect(figure.properties?.dataTitle).toBe('Interactive map');
  });
});

describe('langOf', () => {
  it('deve achar o idioma pela pasta do artigo', () => {
    expect(langOf(new URL('file:///p/src/content/articles/en/rota.md'))).toBe('en');
    expect(langOf(new URL('file:///p/src/content/articles/pt/rota.md'))).toBe('pt');
    expect(langOf(undefined)).toBe('pt');
  });
});

describe('mapEmbedPlugin', () => {
  const replaced: HastNode[] = [];
  const ctx = { replaceNode: (_node: HastNode, replacement: HastNode) => void replaced.push(replacement) };

  it('deve trocar o nó de HTML bruto quando ele é um iframe do mapa', () => {
    // Arrange
    replaced.length = 0;
    const plugin = mapEmbedPlugin({ fileURL: new URL('file:///p/src/content/articles/en/rota.md') });

    // Act
    plugin.raw({ type: 'raw', value: `<iframe src="${SRC}" title="Route map"></iframe>` }, ctx);

    // Assert
    expect(replaced).toHaveLength(1);
    expect(text(find(replaced[0], 'button')[0])).toBe('Load interactive map');
  });

  it('deve deixar o HTML bruto como está quando não é um mapa', () => {
    // Arrange
    replaced.length = 0;
    const plugin = mapEmbedPlugin({ fileURL: undefined });

    // Act
    plugin.raw({ type: 'raw', value: '<iframe src="https://www.youtube-nocookie.com/embed/abc123"></iframe>' }, ctx);

    // Assert
    expect(replaced).toHaveLength(0);
  });
});
