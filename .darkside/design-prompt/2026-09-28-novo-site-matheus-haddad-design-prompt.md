✅ Design Prompt completed — 28/09/2026 22:27

# Design Prompt: Novo site de Matheus Haddad

**Fontes:** `.darkside/discover/2026-09-28-site-autoridade-blog.md` · `.darkside/tech-design/2026-09-28-novo-site-astro-plan.md`

## Context

- **Domínio e propósito:** site pessoal de Matheus Haddad (`matheushaddad.com`), empresário, empreendedor e consultor em negócios e tecnologia. É um hub de autoridade que reúne artigos, palestras, empresas e serviços em torno de Gestão, Liderança, AI e Desenvolvimento de Software, e converte credibilidade em conversas de negócio. Objetivo: sair de 0 para ≥ 5 contatos qualificados por mês em 6 meses.
- **Personas:**
  - **Ricardo (principal):** 46 anos, CEO de empresa grande com tecnologia no core (fintech, healthtech). Chega aquecido (LinkedIn, palestra, podcast), quer confirmar se Matheus entende de tecnologia e AI, e não "só de RH".
  - **Juliana (secundária):** 34 anos, head de engenharia recém-promovida, busca mentoria individual.
- **Jornada principal:** link compartilhado (LinkedIn/WhatsApp) → artigo → outros artigos do tema → Sobre/Empresas → página de serviço → clique em "Conversar no WhatsApp" com mensagem pré-preenchida.
- **Páginas:** Home, Sobre, Consultoria, Mentoria, Palestras e mídia, Empresas (+ página por empresa na onda 5), Livros, Artigos (lista, categoria, artigo), 404. Sem página de contato: botão de WhatsApp no header, no rodapé e nas páginas de serviço.
- **Conteúdo:** 35 artigos em 6 categorias (Gestão e Design Organizacional; Coerência Cognitiva e P-O Fit; AI, Trabalho e Organizações; Desenvolvimento de Software; Educação; Hobbies), ~23 palestras/podcasts, 8 empresas e organizações, livro Feedback Canvas.
- **Restrições:** bilíngue completo (PT/EN, seletor de idioma para a página equivalente); mobile-first (a maioria chega por links no celular); < 3 s no 4G; WCAG 2.1 AA básico; prévias de compartilhamento 1200×630; fontes self-hosted; ícones SVG; Astro estático sem backend; orçamento zero; fotos novas ainda não produzidas.
- **Design system:** não existe. A nova identidade visual e o design system serão criados agora; o visual atual (Montserrat/Lato, terracota) e os protótipos anteriores não são ponto de partida.

## Discovery

1. **Personalidade visual:** editorial com assinatura tech. Base sóbria de revista de negócios (muito espaço em branco, tipografia forte, texto protagonista) com detalhes pontuais de produto de software (monoespaçada em rótulos e datas, uma cor de destaque vibrante, grids precisos). Deve transmitir "pensador e construtor" ao mesmo tempo.
2. **Cor:** base neutra (preto, branco, cinzas) + **uma** cor de destaque **azul elétrico/cobalto** (tecnologia, confiança, racionalidade) para links, botões e detalhes.
3. **Tipografia:** serifada nos títulos (ex.: Fraunces ou Newsreader) + sem serifa no texto (ex.: Inter) + monoespaçada em detalhes como datas, categorias e rótulos (ex.: JetBrains Mono). Todas gratuitas e self-hosted.
4. **Imagens:** retrato de Matheus em destaque (home e Sobre) + fotos de contexto quando houver (palcos de palestra, equipes, eventos) + **sistema gráfico por categoria** (padrão geométrico ou ícone abstrato na cor de destaque) para capas de artigos e prévias de compartilhamento. Matheus reunirá fotos de palestras já existentes; o layout precisa funcionar bem também sem elas.
5. **Hierarquia da home:** híbrida. Primeira dobra com posicionamento + retrato e uma faixa de prova (números e logos das empresas). Em seguida: artigos em destaque por tema, serviços e palestras.
6. **Modo escuro:** claro e escuro automáticos (segue o sistema do visitante) **com botão de alternância no header** que lembra a escolha. O design system nasce com as duas paletas. ⚠️ Acrescenta escopo à onda 2; todo componente precisa ser validado nos dois modos, inclusive o contraste do azul de destaque.
7. **Marca:** nome "Matheus Haddad" por extenso na serifada dos títulos, sem símbolo. Favicon com as iniciais "MH".

## Design Decisions

1. **Navegação — enxuta (A).** Header com 4 itens (Artigos, Serviços, Empresas, Sobre) + seletor de idioma + alternância de tema + botão "WhatsApp". "Serviços" leva a uma página que reúne Consultoria, Mentoria e Palestras. Livros fica no rodapé. No celular, menu em sobreposição (overlay). *Krug — Don't make me think; Nielsen H8 — design estético e minimalista.*
2. **Página de artigo — leitura rica (C).** Categoria e data em monoespaçada, título, tempo de leitura, coluna de leitura confortável; índice lateral fixo no desktop (recolhível no mobile); barra de progresso de leitura; blocos de destaque para citações; bloco de autor no fim ("Quem escreve": foto, linha de posicionamento, link para Sobre); botões de compartilhar (LinkedIn, WhatsApp, copiar link); aviso "Publicado originalmente no LinkedIn/Medium em [data]" nos migrados; chamada para o serviço relacionado; espaço para artigos relacionados (onda 5). *Nielsen H7 — flexibilidade e eficiência; H1 — visibilidade do status (progresso, origem, data).*
3. **Lista de artigos — destaque + grade (B).** Artigo mais recente em destaque grande com capa; demais em grade de cards com a capa gráfica da categoria, categoria e data em monoespaçada, título e resumo; filtros por categoria com contagem de artigos. *Nielsen H8 — hierarquia visual; Krug — o mais importante é o mais visível.*
4. **Páginas de serviço — com prova (B).** Para quem é, problema que resolve, temas e abordagens, como funciona em 3 passos, logos de empresas/contextos onde já atuou, 2–3 artigos de Matheus sobre o tema como prova de pensamento, botão "Conversar no WhatsApp" no topo e no fim. *Nielsen H2 — linguagem do mundo do cliente; Continuous Discovery — oferta ligada ao problema real.*

## Final Context

- **Projeto:** novo site pessoal de Matheus Haddad (`matheushaddad.com`), hub de autoridade em Gestão, Liderança, AI e Desenvolvimento de Software, que converte credibilidade em conversas de negócio pelo WhatsApp.
- **Usuários:** Ricardo (principal), CEO de empresa grande com tecnologia no core, chega aquecido por links e quer confirmar competência em tecnologia e negócios; Juliana (secundária), head de engenharia buscando mentoria.
- **Plataforma:** web responsiva, **mobile-first** (maioria chega pelo celular via WhatsApp/LinkedIn); breakpoints mobile (360–767), tablet (768–1023) e desktop (≥ 1024, coluna de conteúdo até ~1200). Bilíngue PT/EN.
- **Design system (a criar):**
  - Personalidade: **editorial com assinatura tech**.
  - Cor: neutros (preto, branco, cinzas) + um destaque **azul elétrico/cobalto**; paletas **clara e escura**, com contraste AA nos dois modos.
  - Tipografia: serifada nos títulos (Fraunces ou Newsreader), sem serifa no texto (Inter), monoespaçada em datas, categorias e rótulos (JetBrains Mono).
  - Marca: "Matheus Haddad" por extenso na serifada; favicon "MH".
  - Imagens: retrato em destaque, fotos de contexto quando houver, sistema gráfico por categoria (6 padrões geométricos) para capas e prévias 1200×630.
  - Ícones em SVG de traço fino.
- **Fluxos principais:**
  1. Link compartilhado → artigo → outros artigos → Sobre/Empresas → serviço → WhatsApp.
  2. Home → serviço → WhatsApp.
  3. Home → Artigos → filtro por categoria → artigo.
- **Decisões de design:** navegação enxuta (Artigos, Serviços, Empresas, Sobre + idioma + tema + WhatsApp); home híbrida (posicionamento + retrato + faixa de prova, depois artigos por tema, serviços e palestras); artigo com leitura rica; lista com destaque + grade + filtros com contagem; serviços com prova.
- **Restrições:**
  - Acessibilidade WCAG 2.1 AA: contraste, foco visível, navegação por teclado, `alt` em imagens, alvos de toque ≥ 44 px, respeito a `prefers-reduced-motion`.
  - Feedback: estados de hover, foco, ativo e visitado; confirmação ao copiar link; indicação do idioma e do tema atuais.
  - Estados de erro e vazios: 404 bilíngue; categoria sem artigos oculta; imagem de capa ausente usa o padrão da categoria; vídeo que não carrega mostra fachada com link.
  - Performance: páginas leves, poucas animações, fontes self-hosted.
  - Sem formulários, sem página de contato, sem séries.

## Prompts

### Lo-Fi

```
Crie wireframes de baixa fidelidade (tons de cinza, sem cor, sem tipografia final, blocos e textos de exemplo) para o site pessoal de Matheus Haddad, empresário e consultor em negócios e tecnologia. O objetivo é validar estrutura, hierarquia e fluxo de navegação.

Público principal: CEOs e CTOs de empresas de tecnologia que chegam por links compartilhados no LinkedIn e no WhatsApp, quase sempre pelo celular. O site deve levar da leitura de um artigo até o contato pelo WhatsApp.

Gere cada tela em duas larguras: celular (390 px) e desktop (1440 px).

Elementos globais:
- Header: nome "Matheus Haddad" à esquerda; menu com 4 itens (Artigos, Serviços, Empresas, Sobre); à direita, seletor de idioma (PT/EN), botão de alternância de tema claro/escuro e botão "WhatsApp". No celular: nome, botão "WhatsApp" e ícone de menu que abre um menu em sobreposição de tela cheia com os mesmos itens, idioma e tema.
- Rodapé: nome e uma linha de posicionamento; links de navegação (incluindo Livros); links sociais (LinkedIn, Instagram, X); botão "Conversar no WhatsApp"; seletor de idioma.

Telas:
1. Home: primeira dobra com título de posicionamento, subtítulo, retrato à direita (abaixo do texto no celular) e dois botões (Ver serviços; Conversar no WhatsApp); faixa de prova com 3 números e 8 logos de empresas. Depois: artigos em destaque por tema (3 cards), bloco de serviços (3 cards: Consultoria, Mentoria, Palestras), bloco de palestras e mídia (3 itens) e chamada final para o WhatsApp.
2. Artigos (lista): título da página; filtros por categoria em forma de chips com contagem; artigo mais recente em destaque grande com capa; grade de cards (capa, categoria, data, título, resumo).
3. Artigo: categoria e data, título, tempo de leitura, capa; coluna de texto com subtítulos e um bloco de citação; índice lateral fixo no desktop e recolhível no topo no celular; barra de progresso de leitura no topo; aviso "Publicado originalmente no LinkedIn em [data]"; botões de compartilhar (LinkedIn, WhatsApp, copiar link); bloco "Quem escreve" com foto e uma linha; chamada para o serviço relacionado com botão de WhatsApp.
4. Serviços (hub): introdução curta e 3 blocos (Consultoria, Mentoria, Palestras), cada um com para quem é e link para a página.
5. Página de serviço (modelo para Consultoria): para quem é; problema que resolve; temas e abordagens; como funciona em 3 passos; logos de empresas onde já atuou; 2–3 artigos relacionados; botão "Conversar no WhatsApp" no topo e no fim.
6. Empresas: introdução e grade de 8 cards (logo, nome, papel de Matheus, descrição curta), separando empresas fundadas e organizações onde atua como conselheiro.
7. Sobre: retrato, bio, linha do tempo profissional, formação, valores.
8. Palestras e mídia: temas de palestra, formatos, filtro por tipo (palestra, podcast, webinar, entrevista) e grade de itens com miniatura de vídeo.
9. 404: mensagem curta bilíngue e links para Home e Artigos.

Mostre as conexões de navegação entre as telas, destacando o caminho Artigo → Página de serviço → WhatsApp. Marque a área do botão de WhatsApp em todas as telas em que ele aparece.
```

### Mid-Fi

```
Evolua para média fidelidade o site pessoal de Matheus Haddad, empresário e consultor em negócios e tecnologia, com conteúdo real, aplicação básica de cor e tipografia, estados interativos indicados e componentes identificados. Público principal: CEOs e CTOs de empresas de tecnologia (fintechs, healthtechs) que chegam por links no LinkedIn e no WhatsApp, a maioria pelo celular. Objetivo: transmitir que Matheus entende de negócios E de tecnologia, e levar a leitura até uma conversa no WhatsApp.

Personalidade visual: editorial com assinatura tech. Base sóbria de revista de negócios, com muito espaço em branco e texto como protagonista, e detalhes pontuais de produto de software: monoespaçada em rótulos e datas, uma única cor de destaque, grid preciso.

Estilo básico:
- Cores: branco, preto e cinzas; destaque azul elétrico (#2563EB) só em links, botões principais e detalhes. Mostre também a versão em modo escuro da Home e do Artigo (fundo quase preto, texto claro, azul mais claro).
- Tipografia: títulos em serifada (Fraunces), texto em Inter, rótulos, datas e categorias em JetBrains Mono em caixa alta pequena.
- Marca: "Matheus Haddad" por extenso na serifada; sem símbolo.
- Imagens: retrato de Matheus em destaque; cada uma das 6 categorias de artigo tem uma capa gráfica própria (padrão geométrico abstrato em azul sobre neutro), usada quando o artigo não tem foto.

Conteúdo de exemplo (use português):
- Home, título: "Negócios, tecnologia e pessoas: como organizações crescem na era da IA." Subtítulo: "Empresário, fundador de empresas de software e consultor de lideranças que querem adotar IA sem perder o que as faz funcionar." Números: "5 empresas fundadas", "15+ anos de gestão", "500+ líderes apoiados". Logos: Webgoal, Ateliê de Software, Granatum, Lumiar, Orgganica, Aliança Empreendedora, A Guarda-Chuva, TugÁgil.
- Categorias: Gestão e Design Organizacional (16), Coerência Cognitiva e P-O Fit (8), AI, Trabalho e Organizações (7), Desenvolvimento de Software (1), Educação (1), Hobbies (2).
- Artigos: "A IA muda quase tudo na sua empresa, menos o jogo de poder" (AI, Trabalho e Organizações, 25 ago 2026, 7 min); "A IA não vai cortar custo na sua operação, vai cortar a sua margem de erro"; "O Artesão Digital em seu novo Ateliê de Software"; "A Matriz P-O Fit e os 16 Lugares de Potência".
- Serviços: Consultoria (para CEOs e CTOs que precisam reorganizar gestão e adotar IA), Mentoria (para líderes e heads de engenharia), Palestras (keynotes e workshops sobre IA, gestão e liderança).

Telas (celular 390 px e desktop 1440 px): Home, Artigos, Artigo, Serviços, Consultoria, Empresas, Sobre, Palestras e mídia, 404 e menu mobile aberto.

Componentes a identificar e reutilizar: Header, Menu mobile, Seletor de idioma, Alternância de tema, Botão primário, Botão secundário, Botão de WhatsApp (ícone do WhatsApp com o estilo do botão primário), Chip de categoria com contagem, Card de artigo, Artigo em destaque, Card de serviço, Card de empresa, Item de mídia com miniatura de vídeo, Bloco de autor, Barra de compartilhamento, Índice do artigo, Barra de progresso de leitura, Bloco de citação, Rodapé.

Estados a indicar: hover, foco visível e ativo em links e botões; chip de categoria selecionado; item do menu da página atual; idioma e tema atuais; confirmação "Link copiado" ao copiar link; card de artigo sem foto usando a capa da categoria; miniatura de vídeo antes do clique (fachada com botão de play).

Sugira melhorias com base em heurísticas de usabilidade (Nielsen, Krug): deixar o caminho até o WhatsApp sempre óbvio, reduzir escolhas na primeira dobra, reforçar a escaneabilidade das listas e garantir que o leitor sempre saiba em que idioma, categoria e ponto do artigo está.
```

### Hi-Fi

```
Crie o protótipo de alta fidelidade e o design system do site pessoal de Matheus Haddad, empresário e consultor em negócios e tecnologia. O site é bilíngue (PT/EN), mobile-first, com modo claro e escuro, e converte leitura em conversa pelo WhatsApp. Público principal: CEOs e CTOs de empresas grandes com tecnologia no core, que chegam por links compartilhados no LinkedIn e no WhatsApp, a maioria pelo celular. A primeira impressão precisa comunicar que Matheus entende de negócios e de tecnologia, com a sobriedade de uma revista de negócios e a precisão de um produto de software.

1. DESIGN SYSTEM (crie como página própria, com tokens nomeados)

Cores, em modo claro e escuro, todas com contraste mínimo WCAG AA:
- Claro: background #FFFFFF; surface #F5F5F4; text #111111; text-muted #57534E; border #E7E5E4; accent #2563EB; accent-hover #1D4ED8; accent-subtle #EFF4FF; focus-ring #2563EB.
- Escuro: background #0B0B0C; surface #161618; text #F5F5F4; text-muted #A8A29E; border #2A2A2E; accent #6B8CFF; accent-hover #8FA8FF; accent-subtle #151C33; focus-ring #8FA8FF.
- Valide o contraste de cada combinação texto/fundo e ajuste o que não atingir 4.5:1 (texto normal) ou 3:1 (texto grande e componentes).

Tipografia:
- Títulos: Fraunces (peso 600, óptico para display). Display 56/60 no desktop e 36/40 no celular; H1 44/52; H2 32/40; H3 22/30.
- Texto: Inter. Corpo de artigo 19/32 no desktop e 17/28 no celular; interface 16/24; pequeno 14/20.
- Detalhes: JetBrains Mono 12–13 px, caixa alta, espaçamento de letras 0.08em, para categorias, datas, tempo de leitura e rótulos.
- Largura máxima da coluna de leitura: 680 px.

Espaçamento e grid: escala de 4 px (4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Grid de 12 colunas, largura máxima 1200 px, calha de 24 px; 4 colunas no celular com margens de 20 px. Raio de borda 2 px (botões, chips) e 6 px (cards). Sombras mínimas; preferir bordas de 1 px.

Breakpoints: celular 360–767 px; tablet 768–1023 px; desktop ≥ 1024 px.

Iconografia: SVG de traço fino (1.5 px), cantos retos.

Sistema gráfico por categoria: 6 padrões geométricos abstratos em accent sobre surface, um por categoria (Gestão e Design Organizacional; Coerência Cognitiva e P-O Fit; AI, Trabalho e Organizações; Desenvolvimento de Software; Educação; Hobbies). Use-os em capas de artigos sem foto e em um modelo de imagem de compartilhamento 1200×630 com título do artigo em Fraunces, categoria em JetBrains Mono e o nome "Matheus Haddad".

Marca: "Matheus Haddad" por extenso em Fraunces 600, sem símbolo. Favicon com as iniciais "MH" em Fraunces sobre accent.

2. COMPONENTES (cada um com todos os estados: default, hover, focus, active, disabled quando aplicável, e versão em modo escuro)
Header (desktop e celular), Menu mobile em sobreposição, Seletor de idioma PT/EN, Alternância de tema (claro/escuro), Botão primário, Botão secundário, Link de texto, Botão de WhatsApp (ícone do WhatsApp + "Conversar no WhatsApp", estilo primário em accent), Chip de categoria (default, hover, selecionado, com contagem), Card de artigo (com foto e com capa gráfica), Artigo em destaque, Card de serviço, Card de empresa, Item de mídia (fachada de vídeo com play, estado de carregamento e fallback "Assistir no YouTube"), Índice do artigo (item ativo conforme a rolagem), Barra de progresso de leitura, Bloco de citação, Bloco de autor, Barra de compartilhamento (LinkedIn, WhatsApp, copiar link, com toast "Link copiado" que some em 2 s e é anunciado a leitores de tela), Aviso de publicação original, Rodapé.

3. TELAS (celular 390 px e desktop 1440 px, modo claro; Home e Artigo também em modo escuro)
- Home: primeira dobra com rótulo em mono "EMPRESÁRIO · CONSULTOR · PALESTRANTE", título "Negócios, tecnologia e pessoas: como organizações crescem na era da IA.", subtítulo, retrato, botões "Ver serviços" e "Conversar no WhatsApp"; faixa de prova com "5 empresas fundadas", "15+ anos de gestão", "500+ líderes apoiados" e 8 logos em monocromático (Webgoal, Ateliê de Software, Granatum, Lumiar, Orgganica, Aliança Empreendedora, A Guarda-Chuva, TugÁgil). Depois: artigos em destaque por tema, serviços, palestras e mídia e chamada final para o WhatsApp.
- Artigos: filtros por categoria com contagem; artigo em destaque; grade de cards; estado vazio de filtro ("Ainda não há artigos nesta categoria" com link para todos), embora categorias vazias não apareçam na navegação.
- Artigo: exemplo "A IA muda quase tudo na sua empresa, menos o jogo de poder" (AI, Trabalho e Organizações · 25 AGO 2026 · 7 MIN); índice fixo à direita no desktop e recolhível no celular; barra de progresso; subtítulos; bloco de citação; aviso "Publicado originalmente no LinkedIn em 25/08/2026"; compartilhamento; bloco "Quem escreve"; chamada "Sua empresa está redesenhando a gestão com IA? Vamos conversar." com botão de WhatsApp; espaço para artigos relacionados.
- Serviços (hub) e Consultoria (modelo das páginas de serviço): para quem é, problema, temas e abordagens, como funciona em 3 passos, logos, 2–3 artigos relacionados, botão de WhatsApp no topo e no fim.
- Empresas, Sobre, Palestras e mídia (filtro por tipo, grade com fachadas de vídeo) e 404 bilíngue ("Página não encontrada / Page not found", links para Home e Artigos).
- Versão em inglês de pelo menos uma tela (Home), para validar a extensão dos textos em EN.

4. MICROINTERAÇÕES
Transições de 150–200 ms em hover e foco; sublinhado animado em links; troca de tema sem piscar; barra de progresso acompanhando a rolagem; destaque do item ativo no índice; menu mobile abrindo com deslize curto. Com prefers-reduced-motion ativo, remova animações de movimento e mantenha apenas mudanças de cor.

5. ACESSIBILIDADE (anote nas telas)
Contraste AA em ambos os modos; anel de foco visível de 2 px em accent com 2 px de afastamento em todos os elementos interativos; ordem de foco lógica; link "Pular para o conteúdo"; alvos de toque de no mínimo 44×44 px; hierarquia de títulos correta (um H1 por página); texto alternativo em retratos e logos; ícones com rótulo acessível (idioma, tema, WhatsApp, compartilhar); idioma da página declarado; nenhuma informação transmitida só por cor.

6. RESPONSIVIDADE
Mostre o comportamento em celular, tablet e desktop: header que colapsa em menu; grades de 3 → 2 → 1 coluna; índice do artigo lateral no desktop e recolhível acima do texto no celular; botão de WhatsApp sempre visível no header em todas as larguras.
```
