---
title: "2020 x 2026: um dia na vida de um desenvolvedor de software"
description: "O mesmo desenvolvedor em duas terças-feiras, em 2020 e em 2026: o que saiu das mãos dele, o que ocupou esse espaço e o que a IA não substituiu."
pubDate: 2026-09-29
category: ai
lang: pt
translationKey: 2020-x-2026-um-dia-na-vida-de-um-desenvolvedor-de-software
originalUrl: https://www.linkedin.com/pulse/2020-x-2026-um-dia-na-vida-de-desenvolvedor-software-matheus-haddad-dsbne/
draft: false
---

![À esquerda, um desenvolvedor de costas diante de dois monitores com código, num escritório onde a equipe conversa em frente a um quadro de post-its; à direita, o mesmo desenvolvedor diante de painéis holográficos com diagramas, gráficos e listas de verificação, ladeado por dois pequenos robôs](../../../assets/articles/2020-x-2026-um-dia-na-vida-de-um-desenvolvedor-de-software/capa.png)

*2020 x 2026 - a natureza do trabalho de um desenvolvedor de software mudou (imagem criada pelo ChatGPT)*

Quase toda a discussão sobre inteligência artificial no desenvolvimento de software gira em torno de ferramentas: qual agente, qual modelo, qual harness, quantos por cento de ganho... Prefiro outra pergunta, que me parece mais reveladora. O que mudou no dia de trabalho de quem desenvolve?

Este artigo tenta responder registrando dois dias do mesmo desenvolvedor, com seis anos de distância entre eles. Em 2020, ele passa quase o dia inteiro digitando num editor de código. Em 2026, digita pouco: lê, decide, conversa e espera o resultado de processos que rodam sem ele. É na agenda de um dia comum que fica visível o que saiu das mãos dele, o que ocupou esse espaço e o que a tecnologia não substituiu.

O personagem se chama Jeff. Ele é fictício, mas nenhuma das cenas foi inventada do zero: todas vêm de situações que observei em projetos reais no [Ateliê de Software](https://br.linkedin.com/company/atelie-de-software).

---

## Terça-feira, 29 de setembro de 2020

Sexto dia de uma sprint de duas semanas.

O time tem 4 desenvolvedores de software, um designer, uma pessoa na liderança de produto (product owner) e um facilitador (scrum master) que divide atenção com outras equipes.

09:05 - Reunião diária

Todos reunidos na frente de um quadro kanban, com as colunas To Do, In Progress, Code Review, QA e Done. Cada pessoa compartilha o que fez ontem, o que fará hoje e eventuais impedimentos. O gráfico de burndown segue acima da linha prevista desde sexta-feira. São quinze minutos dedicados à inspeção e à adaptação do trabalho em andamento.

09:25 - Jeff puxa a próxima história da fila

"Exportar os pedidos de um período em planilha", estimada em cinco pontos durante um refinamento que consumiu uma hora e meia do time na semana anterior. Ele mantém outra história parada em Code Review desde ontem, o que na prática significa dois trabalhos abertos ao mesmo tempo.

09:40 - Primeira dúvida, primeira espera

Os critérios de aceitação utilizam o formato "dado... quando... então...". Jeff lê o texto e identifica a primeira dúvida: a exportação deve considerar o fuso horário do cliente ou do servidor? Ele envia mensagem para a Product Owner, que está em reunião, e migra para outra tarefa enquanto aguarda. A resposta chega quarenta minutos depois, interrompendo um raciocínio diferente.

10:30 - Nova branch criada no repositório

Trabalhando em par com outro desenvolvedor, Jeff escreve o primeiro teste, observa a falha, implementa a solução e executa a suíte com 1.400 testes. O processo consome vinte minutos de espera. Na sequência, o pipeline de integração contínua roda novamente por mais vinte minutos. Eles aproveitam para tomar um café no refeitório da empresa.

12:10 - Conflito de merge

Outro desenvolvedor alterou o mesmo módulo de pedidos durante a manhã. Jeff leva meia hora resolvendo o conflito e, na dúvida sobre uma das decisões, chama o colega para conferir se nada foi desfeito.

14:00 - Uma lacuna no protótipo

Jeff nota que o protótipo não prevê o cenário sem pedidos cadastrados no período. A pessoa de design está alocada em outra frente de descoberta e responde apenas no dia seguinte. Jeff implementa uma solução provisória, inclui um comentário no código e cria uma tarefa técnica no backlog, dessas que costumam envelhecer sem prioridade.

15:00 - Pull request aberto

Jeff cria um pull request, preenchendo a lista de verificação exigida pelo time: testes escritos, cobertura mantida e documentação atualizada. A revisão do PR ocorre apenas no fim da tarde, quando um colega encerra a própria tarefa. São dois comentários de arquitetura e quatro de estilo. A validação manual acontece no dia seguinte, em ambiente de homologação, com roteiro de teste escrito à mão. A publicação está agendada para quinta-feira, ao lado de outros nove itens.

18:00 - Fim do dia

Jeff escreveu quatrocentas linhas de código e resolveu um problema real, mas passou grande parte do tempo aguardando respostas de outras pessoas. Quando a funcionalidade chegar ao usuário, terão se passado nove dias desde o início do desenvolvimento, com cerca de seis horas de trabalho efetivo sobre o problema.

O processo funcionava exatamente como foi projetado. Scrum, kanban e as práticas ágeis em torno deles foram desenhados para coordenar especialistas humanos escassos e reduzir o risco das transferências de trabalho entre eles. O gargalo era o tempo de espera e tempo das pessoas para executar, e quase tudo no processo existia para lidar com isso.

---

## Terça-feira, 29 de setembro de 2026

O time agora é enxuto: Jeff e uma pessoa de design. Não existem sprints. O trabalho flui continuamente em episódios que iniciam em um sinal e terminam com evidências de resultado.

09:00 - Verificação da execução noturna dos agentes de IA

Não há reunião diária.

Jeff analisa o painel do projeto e verifica o que rodou durante a noite. Sete episódios de desenvolvimento foram executados em ambientes isolados. Cada sessão de agente ficou registrada com seu contexto, ferramentas utilizadas, tentativas e custos.

Cinco episódios concluíram a cadeia de verificação automática: testes de sintaxe e tipos, análise estrutural, validação de arquitetura, checagem de segurança, acessibilidade e políticas do projeto. Por fim, ocorreu a revisão por outro agente. Esses cinco itens já atendem a 10% dos usuários via feature flag, com métricas em monitoramento.

Dois episódios interromperam o fluxo. O primeiro falhou em um teste de arquitetura devido ao acesso direto ao banco de dados a partir do módulo de faturamento. O segundo foi retido pela política de privacidade ao identificar números de telefone em anexos de e-mail.

A fila de decisões humanas contém apenas três itens, classificados como de alto impacto, alta incerteza ou difícil reversão. O restante avançou automaticamente, com registro de auditoria.

09:20 - Decisão sobre os episódios bloqueados

Jeff e o designer analisam e alinham a solução em dez minutos: substituem o anexo por um link autenticado dentro do sistema. A decisão é documentada e passa a integrar o contexto dos agentes, evitando a repetição do erro.

09:40 - Revisão de especificação de uma nova funcionalidade

A necessidade de permitir que o usuário crie um novo pedido de compras ganha prioridade no negócio, e a especificação inicial fica versionada no repositório do projeto. Jeff e o designer definem juntos o contrato de execução do agente: estados de tela, regras de acessibilidade, componentes do sistema de design, restrições técnicas e critérios de sucesso. Uma dúvida sobre pedidos recorrentes é resolvida ali mesmo, durante a conversa.

10:30 - Apresentação do plano de execução

O agente devolve o plano com arquivos afetados, migrações e testes necessários. Jeff identifica que a data do pedido seria gravada no fuso do servidor, o que distorceria todos os relatórios por período, e corrige o parâmetro antes da geração do código.

11:00 - Exploração de alternativas

Agentes de IA rodam, em paralelo, quatro possíveis soluções para avaliação: alteração mínima, solução estrutural, busca por funcionalidade já existente e análise de impacto operacional, cada um com estimativa de custo. O cruzamento de dados localiza metade da funcionalidade necessária, escrita dois anos antes em outro módulo por alguém que já saiu do time.

11:40 - Conversa com o cliente

Em quinze minutos, metade do escopo planejado é descartada com base nas descobertas da manhã. Em 2020, essa descoberta apareceria na terceira semana, com o código já pela metade.

12:00 - Início da implementação do episódio de desenvolvimento

Com o escopo reduzido pela conversa com o cliente, a especificação é aprovada e revisada em conjunto. Ela deixa de ser um documento e vira um episódio de desenvolvimento: a intenção, o contexto, as restrições, os critérios de sucesso e o nível de autonomia permitido para aquele trabalho. O episódio entra na fila do orquestrador, que seleciona os agentes, monta o ambiente de execução e distribui as etapas de implementação e teste. A partir daí, o trabalho corre sem o Jeff, que aproveita para ir almoçar. Ele volta a olhar quando houver evidência de resultado ou quando algo exigir decisão humana.

13:30 - Sustentação do ambiente dos agentes de IA

Jeff dedica uma parte da tarde ao sistema que produz o software, e não ao software em si. Converte a regra de arquitetura que falhou pela manhã em um teste estrutural permanente. Padroniza o modelo de migração em uma habilidade reutilizável para os agentes. Cria um teste de comportamento que reprova execuções que inventem campos inexistentes no relatório. E ajusta as permissões dos agentes, restringindo implantações diretas em produção e acessos ao módulo de pagamentos.

15:00 - Revisão por exceção

Dois pull requests feitos por agentes aguardam. Jeff aprova o primeiro apoiado nas evidências da verificação automática e analisa linha por linha apenas o segundo, que altera a fronteira entre dois módulos.

16:00 - Correção escrita à mão

Desde a semana passada, alguns clientes recebem o relatório semanal duas vezes. Para dar conta do volume, o sistema roda em quatro servidores que consultam a mesma fila de envios agendados. Às oito da manhã de segunda, dois deles consultam a fila no mesmo instante, encontram o mesmo envio pendente e os dois mandam o e-mail.

Jeff havia delegado essa correção a um agente na sexta-feira. O código voltou bem escrito e passou em todos os testes, mas o erro continuou em produção, porque os testes do projeto executam um servidor de cada vez e nenhum deles reproduz a falha.

Então ele assume. Começa pelo teste que faltava, que dispara dois envios simultâneos contra o mesmo agendamento, e o roda até a falha aparecer de forma consistente. A correção vem em duas partes: o primeiro servidor que pega um envio o marca como "em processamento", e os outros passam direto; depois do disparo, o envio fica registrado como concluído naquela semana, para que uma nova tentativa após falha de rede não vire um segundo e-mail.

São quarenta linhas e uma hora e meia de trabalho. Jeff escreve à mão porque, nesse tipo de problema, o código é o próprio raciocínio para ele. No fim, transforma o teste de execução simultânea em regra do projeto, para que qualquer tarefa agendada escrita por um agente passe por ele.

17:40 - Exposição progressiva

A entrega do dia anterior passa de 10% para 30% dos usuários, com alerta configurado para reverter automaticamente caso a taxa de erro ultrapasse o limite. A publicação deixou de ser um evento de quinta-feira e virou um fluxo observado.

18:00 - Fim do dia

Não há reunião de acompanhamento.

O estado do trabalho é inferido das evidências geradas por pessoas, agentes e ferramentas, e o cliente acompanha o mesmo painel que o time. O quadro kanban continua existindo, porque é uma boa forma de uma pessoa enxergar o fluxo, mas virou apenas uma projeção digital.

Jeff escreveu cerca de cem linhas de código e tomou onze decisões (todas devidamente registradas).

---

## Mudanças na natureza do trabalho

A comparação entre as duas terças-feiras revela cinco deslocamentos:

1. Da produção para a formulação. Em 2020, o trabalho central era escrever a solução. Em 2026, é definir bem o problema, descrever a intenção sem deixar margem para adivinhação e escolher entre alternativas. Repare que a decisão mais valiosa do dia de 2026 aconteceu às 11:40, quando metade do escopo foi descartada numa conversa de quinze minutos. Nenhuma linha de código teria produzido aquele resultado.
2. Da revisão manual para o projeto da verificação. Ler todo o código linha por linha funciona enquanto uma pessoa escreve esse código. Quando sete episódios rodam durante a noite, a leitura integral vira gargalo. O trabalho passa a ser transformar critérios de qualidade em verificações automáticas, como Jeff fez ao converter uma regra de arquitetura em teste estrutural. A revisão humana continua existindo, mas agora é decidida por risco.
3. Da execução de tarefas para a construção do ambiente. Boa parte da tarde de 2026 foi dedicada ao sistema que produz o software, e não ao software em si. Esse trabalho não aparece em pontos de história nem em nenhuma métrica de entrega, e é justamente ele que define quanto o time consegue fazer na semana seguinte.
4. Do status relatado para o estado inferido. Em 2020, o time se reunia às 9:05 para descobrir o estado do trabalho uns dos outros. Em 2026, esse estado é derivado das evidências que pessoas, agentes e ferramentas já produzem. Muda o sentido da reunião diária, do quadro e do relatório de acompanhamento, que deixam de ser a fonte da verdade e viram formas de visualizá-la.
5. Da atenção distribuída para a atenção concentrada. Em 2020, Jeff dedicava o mesmo cuidado a tudo o que passava pelas mãos dele. Em 2026, a atenção cresce com impacto, incerteza e dificuldade de reverter, e diminui quando existe evidência confiável. Uma alteração pequena e reversível segue sozinha. Alterações críticas ou irreversíveis escalam para uma pessoa.

Ainda assim, algumas coisas não mudaram: a responsabilidade pelo resultado, a conversa com o cliente e o julgamento sobre o que vale a pena construir. A IA não tira nada disso do desenvolvedor. O que ela faz é tornar visível o quanto do trabalho antigo era execução, e o quanto do processo em volta existia apenas para administrar essa execução.

---

## O Papel do Forward Deployed Engineer

O perfil demonstrado por Jeff em 2026 aproxima-se da atuação conhecida como [Forward Deployed Engineer (FDE)](https://en.wikipedia.org/wiki/Forward_deployed_engineer).

Popularizado por empresas que atuam em cenários de alta complexidade e dados não estruturados, o papel integra atividades que antes ficavam isoladas: investigação, arquitetura, desenvolvimento, testes e acompanhamento de impacto em produção.

Diferente do fluxo tradicional onde o desenvolvedor recebe um item fechado para codificar, o FDE atua no ciclo completo do problema. A ampliação da capacidade de geração de código aumenta a necessidade de visão sistêmica e integração com o contexto do cliente.

Esse perfil combina três frentes essenciais:

- Entendimento do negócio e do cliente: capacidade de navegar pelo domínio do problema e suas restrições reais.
- Visão de produto: foco na experiência do usuário e na entrega de valor.
- Engenharia de plataformas e agentes: domínio do ambiente de automação, fluxos de contexto e mecanismos de controle.

O desafio das organizações reside em garantir que o aprendizado obtido em cada projeto seja incorporado ao sistema na forma de padrões, verificações e ferramentas reutilizáveis, evitando a dependência individual e a repetição de esforço.

---

## Para reflexão

1. Em quais momentos da sua semana profissional você identifica processos mais próximos ao modelo de 2020 e onde percebe avanços rumo ao modelo de 2026?
2. Quais atividades da sua equipe possuem clareza suficiente para rodar com maior autonomia automatizada hoje?
3. Conforme a execução operacional deixa de ser o gargalo principal, como sua organização pretende redirecionar a capacidade técnica disponível?
