## Duas tarefas nesta aula

A Aula 2 tem **duas tarefas**, nesta ordem:

1. **Tarefa 2a** (esta aqui): a dieta de **um único dia**, sem se preocupar
   com estoque de alimentos.
2. **Tarefa 2b**: a mesma dieta, mas agora considerando o **estoque** de
   alimentos, o **total de refeições diárias** a servir e um
   **horizonte de planejamento de 5 dias** (uma semana útil).

A Tarefa 2b usa a formulação e os dados desta Tarefa 2a como ponto de
partida, então resolvam esta primeiro.

## O pedido

Imaginem que vocês formam uma pequena equipe de consultoria em otimização,
e receberam a seguinte encomenda:

> "Sou a nutricionista responsável pelo refeitório de uma fábrica que
> serve milhares de refeições por dia. Gastamos muito dinheiro por mês
> com isso, e a diretoria está cobrando um corte de custos — mas eu não
> posso simplesmente cortar comida, ou vou colocar a saúde dos
> trabalhadores em risco. Levantei, com base nas necessidades diárias de
> um adulto, os seguintes limites que o cardápio precisa respeitar:
>
> | Nutriente | Mínimo | Máximo |
> |---|---|---|
> | Calorias (kcal) | 1800 | 2400 |
> | Proteínas (g) | 50 | 175 |
> | Cálcio (g) | 1,0 | 2,5 |
> | Sódio (g) | 1,5 | 2,3 |
> | Ferro (g) | 0,008 | 0,045 |
> | Vitamina A (mcg RE) | 600 | 3000 |
> | Vitamina C (mg) | 75 | 2000 |
> | Vitamina B1 -- Tiamina (mg) | 1,1 | 50 |
>
> O problema é que tenho dezenas de alimentos possíveis pra escolher, em
> quantidades variáveis, e testar combinações à mão é inviável. Vocês
> conseguem me entregar uma ferramenta que, a partir de uma lista de
> alimentos (com custo e composição nutricional), me diga quais
> alimentos usar e em que quantidade, gastando o mínimo possível e sem
> violar nenhum desses limites (nem para cima, nem para baixo)?"

Essa é a encomenda de vocês nesta tarefa: construir, para essa
nutricionista, o modelo de otimização que resolve esse problema —
depois validado com dados reais que vocês mesmos vão levantar. (Os
valores da tabela acima são uma simplificação para efeito da tarefa,
não uma recomendação nutricional real.)

## O que fazer

1. **Pesquisem os dados.** Escolham pelo menos **10 alimentos** e busquem,
   em fontes confiáveis (ex.: [Tabela TACO](https://cfn.org.br/wp-content/uploads/2017/03/taco_4_edicao_ampliada_e_revisada.pdf),
   rótulos nutricionais, bases de dados nutricionais), os seguintes valores
   por unidade/porção de cada alimento:
   - custo (defina uma fonte de preço, ex.: preço de mercado por porção);
   - calorias (kcal);
   - proteínas (g);
   - cálcio (g);
   - sódio (g);
   - ferro (g);
   - vitamina A (mcg RE);
   - vitamina C (mg);
   - vitamina B1 -- tiamina (mg).

   Façam esse levantamento como se estivessem de fato pesquisando o
   cardápio disponível para essa nutricionista.

2. **Escrevam a formulação compacta** do problema (parâmetros, variáveis
   de decisão, função objetivo, restrições), no mesmo estilo usado em
   aula para o Problema da Mochila, explicando o significado de cada
   elemento — imaginem que este texto vai para a nutricionista entender
   o que o modelo está decidindo.

3. **Implementem em AMPL**, criando os três arquivos:
   - `dieta.mod` — a formulação do item anterior;
   - `dieta.dat` — com os dados que vocês pesquisaram;
   - `dieta.run` — carrega modelo + dados e resolve (`option solver highs;`).

4. **Resolvam e leiam o resultado**: quais alimentos e em que quantidade
   compõem a dieta de menor custo que atende às restrições nutricionais?

## Entrega

- A formulação, os três arquivos AMPL, o resultado obtido (valores das
  variáveis e custo total) e as respostas às perguntas de reflexão
  abaixo.

## Perguntas de reflexão (respondam na entrega)

1. Quais as limitações da solução obtida?
2. O que poderia ser melhorado no modelo?
3. Esta dieta vale só para um dia. O que muda se o refeitório precisar
   planejar vários dias seguidos, com estoque de alimentos limitado?
   (essa extensão é o assunto da Tarefa 2b)
4. Este modelo poderia ser aplicado na sua casa ou no seu trabalho?
5. Há semelhança com o Problema da Mochila visto em aula?
