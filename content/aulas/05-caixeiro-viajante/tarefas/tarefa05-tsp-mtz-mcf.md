## Tarefa avaliativa — Caixeiro Viajante: MTZ x Fluxo Multi-Produto

**Caráter avaliativo.** Esta tarefa vale **25% da nota da Unidade 1** da
disciplina. Pode ser realizada em equipes de até 3 pessoas. A data de
entrega e o formato de submissão serão informados pelo professor
**(a definir)**.

Diferente das tarefas anteriores, aqui as formulações matemáticas **são
fornecidas prontas** (Passo 1 abaixo). O que se avalia é a capacidade de
implementá-las corretamente em AMPL e Python, aplicá-las a instâncias
reais e comparar os resultados de forma clara.

## O problema

O Problema do Caixeiro Viajante (TSP, do inglês *Travelling Salesman
Problem*) consiste em encontrar, dado um conjunto de cidades e a distância
entre cada par delas, a rota de menor distância total que parte de uma
cidade, visita cada uma das demais exatamente uma vez, e retorna à cidade
de origem.

O problema é fácil de enunciar e aparece em contextos muito diversos —
roteamento de entregas, planejamento de visitas, sequenciamento de
operações em uma máquina — mas é difícil de resolver: o número de rotas
possíveis cresce com $(n-1)!/2$, onde $n$ é o número de cidades.

Toda formulação de programação linear inteira para o TSP precisa, além de
decidir quais arcos compõem a rota, impedir que a solução se quebre em
**subrotas** — vários ciclos menores e desconexos, cada um cobrindo só
parte das cidades, em vez de um único ciclo passando por todas. É nisso
que as duas formulações desta tarefa diferem: elas eliminam subrotas de
maneiras distintas, com consequências diferentes sobre o tamanho do
modelo e a qualidade do limitante inferior que ele produz.

## Passo 1 — As duas formulações

**Parâmetros (comuns às duas formulações)**

- $n$ — número de cidades;
- $d_{ij}$ — distância entre as cidades $i$ e $j$, para todo $i,j = 1,
  \ldots, n$.

**Variável de decisão comum**

- $x_{ij} \in \{0,1\}$ — vale 1 se a rota vai da cidade $i$ diretamente
  para a cidade $j$, e 0 caso contrário, para todo $i,j = 1,\ldots,n$,
  $i \neq j$.

Ambas as formulações compartilham a mesma função objetivo e as mesmas
restrições de grau:

$$
\text{minimize}~Z = \sum_{i=1}^{n}\sum_{j=1,j \neq i}^{n} d_{ij}x_{ij}
$$

sujeito a:

$$
\sum_{i=1,i \neq j}^{n} x_{ij} = 1,~\forall~j = 1,2,\ldots,n
$$

$$
\sum_{j=1,j \neq i}^{n} x_{ij} = 1,~\forall~i = 1,2,\ldots,n
$$

A função objetivo minimiza a distância total percorrida. A primeira
igualdade garante que toda cidade é alcançada a partir de exatamente uma
outra; a segunda garante que toda cidade tem exatamente uma saída.
Sozinhas, porém, essas restrições não impedem subrotas — cada formulação
completa esse modelo com um mecanismo diferente de eliminação.

### 1.1 — Formulação MTZ (Miller–Tucker–Zemlin)

Além de $x_{ij}$, acrescenta-se:

- $u_i$ — inteiro em $\{1,\ldots,n-1\}$, para todo $i = 2,\ldots,n$.
  Indica a posição em que a cidade $i$ é visitada na rota (por exemplo,
  $u_3 = 4$ significa que a cidade 3 é a quarta a ser visitada). A cidade
  1 é sempre a origem e o destino final da rota, por isso não precisa de
  uma variável $u_1$.

Restrições adicionais:

$$
u_i - u_j + (n-1)x_{ij} \leq n-2,~\forall~i,j = 2,3,\ldots,n;~i \neq j
$$

$$
1 \leq u_i \leq n-1,~\forall~i = 2,3,\ldots,n
$$

$$
u_i \in \mathbb{Z},~\forall~i = 2,3,\ldots,n
$$

Se a rota vai de $i$ para $j$ ($x_{ij}=1$), a primeira restrição força
$u_j \geq u_i + 1$: $j$ só pode ocupar uma posição posterior à de $i$ na
sequência — algo impossível de satisfazer numa subrota que não passe pela
cidade 1. A formulação é **compacta**: $O(n^2)$ variáveis e $O(n^2)$
restrições. Em compensação, seu limitante inferior (relaxação linear) é
conhecidamente **fraco**.

### 1.2 — Formulação de Fluxo de Mercadorias Multi-Produto (MCF)

Uma alternativa que elimina subrotas por meio de um argumento de
**fluxo em rede**: imagine a cidade 1 como uma central que precisa enviar
exatamente uma unidade de um produto diferente para cada uma das demais
$n-1$ cidades, usando só os arcos que a rota efetivamente percorre. Se a
rota se quebrasse em subrotas, os produtos destinados às cidades de uma
subrota que não contém a cidade 1 jamais chegariam ao destino — e é
exatamente essa impossibilidade que a formulação explora.

Variáveis adicionais:

- $f_{ij}^{k} \geq 0$ — quantidade do produto $k$ transportada pelo arco
  $(i,j)$, para cada arco $i,j = 1,\ldots,n,~i\neq j$ e cada produto $k =
  2,\ldots,n$ (um produto para cada cidade que não seja a cidade 1,
  a cidade $k$ sendo o destino do produto $k$).

Restrições adicionais, para cada produto $k = 2,\ldots,n$:

$$
\sum_{j=1,j\neq i}^{n} f_{ij}^{k} - \sum_{j=1,j\neq i}^{n} f_{ji}^{k} =
\begin{cases}
1, & \text{se } i = 1 \\
-1, & \text{se } i = k \\
0, & \text{caso contrário}
\end{cases}
,~\forall~i = 1,\ldots,n
$$

$$
f_{ij}^{k} \leq x_{ij},~\forall~i,j = 1,\ldots,n;~i\neq j
$$

$$
f_{ij}^{k} \geq 0,~\forall~i,j = 1,\ldots,n;~i \neq j
$$

A primeira família é a **conservação de fluxo**: a cidade 1 emite uma
unidade do produto $k$ (saída menos entrada $= 1$), a cidade $k$ absorve
essa unidade (saída menos entrada $= -1$), e toda cidade intermediária
repassa o que recebe (saída menos entrada $= 0$). A segunda família
**acopla** o fluxo à rota: só pode haver fluxo de um produto num arco que
a rota realmente usa ($x_{ij}=1$); se $x_{ij}=0$, a restrição força
$f_{ij}^{k}=0$ para todo $k$.

Essa formulação é conhecida por ser **tão forte quanto** a formulação
clássica de Dantzig–Fulkerson–Johnson (que usa um número exponencial de
restrições de eliminação de subrota) — sua relaxação linear já é bem mais
apertada que a da MTZ. O preço é o tamanho: são $O(n^2)$ produtos $\times$
$O(n^2)$ arcos, ou seja, $O(n^3)$ variáveis de fluxo — cresce muito mais
rápido com $n$ do que a MTZ.

### 1.3 — Por que comparar as duas

MTZ e MCF representam dois extremos de um mesmo compromisso ao formular o
TSP como programação linear inteira: MTZ é **compacta e fraca** (poucas
variáveis, limitante inferior distante do ótimo); MCF é **compacta e
forte** (limitante inferior próximo do ótimo, mas um número de variáveis
que explode com $n$). É esse compromisso — tamanho do modelo *versus*
qualidade do limitante — que a tarefa pede para observar na prática, não
só descrever em teoria.

## Passo 2 — Escrever os modelos em AMPL

Transcrevam as duas formulações para dois arquivos separados: `tsp_mtz.mod`
e `tsp_mcf.mod`.

## Passo 3 — Ler as instâncias

As instâncias desta tarefa vêm da coleção *National TSP* da University of
Waterloo, no formato padrão da TSPLIB:

- **Djibouti** (`dj38`) — 38 cidades;
- **Uruguai** (`uy734`) — 734 cidades;
- **Luxemburgo** (`lu980`) — 980 cidades;
- **Omã** (`mu1979`) — 1.979 cidades.

Os quatro arquivos `.tsp` estão disponíveis em
[https://www.math.uwaterloo.ca/tsp/world/countries.html](https://www.math.uwaterloo.ca/tsp/world/countries.html)
(a página também traz, para cada instância, um link para a rota ótima
conhecida — útil para conferir seus resultados). Um arquivo `.tsp` segue
o formato:

```
NAME: dj38
COMMENT: 38 locations in Djibouti
TYPE: TSP
DIMENSION: 38
EDGE_WEIGHT_TYPE: EUC_2D
NODE_COORD_SECTION
1 11003.611100 42102.500000
2 11108.611100 42373.888900
...
EOF
```

Ou seja: um cabeçalho com metadados (o que importa aqui é `DIMENSION`, o
número de cidades $n$) seguido da seção `NODE_COORD_SECTION`, com uma
linha por cidade no formato `<índice> <x> <y>`.

Escrevam uma função `ler_instancia(arquivo)` que:

- lê o cabeçalho e a lista de coordenadas de um arquivo `.tsp`;
- calcula a matriz de distâncias $d_{ij}$ a partir das coordenadas,
  usando a distância euclidiana **arredondada ao inteiro mais próximo**
  (é assim que o tipo `EUC_2D` da TSPLIB define $d_{ij}$, e é o valor
  usado para calcular a rota ótima conhecida — arredondar é necessário
  para que seus resultados sejam comparáveis a ela);
- devolve $n$ e a matriz $d$, prontos para uso nos dois modelos.

Testem a função primeiro com a instância de Djibouti (a menor) antes de
passar para as demais.

## Passo 4 — Escrever o script de resolução

**4.1. MTZ nas quatro instâncias.** Escrevam um script que, usando
`amplpy`, para **cada uma das quatro instâncias**:

- lê a instância com a função do Passo 3;
- carrega `tsp_mtz.mod`, injeta $n$ e $d$;
- resolve com o HiGHS, com **tempo limite de 300 segundos (5 minutos)** e
  **1 thread**;
- registra o LB, o UB (valor da função objetivo), o GAP, o tempo de
  execução e o status (`ampl.solve_result`).

Nas instâncias maiores é esperado que o solver **não feche** a
otimalidade dentro do tempo limite — registrem o GAP e o status (`limit`)
normalmente; isso faz parte do que a tarefa pede para observar.

**4.2. MCF — só na instância de Djibouti.** Por causa do crescimento
$O(n^3)$ do número de variáveis de fluxo, a formulação MCF só é tratável,
nesta tarefa, para a **menor** instância: resolvam Djibouti (`dj38`) com
`tsp_mcf.mod`, mesmo solver (HiGHS), **mesmo tempo limite de 300 segundos**
e **1 thread**, para que a comparação com a MTZ seja justa (mesmas
condições de execução, só muda o modelo). **Não é esperado** que vocês
rodem a MCF em Uruguai, Luxemburgo ou Omã — se quiserem tentar como
exercício extra, tudo bem, mas isso não é parte da entrega obrigatória
(nem é necessariamente factível: já para Uruguai, $n^3$ passa de 390
milhões de variáveis de fluxo).

## Passo 5 — Tabelas de resultados

**Tabela A — MTZ nas quatro instâncias**, em ordem crescente de tamanho:

| Instância | Cidades ($n$) | LB | UB | GAP | Tempo (s) | Status |
|---|---|---|---|---|---|---|
| Djibouti (dj38) | 38 | ... | ... | ... | ... | ... |
| Uruguai (uy734) | 734 | ... | ... | ... | ... | ... |
| Luxemburgo (lu980) | 980 | ... | ... | ... | ... | ... |
| Omã (mu1979) | 1.979 | ... | ... | ... | ... | ... |

**Tabela B — MTZ x MCF em Djibouti** (mesma instância, mesmo tempo
limite):

| Formulação | Variáveis (aprox.) | LB | UB | GAP | Tempo (s) | Status |
|---|---|---|---|---|---|---|
| MTZ | ... | ... | ... | ... | ... | ... |
| MCF | ... | ... | ... | ... | ... | ... |

## Passo 6 — Análise

Em dois ou três parágrafos, comentem:

- como o GAP da MTZ evoluiu da menor para a maior instância, dentro do
  mesmo tempo limite — isso é coerente com o que se discutiu em aula
  sobre a força do seu limitante inferior?
- na Tabela B, o LB da MCF ficou mais próximo do UB do que o LB da MTZ,
  para a mesma instância e o mesmo tempo? Isso é coerente com a MCF ser
  uma formulação mais forte?
- para as execuções em que o solver encontrou a rota ótima (GAP = 0),
  compare o UB obtido com a rota ótima conhecida publicada na página da
  TSPLIB (lembrando de usar a distância `EUC_2D` arredondada) — os
  valores coincidem?
- o compromisso entre as duas formulações (compacta e fraca *versus*
  compacta e forte, mas com muito mais variáveis) apareceu nos seus
  resultados? Em que situação prática vocês optariam por uma ou por
  outra?

## Entrega

- `tsp_mtz.mod` e `tsp_mcf.mod`;
- o script Python (função `ler_instancia` + execução da MTZ nas quatro
  instâncias e da MCF em Djibouti);
- as Tabelas A e B preenchidas;
- a análise do Passo 6.
