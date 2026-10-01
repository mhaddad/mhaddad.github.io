✅ Engineering discovery completed — 28/09/2026 21:34

# Plan: Novo site em Astro — autoridade, blog bilíngue e WhatsApp

**Date:** 2026-09-28

> **Base:** discovery `.darkside/discover/2026-09-28-site-autoridade-blog.md` · scan `.darkside/scan/tech.md` (site estático atual)

---

## 1. Functional Understanding

### Main Flow

Dois fluxos complementares.

**Fluxo A — Publicação (Matheus)**
1. **Início:** Matheus termina um artigo no Obsidian. O vault é um repositório **separado** do site.
2. **Processamento:**
   1. Matheus pede a uma ferramenta de AI (ex.: Claude Code, rodando no repositório do site) que busque o artigo no Obsidian.
   2. A ferramenta **traduz o artigo para o inglês** (Matheus escreve só em português; sem etapa de revisão humana da tradução), ajusta as duas versões ao formato do Astro (frontmatter, pastas PT/EN, imagens, slugs) e faz commit e push na `main`.
   3. O push dispara o build no GitHub Actions: o Astro valida os campos do artigo e gera as páginas nos dois idiomas, as imagens de prévia, o RSS, o sitemap e, na onda 5, `llms.txt` e `llms-full.txt`.
   4. O Actions publica o resultado no GitHub Pages.
3. **Resultado:** em poucos minutos o artigo está no ar em `matheushaddad.com`, em PT e EN, pronto para ser compartilhado.

**Fluxo B — Visita (Ricardo)**
1. **Início:** clique em um link compartilhado (LinkedIn, WhatsApp, chat), de preferência com UTM.
2. **Processamento:**
   1. O site entrega uma página estática no idioma do link, com troca para a mesma página no outro idioma.
   2. Ao fim do artigo, mostra uma chamada para o serviço relacionado.
   3. O GA4 registra a visita, a origem e os cliques.
3. **Resultado:** o Ricardo clica em "Conversar no WhatsApp" e abre uma conversa com mensagem pré-preenchida que cita a página de origem.

### States

| Estado | Comportamento |
|---|---|
| **Loading** | Não se aplica às páginas (HTML estático pré-gerado). Imagens com lazy loading e dimensões reservadas (`width`/`height` ou `aspect-ratio`) para evitar deslocamento de layout |
| **Vazio** | Categoria sem artigos (ex.: Hobbies no início) não aparece na navegação de temas, em vez de exibir uma página vazia |
| **Erro — página inexistente** | 404 bilíngue com a identidade do site e links para home e blog |
| **Erro — build** | Site no ar não muda; GitHub envia e-mail de falha do workflow |
| **Erro — publicação pela ferramenta de AI** | A ferramenta interrompe, informa o problema e **não** faz push |
| **Retry** | Deploy com falha por instabilidade: reexecutar o workflow (manualmente no Actions ou via novo push) |
| **Timeout** | Não há chamadas em tempo real. Embed de YouTube que não carregar mostra o espaço reservado com link para abrir no YouTube |

### Rules

**Permissões**
- Só Matheus (e a ferramenta de AI agindo em seu nome) publica no repositório. O site não tem login nem área restrita.
- Push direto na `main`, sem pull request. Todo push na `main` vai para produção.

**Validações (no build; se falhar, nada é publicado)**

| Campo | Obrigatório | Regra |
|---|---|---|
| `title` | Sim | Texto |
| `description` | Sim | Tamanho máximo definido para caber na prévia do WhatsApp e do LinkedIn |
| `pubDate` | Sim | Data **original** de publicação (artigos migrados mantêm a data do Medium ou do LinkedIn) |
| `category` | Sim | Lista fechada: AI, Desenvolvimento de Software, Gestão, Liderança, Hobbies |
| `lang` | Sim | `pt` ou `en` |
| Identificador do par | Sim | Liga a versão PT à EN. **O build falha se um artigo não tiver os dois idiomas** |
| `cover` | Não | Sem ela, usa a imagem padrão do site na prévia |
| `service` | Não | Serviço da chamada no fim do artigo; sem ele, usa o padrão da categoria |
| `originalUrl` | Não | Onde o artigo saiu primeiro (Medium, LinkedIn) |
| `draft` | Não | Artigo no repositório, mas fora do ar |
| `updatedDate` | Não | Data da última correção relevante |

**Limites**
- GitHub Pages: site de até 1 GB e ~10 builds por hora, o que sobra para o volume previsto.
- Imagens otimizadas no build para formatos modernos (meta de menos de 3 s no 4G).

**Dependências**
- Botão de WhatsApp: `https://wa.me/5535988867870?text=<mensagem codificada>`, com o texto montado conforme o idioma e a página de origem.
- Domínio `matheushaddad.com` continua no GitHub Pages; muda apenas a forma de publicar (GitHub Actions no lugar da publicação a partir da branch).

### Alternative Cases

**Falha na operação**
- **Build ou deploy falha:** o site anterior continua no ar e o GitHub avisa por e-mail. O build oficial acontece **somente no GitHub Actions**; antes do push, a skill roda apenas a verificação leve `astro check` na máquina de Matheus, pegando a maioria dos erros de schema em segundos.
- **Tradução ou acesso ao Obsidian falha:** a ferramenta interrompe, avisa e não faz push. Nunca sobe artigo pela metade.

**Operação já executada (republicação)**
- A ferramenta **atualiza** o par existente, sem criar outro.
- Slug e `pubDate` **nunca mudam** depois de publicados, para não quebrar links compartilhados.
- Novo campo opcional `updatedDate`, exibido como "Atualizado em" / "Updated on".
- A tradução em inglês é refeita para refletir a correção.

**Dado duplicado**
- **Dois artigos com o mesmo slug:** o build falha com mensagem clara.
- **Mesmo artigo do Obsidian importado duas vezes:** a ferramenta reconhece pelo identificador do par e atualiza em vez de duplicar.

**Execuções simultâneas**
- **Dois pushes seguidos:** o workflow usa um grupo de concorrência que cancela o deploy em andamento e publica só o mais recente.
- **Edição do repositório em dois lugares:** a ferramenta sempre faz `pull` antes do push; se houver conflito, interrompe e avisa.

### Acceptance Criteria

**Negócio:** os critérios de caminho feliz, casos de borda e a definição de pronto do lançamento estão na seção *Validation* da discovery (`.darkside/discover/2026-09-28-site-autoridade-blog.md`) e valem integralmente para este plano.

**Técnicos**
- [ ] Toda página e artigo declara a versão no outro idioma (`hreflang` PT/EN + `x-default`) e uma URL canônica
- [ ] Todo artigo tem Open Graph e Twitter Card com **URLs absolutas** e imagem 1200×630
- [ ] RSS por idioma e sitemap com todas as páginas
- [ ] O build falha se algum artigo não passar na validação dos campos ou estiver sem o par de idioma
- [ ] Deploy concluído em até ~5 minutos após o push
- [ ] GA4 registra o evento de clique no WhatsApp com página, idioma e serviço
- [ ] `matheushaddad.com` segue funcionando com HTTPS após a troca para publicação via GitHub Actions
- [ ] Nada do site antigo permanece publicado (páginas `.html`, `css/`, `js/`, `assets/`, `index-old.html`)
- [ ] Os PDFs do Feedback Canvas continuam acessíveis nos endereços atuais (`/feedback-canvas/...`)

---

## 2. Technical Impact

### Systems

| Sistema | O que muda |
|---|---|
| **Frontend** | Reescrita completa: HTML manual → **Astro**, com componentes reutilizáveis (header, footer, cards, botão de WhatsApp), roteamento bilíngue, coleção de artigos com validação de schema e novo design system. `js/main.js` deixa de existir; o JavaScript mínimo (menu mobile, filtro de palestras) vive nos componentes |
| **Backend / Banco de dados** | Continuam inexistentes. O Formspree sai |
| **Infraestrutura** | Novo workflow do GitHub Actions (build + deploy). Origem do GitHub Pages muda de "branch" para "GitHub Actions" (ajuste manual único em Settings → Pages). `CNAME` passa para `public/` para constar no site gerado |
| **Analytics** | Mesma propriedade GA4 (`G-CPNE8N9WS3`, preserva o baseline). Novos eventos: clique no WhatsApp, troca de idioma, compartilhamento. UTMs nos links distribuídos |

### Data

Não há banco de dados. Os "dados" são **coleções de conteúdo versionadas no repositório**, validadas por schema no build.

**Fonte dos artigos — vault do Obsidian (`matheus-haddad/artigos`, repositório separado)**
- 35 artigos publicados (`status: publicado`) + rascunhos em `_rascunhos/` (nunca publicados).
- Frontmatter existente: `title`, `date`, `category`, `series`, `tags`, `language`, `status`, `source_url`/`source_urls`, `platform`, `tldr` (em parte dos artigos) e metadados de exportação.
- O texto publicável fica **somente** sob `## Conteúdo original`; as demais seções ("Classificação", "Ideias centrais", "Artigos relacionados", "Síntese estruturada", "Referência") são material editorial e não vão para o site.

**Categorias (decisão irreversível — tomada)**: as do vault, com nomes mais curtos no site. O vault continua sendo a fonte, sem conversão.

| Categoria no vault | Nome no site (PT / EN) | Publicados |
|---|---|---|
| Gestão e Design Organizacional | Gestão e Design Organizacional / Management & Organizational Design | 16 |
| Coerência Cognitiva e P-O Fit | Coerência Cognitiva e P-O Fit / Cognitive Coherence & P-O Fit | 8 |
| IA, Trabalho e Organizações | AI, Trabalho e Organizações / AI, Work & Organizations | 7 |
| História, Simbolismo e Caminho de Santiago | Hobbies / Hobbies | 2 |
| Agilidade e Desenvolvimento de Software | Desenvolvimento de Software / Software Development | 1 (+3 rascunhos) |
| Educação e Aprendizagem | Educação / Education | 1 |

**Coleções no site**

| Coleção | Conteúdo | Origem |
|---|---|---|
| `articles` | Artigos, um arquivo por idioma, ligados pelo identificador do par | Vault do Obsidian, via ferramenta de publicação |
| `talks` | ~23 palestras, podcasts e webinars (título, descrição, canal/evento, tipo, link/embed) | Extraído de `palestras.html` atual |
| `companies` | 8 empresas e organizações (nome, logo, link, papel de Matheus, descrição) | Extraído de `empresas.html` atual |
| `services` | Consultoria, Mentoria, Palestras (texto, público, formato, mensagem de WhatsApp) | Copy nova |
| Dicionário de interface | Textos fixos de menu, botões e rótulos, em PT e EN | Novo |

**Séries:** o campo `series` do vault **não** é usado no site (decisão do autor). Não é importado.

**Migração e dados existentes**
- **Aditiva** para o conteúdo: nada do vault é alterado.
- **Destrutiva** para o site antigo: HTML, `css/`, `js/`, `assets/` e `index-old.html` são removidos. Antes, criar a tag `site-v1` no git para permitir consulta ou restauração.
- Preservados: `CNAME` (→ `public/`), `favicon.ico`, `feedback-canvas/*.pdf` (mesmos caminhos), imagens reaproveitáveis (logos, capa do livro).
- GA4 segue na mesma propriedade, sem perda de histórico.

### APIs

Não há API. O contrato público equivalente são **as URLs**, que não podem mudar depois de compartilhadas.

**Estrutura de URLs (decisão irreversível — tomada)**

| Página | Português | Inglês |
|---|---|---|
| Home | `/` | `/en/` |
| Sobre | `/sobre/` | `/en/about/` |
| Serviços (hub) | `/servicos/` | `/en/services/` |
| Consultoria | `/consultoria/` | `/en/consulting/` |
| Mentoria | `/mentoria/` | `/en/mentoring/` |
| Palestras e mídia | `/palestras/` | `/en/speaking/` |
| Empresas | `/empresas/` (+ `/empresas/<empresa>/` na onda 5) | `/en/companies/` (+ `/en/companies/<company>/`) |
| Livros | `/livros/` | `/en/books/` |
| Lista de artigos | `/artigos/` | `/en/articles/` |
| Artigo | `/artigos/<titulo-do-artigo>/` | `/en/articles/<article-title>/` |
| Categoria | `/artigos/categoria/<categoria>/` | `/en/articles/category/<category>/` |
| Feeds e arquivos | `/rss.xml`, `/sitemap-index.xml`, `/llms.txt`, `/llms-full.txt` | `/en/rss.xml` |
| 404 | `/404.html` (bilíngue) | — |

- Português na raiz; inglês sob `/en/`. URLs com barra final, de forma consistente.
- Artigo **sem categoria nem data** na URL: recategorizar não quebra links.
- Slug no idioma de cada versão; as duas versões ligadas pelo identificador do par.
- A página `/servicos/` (adicionada no design prompt de 28/09) reúne Consultoria, Mentoria e Palestras e é o item "Serviços" do menu.
- Não há página `/contato/`: o botão "Conversar no WhatsApp" fica no header, no rodapé e em cada página de serviço.

**Versão original / canonical (decisão irreversível — tomada)**
- A versão do **site** é a canônica (`<link rel="canonical">` aponta para o próprio site).
- Artigos migrados exibem "Publicado originalmente no LinkedIn/Medium em [data]", com link para `originalUrl`.
- Artigos novos: publicados primeiro no site; o link do site é o que se distribui.

**Quebra de clientes atuais:** as URLs antigas (`sobre.html`, `palestras.html` etc.) deixam de existir, sem redirecionamento (decisão da discovery). Caem na 404 bilíngue.

### Dependencies

**Build (versões consultadas no npm em 28/09/2026)**

| Dependência | Uso |
|---|---|
| `astro` 7.3.x | Framework; roteamento i18n nativo e content collections com schema |
| `@astrojs/sitemap` 3.7.x | Sitemap com alternâncias de idioma |
| `@astrojs/rss` 4.0.x | RSS por idioma |
| `@astrojs/check` 0.9.x | Validação de tipos e schema antes do push |
| `sharp` (via `astro:assets`) | Otimização de imagens |
| Gerador de imagens OG no build | Prévias 1200×630 com a marca, a partir de título e categoria (biblioteca a escolher na onda 2) |
| Fontes self-hosted | Sem Google Fonts; família definida pelo design system |
| Ícones SVG | Substituem o Font Awesome |

**Serviços externos**
- **GA4** (`G-CPNE8N9WS3`), carregado sem bloquear a renderização.
- **WhatsApp** via `wa.me` (sem API, sem custo).
- **YouTube:** player carregado só no clique (fachada leve). O `palestras.html` atual carrega ~20 iframes de uma vez.

**Infraestrutura**
- **GitHub Actions** com o workflow oficial do Astro para GitHub Pages; grupo de concorrência para cancelar deploys obsoletos.
- **Node 24 LTS** no CI (linha LTS ativa em set/2026; corrige a menção a Node 22 feita na conversa) e **npm**.

**Fluxo de publicação**
- **Obsidian MCP** (já conectado ao Claude Code) para ler o vault.

**Não se aplicam:** fila/mensageria, cache próprio (o GitHub Pages serve via CDN), feature flags (o campo `draft` cumpre o papel).

---

## 3. Implementation Strategy

### Architecture

**Onde ficam as regras**
- **No build (Astro):** schema dos artigos, par PT/EN obrigatório, slugs estáveis, montagem da mensagem de WhatsApp, chamada no fim do artigo (por `service` ou padrão da categoria), `hreflang`/canonical, imagens OG.
- **Na skill de publicação:** extrair apenas `## Conteúdo original`, converter o frontmatter do vault, traduzir para o inglês, evitar duplicatas (identificador do par), validar e publicar.

**Frontend × backend:** tudo é frontend gerado no build. JavaScript no navegador restrito a: menu mobile, filtro de palestras, fachada do YouTube e GA4 (com eventos).

**Estrutura proposta do repositório**

```
.
├── .claude/skills/publicar-artigo/SKILL.md   # Skill de publicação (fluxo A)
├── .github/workflows/deploy.yml              # Build + deploy no GitHub Pages
├── astro.config.mjs                          # site, i18n (pt padrão na raiz, en em /en/), integrações
├── public/                                   # CNAME, favicon, feedback-canvas/*.pdf, robots.txt
├── src/
│   ├── content.config.ts                     # Schemas das coleções
│   ├── content/
│   │   ├── articles/pt/<slug>.md
│   │   ├── articles/en/<slug>.md
│   │   ├── talks/  companies/  services/
│   ├── i18n/                                 # Dicionário de interface PT/EN + helpers de rota
│   ├── components/                           # Header, Footer, WhatsAppButton, ArticleCard, LanguageSwitcher, SEO...
│   ├── layouts/                              # BaseLayout, ArticleLayout
│   ├── pages/                                # Rotas PT na raiz e EN em /en/
│   └── styles/                               # Tokens e estilos do design system
└── package.json
```

**Ferramenta de publicação — decisão do autor: somente uma skill do Claude Code**
- Skill `publicar-artigo` versionada no repositório do site, usando o **Obsidian MCP local** para ler a nota.
- Passos: localizar a nota no vault → extrair `## Conteúdo original` → converter o frontmatter → traduzir para o inglês (com glossário e regras de estilo na própria skill) → gravar o par PT/EN → `git pull` → verificação leve `astro check` (segundos; o build completo fica com o GitHub Actions) → commit e push.
- **Mitigação da variabilidade** (sem script determinístico): o schema do build rejeita estruturas erradas; a skill traz um template de frontmatter e um checklist; o `astro check` roda antes de todo push.

**Reaproveitamento:** conteúdo de palestras, empresas e livro; logos; capa do livro; PDFs; propriedade GA4; domínio. O código antigo (HTML/CSS/JS) **não** é reaproveitado.

### Implementation Order

Sem backend; a sequência segue as dependências do próprio site. Desenvolvimento na branch `novo-site`; o site atual segue no ar até o lançamento.

**Onda 1 — Casa própria publicando (29/09–05/10)**
1. Tag `site-v1` no estado atual; branch `novo-site`.
2. Esqueleto Astro: i18n (pt na raiz, en em `/en/`), layout base com visual neutro, workflow de build.
3. Coleções e schemas (`articles`, `talks`, `companies`, `services`) e dicionário de interface.
4. Páginas do blog: lista, artigo, categoria, RSS, sitemap, `hreflang` e canonical.
5. Skill `publicar-artigo`, testada com 3 artigos reais (um de cada categoria principal).
6. GA4 com eventos.

**Onda 2 — Cara nova (06–12/10)**
7. Design system definido **antes** do código (cores, tipografia, espaçamentos, componentes).
8. Aplicação ao layout, header, footer e página de artigo.
9. Home.
10. Imagens OG e botões de compartilhar.

**Onda 3 — Converter (13–19/10)**
11. Páginas de serviço (copy nova em PT, depois traduzida).
12. Botão de WhatsApp com mensagens por página + evento GA4.
13. Chamada no fim do artigo.

**Onda 4 — Volume e credibilidade (20–26/10)**
14. Migração dos 32 artigos restantes pela skill, em lotes (estressa a skill).
15. Sobre.
16. Palestras, empresas (cards), livros e 404.

**Lançamento (27–31/10)**
17. Revisão (antes da troca): mobile, performance, acessibilidade, prévias reais no WhatsApp e no LinkedIn.
18. **Em 27/10:** remoção do site antigo, merge na `main`, troca da origem do Pages para GitHub Actions, verificação de domínio e HTTPS. De 28 a 31/10: correções com o site no ar.

**Onda 5 (novembro):** páginas por empresa, artigos relacionados, `llms.txt`/`llms-full.txt`/`humans.txt`.

**Dependências críticas:** passo 3 → 4 e 5; passo 7 → 8 a 16; passo 5 → 14.
**Menor entrega com valor:** onda 1 funcionando de ponta a ponta (publicar um artigo pela skill e vê-lo gerado nos dois idiomas).

### Compatibility

- **Transição:** o site atual segue no ar, intocado, na `main`. O novo é desenvolvido na branch `novo-site`, com acompanhamento local (`npm run dev` / `npm run preview`).
- **Rollout:** troca única para todos (big bang). Sem redirecionamento das URLs antigas (decisão da discovery).
- **Data da troca:** **27/10/2026**, início da semana de folga, para testar no ar o que só funciona com URL pública (prévias no WhatsApp e LinkedIn, domínio, HTTPS) e corrigir até 31/10.
- **Fallback:**
  - Problema pequeno: corrigir e dar push (deploy em minutos).
  - Problema grave: reverter o merge na `main`, voltar a origem do Pages para "branch" e o site antigo volta a partir da tag `site-v1` (~10 minutos).

### Security

- **Permissões:** sem login nem área restrita. Só Matheus (e a skill em seu nome) faz push. Workflow com permissões mínimas (`contents: read`, `pages: write`, `id-token: write`).
- **Segredos:** nenhum no repositório. ID do GA4 e número do WhatsApp são públicos por natureza. Deploy autenticado pelo mecanismo nativo do GitHub Pages (OIDC), sem tokens manuais.
- **Entrada de usuário:** inexistente (sem formulários nem backend).
- **Conteúdo:** vem de Matheus e da tradução por AI. O Astro escapa o texto; a skill remove `<script>` e iframes fora do YouTube antes de publicar.
- **Vazamento a partir do vault:** a skill publica **somente** o artigo indicado pelo nome, **somente** a seção `## Conteúdo original` e **nunca** conteúdo de `_rascunhos/` sem pedido explícito. Notas editoriais não saem do vault.
- **Supply chain:** Dependabot para atualizações de segurança; actions do workflow fixadas em versões específicas; `package-lock.json` versionado.
- **Terceiros:** apenas GA4 e YouTube (`youtube-nocookie.com`, carregado só no clique).
- **LGPD / cookies (decisão do autor: opção B):** GA4 mantido como hoje, **sem aviso de cookies nem modo de consentimento**. Risco aceito conscientemente: baixo para um site pessoal, mas existente. Revisitar se o site passar a coletar dados pessoais ou se houver exigência de cliente.
- **Headers:** o GitHub Pages não permite configurar headers de segurança (ex.: CSP); aceito para um site estático sem entrada de usuário.

### Technical Plan

**Abordagem**
- Reescrever o site em **Astro 7** como site estático bilíngue (PT na raiz, EN em `/en/`), com artigos, palestras, empresas e serviços em **content collections validadas por schema**.
- Publicar pelo **GitHub Actions no GitHub Pages**, mantendo o domínio `matheushaddad.com`, com deploy a cada push na `main`.
- Alimentar o blog por uma **skill do Claude Code** (`publicar-artigo`) que lê o vault do Obsidian pelo MCP local, extrai o conteúdo original, traduz para o inglês e publica o par.
- Converter leitura em contato via **WhatsApp Business** (`wa.me` com mensagem por página e idioma), medindo cliques no **GA4**.
- Desenvolver na branch `novo-site` e fazer a troca de uma vez em **27/10**, com rollback pela tag `site-v1`.

**Sequência de implementação:** ver *Implementation Order* (18 passos em 4 ondas + lançamento; onda 5 em novembro).

**Responsabilidades por camada**

| Camada | Responsabilidade |
|---|---|
| Conteúdo (`src/content/`) | Artigos PT/EN, palestras, empresas, serviços; schema como contrato |
| i18n (`src/i18n/`) | Dicionário de interface, mapeamento de rotas PT ↔ EN, helpers de `hreflang` |
| Componentes e layouts | Design system aplicado; SEO/OG; botão de WhatsApp; chamada no fim do artigo; seletor de idioma |
| Páginas (`src/pages/`) | Rotas conforme o contrato de URLs; 404 bilíngue; RSS; `llms.txt` (onda 5) |
| Build (Actions) | `astro check` + `astro build`, otimização de imagens, OG images, sitemap, deploy |
| Skill `publicar-artigo` | Extração, conversão, tradução, anti-duplicata, `astro check`, commit e push |
| Analytics | GA4 com eventos de WhatsApp, troca de idioma e compartilhamento; UTMs |

**Rollout**
- Até 26/10: tudo na branch `novo-site`, revisado localmente.
- 27/10: remoção do site antigo, merge na `main`, troca da origem do Pages, verificação de domínio, HTTPS e prévias reais.
- 28–31/10: correções com o site no ar. Rollback grave: revert + tag `site-v1` (~10 min).

**Riscos principais e mitigações**

| Risco | Mitigação |
|---|---|
| **Prazo** (uma pessoa, ~4,5 semanas) | Ondas semanais com dependências explícitas; design system definido antes do código (passo 7) para não travar as ondas 3 e 4; onda 5 fora do MVP |
| **Qualidade da tradução sem revisão humana** | Glossário e regras de estilo na skill (termos técnicos, tom autoral, nomes próprios); revisão amostral por Matheus nos 3 artigos de teste da onda 1 |
| **Variabilidade da skill** (sem script determinístico) | Schema rígido no build; template de frontmatter e checklist na skill; `astro check` antes de todo push |
| **Vazamento de notas editoriais do vault** | Extração restrita a `## Conteúdo original`; nunca publicar `_rascunhos/` sem pedido explícito |
| **Performance** (meta < 3 s no 4G) | Fachada do YouTube; imagens otimizadas; fontes self-hosted; JS mínimo |
| **Premissa 4 parcialmente refutada** (pouco conteúdo de Desenvolvimento de Software) | Publicar os 3 rascunhos da série "IA no Desenvolvimento de Software" logo após o lançamento |
| **LGPD** (GA4 sem aviso) | Risco aceito pelo autor; revisitar se houver coleta de dados pessoais |
| **`llms-full.txt` > ~100 mil tokens** (onda 5) | Gerar um arquivo por idioma, se necessário |
