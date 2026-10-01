✅ Discovery completed — 28/09/2026 20:29

# Discover: Novo site pessoal — autoridade, blog e geração de oportunidades

**Level:** Product
**Date:** 2026-09-28

> **Contexto de partida:** `.darkside/scan/tech.md` (site estático atual, 7 páginas, GitHub Pages), PRD da versão atual em `specifications/prd-site-matheus.md` (personas, mapa do site e metas de leads), protótipos de um novo design em `specifications/novo-desing/` e a migração descartada guardada em `git stash`.

## Executive Summary

- **Problema:** a produção de Matheus está espalhada entre Medium, LinkedIn e outras plataformas, e o site atual reforça uma imagem antiga ("o cara do RH e do Feedback Canvas"). Hoje o site gera ~20 visitas e **nenhum contato** por mês.
- **Para quem:** CEOs e CTOs de empresas grandes com tecnologia no core (persona **Ricardo**) que já viram Matheus no LinkedIn, numa palestra ou num podcast e querem confirmar se ele é a pessoa certa.
- **Direção:** novo site em **Astro**, com conteúdo em Markdown no repositório, **totalmente bilíngue (PT + EN)**, deploy automático no GitHub Pages, novo design system, blog por tema (AI, Dev, Gestão, Liderança, Hobbies) e contato por **WhatsApp Business** no lugar de formulários.
- **Recorte:** MVP em **31/10/2026** com as ondas 1–4 (publicação, identidade, conversão, migração dos 35 artigos); em novembro, páginas por empresa, artigos relacionados e arquivos para LLMs.
- **Maiores riscos:** (1) a premissa de que o Ricardo decide com base em conteúdo, mitigada por conversas com 5 CEOs/CTOs; (2) o prazo apertado para uma pessoa só, com o design system como ponto de maior risco de atraso.
- **Metas (6 meses após o lançamento):** ≥ 5 contatos qualificados/mês, ≥ 1.000 visitas/mês, ≥ 50% das visitas vindas das redes sociais, ≥ 4 artigos inéditos/mês.
- **Primeiro incremento:** onda 1, casa própria publicando (fluxo de publicação + blog bilíngue + analytics).

**Rastreabilidade:** contatos qualificados/mês → Ricardo (CEO de empresa com tecnologia no core) → passa a ler o conteúdo de Matheus antes de decidir e o procura direto pelo site → blog bilíngue com fluxo de publicação leve (onda 1).

## Problem & North Star

### Problema / oportunidade

- **Conteúdo fragmentado:** a produção de Matheus (artigos, posts, palestras, podcasts) está espalhada entre Medium, LinkedIn e outras plataformas. Não existe um lugar que mostre o volume e a relevância da contribuição dele como um conjunto.
- **Posicionamento desatualizado:** a imagem pública ainda é a do "cara do RH ágil e do Feedback Canvas". O posicionamento desejado é mais amplo: **empresário, empreendedor e consultor em negócios e tecnologia**, com autoridade em **Gestão, Liderança, AI e Desenvolvimento de Software**.
- **Empresas pouco exploradas:** as empresas de Matheus aparecem só como logos e cards. Os negócios delas e os movimentos que fazem não são contados, apesar de serem prova concreta de competência como empresário.
- **Site sem função comercial:** o site atual não gera negócios nem fortalece a credibilidade no mercado.

**Se nada for feito:** o site segue sem gerar oportunidades, a produção de conteúdo continua dispersa (e sem acumular valor em torno do nome) e o posicionamento antigo persiste.

### Resultado esperado (outcome)

- **Quem chega:** CEOs, CTOs e outras lideranças de empresas buscando consultoria, mentoria e serviços ligados às áreas de atuação de Matheus.
- **Como chegam:** já aquecidos. Conheceram Matheus no LinkedIn, numa palestra ou num podcast, e vão ao site para aprofundar. O site funciona como **hub de credibilidade e conversão** para quem já foi exposto a ele em outro canal, mais do que como porta de descoberta via busca.
- **O que já sabem antes da primeira conversa:** os negócios de Matheus, suas abordagens e o conteúdo que publica.
- **Uso no dia a dia:** Matheus passa a publicar no site e a usar os links como moeda de distribuição (WhatsApp, chats e redes sociais), tanto para conteúdos quanto para divulgar negócios e serviços.

### Indicadores citados pelo autor

1. Visitas no site
2. Contatos qualificados por mês
3. Tráfego de referência das redes sociais para conteúdos do site

Baselines e metas ficam para o Bloco F.

### North Star (confirmado)

- **Norte:** **contatos qualificados por mês**, ou seja, CEOs, CTOs e lideranças pedindo consultoria, mentoria ou negócios.
- **Antecedentes (leading):** tráfego de referência das redes sociais para o site, que mostra se a distribuição funciona, e visitas totais, que medem o volume.
- **Leitura:** visitas em alta com contatos parados indica problema de conversão, não de atração.

### Por que agora

- **Janela de AI:** o tema está ganhando espaço rapidamente e Matheus quer ocupar esse território antes que outros o ocupem.
- **Volume de produção:** a quantidade de conteúdo produzido já justifica uma casa própria.

### Alternativas atuais e por que não bastam

- **LinkedIn e Medium:** espaço emprestado. O algoritmo decide o alcance, os posts somem do feed em dias, não há visão consolidada da produção e o Medium pode colocar textos atrás de paywall.
- **Site atual:** apresenta Matheus, mas não tem conteúdo próprio (só o acervo de palestras e podcasts) e não reflete o novo posicionamento.

### Visão do produto

> Para **CEOs, CTOs e lideranças de empresas** que já tiveram contato com Matheus Haddad e querem entender se ele é a pessoa certa para apoiá-los, **cujo problema** é não encontrar em um só lugar a amplitude do que ele produz, pensa e constrói, o **matheushaddad.com** é **o hub pessoal de autoridade** que reúne artigos, palestras, empresas e serviços em torno de Gestão, Liderança, AI e Desenvolvimento de Software. **Diferentemente** de perfis no LinkedIn e no Medium, que pertencem às plataformas e dispersam a produção, **o site** consolida a contribuição de Matheus numa casa própria e transforma a credibilidade em conversas de negócio.

### Entrega × resultado

- **Output (entrega):** site reformulado, com blog que centraliza os artigos, novo design, páginas que contam as empresas e apresentam os serviços, e publicação automatizada.
- **Outcome (resultado):** lideranças chegam à primeira conversa já convencidas da competência de Matheus, o que gera mais contatos qualificados por mês para consultoria, mentoria e negócios.

## Actors & Impacts

### Atores

1. **Liderança decisora (CEO, CTO, diretor):** busca consultoria ou mentoria para a empresa e decide a contratação.
2. **Profissional em desenvolvimento:** gestor, líder técnico ou empreendedor que busca mentoria individual e paga do próprio bolso.
3. **Organizador de eventos e podcasts:** convida para palestras; amplia a exposição.
4. **Parceiros e interessados nas empresas:** clientes, sócios potenciais ou investidores que querem entender os negócios de Matheus.
5. **Matheus, como publicador:** alimenta o site. Se publicar for trabalhoso, o conteúdo para e o site perde valor. É o ator que mais pode atrapalhar o resultado.
6. **Assistentes de AI (ChatGPT, Claude, Perplexity, agentes):** cada vez mais consultados pelo Ricardo antes de uma busca tradicional; influenciam a descoberta e a reputação.

### Personas

**Ricardo, 46 anos — CEO de uma empresa grande com tecnologia no core (fintech, healthtech)** ⭐ *Persona principal*
- **Comportamento:** conheceu Matheus numa palestra ou num post do LinkedIn. Antes de contratar, pesquisa e pede referências a pares.
- **O que quer:** adotar AI com critério e ajustar a gestão de uma organização de tecnologia que cresceu rápido.
- **O que dói hoje:** não sabe se Matheus entende de tecnologia e AI ou "só de RH", e não tem onde conferir o histórico dele em um lugar só.

**Juliana, 34 anos — head de engenharia recém-promovida**
- **Comportamento:** consome conteúdo no LinkedIn e em podcasts; salva artigos para ler depois.
- **O que quer:** mentoria para liderar pessoas e tomar melhores decisões técnicas.
- **O que dói hoje:** não fica claro como a mentoria funciona nem se serve para o perfil dela.

**Matheus — o publicador**
- **Comportamento:** produz muito, em vários lugares, com pouco tempo sobrando.
- **O que quer:** publicar uma vez e distribuir o link facilmente.
- **O que dói hoje:** republicar exige esforço e o conteúdo fica disperso.

**Decisão:** em conflitos de prioridade, vale o que serve ao **Ricardo**, porque é ele quem move o Norte.

### Impact map

**KR / Norte:** contatos qualificados por mês

| Ator | Impacto (mudança de comportamento) | Entregáveis |
|---|---|---|
| Ricardo (liderança decisora) | **Começa** a visitar o site depois de ver Matheus no LinkedIn ou numa palestra e lê pelo menos um artigo ou case antes de decidir | *(Bloco H)* |
| | **Muda** a percepção: de "o cara do RH" para referência em negócios e tecnologia, com empresas reais | *(Bloco H)* |
| | **Começa** a procurar Matheus direto pelo site, sem indicação, sabendo qual serviço quer | *(Bloco H)* |
| | **Começa** a encaminhar artigos a pares e ao próprio time | *(Bloco H)* |
| Juliana (mentoria) | **Começa** a pedir mentoria por conta própria, entendendo o formato e se serve para ela | *(Bloco H)* |
| Organizadores de eventos e podcasts | **Começam** a convidar Matheus para falar de AI e desenvolvimento de software, não só de feedback e RH | *(Bloco H)* |
| Parceiros e interessados nas empresas | **Chegam** às empresas pelo site, entendendo o que cada uma faz e seu momento | *(Bloco H)* |
| Matheus (publicador) | **Para** de publicar só nas plataformas: publica primeiro no site e distribui o link | *(Bloco H)* |
| | **Mantém** uma frequência de publicação sem esforço excessivo | *(Bloco H)* |
| Assistentes de AI | **Passam a** encontrar, resumir e citar corretamente o trabalho de Matheus quando perguntados sobre AI, gestão ou liderança | *(Bloco H)* |

### Jornada principal — Ricardo até pedir uma conversa

1. **Gatilho:** a empresa enfrenta um problema real (adotar AI com segurança, time de tecnologia que cresceu e perdeu ritmo).
2. **Primeiro contato:** vê Matheus numa palestra ou num podcast, ou recebe de um colega um post do LinkedIn.
3. **Curiosidade:** clica no link de um artigo (LinkedIn, WhatsApp, chat) e chega ao site por um conteúdo específico.
4. **Aprofundamento:** lê o artigo, navega por outros do mesmo tema e percebe o volume e a consistência da produção.
5. **Checagem de credibilidade:** visita "Sobre" e "Empresas" e descobre que Matheus constrói negócios de tecnologia, não só aconselha.
6. **Entendimento da oferta:** encontra o serviço que resolve o seu problema e entende como funciona.
7. **Decisão de contato:** clica no botão de WhatsApp e inicia a conversa com uma mensagem já preenchida que cita a página ou o artigo de onde veio.
8. **Pós-contato:** encaminha artigos ao time e a outros executivos, alimentando novos "Ricardos".

## Scope & Boundaries

Legenda: **[D]** diferenciador (investir em profundidade) · **[P]** paridade (solução mais simples e padrão)

### É
- O hub pessoal de autoridade de Matheus Haddad
- A casa própria de todo o conteúdo que ele produz
- A vitrine das suas empresas e dos seus serviços
- Um canal de entrada de oportunidades de negócio
- Moderno, profissional e fácil de compartilhar
- Bilíngue (português e inglês)

### Não é
- Uma rede social ou comunidade
- O site institucional das empresas (elas têm sites próprios)
- Uma loja ou plataforma de cursos
- Um portfólio genérico de consultor

### Faz
- **[D]** Publica artigos organizados por tema: AI, Desenvolvimento de Software, Gestão, Liderança e **Hobbies** (categoria do blog, não seção separada)
  - *Atualizado no tech-design (28/09): as categorias passam a ser as do vault do Obsidian — ver plano `.darkside/tech-design/2026-09-28-novo-site-astro-plan.md`, seção Data.*
- **[D]** Reúne no site os artigos já publicados no Medium, no LinkedIn e em outras plataformas, apontando a versão do site como a original
- **[D]** Conta a história e os movimentos das empresas de Matheus
- **[D]** Apresenta os serviços (consultoria, mentoria, palestras) com clareza para o Ricardo
- **[D]** Gera boas prévias de link no WhatsApp e no LinkedIn (título, imagem, resumo)
- **[D]** Versão em inglês **completa e espelhada**: páginas institucionais e todos os artigos nos dois idiomas
  - ⚠️ Tensão com o impacto "Matheus mantém frequência sem esforço excessivo": cada artigo passa a exigir duas versões (tratar em Riscos)
- **[P]** Mantém o acervo de palestras e podcasts
- **[D]** Recebe contatos pelo **WhatsApp Business** (+55 35 98886-7870), com mensagem pré-preenchida indicando serviço e página de origem
- **[P]** Mede visitas, origem do tráfego e contatos
- **[P]** Publica automaticamente a cada mudança (build e deploy no GitHub)
- **[P]** Divulga o livro Feedback Canvas

### Entra explicitamente (confirmado)
- Migração de **todos** os artigos já publicados no Medium, no LinkedIn e em outras plataformas (não apenas uma seleção)
- **Copy nova** em todas as páginas, escrita para o novo posicionamento
- **Página própria para cada empresa**, não só cards
- Manutenção do domínio `matheushaddad.com`
- **Identidade visual e fotos novas**

### Não faz ainda
- Newsletter por e-mail
- Comentários nos artigos
- Busca interna
- Publicação automática de volta no LinkedIn e no Medium

### Não faz nunca
- Venda direta (o livro continua indo para a Amazon)
- Área de membros ou conteúdo pago
- Painel de edição visual tipo WordPress (a publicação continua pelo repositório)
- Redirecionar URLs antigas (`sobre.html` etc.) que não forem reaproveitadas no novo site
- Formulários de contato (Formspree deixa de ser usado; o canal de contato é o WhatsApp Business)

## Alternatives

### ✅ Direção escolhida — A. Site gerado com Astro, conteúdo em arquivos no repositório

Cada artigo é um arquivo Markdown no GitHub; ao salvar, o site é gerado e publicado automaticamente no GitHub Pages.

- **Por que:** atende ao pedido de build e deploy automatizados no GitHub, suporta os dois idiomas e escala para o volume de artigos a migrar, com hospedagem gratuita e controle total do design.
- **Premissas:** Matheus (ou um agente de AI) edita arquivos de texto e usa Git sem dificuldade.
- **Riscos:** publicação bilíngue pesada sem um fluxo bem desenhado; esforço alto na migração inicial.

### ❌ Descartadas

- **B. Plataforma pronta (Ghost / WordPress gerenciado):** suporte bilíngue limitado ou pago, sai do GitHub (contra o pedido do autor), dependência de fornecedor e mensalidade.
- **C. Evoluir o HTML atual com blog manual:** migrar todos os artigos em dois idiomas à mão é insustentável; header e footer duplicados em dezenas de páginas.

## Success Metrics

| Métrica | Tipo | Baseline (set/2026) | Meta | Horizonte |
|---|---|---|---|---|
| Contatos qualificados por mês | **Norte** | 0 | ≥ 5 | 6 meses após o lançamento |
| Visitas por mês | Antecedente (volume) | ~20 | ≥ 1.000 | 6 meses após o lançamento |
| Participação das redes sociais nas visitas | Antecedente (distribuição) | ~10% | ≥ 50% | 6 meses após o lançamento |
| Artigos inéditos publicados por mês (PT + EN) | Antecedente (publicador) | — | ≥ 4 (um por semana) | Desde o lançamento |

- **Leitura da participação social:** 50% das visitas vindas de redes sociais é o sinal de que o conteúdo está sendo compartilhado pelo próprio Matheus e por leitores.
- **Fontes:** GA4 (`G-CPNE8N9WS3`) para visitas, origem e cliques no botão de WhatsApp; conversas no WhatsApp Business para contatos qualificados.

### Sinais de parar ou pivotar

| Quando | Sinal | Diagnóstico | Ação |
|---|---|---|---|
| 3 meses após o lançamento | Visitas > 300/mês **e** contatos = 0 | Atrai, mas não converte | Revisar oferta, páginas de serviço e caminhos até o contato (não escrever mais) |
| 3 meses após o lançamento | Visitas < 100/mês **com** ≥ 4 artigos/mês publicados | Distribuição não funciona | Rever como e onde os links circulam |
| A qualquer momento | 2 meses seguidos com < 2 artigos/mês | Fluxo de publicação pesado demais | Simplificar, começando por rever o espelhamento obrigatório em inglês |

## Risks & Assumptions

| # | Item | Categoria | Mitigação / spike |
|---|---|---|---|
| 1 | **O Ricardo decide com base em conteúdo:** um CEO de empresa grande com tecnologia no core lê artigos antes de contratar, em vez de decidir só por indicação e relacionamento | 🔴 **Risco crítico** (se errada, derruba o plano) | **Spike antes de investir no conteúdo:** conversar com 5 CEOs/CTOs do perfil (clientes atuais ou da rede) e perguntar como escolheram o último consultor ou mentor e que papel o conteúdo teve. Timebox: 2 semanas, em paralelo à construção. **Instrumentação contínua:** a mensagem pré-preenchida do WhatsApp identifica a página ou o artigo de origem; no início da conversa, Matheus pergunta "Como me conheceu?" |
| 2 | Os links vão circular: Matheus e leitores compartilham com constância | Premissa | Medida pela participação social (meta ≥ 50%) |
| 3 | O ritmo de 4 artigos/mês em PT + EN se sustenta | Premissa | Medida pela métrica de publicação; sinal de pivô em < 2/mês por 2 meses |
| 4 | Já existe produção suficiente sobre AI e Desenvolvimento de Software para sustentar o novo posicionamento | ⚠️ **Parcialmente refutada** (tech-design, 28/09) | Dos 35 artigos, 7 são de AI e só 1 de Desenvolvimento de Software (há 3 rascunhos nessa linha). Priorizar a publicação dos rascunhos da série "IA no Desenvolvimento de Software" logo após o lançamento |
| 5 | Todo o conteúdo pode ser migrado, com o site como versão original e sem problemas de conteúdo duplicado | Known unknown (parcialmente resolvido) | Os ~35 artigos já estão no Obsidian, organizados e categorizados; resta definir a versão original (canonical) no `/tech-design` |
| 7 | `llms-full.txt` com todo o acervo nos dois idiomas pode passar de ~100 mil tokens | Known unknown | Resolver no `/tech-design` (ex.: um arquivo por idioma) |
| 8 | Contatos qualificados vindos do site podem ser contados no WhatsApp Business (o GA4 só vê o clique, não a conversa) | Premissa | Marcar as conversas vindas do site com uma etiqueta no WhatsApp Business e contar mensalmente |
| 9 | Número de WhatsApp público no site atrai spam e contatos não qualificados | Premissa | Aceito pelo autor; monitorar |
| 6 | Visita vira contato: um site bem apresentado converte o Ricardo | Premissa | Sinal de pivô: visitas > 300 e contatos = 0 aos 3 meses |

### Decisões irreversíveis (Real Options)

Adiadas para o `/tech-design`, com prazo-limite **antes do primeiro link do novo site ser compartilhado**:

- **Estrutura das URLs dos artigos** (ex.: `/blog/titulo` e `/en/blog/title`): mudar depois quebra links já compartilhados.
- **Versão original de cada artigo** (site ou Medium/LinkedIn): afeta como o Google atribui a autoria.
- **Nome e organização das categorias:** também aparecem nas URLs.

Reversíveis sem grande prejuízo: escolha do Astro, visual, copy.

### Restrições de viabilidade

| Restrição | Detalhe | Consequência |
|---|---|---|
| **Prazo** | Novo site no ar até **31/10/2026** (~4,5 semanas a partir de 28/09) | 🔴 **Risco crítico:** o escopo completo (design system novo, copy nova, página por empresa, migração de *todo* o acervo em PT + EN) não cabe com folga no prazo. Exige um MVP enxuto no lançamento e o restante em ondas seguintes (Bloco H) |
| **Quem constrói** | O próprio Matheus, com ajuda de AI | Capacidade de uma pessoa, em paralelo à rotina de empresário |
| **Design** | Nova identidade visual e design system a serem buscados, além de fotos e imagens novas | Identidade visual vira dependência das páginas; os protótipos anteriores (`specifications/novo-desing/`) não são o ponto de partida |
| **Orçamento** | Zero | Sem fotógrafo, designer ou tradução paga: fotos próprias ou geradas/editadas com AI, tradução assistida por AI, hospedagem gratuita (GitHub Pages) e WhatsApp Business já existente |

## Increments

### Entregáveis avaliados

**E** = esforço (1–3) · **V** = valor (1–3) · 🟢 sabemos o quê e como · 🟡 falta um dos dois. Inventário de origem: **~35 artigos no Obsidian, já organizados e categorizados**.

| # | Entregável | Impacto que busca | Jornada | E | V | Conf. |
|---|---|---|---|---|---|---|
| 1 | **Blog bilíngue** com categorias (AI, Dev, Gestão, Liderança, Hobbies), incluindo sitemap, RSS e marcação de idioma | Ricardo lê antes de decidir | 3–4 | 2 | 3 | 🟢 |
| 2 | **Fluxo de publicação**: Markdown, tradução assistida por AI, deploy automático no push | Matheus publica primeiro no site, sem esforço excessivo | — | 2 | 3 | 🟡 |
| 3 | **Prévias de compartilhamento** (imagem, título, resumo) e botões de compartilhar | Ricardo encaminha; links circulam | 2–3, 8 | 1 | 3 | 🟢 |
| 4 | **Design system e identidade visual** | Muda a percepção para negócios e tecnologia | 4–5 | 3 | 3 | 🟡 |
| 5 | **Home nova** orientando cada perfil | Muda a percepção | 5–6 | 2 | 3 | 🟢 |
| 6 | **Sobre reescrito** com novo posicionamento e fotos | Muda a percepção | 5 | 2 | 3 | 🟢 |
| 7 | **Páginas de serviços** (Consultoria, Mentoria, Palestras) | Ricardo e Juliana chegam sabendo o que querem | 6 | 2 | 3 | 🟡 |
| 8 | **Contato via WhatsApp Business**: botões com mensagem pré-preenchida por serviço e página de origem, clique medido no GA4 | Procura direta; mede o Norte e o risco 1 | 7 | 1 | 3 | 🟢 |
| 9 | **Chamada no fim de cada artigo** para o serviço relacionado | Leitura vira contato | 6–7 | 1 | 3 | 🟢 |
| 10 | **Analytics**: eventos de clique (inclusive no WhatsApp), origem do tráfego, links com UTM | Mede o Norte e os antecedentes | — | 1 | 2 | 🟢 |
| 11 | **Página própria por empresa** (história, negócio, momento) | Credibilidade de empresário; parceiros chegam às empresas | 5 | 2 | 2 | 🟡 |
| 12 | **Conteúdo do site atual portado**: palestras, podcasts, livro e empresas (cards) | Organizadores convidam para novos temas; não regredir em relação ao site atual | 5 | 1 | 2 | 🟢 |
| 13 | **Migração dos ~35 artigos** do Obsidian, em PT + EN | Ricardo percebe o volume da produção | 4 | 2 | 3 | 🟢 |
| 14 | **Artigos relacionados** e navegação por tema | Ricardo lê mais de um artigo | 4 | 1 | 2 | 🟢 |
| 16 | **Arquivos para LLMs e agentes** (`llms.txt`, `llms-full.txt` gerado no build, `humans.txt`), conforme a skill [llms-txt](https://paulo.com.br/skills/llms-txt/SKILL.md) | Assistentes de AI citam Matheus corretamente | 1–2 | 1 | 2 | 🟢 |

*O item 15 (sitemap, RSS, marcação de idioma) foi incorporado ao item 1. Nenhum item ficou 🔴. O spike de validação com 5 CEOs/CTOs (risco 1) corre em paralelo, fora das ondas.*

### Sequenciador (ondas)

| Onda | Semana | Entregáveis | Valor da onda |
|---|---|---|---|
| **1 — Casa própria publicando** | 29/09–05/10 | #2 Fluxo de publicação 🟡 · #1 Blog bilíngue 🟢 · #10 Analytics 🟢 | Matheus consegue publicar nos dois idiomas no próprio site; testa cedo se o fluxo é leve |
| **2 — Cara nova** | 06–12/10 | #4 Design system 🟡 · #5 Home 🟢 · #3 Prévias de compartilhamento 🟢 | O site passa a comunicar o novo posicionamento e os links compartilhados ficam atraentes |
| **3 — Converter** | 13–19/10 | #7 Serviços 🟡 · #8 Contato via WhatsApp 🟢 · #9 Chamada no fim do artigo 🟢 | A leitura passa a levar ao contato (Norte) |
| **4 — Volume e credibilidade** | 20–26/10 | #13 Migração dos 35 artigos 🟢 · #6 Sobre 🟢 · #12 Conteúdo do site atual portado 🟢 | O visitante vê o tamanho da produção; o site substitui o atual sem perdas |
| 🚀 **Lançamento — MVP (ondas 1–4)** | 27–31/10 | Ajustes, revisão e troca do site no domínio | |
| **5 — Aprofundar** | novembro | #11 Página por empresa 🟡 · #14 Artigos relacionados 🟢 · #16 Arquivos para LLMs 🟢 | Credibilidade de empresário, mais leitura por visita, presença em assistentes de AI |

**Atenção:** ritmo de uma onda por semana com uma semana de folga. O ponto de maior risco de atraso é o design system (onda 2).

### Roadmap de resultados

- **Agora (outubro/2026):** casa própria no ar, com publicação semanal nos dois idiomas.
- **Em seguida (nov/2026–jan/2027):** links circulando, com metade das visitas vindo das redes sociais; primeiros contatos qualificados.
- **Depois (até abr/2027, 6 meses após o lançamento):** 1.000 visitas e 5 contatos qualificados por mês; Matheus lembrado por AI, software, gestão e liderança, inclusive por assistentes de AI.

## MVP Canvas

**Lançamento em 31/10/2026 = ondas 1–4** (ver Increments).

- **Proposta:** uma casa própria que mostra ao Ricardo, em poucos cliques, a amplitude do que Matheus produz e constrói, e leva do artigo ao contato.
- **Personas segmentadas:** Ricardo (principal) e Juliana (secundária). Grupo inicial de teste: rede direta de Matheus no LinkedIn e no WhatsApp, CEOs e CTOs que ele já conhece.
- **Jornada coberta:** os 8 passos da jornada do Ricardo (Actors & Impacts), do link compartilhado ao contato.
- **Entregáveis:** #1, #2, #3, #4, #5, #6, #7, #8, #9, #10, #12, #13.
- **Resultado esperado (aprendizado buscado):**
  1. Matheus sustenta 4 artigos/mês em PT + EN?
  2. Lideranças do perfil do Ricardo chegam pelo conteúdo e pedem contato? (Respondido pela mensagem pré-preenchida do WhatsApp, que traz a página de origem, e pela pergunta "como me conheceu?" no início da conversa.)
- **Métricas:** as de Success Metrics, com primeira leitura aos 3 meses pelos sinais de parar ou pivotar.
- **Custo:** zero em dinheiro; ~4,5 semanas do tempo de Matheus, com AI.
- **Cronograma:** 29/09/2026 a 31/10/2026.

## Validation

### Caminhos felizes

- [ ] **Prévia de compartilhamento:** dado que Matheus mandou pelo WhatsApp o link de um artigo novo, quando o Ricardo recebe a mensagem, então aparece uma prévia com imagem, título e resumo do artigo.
- [ ] **Fim do artigo:** dado que o Ricardo abriu um artigo, quando termina de ler, então vê uma chamada para o serviço relacionado e outros artigos do mesmo tema.
- [ ] **Troca de idioma:** dado que o Ricardo está no site em português, quando troca para inglês, então vai para a versão em inglês **da mesma página ou artigo**, e não para a home.
- [ ] **Contato via WhatsApp:** dado que o Ricardo está na página de Consultoria, quando clica em "Conversar no WhatsApp", então o WhatsApp abre (celular ou computador) para +55 (35) 98886-7870 com mensagem pré-preenchida citando consultoria e a página de origem.
- [ ] **Publicação automática:** dado que Matheus terminou um artigo no Obsidian com as versões PT e EN, quando leva para o repositório e faz push, então em poucos minutos o artigo está no ar nos dois idiomas, sem passo manual de deploy.
- [ ] **Medição:** dado que o Ricardo chegou por um link com UTM do LinkedIn, quando clica no botão de WhatsApp, então o GA4 registra o clique como evento associado à origem "LinkedIn".
- [ ] **Lançamento:** dado o dia do lançamento, quando alguém acessa `matheushaddad.com`, então vê o novo site com os 35 artigos migrados e a página de palestras com o acervo atual.

### Casos de borda

- [ ] **Artigo sem tradução:** dado um artigo só com a versão em português, quando o build roda, então o artigo **não entra no ar** até ter as duas versões (Matheus sempre publica PT + EN juntos).
- [ ] **Build com erro:** dado um push com problema (ex.: campo obrigatório faltando), quando o build falha, então o site no ar continua como estava e Matheus recebe o aviso de falha do GitHub.
- [ ] **Página inexistente:** dado um acesso a URL antiga (`sobre.html`) ou digitada errado, então aparece uma página 404 com a identidade do site, links para a home e o blog, nos dois idiomas.
- [ ] **Artigo sem capa:** dado um artigo sem imagem de capa, quando o link é compartilhado, então a prévia usa uma imagem padrão do site.
- [ ] **WhatsApp sem app:** dado um computador sem o WhatsApp instalado, quando o visitante clica no botão, então abre o WhatsApp Web com a mesma mensagem pré-preenchida.
- [ ] **Data original:** dado um artigo migrado do Medium ou do LinkedIn, então o site mostra a data original de publicação, não a data da migração.

### Definição de pronto — lançamento em 31/10/2026

**Precisa estar pronto**
- [ ] Ondas 1 a 4 entregues e publicadas em `matheushaddad.com`, substituindo o site atual
- [ ] Todas as páginas em português e inglês, com a copy nova
- [ ] Os 35 artigos migrados nos dois idiomas, com datas originais
- [ ] Experiência boa no celular (a maioria chega por links de WhatsApp e LinkedIn)
- [ ] Carregamento em menos de 3 s no 4G
- [ ] Acessibilidade básica: contraste, textos alternativos, navegação por teclado
- [ ] GA4 medindo visitas, origem e cliques no WhatsApp
- [ ] Validação com os 5 CEOs/CTOs (risco 1) pelo menos iniciada

**Explicitamente NÃO precisa estar pronto**
- Página própria por empresa, artigos relacionados e arquivos para LLMs (onda 5)
- Fotos profissionais definitivas (lançar com as melhores disponíveis e trocar depois)
- Design system documentado em detalhe (basta estar aplicado de forma consistente)
- Pontuação perfeita em ferramentas de SEO e performance

### Observabilidade

- **Métricas (GA4):** visitas, origem do tráfego (redes sociais, direto, busca), cliques no WhatsApp por página, artigos mais lidos.
- **Alertas:** e-mail do GitHub quando build ou deploy falhar. A disponibilidade fica a cargo do GitHub Pages.
- **Rotina mensal (~15 min):** contar as conversas com etiqueta "Site" no WhatsApp Business, comparar os números do GA4 com as metas e checar os sinais de parar ou pivotar. Primeira leitura formal aos 3 meses do lançamento.
- **Registro:** nota mensal no Obsidian com os números, para acompanhar a evolução até abril/2027.
