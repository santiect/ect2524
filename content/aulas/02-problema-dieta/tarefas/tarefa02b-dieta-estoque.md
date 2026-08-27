## Continuação da Tarefa 2a

Esta é a segunda tarefa da Aula 2. Ela parte da mesma nutricionista e dos
mesmos alimentos que vocês levantaram na Tarefa 2a — mas agora o pedido
fica mais realista.

## O pedido

> "A dieta de um único dia que vocês montaram ficou ótima, mas na prática
> eu não compro comida dia a dia: eu faço um planejamento de compras para
> a **semana** (considerem uma semana útil, de **5 dias**). Cada dia eu
> começo com um certo **estoque** de cada alimento (o que sobrou do dia
> anterior, mais o que chegou de fornecedor), e preciso decidir quanto
> usar de cada alimento em cada dia, sem nunca usar mais do que eu tenho
> em estoque naquele dia.
>
> Além disso, o refeitório não serve sempre a mesma quantidade de
> refeições: em alguns dias servimos mais gente do que em outros. Então
> as exigências nutricionais mínimas e máximas — que antes eram por
> pessoa, por dia — agora precisam ser multiplicadas pelo **total de
> refeições** que vamos servir naquele dia específico.
>
> Quero, para os 5 dias da semana, saber quanto usar de cada alimento a
> cada dia, respeitando o estoque disponível e as exigências
> nutricionais de cada dia, gastando o mínimo possível ao longo da
> semana toda."

## O que fazer

1. **Reaproveitem os dados da Tarefa 2a**: os mesmos alimentos, custos e
   composição nutricional por porção.

2. **Definam dois dados novos**, com valores que vocês mesmos podem
   arbitrar (não precisam pesquisar fonte externa para estes, mas
   justifiquem que fazem sentido):
   - o **estoque inicial** de cada alimento (quanto já está disponível
     no início do dia 1);
   - o **total de refeições** a servir em cada um dos 5 dias (pode variar
     dia a dia, ex.: menos refeições numa sexta-feira).

3. **Escrevam a formulação compacta estendida**, no mesmo estilo da
   Tarefa 2a, mas agora indexada também pelo dia (use um índice
   $t \in \{1, \dots, 5\}$ além do índice de alimento). Pensem em:
   - variáveis de decisão: quanto usar de cada alimento, em cada dia;
   - como o **estoque** de cada alimento evolui entre um dia e o
     seguinte (o que sobra de estoque em $t$ é o que estava disponível
     em $t$ menos o que foi usado em $t$, e passa a ser o estoque
     disponível em $t+1$ — não há reposição no meio da semana, só o
     estoque inicial);
   - como as exigências nutricionais mínimas/máximas de cada dia
     dependem do total de refeições daquele dia;
   - a função objetivo: custo total ao longo dos 5 dias.

   Expliquem o significado de cada parâmetro, variável e restrição —
   de novo, pensando que esse texto precisa fazer sentido para a
   nutricionista.

4. **Implementem em AMPL**, criando os três arquivos:
   - `dieta_estoque.mod` — a formulação do item anterior (com os
     conjuntos/índices de alimento *e* de dia);
   - `dieta_estoque.dat` — dados da Tarefa 2a mais o estoque inicial e o
     total de refeições por dia;
   - `dieta_estoque.run` — carrega modelo + dados e resolve
     (`option solver highs;`).

5. **Resolvam e leiam o resultado**: para cada um dos 5 dias, quanto de
   cada alimento é usado, qual o custo diário e qual o custo total da
   semana? O estoque inicial foi suficiente, ou algum alimento esgotou
   antes do fim da semana?

## Entrega

- A formulação estendida, os três arquivos AMPL, o resultado obtido
  (quantidades por alimento e por dia, custo diário e custo total da
  semana) e as respostas às perguntas de reflexão abaixo.

## Perguntas de reflexão (respondam na entrega)

1. O que mudou na formulação em relação à Tarefa 2a (dia único)? Quais
   parâmetros, variáveis e restrições foram adicionados?
2. O estoque inicial que vocês definiram foi suficiente para os 5 dias?
   O que acontece com o modelo se algum alimento acabar no meio da
   semana?
3. Este modelo, com estoque e horizonte de vários dias, ainda tem
   variáveis contínuas e a mesma estrutura geral da mochila e da dieta
   de um dia — o que mudou foi só a quantidade de índices/restrições.
   Vocês concordam? Por quê?
4. Como esse modelo poderia ser estendido para um horizonte maior (ex.:
   um mês) ou para considerar reposição de estoque (compras) no meio da
   semana, e não só o estoque inicial?
5. Este modelo de planejamento com estoque poderia ser útil na sua casa
   ou no seu trabalho?
