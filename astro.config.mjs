// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/config.ts';
import { satteri } from '@astrojs/markdown-satteri';
import { mapEmbedPlugin } from './src/lib/map-embed.ts';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  // Mapas do Google nos artigos são padronizados no build (src/lib/map-embed.ts).
  markdown: { processor: satteri({ hastPlugins: [mapEmbedPlugin] }) },
  integrations: [sitemap({ filter: (page) => !page.includes('/og/') })],
  // Fontes servidas pelo próprio site, a partir dos pacotes @fontsource (sem rede no build).
  // Só o subconjunto latin, que cobre o português; o provedor npm traria cirílico,
  // grego e vietnamita junto, e o preload pegaria todos.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Fraunces',
      cssVariable: '--font-display',
      fallbacks: ['Georgia', 'serif'],
      options: {
        variants: [
          { src: ['@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2'], weight: '100 900', style: 'normal' },
          { src: ['@fontsource-variable/fraunces/files/fraunces-latin-opsz-italic.woff2'], weight: '100 900', style: 'italic' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-body',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          { src: ['@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'], weight: '100 900', style: 'normal' },
          { src: ['@fontsource-variable/inter/files/inter-latin-wght-italic.woff2'], weight: '100 900', style: 'italic' },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'JetBrains Mono',
      cssVariable: '--font-mono',
      fallbacks: ['monospace'],
      options: {
        variants: [
          { src: ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2'], weight: '400', style: 'normal' },
          { src: ['@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2'], weight: '500', style: 'normal' },
        ],
      },
    },
  ],
});
