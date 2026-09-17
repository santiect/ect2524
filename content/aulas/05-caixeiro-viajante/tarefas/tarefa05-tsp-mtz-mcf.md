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

A conservação de fluxo do produto $k$ é feita em três blocos, um para
cada papel que uma cidade pode ter em relação a esse produto: a origem
(cidade 1), o destino (cidade $k$) e todas as demais.

**Origem.** A cidade 1 emite uma unidade do produto $k$ — sua saída total
supera a entrada total em exatamente 1:

$$
\sum_{j=1,j\neq 1}^{n} f_{1j}^{k} - \sum_{j=1,j\neq 1}^{n} f_{j1}^{k} = 1,
~\forall~k = 2,\ldots,n
$$

**Destino.** A cidade $k$ absorve essa unidade — sua entrada total supera
a saída total em exatamente 1 (equivalentemente, saída menos entrada
$=-1$):

$$
\sum_{j=1,j\neq k}^{n} f_{kj}^{k} - \sum_{j=1,j\neq k}^{n} f_{jk}^{k} = -1,
~\forall~k = 2,\ldots,n
$$

**Demais cidades.** Toda cidade $i$ que não seja a origem nem o destino
do produto $k$ apenas repassa o que recebe — sua saída e sua entrada do
produto $k$ são iguais:

$$
\sum_{j=1,j\neq i}^{n} f_{ij}^{k} - \sum_{j=1,j\neq i}^{n} f_{ji}^{k} = 0,
~\forall~i = 2,\ldots,n;~i \neq k;~\forall~k = 2,\ldots,n
$$

E, para cada produto $k = 2,\ldots,n$, o acoplamento do fluxo com a rota:

$$
f_{ij}^{k} \leq x_{ij},~\forall~i,j = 1,\ldots,n;~i\neq j
$$

$$
f_{ij}^{k} \geq 0,~\forall~i,j = 1,\ldots,n;~i \neq j
$$

As três primeiras famílias, juntas, são a **conservação de fluxo**: o que
sai da cidade 1 é 1 unidade a mais do que entra; o que entra na cidade $k$
é 1 unidade a mais do que sai; em qualquer outra cidade, entra e sai a
mesma quantidade. A última família **acopla** o fluxo à rota: só pode
haver fluxo de um produto num arco que a rota realmente usa ($x_{ij}=1$);
se $x_{ij}=0$, a restrição força $f_{ij}^{k}=0$ para todo $k$.

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

As instâncias desta tarefa vêm da TSPLIB clássica (Reinelt), mantida pela
Universidade de Heidelberg, escolhidas em ordem crescente de tamanho para
que a diferença entre uma e a próxima seja bem perceptível:

| Instância | Cidades ($n$) | Ótimo conhecido |
|---|---|---|
| `berlin52` | 52 | 7.542 |
| `kroA200` | 200 | 29.368 |
| `pr439` | 439 | 107.217 |
| `pr1002` | 1.002 | 259.045 |

Os ótimos acima são os publicados pela própria TSPLIB (todas as quatro
instâncias já estão resolvidas até a otimalidade comprovada) — usem-nos
no Passo 6 para conferir seus resultados, sem precisar visitar outra
página.

Os quatro arquivos `.tsp` (compactados em `.gz`) estão disponíveis no
índice da TSPLIB, em
[http://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp/tspindex.html](http://comopt.ifi.uni-heidelberg.de/software/TSPLIB95/tsp/tspindex.html).
Um arquivo `.tsp` segue o formato (exemplo com `berlin52`):

```
NAME: berlin52
COMMENT: 52 locations in Berlin (Groetschel)
TYPE: TSP
DIMENSION: 52
EDGE_WEIGHT_TYPE: EUC_2D
NODE_COORD_SECTION
1 565.0 575.0
2 25.0 185.0
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
  usado para calcular o ótimo publicado — arredondar é necessário para
  que seus resultados sejam comparáveis a ele);
- devolve $n$ e a matriz $d$, prontos para uso nos dois modelos.

Testem a função primeiro com `berlin52` (a menor) antes de passar para as
demais.

## Passo 4 — Escrever o script de resolução

Escrevam um script que, usando `amplpy`, tente resolver **as duas
formulações em cada uma das quatro instâncias** (8 execuções no total):
para cada combinação instância/formulação, ler a instância com a função
do Passo 3, carregar o `.mod` correspondente, injetar $n$ e $d$, e
resolver com o HiGHS, **1 thread** e **tempo limite de 600 segundos (10
minutos)** passado como opção do solver.

Esse tempo limite vale para o **solver**, não para a geração do modelo
em si — a MCF tem $O(n^3)$ variáveis de fluxo: cerca de 140 mil em
`berlin52`, 8 milhões em `kroA200`, 85 milhões em `pr439` e passa de 1
bilhão em `pr1002`. Nas instâncias maiores, montar esse modelo pode ser
lento ou consumir toda a memória disponível **antes mesmo** de o solver
ser chamado. Isso é esperado, e faz parte do que a tarefa pede para
observar: tentem rodar as 8 combinações e constatem, na prática, até
onde a MCF é tratável.

**O que fazer se travar ou faltar memória.** Se a geração do modelo ou a
resolução não terminar em um tempo razoável, ou se o processo for
encerrado por falta de memória, interrompam a execução daquela
combinação, anotem o que aconteceu (nome da instância, formulação, e o
sintoma: travou, ficou consumindo memória sem terminar, foi encerrado
pelo sistema, etc.) e registrem essa combinação na tabela de resultados
como **impraticável**, em vez de LB/UB/GAP. Não é preciso — nem é
seguro — insistir em forçar a execução até o fim nessas situações.

Nas combinações que terminam mas não fecham a otimalidade dentro dos 10
minutos, registrem o GAP e o status (`limit`) normalmente.

## Passo 5 — Tabela de resultados

Uma linha por instância **e** por formulação (8 linhas), em ordem
crescente de tamanho da instância:

| Instância | Cidades ($n$) | Formulação | LB | UB | GAP | Tempo (s) | Status |
|---|---|---|---|---|---|---|---|
| berlin52 | 52 | MTZ | ... | ... | ... | ... | ... |
| berlin52 | 52 | MCF | ... | ... | ... | ... | ... |
| kroA200 | 200 | MTZ | ... | ... | ... | ... | ... |
| kroA200 | 200 | MCF | ... | ... | ... | ... | ... |
| pr439 | 439 | MTZ | ... | ... | ... | ... | ... |
| pr439 | 439 | MCF | ... | ... | ... | ... | ... |
| pr1002 | 1.002 | MTZ | ... | ... | ... | ... | ... |
| pr1002 | 1.002 | MCF | ... | ... | ... | ... | ... |

Para as combinações marcadas como impraticáveis, preencham a coluna
`Status` com **impraticável** e descrevam o sintoma observado (travou,
sem memória, etc.) logo abaixo da tabela, em vez de tentar preencher
LB/UB/GAP/Tempo.

## Passo 6 — Análise

Em dois ou três parágrafos, comentem:

- como o GAP da MTZ evoluiu da menor para a maior instância, dentro do
  mesmo tempo limite — isso é coerente com o que se discutiu em aula
  sobre a força do seu limitante inferior?
- em que instâncias a MCF se tornou impraticável, e em quê isso se
  manifestou (tempo de geração, memória, ou ambos)? Isso é coerente com
  o crescimento $O(n^3)$ do número de variáveis de fluxo?
- nas instâncias em que **ambas** as formulações terminaram, o LB da MCF
  ficou mais próximo do UB do que o LB da MTZ, no mesmo tempo? Isso é
  coerente com a MCF ser uma formulação mais forte?
- para as execuções em que o solver encontrou a rota ótima (GAP = 0),
  compare o UB obtido com o ótimo conhecido da tabela do Passo 3
  (lembrando de usar a distância `EUC_2D` arredondada) — os valores
  coincidem?
- o compromisso entre as duas formulações (compacta e fraca *versus*
  compacta e forte, mas com muito mais variáveis) apareceu nos seus
  resultados? Em que situação prática vocês optariam por uma ou por
  outra?

## Entrega

- `tsp_mtz.mod` e `tsp_mcf.mod`;
- o script Python (função `ler_instancia` + laço que tenta as 8
  combinações de instância e formulação);
- a tabela de resultados preenchida (incluindo as combinações marcadas
  como impraticáveis, com o sintoma observado);
- a análise do Passo 6.
