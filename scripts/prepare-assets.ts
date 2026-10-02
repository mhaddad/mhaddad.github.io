// Prepara as imagens da Onda 4 e grava em src/assets/ (versionadas no repositório).
// Roda só em desenvolvimento: `npm run assets`. O build e o navegador nunca chamam
// o YouTube; as miniaturas ficam locais.
//
// - Logos (images/*.png do site antigo): recorta a margem branca e grava a versão
//   colorida (Empresas), a máscara de opacidade e a versão colorida sem fundo (faixa da home).
// - Miniaturas: baixa a hqdefault de cada youtubeId de talks.yaml e recorta em 16:9.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import { logoColor, logoMask } from '../src/lib/logo-mask.ts';

const LOGOS = ['webgoal', 'granatum', 'atelie', 'orgganica', 'lumiar', 'alianca', 'guardachuva', 'tugagil'];
const LOGO_WIDTH = 480;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

async function prepareLogos() {
  await mkdir('src/assets/companies/mono', { recursive: true });
  await mkdir('src/assets/companies/color', { recursive: true });
  for (const id of LOGOS) {
    const trimmed = await sharp(`images/${id}.png`)
      .flatten({ background: '#ffffff' })
      .trim({ background: '#ffffff', threshold: 12 })
      .resize({ width: LOGO_WIDTH, withoutEnlargement: true })
      .ensureAlpha()
      .toBuffer();
    await sharp(trimmed).png().toFile(`src/assets/companies/${id}.png`);

    const { data, info } = await sharp(trimmed).raw().toBuffer({ resolveWithObject: true });
    await sharp(Buffer.from(logoMask(new Uint8Array(data))), {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toFile(`src/assets/companies/mono/${id}.png`);
    await sharp(Buffer.from(logoColor(new Uint8Array(data))), {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toFile(`src/assets/companies/color/${id}.png`);
    console.log(`logo ${id}: ${info.width}×${info.height}`);
  }
}

async function prepareThumbnails() {
  await mkdir('src/assets/talks', { recursive: true });
  const yaml = await readFile('src/content/talks/talks.yaml', 'utf8');
  const ids = [...yaml.matchAll(/^\s*youtubeId:\s*(\S+)\s*$/gm)].map((match) => match[1]);
  for (const id of ids) {
    if (!YOUTUBE_ID.test(id)) throw new Error(`youtubeId inválido: ${id}`);
    const target = `src/assets/talks/${id}.jpg`;
    if (existsSync(target)) continue;
    const response = await fetch(`https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
    if (!response.ok) {
      console.warn(`miniatura ${id}: HTTP ${response.status}, item precisa sair do talks.yaml`);
      continue;
    }
    // A hqdefault é 480×360 com faixas pretas; o recorte central dá 480×270 (16:9).
    const image = await sharp(Buffer.from(await response.arrayBuffer()))
      .extract({ left: 0, top: 45, width: 480, height: 270 })
      .jpeg({ quality: 82 })
      .toBuffer();
    await writeFile(target, image);
    console.log(`miniatura ${id}`);
  }
}

await prepareLogos();
await prepareThumbnails();
