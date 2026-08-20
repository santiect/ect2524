## Objetivo

Modelar e resolver, em AMPL, uma versão própria do **Problema da Dieta**
apresentado no notebook `OPT002_knapsack_compact`, usando dados de
alimentos que vocês mesmos vão pesquisar.

## O que fazer

1. **Pesquisem os dados.** Escolham pelo menos **10 alimentos** e busquem,
   em fontes confiáveis (ex.: [Tabela TACO](https://www.nepa.unicamp.br/taco/),
   rótulos nutricionais, bases de dados nutricionais), os seguintes valores
   por unidade/porção de cada alimento:
   - custo (defina uma fonte de preço, ex.: preço de mercado por porção);
   - calorias (kcal);
   - proteínas (g);
   - cálcio (g);
   - sódio (g);
   - ferro (g);
   - vitaminas (g) — ou outro conjunto de nutrientes, desde que
     justifiquem a escolha.

   **Não usem os dados prontos do notebook** — a pesquisa dos valores é
   parte da tarefa.

2. **Escrevam a formulação compacta** do problema (parâmetros, variáveis
   de decisão, função objetivo, restrições), no mesmo estilo da
   formulação (4)-(6) do notebook `OPT002_knapsack_compact`, explicando o
   significado de cada elemento.

3. **Implementem em AMPL**, criando os três arquivos:
   - `dieta.mod` — pode adaptar o modelo do notebook;
   - `dieta.dat` — com os dados que vocês pesquisaram;
   - `dieta.run` — carrega modelo + dados e resolve (`option solver highs;`).

4. **Resolvam e leiam o resultado**: quais alimentos e em que quantidade
   compõem a dieta de menor custo que atende às restrições nutricionais?

## Entrega

- Um Colab (ou os três arquivos `.mod`/`.dat`/`.run` + prints do
  resultado) contendo: a formulação, os arquivos AMPL, o resultado obtido
  e as respostas às perguntas de reflexão da aula.

## Perguntas de reflexão (respondam na entrega)

1. Quais as limitações da solução obtida?
2. O que poderia ser melhorado no modelo?
3. Como poderia ser pensado o cardápio de um refeitório real (ex.: o
   restaurante universitário do campus), servindo milhares de refeições
   ao longo de uma semana, mês ou ano?
4. Este modelo poderia ser aplicado na sua casa ou no seu trabalho?
5. Há semelhança com o Problema da Mochila visto em aula?
