---
title: "A IA não vai cortar custo na sua operação, vai cortar a sua margem de erro"
description: "A IA acelera a produção, não a solução do imprevisto. Cortar a folga com base nesse ganho elimina a margem que a operação usa para absorver a variabilidade."
pubDate: 2026-08-18
category: ai
lang: pt
translationKey: a-ia-nao-vai-cortar-custo-na-sua-operacao-vai-cortar-a-sua-margem-de-erro
originalUrl: https://www.linkedin.com/pulse/ia-n%C3%A3o-vai-cortar-custo-na-sua-opera%C3%A7%C3%A3o-margem-de-erro-matheus-haddad-nuaje
draft: false
---

![Em uma reunião de planejamento de sprint, um executivo aponta para a tela com 20% de buffer e 80% de desenvolvimento e pergunta, num balão de fala: "Se estamos produzindo mais com IA, por que ainda reservamos 20% da capacidade para imprevistos?"](../../../assets/articles/a-ia-nao-vai-cortar-custo-na-sua-operacao-vai-cortar-a-sua-margem-de-erro/capa.jpg)

*CTO buscando o aumento da produtividade do time - Imagem gerada pelo Gemini (NanoBanana 2)*

Numa reunião de planejamento de sprint, o time olha para a capacidade (tempo e esforço) e reserva 20% para o imprevisto. Ninguém precisa explicar o motivo: bug que aparece no final da semana, a integração que muda de contrato sem avisar, o pedido urgente que chega do comercial na véspera da entrega...

Alguns meses depois, esse mesmo time adotou inteligência artificial para escrever código, revisar *pull request* e gerar testes. A entrega acelerou de verdade. Até que o CTO aparece e pergunta numa reunião: se estamos produzindo mais, por que continuar reservando 20% da capacidade do time?

Parece a decisão mais racional do mundo. Sobe o compromisso da sprint, ocupa a margem, aproveita o ganho.

O que a pergunta ignora é que a IA acelerou a produção, não a solução do imprevisto. A margem não existia para cobrir lentidão, mas para absorver o impacto do imprevisível.

## Só a variedade absorve variedade

[W. Ross Ashby](https://en.wikipedia.org/wiki/W._Ross_Ashby) formulou na cibernética a **lei da variedade requerida**, resumida numa frase que circula em várias versões: só a variedade absorve variedade. Na prática, um sistema só se mantém estável se o seu repertório de respostas for tão variado quanto os problemas que enfrenta.

O bug de sexta-feira, a integração que quebra e o pedido de última hora são variedade. Nenhum deles é previsível um por um, e todos aparecem com alguma regularidade.

A margem que o time reservava era repertório de resposta. Tom DeMarco deu a essa margem o nome de **folga**, e ela mora no prazo, na capacidade, no orçamento e na tolerância de qualidade.

Repare no que a IA fez e no que ela não fez. Ela aumentou a velocidade de produzir código. A variedade do ambiente continua a mesma, e o repertório para absorvê-la encolheu no instante em que a margem virou mais compromisso de entrega.

## A conta que fica pela metade

Tenho chamado isso de **assimetria contábil da folga**: a folga aparece no planejamento, mas a coordenação não.

Corte a folga e o número melhora já no ciclo seguinte, porque folga é algo mensurável. O custo dessa decisão chega depois: como reunião de alinhamento, escalonamento, retrabalho e tempo de gestor consumido em replanejamento. Como ele nasce em outra planilha, com outro dono e em outro trimestre, ninguém o soma à economia que justificou o corte.

Com inteligência artificial no meio, a assimetria fica ainda mais convincente. Entra uma linha nova no orçamento, que é a ferramenta, e sai uma linha antiga, que é a folga. As duas são visíveis, as duas se comparam bem num slide, mas a coordenação segue exatamente onde estava: fora da conta.

## O custo invisível de operar no limite

A teoria das filas explica por que o tempo de espera não cresce no mesmo ritmo da demanda. Conforme a ocupação de um sistema sobe, o atraso não aumenta gradualmente: ele se multiplica. Se o ritmo de chegada e a duração das tarefas variam, a curva de lentidão dispara ainda mais cedo (exatamente como acontece no trânsito antes de um engarrafamento).

É verdade que o trabalho de conhecimento não é uma fila passiva. Pessoas repriorizam, negociam, agrupam e descartam tarefas o tempo todo.

Ainda assim, a matemática da curva reflete uma realidade intuitiva: subir a ocupação de 70% para 80% quase não dói, mas ir de 95% para 100% transforma a sprint num cenário imprevisível. É para essa zona crítica que a busca por eficiência via inteligência artificial empurra a operação, pois é onde os ganhos parecem mais fáceis de demonstrar. O último pedaço de folga é o mais caro de todos, porém também é o primeiro a ser sacrificado.

## O que a Toyota entendeu sobre cortar a folga

Alguém vai lembrar do *just-in-time*. Taiichi Ohno documentou a remoção deliberada da folga de estoque na fábrica da Toyota, e funcionou. O que some na versão resumida é a outra metade da história: no lugar da folga física, a fábrica construiu um aparato de informação feito para enxergar a variação em tempo real e reagir a ela, com kanban e sinalização de parada. Em vocabulário de Ashby, a fábrica trocou uma forma de variedade por outra, mas não abriu mão do repertório.

É a mesma estrutura de argumento que se usa para a inteligência artificial hoje. A diferença essencial está em como cada aparato falha.

O kanban falhava localmente, visivelmente e devagar. Um cartão parava, alguém via, a linha parava e o erro se anunciava antes de se espalhar. A coordenação assistida por inteligência artificial erra de outro jeito: com consistência, em escala e em silêncio. Um sistema que classifica errado classifica errado todas as vezes, e ninguém percebe até o efeito acumulado aparecer. É o oposto do cartão que trava.

Aí está a assimetria: o ganho da IA aparece rápido, em indicadores imediatos de produtividade; o erro aparece devagar, distribuído entre áreas, sem dono e sem data. Por isso, quem pretende cortar folga contando com a IA como aparato precisa responder antes a uma pergunta: o meu aparato falha como o kanban ou de um jeito pior? Se falha como o kanban, o corte é defensável. Se falha em silêncio, você retirou a margem exatamente na hora em que vai precisar dela.

## Como tomar uma decisão melhor sobre o corte da folga

Não existe fórmula exata para essa conta, mas é fácil elevar a qualidade da decisão com duas perguntas simples:

- **Mapeamento do custo real:** Quantas horas a área perdeu com reuniões de alinhamento, escalonamentos e retrabalhos nos últimos três meses? Sem esse diagnóstico, qualquer promessa de economia está sendo comparada com o nada.
- **Modo de falha da ferramenta:** Como o time vai identificar um erro desse novo sistema e em quanto tempo? Quando não há resposta clara para isso, significa que a folga continua sendo o único mecanismo de segurança real (mesmo que pareça um desperdício na planilha).

Nenhuma dessas perguntas impede o corte. No entanto, ambas transformam o nível de consciência na hora de decidir.

## Para refletir

- Na sua empresa, alguém já somou o que a IA economizou de um lado com o que ela passou a consumir de coordenação, verificação e correção do outro?
- A sua operação ganhou repertório para lidar com o inesperado, ou só ganhou velocidade para produzir o esperado?
- E você saberia apontar agora qual é a última folga que sobrou na sua área, ou ela já foi ocupada em alguma atividade que pareceu boa na hora?
