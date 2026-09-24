## Tarefa avaliativa — Heurísticas para o TSP: vizinho mais próximo e construção aleatória

## Instruções de entrega

Estas instruções valem para **todas as tarefas ao longo do semestre**, não
só esta:

- O aluno (ou, em tarefas de equipe, um dos integrantes em nome do grupo)
  deve criar um **repositório privado no GitHub** e adicionar o professor
  como colaborador, usando o e-mail **everton.santi@ufrn.br**.
- Cada tarefa a ser entregue corresponde a uma **pasta dentro desse
  repositório**.

**Esta tarefa em particular:** usem o **mesmo repositório já criado para a
tarefa da Aula 5** (não criem um repositório novo) — basta acrescentar uma
**nova pasta**, identificada com o nome desta tarefa (ex.:
`tarefa06-heuristicas-tsp`), mantendo a pasta da tarefa da Aula 5 intacta.

**Prazo desta tarefa (Aula 6):** até o dia **02/10**, às **8h50**.

**Caráter avaliativo.** Esta tarefa vale **25% da nota da Unidade 1** da
disciplina. Pode ser realizada em equipes de até 3 pessoas — o mesmo grupo
da tarefa da Aula 5, se preferirem manter a mesma composição.

## O problema

A tarefa da Aula 5 resolveu o TSP por formulação exata (MTZ e MCF) nas
quatro instâncias da TSPLIB clássica, e uma delas — a MCF — se tornou
impraticável já nas instâncias maiores, pelo crescimento cúbico do número
de variáveis de fluxo. Essa é uma limitação inerente à abordagem exata em
problemas NP-difíceis como o TSP, discutida em aula: não existe garantia
de que um solver termine em tempo viável à medida que a instância cresce.

Uma alternativa é abrir mão da garantia de otimalidade em troca de
velocidade: uma **heurística** constrói uma solução viável rapidamente,
sem procurar comprovar que ela é ótima. Esta tarefa pede a implementação
de duas heurísticas construtivas para o TSP — a do vizinho mais próximo e
a de construção aleatória — e a comparação dos resultados obtidos com os
já calculados pelo grupo na tarefa da Aula 5.

## Passo 1 — Retomando as instâncias e os ótimos conhecidos

As instâncias são as mesmas quatro já usadas na tarefa da Aula 5, com os
mesmos ótimos conhecidos publicados pela TSPLIB:

| Instância | Cidades ($n$) | Ótimo conhecido |
|---|---|---|
| `berlin52` | 52 | 7.542 |
| `kroA100` | 100 | 21.282 |
| `ch150` | 150 | 6.528 |
| `kroA200` | 200 | 29.368 |

A tarefa não exige nenhuma linguagem específica — usem a linguagem que o
grupo preferir (Python, C, C++, Java, ou outra). Se mantiverem a mesma
linguagem da tarefa da Aula 5, reaproveitem a rotina `ler_instancia`
escrita lá, que lê um arquivo `.tsp` e devolve $n$ e a matriz de
distâncias $d$ (distância euclidiana `EUC_2D`, arredondada ao inteiro
mais próximo); se trocarem de linguagem, reimplementem a mesma lógica.

## Passo 2 — Heurística do vizinho mais próximo

A heurística do vizinho mais próximo constrói uma rota da seguinte forma:
partindo de uma cidade de origem, visita sempre a cidade não visitada mais
próxima da cidade atual; repete esse passo até que todas as cidades
tenham sido visitadas, e então retorna à cidade de origem. Ela usa a
informação de distância a cada passo, mas não garante que a rota gerada
seja ótima — uma escolha gulosa no início pode forçar um deslocamento
longo mais tarde na rota.

Implementem duas variantes (os nomes abaixo são só uma sugestão — adaptem
à convenção da linguagem escolhida):

- `vizinho_mais_proximo(d, origem)` — roda a heurística a partir de uma
  única cidade de origem (a cidade 1, mesma convenção de origem já usada
  nas formulações MTZ e MCF da tarefa anterior);
- `vizinho_mais_proximo_multistart(d)` — roda a heurística a partir de
  cada uma das $n$ cidades possíveis e devolve a melhor rota encontrada
  entre todas as partidas.

Ambas devem devolver a rota encontrada, seu custo e o tempo de execução.

## Passo 3 — Heurística de construção aleatória

A construção aleatória gera uma permutação aleatória das cidades como
rota, sem usar nenhuma informação sobre as distâncias entre elas. A
qualidade da solução obtida é uma questão de sorte, por isso o resultado
de uma única execução não é representativo: é preciso rodar a heurística
várias vezes e reportar estatísticas.

Implementem uma função (ex.: `construcao_aleatoria(d, seed)`) que gera
uma rota aleatória e devolve seu custo e o tempo de execução. Para cada uma das
quatro instâncias, rodem essa função **30 vezes**, com seeds diferentes, e
calculem:

- o custo médio das 30 execuções;
- o desvio-padrão do custo das 30 execuções;
- o custo da melhor execução (menor custo entre as 30);
- o tempo total das 30 execuções e o tempo médio por execução.

## Passo 4 — Tabela de resultados

Diferente da tabela da Aula 5 (uma linha por instância *e* por
formulação), aqui a comparação é direta contra o **ótimo conhecido** da
tabela do Passo 1 — não é preciso reproduzir os resultados de MTZ/MCF da
tarefa anterior nesta tabela; eles já estão registrados no relatório
daquela tarefa e entram só na análise do Passo 6.

Uma única tabela, com **uma linha por instância** (4 linhas), organizada
em três blocos de colunas — um por heurística. Nos cabeçalhos abaixo,
`NN` abrevia **vizinho mais próximo** (do inglês *nearest neighbor*, a
heurística do Passo 2) — usada aqui só para caber nos cabeçalhos da
tabela:

| Instância | Cidades (n) | Ótimo conhecido | NN cidade 1 — Custo | NN cidade 1 — GAP | NN cidade 1 — Tempo (s) | NN multi-start — Custo | NN multi-start — GAP | NN multi-start — Tempo (s) | Aleatória — Custo médio | Aleatória — Desvio padrão | Aleatória — Melhor custo | Aleatória — GAP (melhor) | Aleatória — Tempo total (s) | Aleatória — Tempo médio (ms) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| berlin52 | 52 | 7.542 | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| kroA100 | 100 | 21.282 | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| ch150 | 150 | 6.528 | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| kroA200 | 200 | 29.368 | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

Onde: `GAP` é sempre calculado em relação ao ótimo conhecido da mesma
linha — $\text{GAP} = (\text{Custo} - \text{Ótimo}) / \text{Ótimo}$; nos
blocos `NN cidade 1` e `NN multi-start`, `Custo` e `Tempo (s)` vêm de uma
única execução (determinística); no bloco `Aleatória`, `Custo médio` e
`Desvio padrão` vêm das 30 execuções, `Melhor custo` e o `GAP (melhor)`
correspondente vêm da melhor entre elas, e `Tempo total (s)`/`Tempo médio
(ms)` cobrem as 30 execuções.

## Passo 5 — Ambiente computacional

Diferente das tarefas anteriores, esta pede que o grupo descreva, em
texto corrido, as condições em que os resultados foram obtidos — o tempo
de execução das heurísticas é, aqui, o próprio objeto de comparação, não
apenas um efeito colateral do solver, então precisa ser interpretável por
quem lê o relatório sem acesso à máquina usada. Descrevam:

- o processador usado (modelo e número de núcleos);
- a memória RAM disponível;
- o sistema operacional;
- a linguagem de programação escolhida pelo grupo e sua versão, e as
  bibliotecas ou tecnologias usadas, com versão (ex.: NumPy em Python,
  STL em C++, se for o caso);
- qual **solver** foi usado nas execuções de MTZ e MCF da tarefa anterior
  (nome e versão) — informação já levantada lá, mas que deve constar aqui
  também, para que o relatório desta tarefa fique autocontido;
- quantas **threads** foram usadas em cada tipo de execução: nas do
  solver (a tarefa da Aula 5 já exigia 1 thread — confirmem que isso foi
  respeitado) e nas das duas heurísticas desta tarefa (também devem ser
  execuções de 1 thread, sequenciais, já que não há paralelismo pedido
  aqui). Isso deixa as condições de tempo comparáveis entre o solver e as
  heurísticas.

## Passo 6 — Análise

Em três ou quatro parágrafos, comentem:

- como o UB das heurísticas se compara ao ótimo conhecido e ao UB obtido
  pelo solver (MTZ e MCF) na tarefa anterior — as heurísticas chegam perto
  da qualidade do solver, ou o GAP é bem maior?
- a diferença entre o vizinho mais próximo partindo só da cidade 1 e a
  variante multi-start: o custo extra de rodar a heurística $n$ vezes
  trouxe uma melhora de rota que compense, na opinião do grupo?
- o que o desvio-padrão da heurística aleatória revela sobre o quanto a
  qualidade da solução depende mesmo de sorte, e como isso se compara à
  distância entre o custo médio aleatório e o ótimo conhecido;
- a ordem de grandeza do tempo de execução das heurísticas frente ao
  tempo gasto pelo solver na tarefa anterior — o que essa diferença de
  tempo diz sobre quando vale a pena usar cada abordagem na prática.

## Entrega

Na pasta desta tarefa dentro do repositório (ver "Instruções de entrega"
no início deste enunciado), incluam dois grupos de arquivos:

**Código**

- o código-fonte, na linguagem escolhida pelo grupo, com as rotinas
  equivalentes a `vizinho_mais_proximo`, `vizinho_mais_proximo_multistart`
  e `construcao_aleatoria`, reaproveitando (ou reimplementando, se a
  linguagem mudou) a lógica de `ler_instancia` da tarefa da Aula 5;
- o código que roda as 30 execuções da heurística aleatória por instância
  e calcula as estatísticas do bloco `Aleatória` da tabela do Passo 4.

**Relatório**

Um arquivo Markdown (ex.: `relatorio.md`) na raiz da pasta desta tarefa,
reunindo:

- a tabela de resultados do Passo 4 (4 linhas, uma por instância, com os
  três blocos de colunas);
- a descrição do ambiente computacional do Passo 5;
- a análise do Passo 6.
