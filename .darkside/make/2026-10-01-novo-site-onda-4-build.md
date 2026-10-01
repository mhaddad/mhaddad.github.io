# Novo site em Astro — Onda 4: Volume e credibilidade (páginas)

**Tech Design Plan:** `.darkside/tech-design/2026-09-28-novo-site-astro-plan.md`
**Copy aprovada:** `.darkside/content/2026-10-01-copy-onda-4.md` (inclui as decisões de layout)
**Fonte de design:** Figma Make `Qc3aGJIstqsCK6jdI415l2`, telas `About.tsx`, `Companies.tsx`, `TalksMedia.tsx` e `NotFound.tsx`. Livros não tem tela no Figma.

## Order

### Escopo

Passos 15 e 16 da Onda 4 do plano, mais duas mudanças na home decididas em 01/10/2026.

| # | Passo | O que entra |
|---|---|---|
| 15 | Sobre | `/sobre/` e `/en/about/`: abertura com retrato, bio, trajetória (2008 a 2026), formação, princípios e chamada final |
| 16a | Palestras e Mídia | Acervo dos 23 itens do site antigo embaixo do bloco de serviço de `/palestras/` e `/en/speaking/`, com filtro por tipo e vídeo carregado só no clique |
| 16b | Empresas | `/empresas/` e `/en/companies/`: lista do Figma com logo numa placa clara, em dois grupos (5 cofundadas e 3 de conselho ou voluntariado) |
| 16c | Livros | `/livros/` e `/en/books/`: Feedback Canvas, com a Amazon Brasil em PT e a Amazon americana (edição em inglês) em EN |
| 16d | 404 | `/404.html` bilíngue, fora do índice dos buscadores |
| — | Home: hero | Fundo animado de ondas de pontos cinza no lugar do retrato. **Já implementado e aprovado** na working tree (`src/lib/hero-field.ts`, `Hero.astro`); entra no commit desta onda |
| — | Home: faixa de prova | Os 8 nomes viram logos monocromáticos na cor do texto, a partir da coleção `companies` |

**Fora do escopo:**
- Passo 14 (migração dos 32 artigos), que fica para depois desta entrega.
- Onda 5: página por empresa (`/empresas/<empresa>/`), artigos relacionados e `llms.txt`.
- Bloco "Palestras e mídia" na home (o design prompt previa 3 itens). Fica registrado como candidato a ajuste; não entra sem pedido.
- Remoção do site antigo (`images/`, `*.html`), que acontece no lançamento (passo 18). Os arquivos de `images/` são copiados para `src/assets/`, não movidos.

### Abordagem e arquitetura

- **Conteúdo em coleções com schema**, como o plano prevê para `talks` e `companies`, e o mesmo molde para o Sobre e o livro:
  - `talks`: um YAML único (`src/content/talks/talks.yaml`) lido pelo loader `file()` do Astro, um item por palestra, na ordem do site antigo (campo `order`). Cada item tem `youtubeId` ou `spotifyId`, nunca os dois.
  - `companies`: um YAML único (`src/content/companies/companies.yaml`), com `group` (`founded` ou `board`), `year` opcional, papel e descrição em PT e EN, logo e link.
  - `about`: `src/content/about/{pt,en}.yaml`, com título, subtítulo, bio, trajetória, formação e princípios. Um item da trajetória pode apontar para um artigo pelo `translationKey`.
  - `books`: `src/content/books/{pt,en}/feedback-canvas.yaml`, com título, subtítulo, textos, listas, link da Amazon e capa.
- **Regras entre arquivos no build**, no molde de `validateServices`: `validateTalks` (ID único, exatamente uma plataforma, miniatura existente para cada vídeo do YouTube), `validateCompanies` (logo existente, `year` obrigatório nas cofundadas), `validateAbout` (os dois idiomas com a mesma quantidade de itens; artigo da trajetória publicado no idioma). Se falhar, o build falha.
- **Imagens preparadas uma vez e versionadas**, para o site não chamar terceiros no carregamento:
  - `scripts/prepare-assets.mjs` (usa o `sharp`, que já está no projeto) recorta a margem branca dos 8 logos e grava duas versões: `src/assets/companies/<id>.png` (colorida, para a placa clara de Empresas) e `src/assets/companies/mono/<id>.png` (máscara de opacidade para a home). A máscara usa `alpha = 1 - min(R,G,B)` com reforço de contraste, o que mantém visíveis o amarelo da Lumiar e o traço fino do Ateliê.
  - O mesmo script baixa as miniaturas dos 20 vídeos (`i.ytimg.com/vi/<id>/hqdefault.jpg`) para `src/assets/talks/<youtubeId>.jpg`. Ele roda só em desenvolvimento; o build e o navegador nunca chamam o YouTube antes do clique.
  - A conversão de pixels fica numa função pura (`src/lib/logo-mask.ts`), testada à parte.
- **Fachada do YouTube:** o card mostra a miniatura local e um botão de play. No clique, o botão é trocado por um iframe de `youtube-nocookie.com/embed/<id>?autoplay=1`. Os 3 episódios do Spotify mostram o padrão geométrico e um link "Ouvir no Spotify" (sem embed).
- **Filtro por tipo:** botões com `aria-pressed` (Todos, Palestras, Webinars, Podcasts, Entrevistas) que escondem os cards por `data-type`. Sem JavaScript, todos os cards aparecem.
- **Palestras e Mídia numa página só:** `ServicePage` ganha um slot nomeado `after`, de largura total, abaixo da grade do serviço; `/palestras/` passa o `TalksArchive` nele.
- **Logos na home:** `ProofBand` lê a coleção `companies` e mostra cada máscara como `mask-image` sobre `background: currentColor`, com o nome da empresa como texto acessível. Assim o logo pega a cor do texto nos dois temas.
- **404:** `src/pages/404.astro`, com o `BaseLayout` em PT e o bloco em inglês marcado com `lang="en"`. O `Seo` ganha a opção `noindex`, e a página sai do sitemap.
- **Visual:** fiel às telas do Figma, só com tokens existentes. Tokens novos apenas para a largura do retrato do Sobre e o tamanho da placa do logo.

### Componentes e arquivos

| Área | Arquivos |
|---|---|
| Conteúdo | `src/content.config.ts` (schemas `talks`, `companies`, `about`, `books`), `src/content/talks/talks.yaml`, `src/content/companies/companies.yaml`, `src/content/about/{pt,en}.yaml`, `src/content/books/{pt,en}/feedback-canvas.yaml` |
| Imagens | `scripts/prepare-assets.mjs`, `src/lib/logo-mask.ts`, `src/assets/companies/*.png`, `src/assets/companies/mono/*.png`, `src/assets/talks/*.jpg`, `src/assets/books/feedback-canvas.png`, `src/assets/matheus-haddad.jpg` (retrato do Sobre, já existe) |
| Regras | `src/lib/talks.ts`, `src/lib/companies.ts`, `src/lib/about.ts`, `src/lib/collections.ts` (`getAllTalks`, `getAllCompanies`, `getAbout`, `getBook`), `src/lib/seo.ts` (`noindex`) |
| Componentes | `AboutPage.astro`, `Timeline.astro`, `CompaniesPage.astro`, `CompanyRow.astro`, `BooksPage.astro`, `TalksArchive.astro`, `TalkCard.astro`, `NotFound.astro`, `ServicePage.astro` (slot `after`), `home/ProofBand.astro` (logos), `Seo.astro` |
| Páginas | `src/pages/sobre/`, `empresas/`, `livros/`, `404.astro`, `palestras/` (acervo) e os equivalentes em `src/pages/en/` (`about/`, `companies/`, `books/`, `speaking/`) |
| i18n | `src/i18n/ui.ts`: rótulos das páginas novas (títulos de seção, filtro, botões, 404) |
| Home (já feito) | `src/lib/hero-field.ts`, `src/lib/hero-field.test.ts`, `src/components/home/Hero.astro`, `tests/build.test.ts` (teste do hero) |

### Ordem de implementação e justificativa

1. **Imagens e conteúdo.** Script de preparo, função da máscara, os YAMLs e os schemas. Todo o resto lê daqui.
2. **Regras de validação.** `validateTalks`, `validateCompanies` e `validateAbout`, ligadas aos getters de `collections.ts`.
3. **Empresas e faixa de prova da home.** As duas leem `companies`; fazer juntas evita retrabalho nos logos.
4. **Sobre.** Depende de `about` e do retrato.
5. **Palestras e Mídia.** Depende de `talks`, das miniaturas e do slot novo em `ServicePage`.
6. **Livros e 404.** Independentes e menores, por último. A 404 traz a mudança no `Seo` (`noindex`).

### Estratégia de testes

- **Unitários:**
  - `logoMask`: branco vira transparente, preto e cores saturadas (o amarelo da Lumiar) ficam opacos, a transparência original é respeitada e o ruído claro é zerado.
  - `validateTalks`: ID repetido, nenhuma ou duas plataformas, miniatura faltando.
  - `talksFor`: ordem e filtro por tipo; contagem por tipo.
  - `validateCompanies` e `companiesByGroup`: grupos na ordem, `year` obrigatório nas cofundadas.
  - `validateAbout`: idiomas com tamanhos diferentes; artigo da trajetória inexistente ou em rascunho.
  - `seo`: `noindex` gera `<meta name="robots" content="noindex">`.
  - Dicionário: chaves novas presentes nos dois idiomas e sem travessão (o teste atual já cobre).
- **De build:**
  - As 4 páginas novas nos 2 idiomas, nos caminhos do contrato, com `hreflang` cruzado; `404.html` gerada, com `noindex` e fora do sitemap.
  - Sobre: 10 marcos na trajetória, 4 formações, 4 princípios e link para o artigo "Coerência Cognitiva".
  - Empresas: 8 linhas em 2 grupos, links externos com `rel="noopener"` e logos com `alt`.
  - Palestras: 23 cards, filtro com 5 botões, nenhum iframe no HTML gerado, nenhuma URL de `ytimg` ou `youtube.com` em `<img>`.
  - Livros: o link da Amazon certo em cada idioma.
  - Home: 8 logos na faixa de prova, com o nome acessível.
  - Os testes de build leem o conteúdo real de `talks`, `companies`, `about` e `books`; não há fixtures para essas coleções.
- **Revisão visual:** capturas do Sobre, de Empresas, de Palestras (com o filtro e um vídeo aberto), de Livros, da 404 e da home, em 1440 px e 390 px, nos dois temas, comparadas com o Figma.

### Decisões técnicas e trade-offs

| Decisão | Alternativa | Motivo |
|---|---|---|
| Um YAML único para `talks` e `companies` (loader `file()`) | Um arquivo por item | 23 e 8 itens curtos; um arquivo só é mais fácil de revisar e reordenar |
| Sobre e livro em coleções | Textos no `ui.ts` | Textos longos e listas; o schema valida a estrutura e mantém o PT e o EN alinhados |
| Imagens preparadas por script e versionadas | Processar no build ou usar as originais | O build fica determinístico e sem rede; nenhuma chamada a terceiros no carregamento da página |
| Máscara de opacidade + `currentColor` para os logos da home | `filter: grayscale()` nos PNGs | O filtro deixa o fundo branco à vista no tema escuro; a máscara pega a cor do texto nos dois temas |
| Logo colorido numa placa clara em Empresas | Logo monocromático também em Empresas | Decisão do autor (01/10); preserva a identidade de cada marca |
| Fachada com miniatura local e iframe só no clique | Iframes direto, como no site antigo | Plano: o site antigo carrega ~20 iframes de uma vez; a fachada é mais leve e não chama o YouTube sem clique |
| Spotify só com link | Embed do Spotify | Evita um terceiro novo; são só 3 itens |
| Acervo no slot `after` da `ServicePage` | Página separada | Contrato de URLs: `/palestras/` é "Palestras e Mídia", uma página só |
| 404 com `noindex` | 404 indexável | Página de erro não deve aparecer em busca |

### Considerações de segurança

- **Terceiros:** só o YouTube, em `youtube-nocookie.com`, e só depois do clique, como o agente de segurança prevê. O iframe sai com `allow` restrito (`autoplay; encrypted-media; picture-in-picture`), `referrerpolicy="strict-origin-when-cross-origin"` e `title`. O ID do vídeo vem do schema (regex `^[A-Za-z0-9_-]{11}$`), nunca da URL da página.
- **Links externos** (empresas, Amazon, Spotify, site do livro) com `target="_blank" rel="noopener"`.
- **Script de preparo:** roda só em desenvolvimento e só baixa de `i.ytimg.com`, para IDs que passam pela mesma regex. Nenhum segredo é necessário.
- **Nenhuma dependência nova:** o `sharp` já está no `package.json`.
- Todo o conteúdo é renderizado como texto (sem `set:html`), salvo o SVG do padrão geométrico, que já é gerado pelo próprio código.

### Riscos

| Risco | Mitigação |
|---|---|
| Máscara de algum logo fica ruim (fundo não totalmente branco, serrilhado) | Teste da função com os casos de borda e conferência visual dos 8 logos; se algum falhar, pedir o SVG da marca |
| Miniatura indisponível para algum vídeo (vídeo removido ou privado) | O script avisa; `validateTalks` falha o build até a miniatura existir ou o item sair do YAML |
| Tradução da copy para EN sem revisão | Tradução feita aqui com o glossário da skill; Matheus revisa junto com a revisão visual |
| Retrato do Sobre: a copy cita `matheus-haddad-2025.jpg` | É o mesmo arquivo de `src/assets/matheus-haddad.jpg` (conferido byte a byte); usar o que já está em `src/assets/` |

## Tasks

> Código validado em protótipo em 01/10/2026: 180 testes passando (24 arquivos), `astro check` sem erros, avisos nem hints, e capturas conferidas contra o Figma Make (`About.tsx`, `Companies.tsx`, `TalksMedia.tsx`, `NotFound.tsx`) em 1440 px no tema escuro. O hero animado já estava aprovado na working tree e entra no Squad 4.

> **TDD:** em cada squad, os `*.test.ts` são escritos e executados primeiro e devem falhar; depois vem a implementação. Os testes de build da Task 13 ficam vermelhos até o squad que entrega cada página.

### Squad: Imagens e conteúdo
**Agent:** coder-frontend

- [ ] **Task 1: Máscara de opacidade dos logos**
  - Files: `src/lib/logo-mask.test.ts`, `src/lib/logo-mask.ts`
  - [ ] Criar `src/lib/logo-mask.test.ts` (teste primeiro):

    ```ts
    import { describe, expect, it } from 'vitest';
    import { logoMask } from './logo-mask';

    const pixel = (r: number, g: number, b: number, a = 255) => new Uint8Array([r, g, b, a]);
    const alphaOf = (r: number, g: number, b: number, a = 255) => logoMask(pixel(r, g, b, a))[3];

    describe('logoMask', () => {
      it('deve tornar transparente o fundo branco quando recebe um pixel branco', () => {
        expect(alphaOf(255, 255, 255)).toBe(0);
      });

      it('deve deixar opaco o traço escuro quando recebe um pixel preto ou cinza-escuro', () => {
        expect(alphaOf(0, 0, 0)).toBe(255);
        expect(alphaOf(68, 68, 68)).toBe(255);
      });

      it('deve manter visível uma cor clara e saturada quando recebe o amarelo da Lumiar', () => {
        expect(alphaOf(253, 185, 19)).toBeGreaterThan(200);
      });

      it('deve zerar o ruído quase branco quando recebe um pixel de compressão', () => {
        expect(alphaOf(250, 250, 248)).toBe(0);
      });

      it('deve respeitar a transparência original quando o pixel já é transparente', () => {
        expect(alphaOf(0, 0, 0, 0)).toBe(0);
        expect(alphaOf(0, 0, 0, 128)).toBe(128);
      });

      it('deve pintar a cor de preto e manter o tamanho quando recebe vários pixels', () => {
        const result = logoMask(new Uint8Array([10, 20, 30, 255, 255, 255, 255, 255]));
        expect(result).toHaveLength(8);
        expect([...result.slice(0, 3), ...result.slice(4, 7)]).toEqual([0, 0, 0, 0, 0, 0]);
      });
    });
    ```
  - [ ] Verificar — rodar `npx vitest run src/lib/logo-mask.test.ts`, esperado: falha com `Cannot find module './logo-mask'`.
  - [ ] Criar `src/lib/logo-mask.ts`:

    ```ts
    // Converte um logo colorido sobre fundo branco numa máscara de opacidade.
    // A "tinta" de cada pixel é a distância dele até o branco (1 - menor canal), e não
    // a luminância: assim cores claras e saturadas, como o amarelo da Lumiar, continuam
    // visíveis. O resultado é preto com alpha, para usar como mask-image no CSS.

    const CONTRAST = 1.6;
    const NOISE_FLOOR = 0.08;

    export function logoMask(rgba: Uint8Array): Uint8Array {
      const result = new Uint8Array(rgba.length);
      for (let i = 0; i < rgba.length; i += 4) {
        const ink = 1 - Math.min(rgba[i], rgba[i + 1], rgba[i + 2]) / 255;
        const strength = ink < NOISE_FLOOR ? 0 : Math.min(1, ink * CONTRAST);
        result[i + 3] = Math.round(strength * rgba[i + 3]);
      }
      return result;
    }
    ```
  - [ ] Verificar — rodar `npx vitest run src/lib/logo-mask.test.ts`, esperado: `Tests  6 passed (6)`.

- [ ] **Task 2: Script de preparo das imagens e acervo de palestras**
  - Files: `src/content/talks/talks.yaml`, `scripts/prepare-assets.ts`, `package.json`, `src/assets/companies/**`, `src/assets/talks/*.jpg`, `src/assets/books/feedback-canvas.png`
  - [ ] Criar `src/content/talks/talks.yaml` (os 23 itens de `palestras.html`, na mesma ordem; os dois travessões dos títulos viram dois-pontos):

    ```yaml
    # Acervo de Palestras e Mídia, na ordem do site antigo (palestras.html).
    # Cada item tem youtubeId ou spotifyId, nunca os dois. As miniaturas dos vídeos
    # ficam em src/assets/talks/<youtubeId>.jpg (npm run assets).

    - id: vanguarda-em-foco
      order: 1
      type: palestra
      event: "Vanguarda em Foco"
      title: "Feedback Canvas: o fim da avaliação de desempenho em times de tecnologia"
      youtubeId: MSiNEksvWO8
      lang: pt
    - id: tugatalk
      order: 2
      type: webinar
      event: "TugÁtalk"
      title: "Como criar uma cultura de feedback na sua organização? (Portugal)"
      youtubeId: FjbIgA3U8IU
      lang: pt
    - id: podfalar
      order: 3
      type: podcast
      event: "PodFalar"
      title: "Feedback Canvas: um livro para líderes"
      youtubeId: aLpG1ydJ6r0
      lang: pt
    - id: modern-work-award
      order: 4
      type: entrevista
      event: "Modern Work Award"
      title: "Empresas brasileiras premiadas no Modern Work Award 2024"
      youtubeId: akIlkYOxNzI
      lang: pt
    - id: love-the-problem
      order: 5
      type: podcast
      event: "Love The Problem"
      title: "Um mergulho no mundo das metas e na complexidade da sua efetividade"
      spotifyId: 3VBLEkeDhOxAk5BKMFz7FR
      lang: pt
    - id: people-tech
      order: 6
      type: podcast
      event: "People Tech"
      title: "Sobre a descentralização do RH e dos Planos de Carreira"
      spotifyId: 1NAhD5YXmp5r2ODWxEbCEB
      lang: pt
    - id: gerir-pessoas-em-2023
      order: 7
      type: webinar
      event: "Gerir Pessoas em 2023"
      title: "Gerir Pessoas em 2023: RH Ágil (Portugal)"
      youtubeId: 6e7TArdfrIE
      lang: pt
    - id: agile-hr-masterclass
      order: 8
      type: webinar
      event: "AGILE HR Masterclass"
      title: "Salários: degustação do AGILE HR Masterclass"
      youtubeId: HuarXQjHBwY
      lang: pt
    - id: vamos-fazer-diferente
      order: 9
      type: podcast
      event: "Vamos fazer diferente"
      title: "Uma conversa sobre Autonomia com Andrea Murata e Mariana Graf"
      spotifyId: 2m5gx9X55IPzE9keYoIIwh
      lang: pt
    - id: alexandre-nodari-klaus
      order: 10
      type: entrevista
      event: "Alexandre Nodari / Klaus"
      title: "Pragmatismo e Agilidade no RH"
      youtubeId: 34uBmpEUeZI
      lang: pt
    - id: agile-trends
      order: 11
      type: palestra
      event: "Agile Trends"
      title: "O fim da avaliação de desempenho individual e dos planos de carreira"
      youtubeId: VXZIeadueew
      lang: pt
    - id: pull-recast
      order: 12
      type: podcast
      event: "Pull reCast"
      title: "Agile: além da salvação?"
      youtubeId: Qavyj7Cp2sc
      lang: pt
    - id: agile-in-the-jungle
      order: 13
      type: palestra
      event: "Agile in the Jungle"
      title: "Liderança Ágil e Emergente (outubro de 2020)"
      youtubeId: ytwy1W6GrO0
      lang: pt
    - id: jose-jr
      order: 14
      type: entrevista
      event: "José JR"
      title: "O que é Feedback e Feedback Canvas"
      youtubeId: dJLKlPPhPCQ
      lang: pt
    - id: clube-de-empresarios
      order: 15
      type: entrevista
      event: "Clube de Empresários"
      title: "Gestão Ágil e Inovação Organizacional (Marcelo Colleoni)"
      youtubeId: tOMRZcdzk1E
      lang: pt
    - id: atelie-de-software
      order: 16
      type: entrevista
      event: "Ateliê de Software"
      title: "Auto-organização no trabalho remoto"
      youtubeId: GqrIfucpkVQ
      lang: pt
    - id: tdc-recife-2020
      order: 17
      type: palestra
      event: "TDC Recife 2020"
      title: "Estruturas Organizacionais Ágeis"
      youtubeId: GJUdBF8lelQ
      lang: pt
    - id: recrutalks-2020
      order: 18
      type: palestra
      event: "RecruTalks 2020"
      title: "RH Ágil: o que se confirmou com a pandemia"
      youtubeId: RH1W2LdjymA
      lang: pt
    - id: daniel-wildt
      order: 19
      type: entrevista
      event: "Daniel Wildt"
      title: "Gestão empresarial, avaliação de desempenho e feedback"
      youtubeId: lvIkxLPtEyI
      lang: pt
    - id: covid-19-escolas
      order: 20
      type: webinar
      event: "COVID-19 Escolas"
      title: "Impactos da COVID-19 nas escolas e processos de ensino"
      youtubeId: KgP5jj4jxH0
      lang: pt
    - id: f2a2-colleoni
      order: 21
      type: entrevista
      event: "F2A2 (Colleoni)"
      title: "Como pode uma empresa ser autogerida? (gestão orgânica)"
      youtubeId: bU1-EpzO6iw
      lang: pt
    - id: tdc-sao-paulo-2020
      order: 22
      type: palestra
      event: "TDC São Paulo 2020"
      title: "Autonomia para transformar organizações"
      youtubeId: JCmlioldmBc
      lang: pt
    - id: beatriz-garcia
      order: 23
      type: entrevista
      event: "Beatriz Garcia"
      title: "Agilidade nas Organizações"
      youtubeId: 4p6gX3wNIQQ
      lang: pt
    ```
  - [ ] Criar `scripts/prepare-assets.ts`:

    ```ts
    // Prepara as imagens da Onda 4 e grava em src/assets/ (versionadas no repositório).
    // Roda só em desenvolvimento: `npm run assets`. O build e o navegador nunca chamam
    // o YouTube; as miniaturas ficam locais.
    //
    // - Logos (images/*.png do site antigo): recorta a margem branca e grava a versão
    //   colorida (Empresas) e a máscara de opacidade (faixa de prova da home).
    // - Miniaturas: baixa a hqdefault de cada youtubeId de talks.yaml e recorta em 16:9.
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
    ```
  - [ ] Alterar `package.json` (script `assets`):

    ```diff
    diff --git a/package.json b/package.json
    index a4ba315..2333be6 100644
    --- a/package.json
    +++ b/package.json
    @@ -10,7 +10,8 @@
         "build": "astro build",
         "preview": "astro preview",
         "check": "astro check",
    -    "test": "vitest run"
    +    "test": "vitest run",
    +    "assets": "node scripts/prepare-assets.ts"
       },
       "dependencies": {
         "@astrojs/rss": "^4.0.19",
    ```
  - [ ] Rodar `npm run assets` e copiar a capa: `mkdir -p src/assets/books && cp images/livro-feedback-canvas-kindle.png src/assets/books/feedback-canvas.png`.
  - [ ] Verificar — rodar `ls src/assets/companies/*.png src/assets/companies/mono/*.png | wc -l && ls src/assets/talks | wc -l`, esperado: `16` e `20`.
  - [ ] Conferir visualmente as 8 máscaras (branco sobre preto): Lumiar amarela e o traço fino do Ateliê precisam aparecer inteiros.

- [ ] **Task 3: Conteúdo de Empresas, Sobre e Livros**
  - Files: `src/content/companies/companies.yaml`, `src/content/about/{pt,en}.yaml`, `src/content/books/{pt,en}/feedback-canvas.yaml`, `tests/fixtures/about/{pt,en}.yaml`
  - [ ] Criar `src/content/companies/companies.yaml`:

    ```yaml
    # Empresas e organizações de Matheus Haddad (copy aprovada em 01/10/2026,
    # .darkside/content/2026-10-01-copy-onda-4.md). O logo colorido fica em
    # src/assets/companies/<id>.png e a máscara da home em src/assets/companies/mono/<id>.png
    # (npm run assets). O ano é obrigatório nas cofundadas.

    - id: webgoal
      order: 1
      group: founded
      year: 2008
      name: Webgoal
      logo: ../../assets/companies/webgoal.png
      url: https://www.webgoal.com.br
      role: { pt: Cofundador, en: Co-founder }
      description:
        pt: Uma das primeiras empresas de desenvolvimento ágil de software, hoje uma holding de negócios em tecnologia e educação.
        en: One of the first agile software development companies, now a holding company for technology and education businesses.

    - id: granatum
      order: 2
      group: founded
      year: 2009
      name: Granatum Financeiro
      logo: ../../assets/companies/granatum.png
      url: https://www.granatum.com.br
      role: { pt: Cofundador, en: Co-founder }
      description:
        pt: Software de gestão financeira para empresas brasileiras de todos os portes, com fluxo de caixa, cobrança e emissão de notas fiscais.
        en: Financial management software for Brazilian companies of every size, with cash flow, billing and invoicing.

    - id: atelie
      order: 3
      group: founded
      year: 2011
      name: Ateliê de Software
      logo: ../../assets/companies/atelie.png
      url: https://atelie.software
      role: { pt: Cofundador, en: Co-founder }
      description:
        pt: Desenvolvimento de software premium para startups e grandes empresas, com excelência técnica, métodos ágeis e design centrado no usuário.
        en: Premium software development for startups and large companies, with technical excellence, agile methods and user-centered design.

    - id: orgganica
      order: 4
      group: founded
      year: 2017
      name: Orgganica
      logo: ../../assets/companies/orgganica.png
      url: https://www.orgganica.com
      role: { pt: Cofundador, en: Co-founder }
      description:
        pt: Consultoria em evolução organizacional, para sistemas de trabalho mais saudáveis, ágeis e horizontais.
        en: Organizational evolution consultancy, for healthier, more agile and flatter ways of working.

    - id: lumiar
      order: 5
      group: founded
      year: 2018
      name: Escola Lumiar Poços de Caldas
      logo: ../../assets/companies/lumiar.png
      url: https://www.escolalumiarpocos.com.br
      role: { pt: Cofundador, en: Co-founder }
      description:
        pt: Escola de educação básica em Poços de Caldas que adota a Metodologia Lumiar, com autonomia do aluno e desenvolvimento por competências.
        en: K-12 school in Poços de Caldas that follows the Lumiar Methodology, built on student autonomy and competency-based learning.

    - id: alianca
      order: 6
      group: board
      name: Aliança Empreendedora
      logo: ../../assets/companies/alianca.png
      url: https://aliancaempreendedora.org.br/
      role: { pt: Conselheiro, en: Board member }
      description:
        pt: Apoia empreendedores de baixa renda e grupos produtivos comunitários, com foco em impacto social.
        en: Supports low-income entrepreneurs and community production groups, with a focus on social impact.

    - id: guardachuva
      order: 7
      group: board
      name: A Guarda-Chuva
      logo: ../../assets/companies/guardachuva.png
      url: https://www.aguardachuva.org/
      role: { pt: Conselheiro, en: Board member }
      description:
        pt: Escola de empreendedorismo social em Poços de Caldas que forma lideranças e iniciativas de impacto local.
        en: Social entrepreneurship school in Poços de Caldas that develops leaders and local impact initiatives.

    - id: tugagil
      order: 8
      group: board
      name: TugÁgil
      logo: ../../assets/companies/tugagil.png
      url: https://www.tugagil.com/
      role: { pt: Voluntário, en: Volunteer }
      description:
        pt: Comunidade de prática que promove a agilidade em Portugal com formações, talks e eventos.
        en: Community of practice that promotes agility in Portugal through training, talks and events.
    ```
  - [ ] Criar `src/content/about/pt.yaml`:

    ```yaml
    # Página Sobre (copy aprovada em 01/10/2026, .darkside/content/2026-10-01-copy-onda-4.md).
    # Um item da trajetória pode apontar para um artigo pelo translationKey (campo article).
    lang: pt
    title: Construo empresas de tecnologia desde 2008 e ajudo outras lideranças a redesenhar como suas organizações decidem e trabalham.
    description: Matheus Haddad é empresário, cofundador de empresas de software, finanças e educação e mestre em Inteligência Artificial. Trajetória, formação e princípios.
    bio:
      - Sou empresário e cofundador de empresas de software, finanças e educação. Comecei em 2008 com a Webgoal, uma das primeiras empresas de desenvolvimento ágil de software, que hoje é uma holding de negócios em tecnologia e educação. Depois vieram o Granatum, o Ateliê de Software, a Orgganica e a Escola Lumiar Poços de Caldas.
      - "Minha formação é em computação: sou bacharel em Ciência da Computação e mestre em Inteligência Artificial pelo Centro Universitário FEI. Foi construindo essas empresas que passei a estudar quem decide, como o trabalho se coordena e o que faz pessoas autônomas renderem mais ou menos dentro de uma estrutura."
      - "Todas elas partem da mesma aposta: organizações mais transparentes, autônomas e centradas nas pessoas entregam melhores resultados. É essa experiência de quem pratica que levo para a consultoria, a mentoria e as palestras, em eventos no Brasil e no exterior, e para os artigos que escrevo sobre gestão, liderança, IA e desenvolvimento de software."
      - "Hoje meu trabalho se concentra numa pergunta que a IA tornou urgente: como redesenhar a gestão quando muda quem sabe o quê, mas a tecnologia sozinha não muda quem decide. No Ateliê de Software, coloquei em prática a orquestração de agentes de IA no processo de desenvolvimento. Em 2026 também criei o conceito de Coerência Cognitiva e o Diagnóstico de P-O Fit, que avaliam a compatibilidade entre a forma como as pessoas pensam, decidem e agem e a forma de trabalhar da organização."
    timeline:
      - year: 2008
        title: Cofundação da Webgoal
        text: Holding que investe em negócios de tecnologia e educação, com uma gestão baseada em transparência, autonomia e responsabilidade.
      - year: 2009
        title: Cofundação do Granatum
        text: Software de gestão financeira com fluxo de caixa em tempo real, planejamento orçamentário e relatórios para empresas de todos os portes.
      - year: 2011
        title: Cofundação do Ateliê de Software
        text: Desenvolvimento de software premium para startups e grandes empresas, pioneiro no Brasil na adoção de métodos ágeis e design centrado no usuário.
      - year: 2012
        title: Prêmio MPE Brasil, do Sebrae
        text: Vencedor nas categorias "Destaque de boas práticas de inovação" e "Serviços de TI" da etapa estadual de São Paulo e finalista na etapa nacional.
      - year: 2017
        title: Cofundação da Orgganica
        text: Consultoria em transformação ágil e inovação organizacional, com cursos, workshops, consultorias e mentorias para empresas e líderes.
      - year: 2018
        title: Cofundação da Escola Lumiar Poços de Caldas
        text: Escola de educação básica que adota a Metodologia Lumiar, baseada no desenvolvimento de competências e reconhecida pela UNESCO, pela Universidade Stanford e pela Microsoft como uma das 12 mais inovadoras do mundo.
      - year: 2024
        title: Modern Work Award para o Ateliê de Software
        text: O Ateliê de Software recebe o Modern Work Award, reconhecimento internacional por práticas de trabalho moderno e transformação organizacional.
      - year: 2025
        title: Lançamento do livro Feedback Canvas
        text: Metodologia e ferramenta para criar uma cultura de feedback nas organizações, já adotada por centenas de times.
      - year: 2026
        title: Coerência Cognitiva e Diagnóstico de P-O Fit
        text: Um conceito e um diagnóstico para avaliar se a forma como as pessoas pensam, decidem e agem é compatível com a forma de trabalhar da organização.
        article: coerencia-cognitiva
      - year: 2026
        title: Agentes de IA no Ateliê de Software
        text: Orquestração de agentes de IA no processo de desenvolvimento de software do Ateliê de Software.
    education:
      - degree: Bacharel em Ciência da Computação
        school: UNIFENAS
        period: 2000–2003
      - degree: Especialista em Análise de Sistemas Web
        school: FASP
        period: 2004–2005
      - degree: Mestre em Inteligência Artificial
        school: Centro Universitário FEI
        period: 2007–2010
      - degree: MBA em Gestão Empresarial
        school: Fundação Getúlio Vargas (FGV)
        period: 2011–2013
    principles:
      - title: Autonomia e responsabilidade
        text: Quem tem o contexto decide e responde pelo que decidiu.
      - title: Aprendizado contínuo
        text: Uma empresa melhora na velocidade em que consegue rever o que faz, e isso vale também para quem a lidera.
      - title: Impacto real sobre processos e pessoas
        text: Uma mudança só conta quando aparece no jeito como as pessoas decidem e trabalham juntas.
      - title: Transparência e feedback
        text: Informação aberta e conversas francas e frequentes, no lugar de avaliações anuais e decisões de bastidor.
    ```
  - [ ] Criar `src/content/about/en.yaml`:

    ```yaml
    # About page (English version of the copy approved on 2026-10-01).
    lang: en
    title: I have been building technology companies since 2008, and I help other leaders redesign how their organizations decide and work.
    description: Matheus Haddad is an entrepreneur, co-founder of software, finance and education companies, and holds a master's in Artificial Intelligence.
    bio:
      - I am an entrepreneur and co-founder of software, finance and education companies. I started in 2008 with Webgoal, one of the first agile software development companies, which is now a holding company for technology and education businesses. Granatum, Ateliê de Software, Orgganica and Escola Lumiar Poços de Caldas came next.
      - "My background is in computing: I hold a bachelor's degree in Computer Science and a master's in Artificial Intelligence from Centro Universitário FEI. It was while building these companies that I started to study who decides, how work gets coordinated and what makes autonomous people thrive or struggle inside a structure."
      - "They all rest on the same bet: more transparent, autonomous and people-centered organizations deliver better results. That practitioner's experience is what I bring to consulting, mentoring and talks, at events in Brazil and abroad, and to the articles I write on management, leadership, AI and software development."
      - "Today my work focuses on a question that AI has made urgent: how to redesign management when who knows what changes, but technology alone does not change who decides. At Ateliê de Software, I put the orchestration of AI agents into practice in the development process. In 2026 I also created the concept of Cognitive Coherence and the P-O Fit Diagnostic, which assess how well the way people think, decide and act fits the way the organization works."
    timeline:
      - year: 2008
        title: Co-founded Webgoal
        text: A holding company that invests in technology and education businesses, managed on the basis of transparency, autonomy and responsibility.
      - year: 2009
        title: Co-founded Granatum
        text: Financial management software with real-time cash flow, budget planning and reporting for companies of every size.
      - year: 2011
        title: Co-founded Ateliê de Software
        text: Premium software development for startups and large companies, a Brazilian pioneer in agile methods and user-centered design.
      - year: 2012
        title: MPE Brasil Award, by Sebrae
        text: Winner of the "Innovation best practices" and "IT services" categories in the São Paulo state round, and a finalist in the national round.
      - year: 2017
        title: Co-founded Orgganica
        text: A consultancy in agile transformation and organizational innovation, offering courses, workshops, consulting and mentoring to companies and leaders.
      - year: 2018
        title: Co-founded Escola Lumiar Poços de Caldas
        text: A K-12 school that follows the Lumiar Methodology, based on competency development and recognized by UNESCO, Stanford University and Microsoft as one of the 12 most innovative in the world.
      - year: 2024
        title: Modern Work Award for Ateliê de Software
        text: Ateliê de Software receives the Modern Work Award, an international recognition of modern work practices and organizational transformation.
      - year: 2025
        title: Published the book Feedback Canvas
        text: A method and tool to build a feedback culture in organizations, already adopted by hundreds of teams.
      - year: 2026
        title: Cognitive Coherence and the P-O Fit Diagnostic
        text: A concept and a diagnostic to assess whether the way people think, decide and act fits the way the organization works.
        article: coerencia-cognitiva
      - year: 2026
        title: AI agents at Ateliê de Software
        text: Orchestration of AI agents in Ateliê de Software's software development process.
    education:
      - degree: Bachelor's in Computer Science
        school: UNIFENAS
        period: 2000–2003
      - degree: Graduate specialization in Web Systems Analysis
        school: FASP
        period: 2004–2005
      - degree: Master's in Artificial Intelligence
        school: Centro Universitário FEI
        period: 2007–2010
      - degree: MBA in Business Management
        school: Fundação Getúlio Vargas (FGV)
        period: 2011–2013
    principles:
      - title: Autonomy and responsibility
        text: Whoever has the context decides, and answers for the decision.
      - title: Continuous learning
        text: A company improves as fast as it can review what it does, and the same goes for the people who lead it.
      - title: Real impact on processes and people
        text: A change only counts when it shows up in how people decide and work together.
      - title: Transparency and feedback
        text: Open information and frank, frequent conversations, instead of annual reviews and backroom decisions.
    ```
  - [ ] Criar `src/content/books/pt/feedback-canvas.yaml`:

    ```yaml
    # Livro Feedback Canvas (copy aprovada em 01/10/2026, .darkside/content/2026-10-01-copy-onda-4.md).
    lang: pt
    order: 1
    title: Feedback Canvas
    subtitle: Crie uma cultura de feedback na sua organização
    description: Feedback Canvas, livro de Matheus Haddad sobre como criar uma cultura de feedback em equipes e organizações de qualquer porte.
    cover: ../../../assets/books/feedback-canvas.png
    coverAlt: Capa do livro Feedback Canvas, de Matheus Haddad, nas versões impressa e digital
    buyUrl: https://www.amazon.com.br/Feedback-Canvas-cultura-feedback-organiza%C3%A7%C3%A3o-ebook/dp/B0FBGWMFSZ/
    siteUrl: https://feedbackcanvas.digital/livro
    about:
      - O Feedback Canvas é uma forma prática e visual de dar e receber feedback em equipes e organizações. Criei a ferramenta a partir do trabalho nas minhas empresas, e ela já foi adotada por centenas de times em empresas de portes e setores diferentes.
      - O canvas combina estrutura clara, empatia e orientação para a ação, para que as conversas de feedback fiquem mais honestas e construtivas e passem a ser esperadas pelas pessoas, em vez de temidas.
    audience:
      - Líderes e gestores que querem criar uma cultura de feedback genuíno nas suas equipes.
      - Profissionais de RH e People que buscam ferramentas práticas para o desenvolvimento de pessoas.
      - Empreendedores que querem construir organizações mais transparentes e de alto desempenho.
      - Times ágeis que querem aprofundar suas retrospectivas e a melhoria contínua.
    contents:
      - Uma metodologia visual e prática, fácil de aplicar em qualquer contexto.
      - Exemplos reais de aplicação em empresas de diferentes setores.
      - Modelos prontos para usar com a sua equipe.
      - Linguagem acessível, sem abrir mão da profundidade conceitual.
    ```
  - [ ] Criar `src/content/books/en/feedback-canvas.yaml` (subtítulo oficial da edição em inglês, conferido na Amazon):

    ```yaml
    # Feedback Canvas book (English version of the copy approved on 2026-10-01).
    lang: en
    order: 1
    title: Feedback Canvas
    subtitle: Create a feedback culture in your organization
    description: Feedback Canvas, a book by Matheus Haddad on how to build a feedback culture in teams and organizations of any size.
    cover: ../../../assets/books/feedback-canvas.png
    coverAlt: Cover of the book Feedback Canvas by Matheus Haddad, in print and digital editions
    buyUrl: https://www.amazon.com/dp/B0FNLM47WB/
    siteUrl: https://feedbackcanvas.digital/livro
    about:
      - Feedback Canvas is a practical, visual way to give and receive feedback in teams and organizations. I created the tool out of the work in my own companies, and it has already been adopted by hundreds of teams in companies of different sizes and industries.
      - The canvas combines clear structure, empathy and a focus on action, so that feedback conversations become more honest and constructive, and people start looking forward to them instead of dreading them.
    audience:
      - Leaders and managers who want to build a culture of genuine feedback in their teams.
      - HR and People professionals looking for practical tools for people development.
      - Entrepreneurs who want to build more transparent, high-performing organizations.
      - Agile teams that want to deepen their retrospectives and continuous improvement.
    contents:
      - A visual, practical method that is easy to apply in any context.
      - Real examples from companies in different industries.
      - Ready-to-use templates for your team.
      - Accessible language that keeps the conceptual depth.
    ```
  - [ ] Criar `tests/fixtures/about/pt.yaml` (fixture do build de teste, ligada ao artigo `fixture-primeiro`):

    ```yaml
    lang: pt
    title: Título de teste do Sobre.
    description: Descrição de teste do Sobre.
    bio:
      - Primeiro parágrafo de teste.
      - Segundo parágrafo de teste.
    timeline:
      - year: 2008
        title: Marco sem artigo
        text: Texto do marco sem artigo.
      - year: 2026
        title: Marco com artigo
        text: Texto do marco com artigo.
        article: fixture-primeiro
    education:
      - degree: Formação de teste
        school: Escola de teste
        period: 2000–2003
    principles:
      - title: Princípio de teste
        text: Texto do princípio de teste.
    ```
  - [ ] Criar `tests/fixtures/about/en.yaml`:

    ```yaml
    lang: en
    title: Test About title.
    description: Test About description.
    bio:
      - First test paragraph.
      - Second test paragraph.
    timeline:
      - year: 2008
        title: Milestone without article
        text: Milestone text without article.
      - year: 2026
        title: Milestone with article
        text: Milestone text with article.
        article: fixture-primeiro
    education:
      - degree: Test degree
        school: Test school
        period: 2000–2003
    principles:
      - title: Test principle
        text: Test principle text.
    ```

- [ ] **Task 4: Schemas, regras de validação e getters**
  - Files: `src/lib/{talks,companies,about}.test.ts`, `src/lib/{talks,companies,about}.ts`, `src/content.config.ts`, `src/lib/collections.ts`
  - [ ] Criar `src/lib/talks.test.ts` (teste primeiro):

    ```ts
    import { describe, expect, it } from 'vitest';
    import {
      TalkValidationError,
      sortTalks,
      spotifyUrl,
      talkCounts,
      validateTalks,
      youtubeEmbedUrl,
      youtubeWatchUrl,
      type TalkEntry,
    } from './talks';

    function talk(id: string, data: Partial<TalkEntry['data']> = {}): TalkEntry {
      return { id, data: { order: 1, type: 'palestra', youtubeId: 'MSiNEksvWO8', ...data } };
    }

    describe('validateTalks', () => {
      it('deve aceitar o acervo quando cada vídeo tem miniatura e cada item tem uma plataforma', () => {
        // Arrange
        const talks = [talk('a', { order: 1 }), talk('b', { order: 2, youtubeId: undefined, spotifyId: '3VBLEkeDhOxAk5BKMFz7FR' })];

        // Act
        const run = () => validateTalks(talks, new Set(['MSiNEksvWO8']));

        // Assert
        expect(run).not.toThrow();
      });

      it('deve listar os problemas quando falta plataforma, há duas ou falta miniatura', () => {
        // Arrange
        const talks = [
          talk('sem-plataforma', { order: 1, youtubeId: undefined }),
          talk('duas-plataformas', { order: 2, spotifyId: '3VBLEkeDhOxAk5BKMFz7FR' }),
          talk('sem-miniatura', { order: 3, youtubeId: 'aLpG1ydJ6r0' }),
        ];

        // Act
        const run = () => validateTalks(talks, new Set(['MSiNEksvWO8']));

        // Assert
        expect(run).toThrow(TalkValidationError);
        try {
          run();
        } catch (error) {
          const { problems } = error as TalkValidationError;
          expect(problems).toHaveLength(3);
          expect(problems[0]).toContain('sem-plataforma');
          expect(problems[1]).toContain('duas-plataformas');
          expect(problems[2]).toContain('aLpG1ydJ6r0');
        }
      });

      it('deve recusar a ordem repetida quando dois itens têm o mesmo order', () => {
        // Arrange
        const talks = [talk('a', { order: 1 }), talk('b', { order: 1 })];

        // Act
        const run = () => validateTalks(talks, new Set(['MSiNEksvWO8']));

        // Assert
        expect(run).toThrow(/order 1/);
      });
    });

    describe('sortTalks e talkCounts', () => {
      it('deve ordenar pelo campo order e contar por tipo quando recebe o acervo', () => {
        // Arrange
        const talks = [
          talk('c', { order: 3, type: 'podcast' }),
          talk('a', { order: 1, type: 'palestra' }),
          talk('b', { order: 2, type: 'podcast' }),
        ];

        // Act
        const sorted = sortTalks(talks).map((entry) => entry.id);
        const counts = talkCounts(talks);

        // Assert
        expect(sorted).toEqual(['a', 'b', 'c']);
        expect(counts).toEqual({ palestra: 1, webinar: 0, podcast: 2, entrevista: 0 });
      });
    });

    describe('links das plataformas', () => {
      it('deve usar o domínio sem cookies com autoplay quando monta o embed do YouTube', () => {
        expect(youtubeEmbedUrl('MSiNEksvWO8')).toBe('https://www.youtube-nocookie.com/embed/MSiNEksvWO8?autoplay=1');
      });

      it('deve montar os links públicos quando recebe os IDs', () => {
        expect(youtubeWatchUrl('MSiNEksvWO8')).toBe('https://www.youtube.com/watch?v=MSiNEksvWO8');
        expect(spotifyUrl('3VBLEkeDhOxAk5BKMFz7FR')).toBe('https://open.spotify.com/episode/3VBLEkeDhOxAk5BKMFz7FR');
      });
    });
    ```
  - [ ] Criar `src/lib/companies.test.ts` (teste primeiro):

    ```ts
    import { describe, expect, it } from 'vitest';
    import { CompanyValidationError, companiesByGroup, validateCompanies, type CompanyEntry } from './companies';

    function company(id: string, data: Partial<CompanyEntry['data']> = {}): CompanyEntry {
      return { id, data: { order: 1, group: 'founded', year: 2008, ...data } };
    }

    describe('validateCompanies', () => {
      it('deve aceitar as empresas quando cada uma tem máscara e as cofundadas têm ano', () => {
        // Arrange
        const companies = [company('webgoal'), company('tugagil', { order: 2, group: 'board', year: undefined })];

        // Act
        const run = () => validateCompanies(companies, new Set(['webgoal', 'tugagil']));

        // Assert
        expect(run).not.toThrow();
      });

      it('deve listar os problemas quando falta o ano numa cofundada ou falta a máscara', () => {
        // Arrange
        const companies = [company('webgoal', { year: undefined }), company('granatum', { order: 2 })];

        // Act
        const run = () => validateCompanies(companies, new Set(['webgoal']));

        // Assert
        expect(run).toThrow(CompanyValidationError);
        try {
          run();
        } catch (error) {
          const { problems } = error as CompanyValidationError;
          expect(problems).toEqual([
            'webgoal: empresa cofundada precisa de year',
            'granatum: falta a máscara src/assets/companies/mono/granatum.png (rode npm run assets)',
          ]);
        }
      });
    });

    describe('companiesByGroup', () => {
      it('deve separar cofundadas e conselhos na ordem quando recebe a lista misturada', () => {
        // Arrange
        const companies = [
          company('tugagil', { order: 8, group: 'board' }),
          company('granatum', { order: 2 }),
          company('alianca', { order: 6, group: 'board' }),
          company('webgoal', { order: 1 }),
        ];

        // Act
        const groups = companiesByGroup(companies);

        // Assert
        expect(groups.founded.map((entry) => entry.id)).toEqual(['webgoal', 'granatum']);
        expect(groups.board.map((entry) => entry.id)).toEqual(['alianca', 'tugagil']);
      });
    });
    ```
  - [ ] Criar `src/lib/about.test.ts` (teste primeiro):

    ```ts
    import { describe, expect, it } from 'vitest';
    import type { ArticleEntry } from './articles';
    import { AboutValidationError, timelineArticle, validateAbout, type AboutEntry } from './about';

    function about(lang: 'pt' | 'en', data: Partial<AboutEntry['data']> = {}): AboutEntry {
      return {
        id: lang,
        data: {
          lang,
          timeline: [{ year: 2008 }, { year: 2026, article: 'coerencia-cognitiva' }],
          education: [{}, {}],
          principles: [{}],
          ...data,
        },
      };
    }

    function article(lang: 'pt' | 'en', translationKey: string, draft = false): ArticleEntry {
      return {
        id: `${lang}/${translationKey}`,
        data: { title: translationKey, lang, translationKey, category: 'coerencia', pubDate: new Date('2026-01-01'), draft },
      };
    }

    const articles = [article('pt', 'coerencia-cognitiva'), article('en', 'coerencia-cognitiva')];

    function problemsOf(entries: AboutEntry[], list: ArticleEntry[] = articles): string[] {
      try {
        validateAbout(entries, list);
        return [];
      } catch (error) {
        if (error instanceof AboutValidationError) return error.problems;
        throw error;
      }
    }

    describe('validateAbout', () => {
      it('deve aceitar o Sobre quando os dois idiomas estão alinhados e o artigo está publicado', () => {
        expect(problemsOf([about('pt'), about('en')])).toEqual([]);
      });

      it('deve recusar quando falta um idioma', () => {
        expect(problemsOf([about('pt')])).toEqual(['sobre: falta a versão em en']);
      });

      it('deve recusar quando as listas têm tamanhos ou anos diferentes entre os idiomas', () => {
        // Arrange
        const en = about('en', { timeline: [{ year: 2009 }, { year: 2026, article: 'coerencia-cognitiva' }], principles: [{}, {}] });

        // Act
        const problems = problemsOf([about('pt'), en]);

        // Assert
        expect(problems).toEqual([
          'sobre: a trajetória tem anos diferentes entre pt e en',
          'sobre: principles tem 1 itens em pt e 2 em en',
        ]);
      });

      it('deve recusar quando o artigo da trajetória não está publicado no idioma', () => {
        // Arrange
        const list = [article('pt', 'coerencia-cognitiva'), article('en', 'coerencia-cognitiva', true)];

        // Act
        const problems = problemsOf([about('pt'), about('en')], list);

        // Assert
        expect(problems).toEqual(['sobre (en): o artigo "coerencia-cognitiva" da trajetória não está publicado']);
      });
    });

    describe('timelineArticle', () => {
      it('deve achar o artigo publicado no idioma quando o item aponta um translationKey', () => {
        expect(timelineArticle('coerencia-cognitiva', articles, 'en')?.id).toBe('en/coerencia-cognitiva');
        expect(timelineArticle(undefined, articles, 'en')).toBeUndefined();
      });
    });
    ```
  - [ ] Verificar — rodar `npx vitest run src/lib/talks.test.ts src/lib/companies.test.ts src/lib/about.test.ts`, esperado: os 3 arquivos falham com `Cannot find module`.
  - [ ] Criar `src/lib/talks.ts`:

    ```ts
    // Acervo de Palestras e Mídia (src/content/talks/talks.yaml).

    export const talkTypes = ['palestra', 'webinar', 'podcast', 'entrevista'] as const;
    export type TalkType = (typeof talkTypes)[number];

    export const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;
    export const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;

    export interface TalkData {
      order: number;
      type: TalkType;
      youtubeId?: string;
      spotifyId?: string;
    }

    export interface TalkEntry<TData extends TalkData = TalkData> {
      id: string;
      data: TData;
    }

    export class TalkValidationError extends Error {
      constructor(readonly problems: string[]) {
        super(`Acervo de palestras inválido:\n- ${problems.join('\n- ')}`);
        this.name = 'TalkValidationError';
      }
    }

    /** `thumbnails`: IDs do YouTube com miniatura em src/assets/talks/. */
    export function validateTalks(talks: TalkEntry[], thumbnails: Set<string>): void {
      const problems: string[] = [];
      const orders = new Map<number, string>();

      for (const { id, data } of sortTalks(talks)) {
        const platforms = [data.youtubeId, data.spotifyId].filter(Boolean).length;
        if (platforms !== 1) problems.push(`${id}: precisa de youtubeId ou spotifyId, e só de um deles`);
        if (data.youtubeId && !thumbnails.has(data.youtubeId)) {
          problems.push(`${id}: falta a miniatura src/assets/talks/${data.youtubeId}.jpg (rode npm run assets)`);
        }
        const repeated = orders.get(data.order);
        if (repeated) problems.push(`${id}: order ${data.order} repetido com "${repeated}"`);
        orders.set(data.order, id);
      }

      if (problems.length > 0) throw new TalkValidationError(problems);
    }

    export function sortTalks<T extends TalkEntry>(talks: T[]): T[] {
      return [...talks].sort((a, b) => a.data.order - b.data.order);
    }

    export function talkCounts(talks: TalkEntry[]): Record<TalkType, number> {
      const counts = Object.fromEntries(talkTypes.map((type) => [type, 0])) as Record<TalkType, number>;
      for (const { data } of talks) counts[data.type] += 1;
      return counts;
    }

    export function youtubeEmbedUrl(id: string): string {
      return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
    }

    export function youtubeWatchUrl(id: string): string {
      return `https://www.youtube.com/watch?v=${id}`;
    }

    export function spotifyUrl(id: string): string {
      return `https://open.spotify.com/episode/${id}`;
    }
    ```
  - [ ] Criar `src/lib/companies.ts`:

    ```ts
    // Empresas e organizações (src/content/companies/companies.yaml).

    export const companyGroups = ['founded', 'board'] as const;
    export type CompanyGroup = (typeof companyGroups)[number];

    export interface CompanyData {
      order: number;
      group: CompanyGroup;
      year?: number;
    }

    export interface CompanyEntry<TData extends CompanyData = CompanyData> {
      id: string;
      data: TData;
    }

    export class CompanyValidationError extends Error {
      constructor(readonly problems: string[]) {
        super(`Empresas inválidas:\n- ${problems.join('\n- ')}`);
        this.name = 'CompanyValidationError';
      }
    }

    /** `masks`: IDs com máscara monocromática em src/assets/companies/mono/. */
    export function validateCompanies(companies: CompanyEntry[], masks: Set<string>): void {
      const problems: string[] = [];

      for (const { id, data } of sortCompanies(companies)) {
        if (data.group === 'founded' && data.year === undefined) problems.push(`${id}: empresa cofundada precisa de year`);
        if (!masks.has(id)) problems.push(`${id}: falta a máscara src/assets/companies/mono/${id}.png (rode npm run assets)`);
      }

      if (problems.length > 0) throw new CompanyValidationError(problems);
    }

    export function sortCompanies<T extends CompanyEntry>(companies: T[]): T[] {
      return [...companies].sort((a, b) => a.data.order - b.data.order);
    }

    export function companiesByGroup<T extends CompanyEntry>(companies: T[]): Record<CompanyGroup, T[]> {
      const sorted = sortCompanies(companies);
      return {
        founded: sorted.filter((company) => company.data.group === 'founded'),
        board: sorted.filter((company) => company.data.group === 'board'),
      };
    }
    ```
  - [ ] Criar `src/lib/about.ts`:

    ```ts
    // Página Sobre (src/content/about/{pt,en}.yaml).
    import { languages, type Lang } from '../i18n/ui';
    import { publishedArticles, type ArticleEntry } from './articles';

    export interface AboutData {
      lang: Lang;
      timeline: { year: number; article?: string }[];
      education: unknown[];
      principles: unknown[];
    }

    export interface AboutEntry<TData extends AboutData = AboutData> {
      id: string;
      data: TData;
    }

    export class AboutValidationError extends Error {
      constructor(readonly problems: string[]) {
        super(`Página Sobre inválida:\n- ${problems.join('\n- ')}`);
        this.name = 'AboutValidationError';
      }
    }

    export function validateAbout(entries: AboutEntry[], articles: ArticleEntry[]): void {
      const problems: string[] = [];
      const byLang = new Map(entries.map((entry) => [entry.data.lang, entry.data]));

      for (const lang of languages) {
        if (!byLang.has(lang)) problems.push(`sobre: falta a versão em ${lang}`);
      }

      const pt = byLang.get('pt');
      const en = byLang.get('en');
      if (pt && en) {
        const years = (data: AboutData) => data.timeline.map((item) => item.year).join(',');
        if (years(pt) !== years(en)) problems.push('sobre: a trajetória tem anos diferentes entre pt e en');
        for (const field of ['education', 'principles'] as const) {
          if (pt[field].length !== en[field].length) {
            problems.push(`sobre: ${field} tem ${pt[field].length} itens em pt e ${en[field].length} em en`);
          }
        }
      }

      for (const [lang, data] of byLang) {
        for (const { article } of data.timeline) {
          if (article && !timelineArticle(article, articles, lang)) {
            problems.push(`sobre (${lang}): o artigo "${article}" da trajetória não está publicado`);
          }
        }
      }

      if (problems.length > 0) throw new AboutValidationError(problems);
    }

    export function timelineArticle<T extends ArticleEntry>(
      translationKey: string | undefined,
      articles: T[],
      lang: Lang,
    ): T | undefined {
      if (!translationKey) return undefined;
      return publishedArticles(articles, lang).find((entry) => entry.data.translationKey === translationKey);
    }
    ```
  - [ ] Alterar `src/content.config.ts` (loader `file()` para `talks` e `companies`, coleções `about` e `books`, `ABOUT_DIR`):

    ```diff
    diff --git a/src/content.config.ts b/src/content.config.ts
    index 1bc7fed..75c7524 100644
    --- a/src/content.config.ts
    +++ b/src/content.config.ts
    @@ -1,14 +1,17 @@
     import { defineCollection } from 'astro:content';
    -import { glob } from 'astro/loaders';
    +import { file, glob } from 'astro/loaders';
     import { z } from 'astro/zod';
     import { categoryKeys } from './i18n/categories';
     import { languages } from './i18n/ui';
     import { DESCRIPTION_MAX } from './lib/articles';
    +import { companyGroups } from './lib/companies';
     import { serviceKeys } from './lib/services';
    +import { SPOTIFY_ID, YOUTUBE_ID, talkTypes } from './lib/talks';
     
    -// ARTICLES_DIR e SERVICES_DIR só são usados pelos testes de build (tests/fixtures).
    +// ARTICLES_DIR, SERVICES_DIR e ABOUT_DIR só são usados pelos testes de build (tests/fixtures).
     const articlesBase = process.env.ARTICLES_DIR ?? './src/content/articles';
     const servicesBase = process.env.SERVICES_DIR ?? './src/content/services';
    +const aboutBase = process.env.ABOUT_DIR ?? './src/content/about';
     
     const localized = z.object({ pt: z.string().min(1), en: z.string().min(1) });
     
    @@ -32,29 +35,71 @@ const articles = defineCollection({
     });
     
     const talks = defineCollection({
    -  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/talks' }),
    +  loader: file('src/content/talks/talks.yaml'),
       schema: z.object({
    -    title: z.string().min(1),
    -    description: localized.optional(),
    -    type: z.enum(['palestra', 'podcast', 'webinar', 'entrevista']),
    +    order: z.number().int(),
    +    type: z.enum(talkTypes),
         event: z.string().min(1),
    -    date: z.coerce.date().optional(),
    -    url: z.url(),
    -    youtubeId: z.string().optional(),
    +    title: z.string().min(1),
    +    youtubeId: z.string().regex(YOUTUBE_ID).optional(),
    +    spotifyId: z.string().regex(SPOTIFY_ID).optional(),
         lang: z.enum(languages),
       }),
     });
     
     const companies = defineCollection({
    -  loader: glob({ pattern: '**/*.{yaml,yml}', base: './src/content/companies' }),
    +  loader: file('src/content/companies/companies.yaml'),
       schema: ({ image }) =>
         z.object({
    +      order: z.number().int(),
    +      group: z.enum(companyGroups),
    +      year: z.number().int().optional(),
           name: z.string().min(1),
           logo: image(),
           url: z.url(),
           role: localized,
           description: localized,
    +    }),
    +});
    +
    +const about = defineCollection({
    +  loader: glob({ pattern: '{pt,en}.yaml', base: aboutBase }),
    +  schema: z.object({
    +    lang: z.enum(languages),
    +    title: z.string().min(1),
    +    description: z.string().min(1).max(DESCRIPTION_MAX),
    +    bio: z.array(z.string().min(1)).min(1),
    +    timeline: z
    +      .array(
    +        z.object({
    +          year: z.number().int(),
    +          title: z.string().min(1),
    +          text: z.string().min(1),
    +          article: z.string().optional(),
    +        }),
    +      )
    +      .min(1),
    +    education: z.array(z.object({ degree: z.string().min(1), school: z.string().min(1), period: z.string().min(1) })).min(1),
    +    principles: z.array(z.object({ title: z.string().min(1), text: z.string().min(1) })).min(1),
    +  }),
    +});
    +
    +const books = defineCollection({
    +  loader: glob({ pattern: '{pt,en}/*.yaml', base: './src/content/books' }),
    +  schema: ({ image }) =>
    +    z.object({
    +      lang: z.enum(languages),
           order: z.number().int(),
    +      title: z.string().min(1),
    +      subtitle: z.string().min(1),
    +      description: z.string().min(1).max(DESCRIPTION_MAX),
    +      cover: image(),
    +      coverAlt: z.string().min(1),
    +      buyUrl: z.url(),
    +      siteUrl: z.url(),
    +      about: z.array(z.string().min(1)).min(1),
    +      audience: z.array(z.string().min(1)).min(1),
    +      contents: z.array(z.string().min(1)).min(1),
         }),
     });
     
    @@ -85,4 +130,4 @@ const services = defineCollection({
       }),
     });
     
    -export const collections = { articles, talks, companies, services };
    +export const collections = { articles, talks, companies, services, about, books };
    ```
  - [ ] Alterar `src/lib/collections.ts` (getters validados e índice das imagens preparadas):

    ```diff
    diff --git a/src/lib/collections.ts b/src/lib/collections.ts
    index 203674b..48a7b89 100644
    --- a/src/lib/collections.ts
    +++ b/src/lib/collections.ts
    @@ -1,9 +1,30 @@
     import { getCollection, type CollectionEntry } from 'astro:content';
    +import type { Lang } from '../i18n/ui';
    +import { validateAbout } from './about';
     import { validateArticles } from './articles';
    +import { validateCompanies } from './companies';
     import { validateServices } from './services';
    +import { validateTalks } from './talks';
     
     export type Article = CollectionEntry<'articles'>;
     export type Service = CollectionEntry<'services'>;
    +export type Talk = CollectionEntry<'talks'>;
    +export type Company = CollectionEntry<'companies'>;
    +export type About = CollectionEntry<'about'>;
    +export type Book = CollectionEntry<'books'>;
    +
    +// Imagens preparadas por `npm run assets`, indexadas pelo nome do arquivo.
    +const thumbnailFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/talks/*.jpg', { eager: true });
    +const maskFiles = import.meta.glob<{ default: ImageMetadata }>('../assets/companies/mono/*.png', { eager: true });
    +
    +function byBasename(files: Record<string, { default: ImageMetadata }>): Map<string, ImageMetadata> {
    +  return new Map(
    +    Object.entries(files).map(([path, module]) => [path.replace(/^.*\/([^/]+)\.\w+$/, '$1'), module.default]),
    +  );
    +}
    +
    +export const talkThumbnails = byBasename(thumbnailFiles);
    +export const companyMasks = byBasename(maskFiles);
     
     export async function getAllArticles(): Promise<Article[]> {
       const entries = await getCollection('articles');
    @@ -16,3 +37,27 @@ export async function getAllServices(): Promise<Service[]> {
       validateServices(services, articles);
       return services;
     }
    +
    +export async function getAllTalks(): Promise<Talk[]> {
    +  const talks = await getCollection('talks');
    +  validateTalks(talks, new Set(talkThumbnails.keys()));
    +  return talks;
    +}
    +
    +export async function getAllCompanies(): Promise<Company[]> {
    +  const companies = await getCollection('companies');
    +  validateCompanies(companies, new Set(companyMasks.keys()));
    +  return companies;
    +}
    +
    +export async function getAbout(lang: Lang): Promise<About> {
    +  const [entries, articles] = await Promise.all([getCollection('about'), getAllArticles()]);
    +  validateAbout(entries, articles);
    +  return entries.find((entry) => entry.data.lang === lang)!;
    +}
    +
    +export async function getBooks(lang: Lang): Promise<Book[]> {
    +  const books = await getCollection('books', (entry) => entry.data.lang === lang);
    +  if (books.length === 0) throw new Error(`Nenhum livro em ${lang} (src/content/books/${lang}/)`);
    +  return books.sort((a, b) => a.data.order - b.data.order);
    +}
    ```
  - [ ] Verificar — rodar `npx vitest run src/lib/talks.test.ts src/lib/companies.test.ts src/lib/about.test.ts && npm run check`, esperado: `Tests  14 passed (14)` e `0 errors`.

### Squad: Páginas institucionais
**Agent:** coder-frontend

- [ ] **Task 5: Textos de interface, tokens e `noindex` no SEO**
  - Files: `src/i18n/ui.ts`, `src/styles/tokens.css`, `src/lib/seo.test.ts`, `src/lib/seo.ts`
  - [ ] Alterar `src/lib/seo.test.ts` (teste primeiro):

    ```diff
    diff --git a/src/lib/seo.test.ts b/src/lib/seo.test.ts
    index f7ac3f7..6cae816 100644
    --- a/src/lib/seo.test.ts
    +++ b/src/lib/seo.test.ts
    @@ -101,4 +101,27 @@ describe('buildSeo', () => {
         expect(metaContent(seo, 'og:type')).toBe('website');
         expect(metaContent(seo, 'article:published_time')).toBeUndefined();
       });
    +
    +  it('deve marcar noindex e omitir os pares de idioma quando a página é de erro', () => {
    +    // Arrange
    +    const input = { ...base, path: '/404.html', alternatePath: '/en/', noindex: true };
    +
    +    // Act
    +    const seo = buildSeo(input);
    +
    +    // Assert
    +    expect(metaContent(seo, 'robots')).toBe('noindex');
    +    expect(seo.alternates).toEqual([]);
    +  });
    +
    +  it('deve omitir robots quando a página é indexável', () => {
    +    // Arrange
    +    const input = base;
    +
    +    // Act
    +    const seo = buildSeo(input);
    +
    +    // Assert
    +    expect(metaContent(seo, 'robots')).toBeUndefined();
    +  });
     });
    ```
  - [ ] Verificar — rodar `npx vitest run src/lib/seo.test.ts`, esperado: `1 failed` (noindex).
  - [ ] Alterar `src/lib/seo.ts`:

    ```diff
    diff --git a/src/lib/seo.ts b/src/lib/seo.ts
    index 2fea3d3..45533b4 100644
    --- a/src/lib/seo.ts
    +++ b/src/lib/seo.ts
    @@ -12,6 +12,8 @@ export interface SeoInput {
       image?: string;
       publishedTime?: Date;
       modifiedTime?: Date;
    +  // Páginas de erro: fora dos buscadores e sem par de idioma.
    +  noindex?: boolean;
     }
     
     export interface SeoData {
    @@ -54,16 +56,21 @@ export function buildSeo(input: SeoInput): SeoData {
       if (input.modifiedTime) {
         meta.push({ property: 'article:modified_time', content: input.modifiedTime.toISOString() });
       }
    +  if (input.noindex) {
    +    meta.push({ name: 'robots', content: 'noindex' });
    +  }
     
       return {
         title,
         description: input.description,
         canonical,
    -    alternates: [
    -      { hreflang: htmlLang.pt, href: ptUrl },
    -      { hreflang: htmlLang.en, href: enUrl },
    -      { hreflang: 'x-default', href: ptUrl },
    -    ],
    +    alternates: input.noindex
    +      ? []
    +      : [
    +          { hreflang: htmlLang.pt, href: ptUrl },
    +          { hreflang: htmlLang.en, href: enUrl },
    +          { hreflang: 'x-default', href: ptUrl },
    +        ],
         meta,
       };
     }
    ```
  - [ ] Alterar `src/i18n/ui.ts` (chaves novas nos dois idiomas; sai `hero.portraitAlt`, que vira `about.portraitAlt`):

    ```diff
    diff --git a/src/i18n/ui.ts b/src/i18n/ui.ts
    index 55c73ce..69e2a9f 100644
    --- a/src/i18n/ui.ts
    +++ b/src/i18n/ui.ts
    @@ -34,7 +34,6 @@ const pt = {
       'hero.subtitle':
         'Matheus Haddad ajuda CEOs e CTOs a redesenhar organizações para crescer com clareza, combinando estratégia de negócios, tecnologia e gestão de pessoas.',
       'hero.services': 'Ver serviços',
    -  'hero.portraitAlt': 'Matheus Haddad, empresário e consultor em negócios e tecnologia',
       'proof.label': 'Números e empresas',
       'proof.companies': 'empresas fundadas',
       'proof.years': 'anos de gestão',
    @@ -102,6 +101,50 @@ const pt = {
       'cta.educacao.text': 'Palestras e workshops adaptados ao seu público.',
       'cta.default.title': 'Quer levar essa conversa para a sua empresa?',
       'cta.default.text': 'Vamos conversar sobre o seu contexto.',
    +  'about.label': 'Sobre',
    +  'about.portraitAlt': 'Matheus Haddad, empresário e consultor em negócios e tecnologia',
    +  'about.timeline': 'Trajetória',
    +  'about.education': 'Formação',
    +  'about.principles': 'Princípios',
    +  'about.readArticle': 'Ler o artigo',
    +  'about.servicesLink': 'Ver serviços',
    +  'companies.label': 'Empresas',
    +  'companies.title': 'Empresas que cofundei e organizações onde atuo',
    +  'companies.description':
    +    'Empresas de tecnologia, finanças e educação cofundadas por Matheus Haddad desde 2008, e organizações onde atua como conselheiro e voluntário.',
    +  'companies.intro':
    +    'Desde 2008 cofundei cinco empresas em tecnologia, finanças e educação, e é delas que vem boa parte do que escrevo e ensino sobre gestão. Também contribuo como conselheiro e voluntário em organizações de empreendedorismo e de agilidade.',
    +  'companies.founded': 'Empresas cofundadas',
    +  'companies.board': 'Conselhos e voluntariado',
    +  'companies.visit': 'Visitar site',
    +  'companies.logoAlt': 'Logo: {name}',
    +  'books.label': 'Livro',
    +  'books.pageTitle': 'Livros',
    +  'books.buy': 'Comprar na Amazon',
    +  'books.site': 'Site oficial do livro',
    +  'books.about': 'Sobre o livro',
    +  'books.audience': 'Para quem é',
    +  'books.contents': 'O que você vai encontrar',
    +  'talks.title': 'Palestras, podcasts e entrevistas',
    +  'talks.intro': 'Algumas participações em eventos, podcasts e webinars.',
    +  'talks.filterLabel': 'Filtrar por tipo',
    +  'talks.all': 'Todos',
    +  'talks.filter.palestra': 'Palestras',
    +  'talks.filter.webinar': 'Webinars',
    +  'talks.filter.podcast': 'Podcasts',
    +  'talks.filter.entrevista': 'Entrevistas',
    +  'talks.type.palestra': 'Palestra',
    +  'talks.type.webinar': 'Webinar',
    +  'talks.type.podcast': 'Podcast',
    +  'talks.type.entrevista': 'Entrevista',
    +  'talks.play': 'Assistir: {title}',
    +  'talks.watchYouTube': 'Assistir no YouTube',
    +  'talks.listenSpotify': 'Ouvir no Spotify',
    +  'talks.inPortuguese': 'Em português',
    +  'notFound.title': 'Página não encontrada',
    +  'notFound.text': 'O endereço pode ter mudado com a reformulação do site.',
    +  'notFound.home': 'Ir para a Home',
    +  'notFound.articles': 'Ver artigos',
       'footer.tagline': 'Negócios, tecnologia e pessoas.',
       'footer.rss': 'RSS',
       'footer.rights': '© {year} Matheus Haddad. Todos os direitos reservados.',
    @@ -138,7 +181,6 @@ const en: Record<UIKey, string> = {
       'hero.subtitle':
         'Matheus Haddad helps CEOs and CTOs redesign organizations to grow with clarity, combining business strategy, technology, and people management.',
       'hero.services': 'See services',
    -  'hero.portraitAlt': 'Matheus Haddad, entrepreneur and consultant in business and technology',
       'proof.label': 'Numbers and companies',
       'proof.companies': 'companies founded',
       'proof.years': 'years in management',
    @@ -206,6 +248,50 @@ const en: Record<UIKey, string> = {
       'cta.educacao.text': 'Talks and workshops tailored to your audience.',
       'cta.default.title': 'Want to bring this conversation to your company?',
       'cta.default.text': "Let's talk about your context.",
    +  'about.label': 'About',
    +  'about.portraitAlt': 'Matheus Haddad, entrepreneur and consultant in business and technology',
    +  'about.timeline': 'Journey',
    +  'about.education': 'Education',
    +  'about.principles': 'Principles',
    +  'about.readArticle': 'Read the article',
    +  'about.servicesLink': 'See services',
    +  'companies.label': 'Companies',
    +  'companies.title': 'Companies I co-founded and organizations I work with',
    +  'companies.description':
    +    'Technology, finance and education companies co-founded by Matheus Haddad since 2008, and organizations where he serves as a board member and volunteer.',
    +  'companies.intro':
    +    'Since 2008 I have co-founded five companies in technology, finance and education, and they are the source of much of what I write and teach about management. I also contribute as a board member and volunteer to entrepreneurship and agility organizations.',
    +  'companies.founded': 'Co-founded companies',
    +  'companies.board': 'Boards and volunteering',
    +  'companies.visit': 'Visit website',
    +  'companies.logoAlt': '{name} logo',
    +  'books.label': 'Book',
    +  'books.pageTitle': 'Books',
    +  'books.buy': 'Buy on Amazon',
    +  'books.site': 'Official book website',
    +  'books.about': 'About the book',
    +  'books.audience': 'Who it is for',
    +  'books.contents': 'What you will find',
    +  'talks.title': 'Talks, podcasts and interviews',
    +  'talks.intro': 'Some of my appearances at events, podcasts and webinars.',
    +  'talks.filterLabel': 'Filter by type',
    +  'talks.all': 'All',
    +  'talks.filter.palestra': 'Talks',
    +  'talks.filter.webinar': 'Webinars',
    +  'talks.filter.podcast': 'Podcasts',
    +  'talks.filter.entrevista': 'Interviews',
    +  'talks.type.palestra': 'Talk',
    +  'talks.type.webinar': 'Webinar',
    +  'talks.type.podcast': 'Podcast',
    +  'talks.type.entrevista': 'Interview',
    +  'talks.play': 'Watch: {title}',
    +  'talks.watchYouTube': 'Watch on YouTube',
    +  'talks.listenSpotify': 'Listen on Spotify',
    +  'talks.inPortuguese': 'In Portuguese',
    +  'notFound.title': 'Page not found',
    +  'notFound.text': 'This address may have changed when the site was redesigned.',
    +  'notFound.home': 'Go to Home',
    +  'notFound.articles': 'See articles',
       'footer.tagline': 'Business, technology, and people.',
       'footer.rss': 'RSS',
       'footer.rights': '© {year} Matheus Haddad. All rights reserved.',
    ```
  - [ ] Alterar `src/styles/tokens.css`:

    ```diff
    diff --git a/src/styles/tokens.css b/src/styles/tokens.css
    index 12a22d1..7fe94b3 100644
    --- a/src/styles/tokens.css
    +++ b/src/styles/tokens.css
    @@ -78,6 +78,12 @@
       --width-portrait-tablet: 280px;
       --width-hero-title: 640px;
       --width-hero-text: 520px;
    +  --width-about-portrait: 320px;
    +  --width-logo-plate: 200px;
    +  --logo-height: 48px;
    +  /* Placa dos logos coloridos em Empresas: clara nos dois temas, porque os logos são feitos para fundo branco. */
    +  --logo-plate-bg: #ffffff;
    +  --year-column: 80px;
       --col-min-footer: 200px;
       --col-min-card: 300px;
       --gutter: 24px;
    ```
  - [ ] Verificar — rodar `npx vitest run src/lib/seo.test.ts src/i18n`, esperado: `Tests  30 passed (30)`.

- [ ] **Task 6: Sobre**
  - Files: `src/components/Timeline.astro`, `src/components/AboutPage.astro`, `src/components/home/FinalCta.astro`, `src/pages/sobre/index.astro`, `src/pages/en/about/index.astro`
  - [ ] Criar `src/components/Timeline.astro`:

    ```astro
    ---
    // Lista com marcador em mono à esquerda (ano ou período), como a trajetória do About.tsx.
    interface Item {
      marker: string;
      title: string;
      text: string;
      link?: { href: string; label: string };
    }

    interface Props {
      items: Item[];
    }

    const { items } = Astro.props;
    ---

    <ol class="timeline">
      {
        items.map((item) => (
          <li>
            <span class="marker mono">{item.marker}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              {item.link && (
                <a class="arrow-link" href={item.link.href}>
                  {item.link.label} <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
          </li>
        ))
      }
    </ol>

    <style>
      .timeline {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      li {
        display: grid;
        grid-template-columns: var(--year-column) 1fr;
        gap: var(--space-32);
        padding-block: var(--space-32);
        border-bottom: var(--border-width) solid var(--border);
      }

      li:first-child {
        padding-top: 0;
      }

      li:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }

      .marker {
        padding-top: var(--space-4);
        color: var(--accent);
        font-size: var(--fs-12);
      }

      h3 {
        margin-bottom: var(--space-4);
        font-size: var(--fs-20);
      }

      p {
        color: var(--text-muted);
        font-size: var(--fs-15);
        line-height: var(--lh-body);
      }

      .arrow-link {
        margin-top: var(--space-8);
      }

      @media (max-width: 767px) {
        li {
          grid-template-columns: 1fr;
          gap: var(--space-8);
        }
      }
    </style>
    ```
  - [ ] Alterar `src/components/home/FinalCta.astro` (`placement` e link opcional para Serviços):

    ```diff
    diff --git a/src/components/home/FinalCta.astro b/src/components/home/FinalCta.astro
    index 8d02159..717be36 100644
    --- a/src/components/home/FinalCta.astro
    +++ b/src/components/home/FinalCta.astro
    @@ -1,19 +1,34 @@
     ---
    +import Icon from '../Icon.astro';
     import WhatsAppButton from '../WhatsAppButton.astro';
    +import { routePath } from '../../i18n/routes';
     import { t, type Lang } from '../../i18n/ui';
     
     interface Props {
       lang: Lang;
    +  placement?: string;
    +  // Link "Ver serviços" ao lado do WhatsApp (Sobre e Empresas).
    +  showServices?: boolean;
     }
     
    -const { lang } = Astro.props;
    +const { lang, placement = 'home-cta', showServices = false } = Astro.props;
     ---
     
     <section class="final-cta" aria-labelledby="cta-heading">
       <div class="container inner">
         <h2 id="cta-heading">{t(lang, 'home.ctaTitle')}</h2>
         <p>{t(lang, 'home.ctaText')}</p>
    -    <WhatsAppButton lang={lang} placement="home-cta" size="large" />
    +    <div class="actions">
    +      <WhatsAppButton lang={lang} placement={placement} size="large" />
    +      {
    +        showServices && (
    +          <a class="button button--secondary button--large" href={routePath('services', lang)}>
    +            {t(lang, 'about.servicesLink')}
    +            <Icon name="arrow-right" size="s" />
    +          </a>
    +        )
    +      }
    +    </div>
       </div>
     </section>
     
    @@ -45,6 +60,13 @@ const { lang } = Astro.props;
         line-height: var(--lh-snug);
       }
     
    +  .actions {
    +    display: flex;
    +    flex-wrap: wrap;
    +    justify-content: center;
    +    gap: var(--space-12);
    +  }
    +
       @media (max-width: 767px) {
         .inner {
           padding-block: var(--space-64);
    ```
  - [ ] Criar `src/components/AboutPage.astro`:

    ```astro
    ---
    import { Image } from 'astro:assets';
    import portrait from '../assets/matheus-haddad.jpg';
    import Timeline from './Timeline.astro';
    import FinalCta from './home/FinalCta.astro';
    import BaseLayout from '../layouts/BaseLayout.astro';
    import { articlePath, routePath } from '../i18n/routes';
    import { otherLang, t, type Lang } from '../i18n/ui';
    import { timelineArticle } from '../lib/about';
    import { articleSlug } from '../lib/articles';
    import { getAbout, getAllArticles } from '../lib/collections';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;
    const [about, articles] = await Promise.all([getAbout(lang), getAllArticles()]);
    const { title, description, bio, timeline, education, principles } = about.data;
    const [lead, ...paragraphs] = bio;

    const journey = timeline.map((item) => {
      const article = timelineArticle(item.article, articles, lang);
      return {
        marker: String(item.year),
        title: item.title,
        text: item.text,
        link: article && { href: articlePath(lang, articleSlug(article)), label: t(lang, 'about.readArticle') },
      };
    });
    const degrees = education.map((item) => ({ marker: item.period, title: item.degree, text: item.school }));
    ---

    <BaseLayout lang={lang} title={t(lang, 'about.label')} description={description} alternatePath={routePath('about', otherLang(lang))}>
      <div class="container">
        <section class="intro">
          <div>
            <p class="label mono">{t(lang, 'about.label')}</p>
            <h1>{title}</h1>
            <p class="lead">{lead}</p>
            {paragraphs.map((paragraph) => <p class="bio">{paragraph}</p>)}
          </div>
          <div class="portrait">
            <Image
              src={portrait}
              alt={t(lang, 'about.portraitAlt')}
              widths={[320, 640]}
              sizes="320px"
              loading="eager"
              fetchpriority="high"
            />
          </div>
        </section>

        <section class="block" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading">{t(lang, 'about.timeline')}</h2>
          <Timeline items={journey} />
        </section>

        <section class="block" aria-labelledby="education-heading">
          <h2 id="education-heading">{t(lang, 'about.education')}</h2>
          <Timeline items={degrees} />
        </section>

        <section class="block principles" aria-labelledby="principles-heading">
          <h2 id="principles-heading">{t(lang, 'about.principles')}</h2>
          <ul>
            {
              principles.map((principle) => (
                <li>
                  <h3>{principle.title}</h3>
                  <p>{principle.text}</p>
                </li>
              ))
            }
          </ul>
        </section>
      </div>
      <FinalCta lang={lang} placement="about-cta" showServices />
    </BaseLayout>

    <style>
      .intro {
        display: grid;
        grid-template-columns: minmax(0, 1fr) var(--width-about-portrait);
        gap: var(--space-80);
        align-items: start;
        padding-block: var(--space-64) var(--space-80);
        border-bottom: var(--border-width) solid var(--border);
      }

      .label {
        margin-bottom: var(--space-24);
        color: var(--accent);
      }

      h1 {
        max-width: var(--width-reading);
        margin-bottom: var(--space-24);
        font-size: var(--fs-44);
        line-height: var(--lh-heading);
      }

      .lead {
        max-width: var(--width-reading);
        margin-bottom: var(--space-24);
        color: var(--text-muted);
        font-size: var(--fs-18);
        line-height: var(--lh-snug);
      }

      .bio {
        max-width: var(--width-reading);
        margin-bottom: var(--space-20);
        font-size: var(--fs-17);
        line-height: var(--lh-body);
      }

      .bio:last-child {
        margin-bottom: 0;
      }

      .portrait {
        position: sticky;
        top: calc(var(--header-height) + var(--space-16));
      }

      .portrait :global(img) {
        width: 100%;
        height: auto;
        aspect-ratio: 3 / 4;
        object-fit: cover;
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
      }

      .block {
        padding-block: var(--space-80);
        border-bottom: var(--border-width) solid var(--border);
      }

      .block:last-child {
        border-bottom: none;
      }

      h2 {
        margin-bottom: var(--space-48);
        font-size: var(--fs-32);
      }

      .principles ul {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(var(--col-min-footer), 1fr));
        gap: var(--space-32);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .principles li {
        padding-top: var(--space-24);
        border-top: var(--border-strong) solid var(--accent);
      }

      .principles h3 {
        margin-bottom: var(--space-12);
        font-size: var(--fs-20);
      }

      .principles p {
        color: var(--text-muted);
        font-size: var(--fs-15);
        line-height: var(--lh-body);
      }

      @media (max-width: 1023px) {
        .intro {
          grid-template-columns: minmax(0, 1fr) var(--width-portrait-tablet);
          gap: var(--space-40);
        }
      }

      @media (max-width: 767px) {
        .intro {
          grid-template-columns: 1fr;
          padding-block: var(--space-40) var(--space-64);
        }

        .portrait {
          position: static;
          order: -1;
          max-width: var(--width-portrait-tablet);
        }

        h1 {
          font-size: var(--fs-32);
        }

        .block {
          padding-block: var(--space-64);
        }

        h2 {
          margin-bottom: var(--space-32);
          font-size: var(--fs-26);
        }
      }
    </style>
    ```
  - [ ] Criar `src/pages/sobre/index.astro`:

    ```astro
    ---
    import AboutPage from '../../components/AboutPage.astro';
    ---

    <AboutPage lang="pt" />
    ```
  - [ ] Criar `src/pages/en/about/index.astro`:

    ```astro
    ---
    import AboutPage from '../../../components/AboutPage.astro';
    ---

    <AboutPage lang="en" />
    ```
  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts -t "Sobre"`, esperado: o teste do Sobre passa.

- [ ] **Task 7: Empresas**
  - Files: `src/components/CompanyRow.astro`, `src/components/CompaniesPage.astro`, `src/pages/empresas/index.astro`, `src/pages/en/companies/index.astro`
  - [ ] Criar `src/components/CompanyRow.astro`:

    ```astro
    ---
    import { Image } from 'astro:assets';
    import { t, type Lang } from '../i18n/ui';
    import type { Company } from '../lib/collections';

    interface Props {
      company: Company;
      lang: Lang;
    }

    const { company, lang } = Astro.props;
    const { name, year, role, description, logo, url } = company.data;
    const meta = [year, role[lang]].filter(Boolean).join(' · ');
    ---

    <li class="row">
      <div class="text">
        <p class="meta mono">{meta}</p>
        <h3>{name}</h3>
        <p class="description">{description[lang]}</p>
        <a class="arrow-link" href={url} target="_blank" rel="noopener">
          {t(lang, 'companies.visit')} <span aria-hidden="true">→</span>
        </a>
      </div>
      <div class="plate">
        <Image src={logo} alt={t(lang, 'companies.logoAlt', { name })} widths={[200, 400]} sizes="200px" />
      </div>
    </li>

    <style>
      .row {
        display: grid;
        grid-template-columns: minmax(0, 1fr) var(--width-logo-plate);
        gap: var(--space-48);
        align-items: start;
        padding-block: var(--space-40);
        border-bottom: var(--border-width) solid var(--border);
      }

      .meta {
        margin-bottom: var(--space-12);
        color: var(--text-muted);
        font-size: var(--fs-11);
      }

      h3 {
        margin-bottom: var(--space-12);
        font-size: var(--fs-26);
      }

      .description {
        max-width: var(--width-reading);
        margin-bottom: var(--space-16);
        color: var(--text-muted);
        font-size: var(--fs-16);
        line-height: var(--lh-body);
      }

      .plate {
        display: flex;
        align-items: center;
        justify-content: center;
        aspect-ratio: 16 / 9;
        padding: var(--space-20);
        background: var(--logo-plate-bg);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
      }

      .plate :global(img) {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      @media (max-width: 767px) {
        .row {
          grid-template-columns: 1fr;
          gap: var(--space-20);
        }

        .plate {
          order: -1;
          width: var(--width-logo-plate);
        }
      }
    </style>
    ```
  - [ ] Criar `src/components/CompaniesPage.astro`:

    ```astro
    ---
    import CompanyRow from './CompanyRow.astro';
    import FinalCta from './home/FinalCta.astro';
    import BaseLayout from '../layouts/BaseLayout.astro';
    import { routePath } from '../i18n/routes';
    import { otherLang, t, type Lang, type UIKey } from '../i18n/ui';
    import { getAllCompanies } from '../lib/collections';
    import { companiesByGroup, companyGroups, type CompanyGroup } from '../lib/companies';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;
    const groups = companiesByGroup(await getAllCompanies());
    const headings: Record<CompanyGroup, UIKey> = { founded: 'companies.founded', board: 'companies.board' };
    ---

    <BaseLayout
      lang={lang}
      title={t(lang, 'companies.label')}
      description={t(lang, 'companies.description')}
      alternatePath={routePath('companies', otherLang(lang))}
    >
      <div class="container page">
        <header class="intro">
          <p class="label mono">{t(lang, 'companies.label')}</p>
          <h1>{t(lang, 'companies.title')}</h1>
          <p class="lead">{t(lang, 'companies.intro')}</p>
        </header>

        {
          companyGroups.map((group) => (
            <section class="group" aria-labelledby={`${group}-heading`}>
              <h2 id={`${group}-heading`} class="mono">
                {t(lang, headings[group])}
              </h2>
              <ul>
                {groups[group].map((company) => (
                  <CompanyRow company={company} lang={lang} />
                ))}
              </ul>
            </section>
          ))
        }
      </div>
      <FinalCta lang={lang} placement="companies-cta" showServices />
    </BaseLayout>

    <style>
      .page {
        padding-block: var(--space-64) var(--space-96);
      }

      .intro {
        padding-bottom: var(--space-48);
        border-bottom: var(--border-width) solid var(--border);
      }

      .label {
        margin-bottom: var(--space-24);
        color: var(--accent);
      }

      h1 {
        max-width: var(--width-reading);
        margin-bottom: var(--space-12);
        font-size: var(--fs-44);
        line-height: var(--lh-heading);
      }

      .lead {
        max-width: var(--width-reading);
        color: var(--text-muted);
        font-size: var(--fs-18);
        line-height: var(--lh-snug);
      }

      .group {
        padding-top: var(--space-64);
      }

      h2 {
        padding-bottom: var(--space-16);
        color: var(--accent);
        font-size: var(--fs-12);
        border-bottom: var(--border-width) solid var(--border);
      }

      ul {
        margin: 0;
        padding: 0;
        list-style: none;
      }

      @media (max-width: 767px) {
        .page {
          padding-block: var(--space-40) var(--space-64);
        }

        h1 {
          font-size: var(--fs-32);
        }

        .group {
          padding-top: var(--space-48);
        }
      }
    </style>
    ```
  - [ ] Criar `src/pages/empresas/index.astro`:

    ```astro
    ---
    import CompaniesPage from '../../components/CompaniesPage.astro';
    ---

    <CompaniesPage lang="pt" />
    ```
  - [ ] Criar `src/pages/en/companies/index.astro`:

    ```astro
    ---
    import CompaniesPage from '../../../components/CompaniesPage.astro';
    ---

    <CompaniesPage lang="en" />
    ```
  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts -t "Empresas"`, esperado: o teste de Empresas passa.

- [ ] **Task 8: Livros**
  - Files: `src/components/BooksPage.astro`, `src/pages/livros/index.astro`, `src/pages/en/books/index.astro`
  - [ ] Criar `src/components/BooksPage.astro`:

    ```astro
    ---
    import { Image } from 'astro:assets';
    import Icon from './Icon.astro';
    import BaseLayout from '../layouts/BaseLayout.astro';
    import { routePath } from '../i18n/routes';
    import { otherLang, t, type Lang } from '../i18n/ui';
    import { getBooks } from '../lib/collections';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;
    const [book] = await getBooks(lang);
    const { title, subtitle, description, cover, coverAlt, buyUrl, siteUrl, about, audience, contents } = book.data;
    const lists = [
      { id: 'audience', heading: t(lang, 'books.audience'), items: audience },
      { id: 'contents', heading: t(lang, 'books.contents'), items: contents },
    ];
    ---

    <BaseLayout lang={lang} title={t(lang, 'books.pageTitle')} description={description} alternatePath={routePath('books', otherLang(lang))}>
      <div class="container">
        <section class="intro">
          <div>
            <p class="label mono">{t(lang, 'books.label')}</p>
            <h1>{title}</h1>
            <p class="subtitle">{subtitle}</p>
            <div class="actions">
              <a class="button button--primary button--large" href={buyUrl} target="_blank" rel="noopener">
                {t(lang, 'books.buy')}
              </a>
              <a class="button button--secondary button--large" href={siteUrl} target="_blank" rel="noopener">
                {t(lang, 'books.site')}
                <Icon name="arrow-right" size="s" />
              </a>
            </div>
          </div>
          <Image src={cover} alt={coverAlt} widths={[560, 1120]} sizes="(max-width: 767px) 100vw, 560px" loading="eager" />
        </section>

        <section class="block" aria-labelledby="about-heading">
          <h2 id="about-heading" class="section-title mono">{t(lang, 'books.about')}</h2>
          {about.map((paragraph) => <p class="paragraph">{paragraph}</p>)}
        </section>

        <div class="lists">
          {
            lists.map((list) => (
              <section aria-labelledby={`${list.id}-heading`}>
                <h2 id={`${list.id}-heading`} class="section-title mono">
                  {list.heading}
                </h2>
                <ul>
                  {list.items.map((item) => (
                    <li>
                      <span class="mark">
                        <Icon name="check" size="s" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))
          }
        </div>
      </div>

      <section class="final" aria-labelledby="final-heading">
        <div class="container final-inner">
          <h2 id="final-heading">{title}</h2>
          <p>{subtitle}</p>
          <div class="actions">
            <a class="button button--primary button--large" href={buyUrl} target="_blank" rel="noopener">
              {t(lang, 'books.buy')}
            </a>
            <a class="button button--secondary button--large" href={siteUrl} target="_blank" rel="noopener">
              {t(lang, 'books.site')}
              <Icon name="arrow-right" size="s" />
            </a>
          </div>
        </div>
      </section>
    </BaseLayout>

    <style>
      .intro {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
        gap: var(--space-64);
        align-items: center;
        padding-block: var(--space-64) var(--space-80);
        border-bottom: var(--border-width) solid var(--border);
      }

      .intro :global(img) {
        width: 100%;
        height: auto;
      }

      .label {
        margin-bottom: var(--space-24);
        color: var(--accent);
      }

      h1 {
        margin-bottom: var(--space-16);
        font-size: var(--fs-56);
        line-height: var(--lh-display);
      }

      .subtitle {
        max-width: var(--width-hero-text);
        margin-bottom: var(--space-40);
        color: var(--text-muted);
        font-size: var(--fs-20);
        line-height: var(--lh-snug);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-12);
      }

      .section-title {
        margin-bottom: var(--space-24);
        color: var(--accent);
        font-size: var(--fs-12);
      }

      .block {
        max-width: var(--width-reading);
        padding-block: var(--space-80) var(--space-48);
      }

      .paragraph {
        margin-bottom: var(--space-20);
        font-size: var(--fs-18);
        line-height: var(--lh-body);
      }

      .lists {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: var(--space-48);
        padding-bottom: var(--space-96);
      }

      .lists ul {
        display: flex;
        flex-direction: column;
        gap: var(--space-16);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .lists li {
        display: flex;
        gap: var(--space-12);
        color: var(--text-muted);
        font-size: var(--fs-16);
        line-height: var(--lh-body);
      }

      .mark {
        flex-shrink: 0;
        padding-top: var(--space-4);
        color: var(--accent);
      }

      .final {
        background: var(--accent-subtle);
        border-top: var(--border-width) solid var(--border);
        border-bottom: var(--border-width) solid var(--border);
      }

      .final-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--space-16);
        padding-block: var(--space-80);
        text-align: center;
      }

      .final h2 {
        font-size: var(--fs-40);
      }

      .final p {
        margin-bottom: var(--space-16);
        color: var(--text-muted);
        font-size: var(--fs-18);
      }

      .final .actions {
        justify-content: center;
      }

      @media (max-width: 767px) {
        .intro {
          grid-template-columns: 1fr;
          gap: var(--space-32);
          padding-block: var(--space-40) var(--space-64);
        }

        .intro :global(img) {
          order: -1;
        }

        h1 {
          font-size: var(--fs-40);
        }

        .block {
          padding-block: var(--space-64) var(--space-32);
        }

        .lists {
          grid-template-columns: 1fr;
          padding-bottom: var(--space-64);
        }

        .final h2 {
          font-size: var(--fs-32);
        }
      }
    </style>
    ```
  - [ ] Criar `src/pages/livros/index.astro`:

    ```astro
    ---
    import BooksPage from '../../components/BooksPage.astro';
    ---

    <BooksPage lang="pt" />
    ```
  - [ ] Criar `src/pages/en/books/index.astro`:

    ```astro
    ---
    import BooksPage from '../../../components/BooksPage.astro';
    ---

    <BooksPage lang="en" />
    ```
  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts -t "Livros"`, esperado: o teste de Livros passa.

- [ ] **Task 9: 404**
  - Files: `src/pages/404.astro`
  - [ ] Criar `src/pages/404.astro`:

    ```astro
    ---
    // 404 bilíngue (NotFound.tsx do Figma Make). Uma página só, em PT com o bloco em
    // inglês marcado com lang="en"; fora dos buscadores e do sitemap.
    import BaseLayout from '../layouts/BaseLayout.astro';
    import { routePath } from '../i18n/routes';
    import { t } from '../i18n/ui';
    ---

    <BaseLayout
      lang="pt"
      title={`${t('pt', 'notFound.title')} · ${t('en', 'notFound.title')}`}
      description={t('pt', 'notFound.text')}
      alternatePath={routePath('home', 'en')}
      noindex
    >
      <div class="container not-found">
        <p class="code mono">404</p>
        <h1>{t('pt', 'notFound.title')}</h1>
        <p class="text">{t('pt', 'notFound.text')}</p>
        <div class="actions">
          <a class="button button--primary button--large" href={routePath('home', 'pt')}>{t('pt', 'notFound.home')}</a>
          <a class="button button--secondary button--large" href={routePath('articles', 'pt')}>{t('pt', 'notFound.articles')}</a>
        </div>

        <div class="english" lang="en">
          <h2>{t('en', 'notFound.title')}</h2>
          <p class="text">{t('en', 'notFound.text')}</p>
          <div class="actions">
            <a class="arrow-link" href={routePath('home', 'en')}>{t('en', 'notFound.home')} <span aria-hidden="true">→</span></a>
            <a class="arrow-link" href={routePath('articles', 'en')}>{t('en', 'notFound.articles')} <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </BaseLayout>

    <style>
      .not-found {
        max-width: var(--width-reading);
        padding-block: var(--space-128);
        text-align: center;
      }

      .code {
        margin-bottom: var(--space-24);
        color: var(--accent);
        font-size: var(--fs-12);
      }

      h1 {
        margin-bottom: var(--space-8);
        font-size: var(--fs-40);
        line-height: var(--lh-heading);
      }

      .text {
        margin-bottom: var(--space-40);
        color: var(--text-muted);
        font-size: var(--fs-16);
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--space-12);
      }

      .english {
        margin-top: var(--space-64);
        padding-top: var(--space-48);
        border-top: var(--border-width) solid var(--border);
      }

      .english h2 {
        margin-bottom: var(--space-8);
        font-size: var(--fs-26);
      }

      .english .text {
        margin-bottom: var(--space-24);
      }

      .english .actions {
        gap: var(--space-32);
      }

      @media (max-width: 767px) {
        .not-found {
          padding-block: var(--space-80);
        }

        h1 {
          font-size: var(--fs-32);
        }
      }
    </style>
    ```
  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts -t "404"`, esperado: o teste da 404 passa.

### Squad: Palestras e Mídia
**Agent:** coder-frontend

- [ ] **Task 10: Acervo com filtro e fachada do YouTube**
  - Files: `src/components/TalkCard.astro`, `src/components/TalksArchive.astro`, `src/components/ServicePage.astro`, `src/pages/palestras/index.astro`, `src/pages/en/speaking/index.astro`
  - [ ] Criar `src/components/TalkCard.astro`:

    ```astro
    ---
    import { Image } from 'astro:assets';
    import GeometricPattern from './GeometricPattern.astro';
    import Icon from './Icon.astro';
    import { htmlLang, t, type Lang } from '../i18n/ui';
    import { talkThumbnails, type Talk } from '../lib/collections';
    import { spotifyUrl, youtubeWatchUrl } from '../lib/talks';

    interface Props {
      talk: Talk;
      lang: Lang;
    }

    const { talk, lang } = Astro.props;
    const { type, event, title, youtubeId, spotifyId } = talk.data;
    const thumbnail = youtubeId ? talkThumbnails.get(youtubeId) : undefined;
    // Títulos ficam no idioma original; na versão em inglês, marcamos o idioma.
    const contentLang = talk.data.lang === lang ? undefined : htmlLang[talk.data.lang];
    const link = youtubeId
      ? { href: youtubeWatchUrl(youtubeId), label: t(lang, 'talks.watchYouTube') }
      : { href: spotifyUrl(spotifyId!), label: t(lang, 'talks.listenSpotify') };
    ---

    <li class="card" data-type={type}>
      <div class="media">
        {
          youtubeId && thumbnail ? (
            <button
              class="play"
              type="button"
              data-youtube={youtubeId}
              data-title={title}
              aria-label={t(lang, 'talks.play', { title })}
            >
              <Image src={thumbnail} alt="" widths={[480]} sizes="(max-width: 767px) 100vw, 400px" loading="lazy" />
              <span class="play-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              </span>
            </button>
          ) : (
            <GeometricPattern category="coerencia" />
          )
        }
        <span class="badge mono">{t(lang, `talks.type.${type}`)}</span>
      </div>
      <div class="body">
        <p class="event mono" lang={contentLang}>{event}</p>
        <h3 lang={contentLang}>{title}</h3>
        {contentLang && <p class="original mono">{t(lang, 'talks.inPortuguese')}</p>}
        <a class="arrow-link" href={link.href} target="_blank" rel="noopener">
          {link.label}
          <Icon name="arrow-right" size="s" />
        </a>
      </div>
    </li>

    <style>
      .card {
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--bg);
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-m);
      }

      .card[hidden] {
        display: none;
      }

      .media {
        position: relative;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        background: var(--surface);
      }

      .media :global(iframe) {
        display: block;
        width: 100%;
        height: 100%;
        border: 0;
      }

      .play {
        position: relative;
        display: block;
        width: 100%;
        height: 100%;
        padding: 0;
        background: none;
        border: 0;
        cursor: pointer;
      }

      .play :global(img) {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .play::after {
        content: '';
        position: absolute;
        inset: 0;
        background: var(--overlay);
        transition: background var(--duration-fast);
      }

      .play:hover::after {
        background: none;
      }

      .play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        width: var(--touch-target-l);
        height: var(--touch-target-l);
        color: var(--accent-contrast);
        background: var(--accent);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: transform var(--duration-fast);
      }

      .play:hover .play-icon,
      .play:focus-visible .play-icon {
        transform: translate(-50%, -50%) scale(1.08);
      }

      .badge {
        position: absolute;
        top: var(--space-12);
        left: var(--space-12);
        z-index: 1;
        padding: var(--space-4) var(--space-8);
        color: var(--text);
        font-size: var(--fs-10);
        background: var(--bg);
        border-radius: var(--radius-s);
        pointer-events: none;
      }

      .body {
        display: flex;
        flex: 1;
        flex-direction: column;
        padding: var(--space-20);
      }

      .event {
        color: var(--text-muted);
        font-size: var(--fs-10);
      }

      h3 {
        margin: var(--space-8) 0 var(--space-12);
        font-size: var(--fs-18);
        line-height: var(--lh-snug);
      }

      .original {
        margin-bottom: var(--space-12);
        color: var(--text-muted);
        font-size: var(--fs-10);
      }

      .arrow-link {
        margin-top: auto;
      }
    </style>
    ```
  - [ ] Criar `src/components/TalksArchive.astro`:

    ```astro
    ---
    import TalkCard from './TalkCard.astro';
    import { t, type Lang } from '../i18n/ui';
    import { getAllTalks } from '../lib/collections';
    import { sortTalks, talkCounts, talkTypes } from '../lib/talks';

    interface Props {
      lang: Lang;
    }

    const { lang } = Astro.props;
    const talks = sortTalks(await getAllTalks());
    const counts = talkCounts(talks);
    const filters = [
      { key: 'all', label: t(lang, 'talks.all') },
      ...talkTypes.filter((type) => counts[type] > 0).map((type) => ({ key: type, label: t(lang, `talks.filter.${type}`) })),
    ];
    ---

    <section class="archive" aria-labelledby="talks-heading" data-talks>
      <div class="container">
        <header class="intro">
          <h2 id="talks-heading">{t(lang, 'talks.title')}</h2>
          <p>{t(lang, 'talks.intro')}</p>
        </header>

        <div class="filters" role="group" aria-label={t(lang, 'talks.filterLabel')}>
          {
            filters.map((filter) => (
              <button class="filter mono" type="button" data-filter={filter.key} aria-pressed={filter.key === 'all' ? 'true' : 'false'}>
                {filter.label}
              </button>
            ))
          }
        </div>

        <ul class="grid">
          {talks.map((talk) => <TalkCard talk={talk} lang={lang} />)}
        </ul>
      </div>
    </section>

    <script>
      import { YOUTUBE_ID, youtubeEmbedUrl } from '../lib/talks';

      document.querySelectorAll<HTMLElement>('[data-talks]').forEach((archive) => {
        const filters = archive.querySelectorAll<HTMLButtonElement>('[data-filter]');
        const cards = archive.querySelectorAll<HTMLElement>('[data-type]');

        filters.forEach((button) => {
          button.addEventListener('click', () => {
            const selected = button.dataset.filter;
            filters.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
            cards.forEach((card) => {
              card.hidden = selected !== 'all' && card.dataset.type !== selected;
            });
          });
        });

        // Fachada: o YouTube só é chamado depois do clique, em youtube-nocookie.com.
        archive.querySelectorAll<HTMLButtonElement>('[data-youtube]').forEach((button) => {
          button.addEventListener('click', () => {
            const id = button.dataset.youtube ?? '';
            if (!YOUTUBE_ID.test(id)) return;
            const iframe = document.createElement('iframe');
            iframe.src = youtubeEmbedUrl(id);
            iframe.title = button.dataset.title ?? '';
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.allowFullscreen = true;
            button.replaceWith(iframe);
            iframe.focus();
          });
        });
      });
    </script>

    <style>
      .archive {
        padding-block: var(--space-80) var(--space-96);
        border-top: var(--border-width) solid var(--border);
      }

      .intro {
        padding-bottom: var(--space-40);
        margin-bottom: var(--space-48);
        border-bottom: var(--border-width) solid var(--border);
      }

      h2 {
        margin-bottom: var(--space-12);
        font-size: var(--fs-40);
        line-height: var(--lh-heading);
      }

      .intro p {
        color: var(--text-muted);
        font-size: var(--fs-18);
      }

      .filters {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-8);
        margin-bottom: var(--space-48);
      }

      .filter {
        min-height: var(--touch-target);
        padding: var(--space-8) var(--space-16);
        color: var(--text-muted);
        font-size: var(--fs-11);
        background: none;
        border: var(--border-width) solid var(--border);
        border-radius: var(--radius-s);
        cursor: pointer;
        transition:
          color var(--duration-fast),
          border-color var(--duration-fast);
      }

      .filter:hover {
        color: var(--text);
        border-color: var(--text-muted);
      }

      .filter[aria-pressed='true'] {
        color: var(--accent-contrast);
        background: var(--accent);
        border-color: var(--accent);
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(var(--col-min-card), 1fr));
        gap: var(--space-24);
        margin: 0;
        padding: 0;
        list-style: none;
      }

      @media (max-width: 767px) {
        .archive {
          padding-block: var(--space-64);
        }

        h2 {
          font-size: var(--fs-32);
        }

        .grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
    ```
  - [ ] Alterar `src/components/ServicePage.astro` (slot `after`, de largura total):

    ```diff
    diff --git a/src/components/ServicePage.astro b/src/components/ServicePage.astro
    index 2740042..2d8bc76 100644
    --- a/src/components/ServicePage.astro
    +++ b/src/components/ServicePage.astro
    @@ -120,6 +120,9 @@ const related = relatedArticlesFor(service, articles);
           </div>
         </aside>
       </div>
    +
    +  <!-- Conteúdo de largura total abaixo do serviço (acervo de Palestras e Mídia). -->
    +  <slot name="after" />
     </BaseLayout>
     
     <style>
    ```
  - [ ] Alterar `src/pages/palestras/index.astro`:

    ```diff
    diff --git a/src/pages/palestras/index.astro b/src/pages/palestras/index.astro
    index 7a57cdf..1aa7ff3 100644
    --- a/src/pages/palestras/index.astro
    +++ b/src/pages/palestras/index.astro
    @@ -1,8 +1,11 @@
     ---
     import ServicePage from '../../components/ServicePage.astro';
    +import TalksArchive from '../../components/TalksArchive.astro';
     import { getAllArticles, getAllServices } from '../../lib/collections';
     
     const [services, articles] = await Promise.all([getAllServices(), getAllArticles()]);
     ---
     
    -<ServicePage lang="pt" serviceKey="palestras" services={services} articles={articles} />
    +<ServicePage lang="pt" serviceKey="palestras" services={services} articles={articles}>
    +  <TalksArchive slot="after" lang="pt" />
    +</ServicePage>
    ```
  - [ ] Alterar `src/pages/en/speaking/index.astro`:

    ```diff
    diff --git a/src/pages/en/speaking/index.astro b/src/pages/en/speaking/index.astro
    index a3f0a7e..ff7cbeb 100644
    --- a/src/pages/en/speaking/index.astro
    +++ b/src/pages/en/speaking/index.astro
    @@ -1,8 +1,11 @@
     ---
     import ServicePage from '../../../components/ServicePage.astro';
    +import TalksArchive from '../../../components/TalksArchive.astro';
     import { getAllArticles, getAllServices } from '../../../lib/collections';
     
     const [services, articles] = await Promise.all([getAllServices(), getAllArticles()]);
     ---
     
    -<ServicePage lang="en" serviceKey="palestras" services={services} articles={articles} />
    +<ServicePage lang="en" serviceKey="palestras" services={services} articles={articles}>
    +  <TalksArchive slot="after" lang="en" />
    +</ServicePage>
    ```
  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts -t "Palestras e Mídia"`, esperado: os 2 testes do acervo passam.
  - [ ] Conferir no navegador: o filtro esconde e mostra os cards; o clique no play troca a miniatura pelo vídeo de `youtube-nocookie.com`; antes do clique, a aba Rede não mostra nenhuma chamada ao YouTube.

### Squad: Home
**Agent:** coder-frontend

- [ ] **Task 11: Hero animado (já implementado e aprovado)**
  - Files: `src/lib/hero-field.test.ts`, `src/lib/hero-field.ts`, `src/components/home/Hero.astro`
  - [ ] Criar `src/lib/hero-field.test.ts`:

    ```ts
    import { describe, expect, it } from 'vitest';
    import { LINES, lineAlpha, lineBase, pointerBump, surfacePoint } from './hero-field';

    describe('lineBase', () => {
      it('deve juntar as linhas no fundo e abrir na frente quando percorre as linhas', () => {
        const far = lineBase(1) - lineBase(0);
        const near = lineBase(LINES - 1) - lineBase(LINES - 2);
        expect(far).toBeGreaterThan(0);
        expect(near).toBeGreaterThan(far * 2);
      });

      it('deve passar das duas bordas quando recebe a primeira e a última linha', () => {
        expect(lineBase(0)).toBeLessThan(0);
        expect(lineBase(LINES - 1)).toBeGreaterThan(1);
      });
    });

    describe('surfacePoint', () => {
      it('deve repetir o ponto quando recebe os mesmos argumentos', () => {
        expect(surfacePoint(0.3, 5, 2.5)).toEqual(surfacePoint(0.3, 5, 2.5));
      });

      it('deve mudar com o tempo quando a superfície ondula', () => {
        expect(surfacePoint(0.3, 20, 0).y).not.toBe(surfacePoint(0.3, 20, 1).y);
      });

      it('deve cobrir a altura toda quando percorre a largura e o tempo', () => {
        for (let x = 0; x <= 1; x += 0.05) {
          for (const time of [0, 3.7, 12.1, 40]) {
            const ys = Array.from({ length: LINES }, (_, line) => surfacePoint(x, line, time).y);
            expect(Math.min(...ys)).toBeLessThan(0.05);
            expect(Math.max(...ys)).toBeGreaterThan(0.95);
          }
        }
      });

      it('deve ondular mais na frente do que no fundo quando percorre a largura', () => {
        const range = (line: number) => {
          const ys: number[] = [];
          for (let x = 0; x <= 1; x += 0.02) ys.push(surfacePoint(x, line, 0).y);
          return Math.max(...ys) - Math.min(...ys);
        };
        expect(range(LINES - 1)).toBeGreaterThan(range(0));
      });

      it('deve manter a luz entre 0,2 e 1 e variar ao longo da linha quando percorre a largura', () => {
        const shades: number[] = [];
        for (let x = 0; x <= 1; x += 0.02) shades.push(surfacePoint(x, 30, 1.5).shade);
        for (const shade of shades) {
          expect(shade).toBeGreaterThanOrEqual(0.2);
          expect(shade).toBeLessThanOrEqual(1);
        }
        expect(Math.max(...shades) - Math.min(...shades)).toBeGreaterThan(0.4);
      });
    });

    describe('lineAlpha', () => {
      it('deve ficar entre 0 e 1 e crescer para as linhas da frente quando percorre as linhas', () => {
        const values = Array.from({ length: LINES }, (_, line) => lineAlpha(line));
        for (const value of values) {
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThanOrEqual(1);
        }
        expect(values[LINES - 1]).toBeGreaterThan(values[0]);
      });
    });

    describe('pointerBump', () => {
      it('deve levantar a onda quando o cursor está em cima do ponto', () => {
        expect(pointerBump(0.5, 0.5, { x: 0.5, y: 0.5 })).toBeLessThan(0);
      });

      it('deve ser zero quando o cursor está ausente ou longe', () => {
        expect(pointerBump(0.5, 0.5, null)).toBe(0);
        expect(Math.abs(pointerBump(0.05, 0.05, { x: 0.95, y: 0.95 }))).toBeLessThan(1e-6);
      });
    });
    ```
  - [ ] Criar `src/lib/hero-field.ts`:

    ```ts
    /*
     * Fundo animado da primeira dobra da home: uma superfície de ondas feita de
     * pontos cinza, vista em perspectiva, que ocupa toda a altura do hero e passa por
     * trás do texto. As coordenadas de tela são normalizadas (0 a 1) e convertidas
     * para pixels só no desenho.
     */

    export const LINES = 42;
    const AMPLITUDE = 0.2;
    const DOT_SPACING_PX = { far: 5, near: 12 };
    const DOT_SIZE_PX = { far: 1, near: 2.4 };
    const BUMP_HEIGHT = 0.06;
    const BUMP_RADIUS = 0.15;

    export interface Point {
      x: number;
      y: number;
    }

    export interface SurfacePoint {
      y: number;
      shade: number;
    }

    /** Profundidade da linha: 0 é a mais distante (alto da tela), 1 a mais próxima. */
    export function lineDepth(line: number): number {
      return line / (LINES - 1);
    }

    /**
     * Altura de repouso da linha na tela. As linhas se juntam no fundo e se abrem na
     * frente, como um plano visto em perspectiva. As das pontas passam um pouco da
     * borda (o canvas corta o excesso), para a onda cobrir a altura toda.
     */
    export function lineBase(line: number): number {
      return -0.1 + 1.35 * lineDepth(line) ** 1.35;
    }

    /**
     * Ponto da superfície na coluna `x` da tela, na linha `line`, no instante `time`
     * (segundos). A coluna é convertida para o mundo com a abertura da perspectiva;
     * duas ondas em direções diagonais diferentes formam as cristas, e a altura cresce
     * com a proximidade. `shade` (0,2 a 1) acende as cristas e apaga os vales.
     */
    export function surfacePoint(x: number, line: number, time: number): SurfacePoint {
      const depth = lineDepth(line);
      const spread = 0.6 + 0.9 * depth;
      const worldX = 0.5 + (x - 0.5) / spread;
      const worldZ = depth * 2.2;
      const height =
        Math.sin(Math.PI * 2 * (worldX * 1.1 + worldZ * 0.45) + time * 0.6) * 0.65 +
        Math.sin(Math.PI * 2 * (worldX * 0.5 - worldZ * 0.7) - time * 0.4) * 0.35;
      const y = lineBase(line) - height * AMPLITUDE * (0.3 + 0.7 * depth);
      const shade = 0.2 + 0.8 * ((height + 1) / 2) ** 1.5;
      return { y, shade };
    }

    /** Opacidade de cada linha: as do fundo somem, as da frente aparecem mais. */
    export function lineAlpha(line: number): number {
      return 0.15 + 0.6 * lineDepth(line);
    }

    /** Deformação causada pelo cursor: levanta a onda (y negativo) perto dele. */
    export function pointerBump(x: number, y: number, pointer: Point | null): number {
      if (!pointer) return 0;
      const distance = (x - pointer.x) ** 2 + (y - pointer.y) ** 2;
      return -BUMP_HEIGHT * Math.exp(-distance / (BUMP_RADIUS * BUMP_RADIUS));
    }

    /** Liga o fundo a um <canvas>. Só roda no navegador. */
    export function startHeroField(canvas: HTMLCanvasElement): void {
      const context = canvas.getContext('2d');
      if (!context) return;

      const root = document.documentElement;
      const still = window.matchMedia('(prefers-reduced-motion: reduce)');
      // O cursor age a partir de qualquer ponto da primeira dobra.
      const area = canvas.closest('section') ?? canvas;
      let width = 0;
      let height = 0;
      let target: Point | null = null;
      let pointer: Point | null = null;
      let visible = true;
      let frame = 0;
      let color = currentColor();

      function currentColor() {
        return getComputedStyle(root).getPropertyValue('--text-muted').trim();
      }

      function resize() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      }

      // O cursor é seguido com atraso, para a onda acompanhar sem tremer.
      function follow() {
        if (!target) {
          pointer = null;
          return;
        }
        pointer = pointer
          ? { x: pointer.x + (target.x - pointer.x) * 0.08, y: pointer.y + (target.y - pointer.y) * 0.08 }
          : { ...target };
      }

      function draw(time: number) {
        const seconds = time / 1000;
        const ctx = context!;
        ctx.clearRect(0, 0, width, height);
        if (width === 0 || height === 0) return;

        ctx.fillStyle = color;

        for (let line = 0; line < LINES; line++) {
          const depth = lineDepth(line);
          const alpha = lineAlpha(line);
          const spacing = DOT_SPACING_PX.far + (DOT_SPACING_PX.near - DOT_SPACING_PX.far) * depth;
          const size = DOT_SIZE_PX.far + (DOT_SIZE_PX.near - DOT_SIZE_PX.far) * depth;
          const half = size / 2;
          for (let px = 0; px <= width; px += spacing) {
            const x = px / width;
            const point = surfacePoint(x, line, seconds);
            const py = (point.y + pointerBump(x, point.y, pointer)) * height;
            ctx.globalAlpha = alpha * point.shade;
            ctx.fillRect(px - half, py - half, size, size);
          }
        }
        ctx.globalAlpha = 1;
      }

      function loop(time: number) {
        follow();
        draw(time);
        frame = requestAnimationFrame(loop);
      }

      function sync() {
        cancelAnimationFrame(frame);
        if (still.matches) {
          draw(0);
        } else if (visible && !document.hidden) {
          frame = requestAnimationFrame(loop);
        }
      }

      new ResizeObserver(() => {
        resize();
        if (still.matches) draw(0);
      }).observe(canvas);

      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      }).observe(canvas);

      new MutationObserver(() => {
        color = currentColor();
        if (still.matches) draw(0);
      }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });

      document.addEventListener('visibilitychange', sync);
      still.addEventListener('change', sync);

      area.addEventListener('pointermove', (event) => {
        if ((event as PointerEvent).pointerType !== 'mouse') return;
        const rect = canvas.getBoundingClientRect();
        const { clientX, clientY } = event as PointerEvent;
        target = { x: (clientX - rect.left) / rect.width, y: (clientY - rect.top) / rect.height };
      });
      area.addEventListener('pointerleave', () => {
        target = null;
      });

      resize();
      sync();
    }
    ```
  - [ ] Alterar `src/components/home/Hero.astro` (sai o retrato; o canvas cobre o hero inteiro):

    ```diff
    diff --git a/src/components/home/Hero.astro b/src/components/home/Hero.astro
    index 40421ea..133c0c1 100644
    --- a/src/components/home/Hero.astro
    +++ b/src/components/home/Hero.astro
    @@ -1,6 +1,4 @@
     ---
    -import { Image } from 'astro:assets';
    -import portrait from '../../assets/matheus-haddad.jpg';
     import Icon from '../Icon.astro';
     import WhatsAppButton from '../WhatsAppButton.astro';
     import { routePath } from '../../i18n/routes';
    @@ -14,44 +12,46 @@ const { lang } = Astro.props;
     ---
     
     <section class="hero">
    -  <div class="container hero-grid">
    -    <div class="text">
    -      <p class="label mono">{t(lang, 'hero.label')}</p>
    -      <h1>{t(lang, 'hero.title')}</h1>
    -      <p class="subtitle">{t(lang, 'hero.subtitle')}</p>
    -      <div class="ctas">
    -        <a class="button button--secondary button--large" href={routePath('services', lang)}>
    -          {t(lang, 'hero.services')}
    -          <Icon name="arrow-right" size="s" />
    -        </a>
    -        <WhatsAppButton lang={lang} placement="hero" size="large" />
    -      </div>
    -    </div>
    -    <div class="portrait">
    -      <Image
    -        src={portrait}
    -        alt={t(lang, 'hero.portraitAlt')}
    -        widths={[380, 760]}
    -        sizes="380px"
    -        loading="eager"
    -        fetchpriority="high"
    -      />
    -      <span class="corner" aria-hidden="true"></span>
    +  <div class="waves" aria-hidden="true">
    +    <canvas></canvas>
    +  </div>
    +  <div class="container hero-content">
    +    <p class="label mono">{t(lang, 'hero.label')}</p>
    +    <h1>{t(lang, 'hero.title')}</h1>
    +    <p class="subtitle">{t(lang, 'hero.subtitle')}</p>
    +    <div class="ctas">
    +      <a class="button button--secondary button--large" href={routePath('services', lang)}>
    +        {t(lang, 'hero.services')}
    +        <Icon name="arrow-right" size="s" />
    +      </a>
    +      <WhatsAppButton lang={lang} placement="hero" size="large" />
         </div>
       </div>
     </section>
     
     <style>
       .hero {
    +    position: relative;
    +    overflow: hidden;
         border-bottom: var(--border-width) solid var(--border);
       }
     
    -  .hero-grid {
    -    display: grid;
    -    grid-template-columns: 1fr var(--width-portrait);
    -    gap: var(--space-64);
    -    align-items: center;
    -    padding-block: var(--space-80) var(--space-96);
    +  .waves {
    +    position: absolute;
    +    inset: 0;
    +  }
    +
    +  .waves canvas {
    +    display: block;
    +    width: 100%;
    +    height: 100%;
    +    /* As ondas ficam mais discretas atrás do título. */
    +    mask-image: linear-gradient(to right, rgb(0 0 0 / 50%), #000 70%);
    +  }
    +
    +  .hero-content {
    +    position: relative;
    +    padding-block: var(--space-128);
       }
     
       .label {
    @@ -80,34 +80,9 @@ const { lang } = Astro.props;
         gap: var(--space-12);
       }
     
    -  .portrait {
    -    position: relative;
    -  }
    -
    -  .portrait :global(img) {
    -    width: 100%;
    -    height: auto;
    -    aspect-ratio: 3 / 4;
    -    object-fit: cover;
    -    border: var(--border-width) solid var(--border);
    -    border-radius: var(--radius-m);
    -    filter: grayscale(20%);
    -  }
    -
    -  .corner {
    -    position: absolute;
    -    bottom: calc(-1 * var(--space-16));
    -    left: calc(-1 * var(--space-16));
    -    width: var(--space-64);
    -    height: var(--space-64);
    -    border-bottom: var(--border-strong) solid var(--accent);
    -    border-left: var(--border-strong) solid var(--accent);
    -  }
    -
       @media (max-width: 1023px) {
    -    .hero-grid {
    -      grid-template-columns: 1fr var(--width-portrait-tablet);
    -      gap: var(--space-40);
    +    .hero-content {
    +      padding-block: var(--space-96);
         }
     
         h1 {
    @@ -116,17 +91,18 @@ const { lang } = Astro.props;
       }
     
       @media (max-width: 767px) {
    -    .hero-grid {
    -      grid-template-columns: 1fr;
    -      padding-block: var(--space-48) var(--space-64);
    +    .hero-content {
    +      padding-block: var(--space-64);
         }
     
         h1 {
           font-size: var(--fs-36);
         }
    -
    -    .portrait {
    -      display: none;
    -    }
       }
     </style>
    +
    +<script>
    +  import { startHeroField } from '../../lib/hero-field';
    +
    +  document.querySelectorAll<HTMLCanvasElement>('.hero .waves canvas').forEach(startHeroField);
    +</script>
    ```
  - [ ] Verificar — rodar `npx vitest run src/lib/hero-field.test.ts`, esperado: `Tests  10 passed (10)`.

- [ ] **Task 12: Logos monocromáticos na faixa de prova**
  - Files: `src/components/home/ProofBand.astro`
  - [ ] Alterar `src/components/home/ProofBand.astro`:

    ```diff
    diff --git a/src/components/home/ProofBand.astro b/src/components/home/ProofBand.astro
    index 2cc661f..1c0cf68 100644
    --- a/src/components/home/ProofBand.astro
    +++ b/src/components/home/ProofBand.astro
    @@ -1,5 +1,7 @@
     ---
     import { t, type Lang, type UIKey } from '../../i18n/ui';
    +import { companyMasks, getAllCompanies } from '../../lib/collections';
    +import { sortCompanies } from '../../lib/companies';
     
     interface Props {
       lang: Lang;
    @@ -14,16 +16,11 @@ const stats: { value: string; label: UIKey }[] = [
       { value: '500+', label: 'proof.leaders' },
     ];
     
    -const companies = [
    -  'Webgoal',
    -  'Ateliê de Software',
    -  'Granatum',
    -  'Lumiar',
    -  'Orgganica',
    -  'Aliança Empreendedora',
    -  'A Guarda-Chuva',
    -  'TugÁgil',
    -];
    +// Logos em máscara: pegam a cor do texto nos dois temas (npm run assets).
    +const companies = sortCompanies(await getAllCompanies()).map((company) => ({
    +  name: company.data.name,
    +  mask: companyMasks.get(company.id)!.src,
    +}));
     ---
     
     <section class="proof" aria-label={t(lang, 'proof.label')}>
    @@ -41,7 +38,13 @@ const companies = [
         <div class="companies">
           <p class="mono title">{t(lang, 'proof.logos')}</p>
           <ul>
    -        {companies.map((name) => <li>{name}</li>)}
    +        {
    +          companies.map(({ name, mask }) => (
    +            <li>
    +              <span class="logo" role="img" aria-label={name} style={`--logo: url(${mask})`} />
    +            </li>
    +          ))
    +        }
           </ul>
         </div>
       </div>
    @@ -94,21 +97,25 @@ const companies = [
       }
     
       ul {
    -    display: flex;
    -    flex-wrap: wrap;
    -    gap: var(--space-16);
    +    display: grid;
    +    grid-template-columns: repeat(8, 1fr);
    +    gap: var(--space-24);
    +    align-items: center;
         margin: 0;
         padding: 0;
         list-style: none;
       }
     
       li {
    -    padding: var(--space-8) var(--space-16);
    -    border: var(--border-width) solid var(--border);
    -    border-radius: var(--radius-s);
         color: var(--text-muted);
    -    font-size: var(--fs-13);
    -    font-weight: 600;
    +  }
    +
    +  .logo {
    +    display: block;
    +    width: 100%;
    +    height: var(--logo-height);
    +    background: currentColor;
    +    mask: var(--logo) center / contain no-repeat;
       }
     
       @media (max-width: 767px) {
    @@ -121,4 +128,10 @@ const companies = [
           padding: var(--space-16);
         }
       }
    +
    +  @media (max-width: 1023px) {
    +    ul {
    +      grid-template-columns: repeat(4, 1fr);
    +    }
    +  }
     </style>
    ```
  - [ ] Verificar — rodar `npx vitest run tests/build.test.ts -t "home"`, esperado: os testes da home passam.

### Squad: Testes de build
**Agent:** coder-frontend

- [ ] **Task 13: Testes de build da Onda 4** (escritos antes das páginas; ficam vermelhos até cada squad entregar)
  - Files: `tests/build.test.ts`
  - [ ] Alterar `tests/build.test.ts` (`ABOUT_DIR`, home com logos e os blocos da Onda 4; o teste do hero troca o retrato pelo canvas):

    ```diff
    diff --git a/tests/build.test.ts b/tests/build.test.ts
    index 5fc3e65..c688bba 100644
    --- a/tests/build.test.ts
    +++ b/tests/build.test.ts
    @@ -23,7 +23,12 @@ function exists(path: string): boolean {
     beforeAll(() => {
       rmSync(OUT_DIR, { recursive: true, force: true });
       execFileSync('node_modules/.bin/astro', ['build', '--outDir', OUT_DIR], {
    -    env: { ...buildEnv, ARTICLES_DIR: './tests/fixtures/articles', SERVICES_DIR: './tests/fixtures/services' },
    +    env: {
    +      ...buildEnv,
    +      ARTICLES_DIR: './tests/fixtures/articles',
    +      SERVICES_DIR: './tests/fixtures/services',
    +      ABOUT_DIR: './tests/fixtures/about',
    +    },
         stdio: 'pipe',
       });
     }, 120_000);
    @@ -392,7 +397,7 @@ describe('página de artigo — Onda 2', () => {
     });
     
     describe('home', () => {
    -  it('deve mostrar hero com retrato, faixa de prova e os artigos mais recentes quando a home é gerada', () => {
    +  it('deve mostrar hero com campo animado, faixa de prova e os artigos mais recentes quando a home é gerada', () => {
         // Arrange
         const html = page('index.html');
     
    @@ -403,9 +408,8 @@ describe('home', () => {
     
         // Assert
         expect(h1).toBe('Negócios, tecnologia e pessoas: como organizações crescem na era da IA.');
    -    expect(html).toMatch(/<img[^>]*alt="Matheus Haddad, empresário e consultor em negócios e tecnologia"/);
    +    expect(html).toMatch(/<div class="waves"[^>]*aria-hidden="true"[^>]*>\s*<canvas/);
         expect(html).toContain('500+');
    -    expect(html).toContain('TugÁgil');
         expect(featured).toBeGreaterThan(-1);
         expect(older).toBeGreaterThan(featured);
         expect(html).not.toContain('Rascunho de teste');
    @@ -559,3 +563,154 @@ describe('WhatsApp por página e chamada no fim do artigo — Onda 3', () => {
         expect(cta).toContain('href="/en/mentoring/"');
       });
     });
    +
    +describe('home — Onda 4', () => {
    +  it('deve mostrar os 8 logos em máscara com o nome acessível quando a faixa de prova é gerada', () => {
    +    // Arrange
    +    const html = page('index.html');
    +
    +    // Act
    +    const logos = [...html.matchAll(/<span class="logo"[^>]*role="img"[^>]*aria-label="([^"]+)"[^>]*style="--logo: url\(([^)]+)\)"/g)];
    +
    +    // Assert
    +    expect(logos.map((m) => m[1])).toEqual([
    +      'Webgoal',
    +      'Granatum Financeiro',
    +      'Ateliê de Software',
    +      'Orgganica',
    +      'Escola Lumiar Poços de Caldas',
    +      'Aliança Empreendedora',
    +      'A Guarda-Chuva',
    +      'TugÁgil',
    +    ]);
    +    expect(logos.every((m) => m[2]?.startsWith('/_astro/'))).toBe(true);
    +  });
    +});
    +
    +describe('páginas institucionais — Onda 4', () => {
    +  const pages = [
    +    ['sobre/index.html', 'en/about/index.html'],
    +    ['empresas/index.html', 'en/companies/index.html'],
    +    ['livros/index.html', 'en/books/index.html'],
    +  ];
    +
    +  it('deve gerar Sobre, Empresas e Livros nos dois idiomas com hreflang cruzado quando o build termina', () => {
    +    // Arrange
    +    const pairs = pages;
    +
    +    // Act
    +    const crossLinks = pairs.map(([pt = '', en = '']) => {
    +      const ptPath = `/${pt.replace('index.html', '')}`;
    +      const enPath = `/${en.replace('index.html', '')}`;
    +      return (
    +        page(pt).includes(`hreflang="en" href="${SITE}${enPath}"`) && page(en).includes(`hreflang="pt-BR" href="${SITE}${ptPath}"`)
    +      );
    +    });
    +
    +    // Assert
    +    expect(crossLinks).toEqual([true, true, true]);
    +  });
    +
    +  it('deve mostrar retrato, trajetória com link para o artigo, formação e princípios quando a página é o Sobre', () => {
    +    // Arrange
    +    const html = page('en/about/index.html');
    +
    +    // Act
    +    const headings = [...html.matchAll(/<h2 id="[a-z]+-heading"[^>]*>([^<]+)<\/h2>/g)].map((m) => m[1]);
    +    const timeline = /<section[^>]*aria-labelledby="timeline-heading"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    +
    +    // Assert
    +    expect(html).toMatch(/<img[^>]*alt="Matheus Haddad, entrepreneur and consultant in business and technology"/);
    +    expect(html).toContain('Test About title.');
    +    expect(headings).toEqual(['Journey', 'Education', 'Principles', 'Let&#39;s talk?']);
    +    expect((timeline.match(/<li/g) ?? []).length).toBe(2);
    +    expect(timeline).toContain('href="/en/articles/first-article/"');
    +    expect(html).toContain('href="/en/services/"');
    +  });
    +
    +  it('deve listar as 8 empresas em 2 grupos com link externo seguro quando a página é Empresas', () => {
    +    // Arrange
    +    const html = page('empresas/index.html');
    +
    +    // Act
    +    const founded = /<section[^>]*aria-labelledby="founded-heading"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    +    const board = /<section[^>]*aria-labelledby="board-heading"[\s\S]*?<\/section>/.exec(html)?.[0] ?? '';
    +    const external = [...html.matchAll(/<a class="arrow-link"[^>]*href="(https:[^"]+)"[^>]*>/g)].map((m) => m[0]);
    +
    +    // Assert
    +    expect((founded.match(/<li class="row"/g) ?? []).length).toBe(5);
    +    expect((board.match(/<li class="row"/g) ?? []).length).toBe(3);
    +    expect(founded).toContain('2008 · Cofundador');
    +    expect(board).toContain('Voluntário');
    +    expect(external).toHaveLength(8);
    +    expect(external.every((tag) => tag.includes('rel="noopener"') && tag.includes('target="_blank"'))).toBe(true);
    +    expect(html).toMatch(/<img[^>]*alt="Logo: Granatum Financeiro"/);
    +  });
    +
    +  it('deve apontar para a edição de cada idioma na Amazon quando a página é Livros', () => {
    +    // Arrange
    +    const pt = page('livros/index.html');
    +    const en = page('en/books/index.html');
    +
    +    // Act
    +    const amazon = (html: string) => [...new Set([...html.matchAll(/href="(https:\/\/www\.amazon[^"]+)"/g)].map((m) => m[1]))];
    +
    +    // Assert
    +    expect(amazon(pt)).toEqual(['https://www.amazon.com.br/Feedback-Canvas-cultura-feedback-organiza%C3%A7%C3%A3o-ebook/dp/B0FBGWMFSZ/']);
    +    expect(amazon(en)).toEqual(['https://www.amazon.com/dp/B0FNLM47WB/']);
    +    expect(en).toContain('Create a feedback culture in your organization');
    +  });
    +});
    +
    +describe('Palestras e Mídia — Onda 4', () => {
    +  it('deve mostrar os 23 itens do acervo com o filtro por tipo abaixo do bloco de serviço', () => {
    +    // Arrange
    +    const html = page('palestras/index.html');
    +
    +    // Act
    +    const cards = [...html.matchAll(/<li class="card"[^>]*data-type="([a-z]+)"/g)].map((m) => m[1]);
    +    const filters = [...html.matchAll(/<button class="filter mono"[^>]*data-filter="([a-z]+)"/g)].map((m) => m[1]);
    +    const service = html.indexOf('id="steps-heading"');
    +    const archive = html.indexOf('id="talks-heading"');
    +
    +    // Assert
    +    expect(cards).toHaveLength(23);
    +    expect(filters).toEqual(['all', 'palestra', 'webinar', 'podcast', 'entrevista']);
    +    expect(archive).toBeGreaterThan(service);
    +  });
    +
    +  it('deve carregar o YouTube só no clique, com miniaturas locais, quando o acervo é gerado', () => {
    +    // Arrange
    +    const html = page('en/speaking/index.html');
    +
    +    // Act
    +    const plays = (html.match(/<button class="play"[^>]*data-youtube="[A-Za-z0-9_-]{11}"/g) ?? []).length;
    +    const spotify = (html.match(/href="https:\/\/open\.spotify\.com\/episode\/[A-Za-z0-9]{22}"/g) ?? []).length;
    +
    +    // Assert
    +    expect(plays).toBe(20);
    +    expect(spotify).toBe(3);
    +    expect(html).not.toContain('<iframe');
    +    expect(html).not.toMatch(/<img[^>]*src="https?:/);
    +    expect(html).toContain('In Portuguese');
    +  });
    +});
    +
    +describe('404 — Onda 4', () => {
    +  it('deve gerar a 404 bilíngue fora dos buscadores e do sitemap quando o build termina', () => {
    +    // Arrange
    +    const html = page('404.html');
    +    const sitemap = page('sitemap-0.xml');
    +
    +    // Act
    +    const headings = [...html.matchAll(/<h[12][^>]*>([^<]+)<\/h[12]>/g)].map((m) => m[1]);
    +
    +    // Assert
    +    expect(headings).toEqual(['Página não encontrada', 'Page not found']);
    +    expect(html).toContain('<meta name="robots" content="noindex">');
    +    expect(html).not.toMatch(/<link rel="alternate" hreflang=/);
    +    expect(html).toContain('<div class="english" lang="en"');
    +    expect(sitemap).not.toContain('404');
    +  });
    +});
    +
    ```
  - [ ] Verificar — rodar `npm test`, esperado: `Test Files  24 passed (24)` e `Tests  180 passed (180)`.
  - [ ] Verificar — rodar `npm run check`, esperado: `0 errors`, `0 warnings`, `0 hints`.
  - [ ] Verificar — rodar `npm run build`, esperado: `Complete!` com `/sobre/`, `/empresas/`, `/livros/`, `/404.html` e os equivalentes em `/en/`.
  - [ ] Verificação visual — capturas do Sobre, de Empresas, de Palestras (filtro e um vídeo aberto), de Livros, da 404 e da home, em 1440 px e 390 px, nos dois temas.
