// Gera favicon.ico (16, 32 e 48 px) e apple-touch-icon.png (180 px) a partir de public/favicon.svg.
// Roda só em desenvolvimento: `npm run favicon`.
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const ICO_SIZES = [16, 32, 48];
const APPLE_SIZE = 180;
const SVG_SIZE = 64;

const svg = await readFile('public/favicon.svg');
// A densidade escala o SVG antes do resize, para o desenho sair nítido em qualquer tamanho.
const render = (size: number) =>
  sharp(svg, { density: (72 * size * 4) / SVG_SIZE }).resize(size, size).png().toBuffer();

// ICO com imagens PNG embutidas: cabeçalho (6 bytes) + um diretório de 16 bytes por imagem + os dados.
const images = await Promise.all(ICO_SIZES.map(render));
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = header.length + images.length * 16;
const directory = images.map((image, index) => {
  const entry = Buffer.alloc(16);
  entry[0] = ICO_SIZES[index];
  entry[1] = ICO_SIZES[index];
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += image.length;
  return entry;
});
await writeFile('public/favicon.ico', Buffer.concat([header, ...directory, ...images]));
await writeFile('public/apple-touch-icon.png', await render(APPLE_SIZE));
console.log(`favicon.ico (${ICO_SIZES.join(', ')} px) e apple-touch-icon.png (${APPLE_SIZE} px)`);
