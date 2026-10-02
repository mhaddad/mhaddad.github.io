import { describe, expect, it } from 'vitest';
import { isMapEmbedSrc, langOf, mapEmbed, mapEmbedPlugin, mapViewerUrl, parseMapIframe, type HastNode } from './map-embed';

const MID = '1sET9YDELCtNMjR9M6hGqK8ml2iroXGg';
const MY_MAPS = `https://www.google.com/maps/d/embed?mid=${MID}`;
const PLACE = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1!2d-46.65!3d-23.56!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c8da0aa315%3A0xd59f9431f2c9776a!2sS%C3%A3o%20Paulo!5e0!3m2!1spt-BR!2sbr!4v1690000000000';

const find = (node: HastNode, tag: string): HastNode[] =>
  (node.children ?? []).flatMap((child) => [...(child.tagName === tag ? [child] : []), ...find(child, tag)]);
const text = (node: HastNode): string => (node.value ?? '') + (node.children ?? []).map(text).join('');

describe('isMapEmbedSrc', () => {
  it('deve aceitar o embed do My Maps e o embed padrão do Google Maps', () => {
    expect(isMapEmbedSrc(MY_MAPS)).toBe(true);
    expect(isMapEmbedSrc(PLACE)).toBe(true);
  });

  it('deve recusar endereços incompletos, com parâmetros extras ou de outros domínios', () => {
    expect(isMapEmbedSrc('https://www.google.com/maps/d/embed')).toBe(false);
    expect(isMapEmbedSrc('https://www.google.com/maps/embed')).toBe(false);
    expect(isMapEmbedSrc(`${MY_MAPS}&x=1`)).toBe(false);
    expect(isMapEmbedSrc(`${PLACE}"onload="x`)).toBe(false);
    expect(isMapEmbedSrc('https://www.google.com.evil.com/maps/d/embed?mid=abc')).toBe(false);
    expect(isMapEmbedSrc('http://www.google.com/maps/d/embed?mid=abc')).toBe(false);
    expect(isMapEmbedSrc('https://www.youtube.com/embed/abc')).toBe(false);
  });
});

describe('mapViewerUrl', () => {
  it('deve montar o link para abrir o My Maps em tela cheia', () => {
    expect(mapViewerUrl(MY_MAPS)).toBe(`https://www.google.com/maps/d/viewer?mid=${MID}`);
  });

  it('deve devolver nada quando o embed é o padrão do Google Maps, que não tem página própria', () => {
    expect(mapViewerUrl(PLACE)).toBeUndefined();
  });
});

describe('parseMapIframe', () => {
  it('deve devolver o endereço e o título quando o bloco é só o iframe do mapa', () => {
    expect(parseMapIframe(`<iframe src="${MY_MAPS}" title="Mapa da rota"></iframe>`)).toEqual({ src: MY_MAPS, title: 'Mapa da rota' });
    expect(parseMapIframe(`\n<iframe src="${PLACE}"></iframe>\n`)).toEqual({ src: PLACE, title: undefined });
  });

  it('deve aceitar o iframe do jeito que o Google gera, com largura, altura e outros atributos', () => {
    // Arrange
    const html = `<iframe src="${PLACE}" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

    // Act
    const map = parseMapIframe(html);

    // Assert
    expect(map).toEqual({ src: PLACE, title: undefined });
  });

  it('deve recusar quando o iframe não é de mapa ou o bloco tem mais coisa junto', () => {
    expect(parseMapIframe('<iframe src="https://www.youtube-nocookie.com/embed/abc123"></iframe>')).toBeUndefined();
    expect(parseMapIframe(`<iframe src="${MY_MAPS}"></iframe>\n<p>texto</p>`)).toBeUndefined();
    expect(parseMapIframe('<div>texto</div>')).toBeUndefined();
  });
});

describe('mapEmbed', () => {
  it('deve montar o mapa com carregamento preguiçoso e link para abrir o My Maps, em português', () => {
    // Act
    const figure = mapEmbed({ src: MY_MAPS, title: 'Mapa da rota' }, 'pt');

    // Assert
    expect(figure.properties).toMatchObject({ className: ['map-embed'] });
    const [iframe] = find(figure, 'iframe');
    expect(iframe.properties).toMatchObject({
      src: MY_MAPS,
      title: 'Mapa da rota',
      loading: 'lazy',
      referrerPolicy: 'strict-origin-when-cross-origin',
      allowFullScreen: true,
    });
    const [link] = find(figure, 'a');
    expect(link.properties).toMatchObject({ href: `https://www.google.com/maps/d/viewer?mid=${MID}`, target: '_blank', rel: 'noopener' });
    expect(text(link)).toBe('Abrir no Google Maps');
  });

  it('deve usar o título padrão em inglês e omitir o link quando o embed é o padrão do Google Maps', () => {
    // Act
    const figure = mapEmbed({ src: PLACE }, 'en');

    // Assert
    expect(find(figure, 'iframe')[0].properties?.title).toBe('Interactive map');
    expect(find(figure, 'a')).toHaveLength(0);
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

  it('deve trocar o nó de HTML bruto quando ele é um iframe de mapa', () => {
    // Arrange
    replaced.length = 0;
    const plugin = mapEmbedPlugin({ fileURL: new URL('file:///p/src/content/articles/en/rota.md') });

    // Act
    plugin.raw({ type: 'raw', value: `<iframe src="${MY_MAPS}" title="Route map"></iframe>` }, ctx);

    // Assert
    expect(replaced).toHaveLength(1);
    expect(text(find(replaced[0], 'a')[0])).toBe('Open in Google Maps');
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
