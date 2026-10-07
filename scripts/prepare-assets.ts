// Prepara as imagens da Onda 4 e grava em src/assets/ (versionadas no repositório).
// Roda só em desenvolvimento: `npm run assets`. O build e o navegador nunca chamam
// o YouTube; as miniaturas ficam locais.
//
// - Logos (scripts/logos/*.png, os originais do site antigo): recorta a margem branca e grava a versão
//   colorida (Empresas) e a máscara de opacidade (faixa de prova da home).
// - Miniaturas: baixa a hqdefault de cada youtubeId de talks.yaml e recorta em 16:9.
// - Capas dos episódios do Spotify: pega a imagem pelo oEmbed público de cada spotifyId.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import { logoMask } from '../src/lib/logo-mask.ts';

const LOGOS = ['webgoal', 'granatum', 'atelie', 'orgganica', 'lumiar', 'alianca', 'guardachuva', 'tugagil'];
const LOGO_WIDTH = 480;
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

async function prepareLogos() {
  await mkdir('src/assets/companies/mono', { recursive: true });
  for (const id of LOGOS) {
    const trimmed = await sharp(`scripts/logos/${id}.png`)
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
    console.log(`logo ${id}: ${info.width}×${info.height}`);
  }
}

// Retrato recortado no rosto, para a moldura redonda do bloco "Quem escreve" (64 px, até 128 px na tela).
// A foto inteira (src/assets/matheus-haddad.jpg) fica para a página Sobre.
const FACE_CROP = { left: 215, top: 10, width: 760, height: 760 };
const FACE_SIZE = 256;

async function prepareFace() {
  await sharp('src/assets/matheus-haddad.jpg')
    .extract(FACE_CROP)
    .resize(FACE_SIZE, FACE_SIZE)
    .jpeg({ quality: 88 })
    .toFile('src/assets/matheus-haddad-rosto.jpg');
  console.log(`rosto: ${FACE_SIZE}×${FACE_SIZE}`);
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

const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;

async function prepareSpotifyCovers() {
  const yaml = await readFile('src/content/talks/talks.yaml', 'utf8');
  const ids = [...yaml.matchAll(/^\s*spotifyId:\s*(\S+)\s*$/gm)].map((match) => match[1]);
  for (const id of ids) {
    if (!SPOTIFY_ID.test(id)) throw new Error(`spotifyId inválido: ${id}`);
    const target = `src/assets/talks/${id}.jpg`;
    if (existsSync(target)) continue;
    const oembed = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/episode/${id}`)}`);
    if (!oembed.ok) {
      console.warn(`capa ${id}: oEmbed HTTP ${oembed.status}, o card fica com o desenho padrão`);
      continue;
    }
    const { thumbnail_url: url } = (await oembed.json()) as { thumbnail_url?: string };
    // Só imagens do CDN do Spotify, por https.
    if (!url || !/^https:\/\/[a-z0-9.-]+\.spotifycdn\.com\//.test(url)) {
      console.warn(`capa ${id}: sem imagem utilizável, o card fica com o desenho padrão`);
      continue;
    }
    const image = await fetch(url);
    if (!image.ok) {
      console.warn(`capa ${id}: imagem HTTP ${image.status}, o card fica com o desenho padrão`);
      continue;
    }
    await writeFile(target, await sharp(Buffer.from(await image.arrayBuffer())).jpeg({ quality: 88 }).toBuffer());
    console.log(`capa do Spotify ${id}`);
  }
}

await prepareLogos();
await prepareFace();
await prepareThumbnails();
await prepareSpotifyCovers();
