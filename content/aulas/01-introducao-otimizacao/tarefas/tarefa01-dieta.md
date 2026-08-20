## O pedido

Imaginem que vocês formam uma pequena equipe de consultoria em otimização,
e receberam a seguinte encomenda:

> "Sou a nutricionista responsável pelo refeitório de uma fábrica que
> serve milhares de refeições por dia. Gastamos muito dinheiro por mês
> com isso, e a diretoria está cobrando um corte de custos — mas eu não
> posso simplesmente cortar comida, ou vou colocar a saúde dos
> trabalhadores em risco. Preciso montar cardápios que respeitem
> quantidades mínimas de proteína, cálcio, sódio, ferro e vitaminas, além
> de um limite máximo de calorias. O problema é que tenho dezenas de
> alimentos possíveis pra escolher, em quantidades variáveis, e testar
> combinações à mão é inviável. Vocês conseguem me entregar uma
> ferramenta que, a partir de uma lista de alimentos (com custo e
> composição nutricional), me diga quais alimentos usar e em que
> quantidade, gastando o mínimo possível e sem violar essas exigências?"

Essa é a encomenda de vocês nesta tarefa: construir, para essa
nutricionista, o modelo de otimização que resolve esse problema —
depois validado com dados reais que vocês mesmos vão levantar.

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

   Não vale usar uma lista de dados pronta de outra fonte — a pesquisa
   dos valores é parte da tarefa, como se vocês estivessem de fato
   levantando o cardápio disponível para essa nutricionista.

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
3. Como poderia ser pensado o cardápio de um refeitório real (ex.: o
   restaurante universitário do campus), servindo milhares de refeições
   ao longo de uma semana, mês ou ano?
4. Este modelo poderia ser aplicado na sua casa ou no seu trabalho?
5. Há semelhança com o Problema da Mochila visto em aula?
