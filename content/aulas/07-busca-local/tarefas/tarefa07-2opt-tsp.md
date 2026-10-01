## Tarefa avaliativa — Busca local 2-opt para o TSP

## Instruções de entrega

Estas instruções valem para **todas as tarefas ao longo do semestre**, não
só esta:

- O aluno (ou, em tarefas de equipe, um dos integrantes em nome do grupo)
  deve criar um **repositório privado no GitHub** e adicionar o professor
  como colaborador, usando o e-mail **everton.santi@ufrn.br**.
- Cada tarefa a ser entregue corresponde a uma **pasta dentro desse
  repositório**.

**Esta tarefa em particular:** usem o **mesmo repositório já criado para as
tarefas das Aulas 5 e 6** (não criem um repositório novo) — basta acrescentar
uma **nova pasta**, identificada com o nome desta tarefa (ex.:
`tarefa07-2opt-tsp`), mantendo as pastas anteriores intactas.

**Prazo desta tarefa (Aula 7):** até o dia **09/10**, às **8h50**.

**Caráter avaliativo.** Esta tarefa vale **25% da nota da Unidade 1** da
disciplina. Pode ser realizada em equipes de até 3 pessoas — o mesmo grupo
das tarefas anteriores, se preferirem manter a mesma composição.

## O problema

A tarefa da Aula 6 implementou três heurísticas construtivas para o TSP: o
vizinho mais próximo partindo da cidade 1, o vizinho mais próximo
multi-start e a construção aleatória. Todas produzem uma rota viável com
rapidez, mas sem nenhum esforço de melhoria: a rota obtida é a rota
entregue, e o GAP em relação ao ótimo conhecido pode ser grande.

Esta tarefa acrescenta uma etapa de **busca local**. A partir da rota
produzida por uma heurística construtiva, aplica-se repetidamente a
vizinhança **2-opt**, que remove duas arestas da rota e as reconecta
invertendo o trecho entre elas (uma subrota de $k$ cidades consecutivas). O procedimento termina quando nenhum
movimento 2-opt reduz o custo da rota, isto é, quando se atinge um **ótimo
local** em relação a essa vizinhança. O objetivo é medir quanto cada
solução inicial melhora e a que distância do ótimo conhecido ela fica antes
e depois da busca local.

## Passo 1 — Retomando as instâncias, os ótimos e as heurísticas

As instâncias e os ótimos conhecidos são os mesmos das tarefas anteriores:

| Instância | Cidades ($n$) | Ótimo conhecido |
|---|---|---|
| `berlin52` | 52 | 7.542 |
| `kroA100` | 100 | 21.282 |
| `ch150` | 150 | 6.528 |
| `kroA200` | 200 | 29.368 |

Reaproveitem, da tarefa da Aula 6, a rotina de leitura de instâncias (matriz
de distâncias `EUC_2D` arredondada) e as três heurísticas construtivas:
vizinho mais próximo partindo da cidade 1, vizinho mais próximo multi-start
(melhor rota entre as $n$ partidas) e construção aleatória. Se a linguagem
for mantida, nada precisa ser reescrito; se for trocada, reimplementem a
mesma lógica.

## Passo 2 — Vizinhança 2-opt e busca local

Uma rota é uma permutação $(r_0, r_1, \ldots, r_{n-1})$ das cidades, com
retorno à cidade $r_0$. Dadas duas arestas da rota, $(a,b)$ e $(c,d)$, com
$b$ seguindo $a$ e $d$ seguindo $c$ na rota, o movimento 2-opt as substitui
por $(a,c)$ e $(b,d)$, o que equivale a **inverter** o trecho da rota que
vai de $b$ até $c$. A variação de custo do movimento é

$$
\Delta = d_{ac} + d_{bd} - d_{ab} - d_{cd}
$$

e o movimento melhora a rota quando $\Delta < 0$. Cada rota possui
$n(n-3)/2$ vizinhos 2-opt.

Implementem uma função de busca local (ex.: `busca_local_2opt(d, rota)`)
que recebe a matriz de distâncias e uma rota inicial e devolve a rota
final, seu custo, o número de movimentos aplicados e o tempo de execução.
Requisitos:

- a variação $\Delta$ deve ser calculada em tempo constante, a partir das
  quatro distâncias envolvidas; **não** é permitido recalcular o custo
  total da rota para avaliar cada vizinho;
- o custo final deve ser obtido somando os $\Delta$ dos movimentos aplicados
  ao custo inicial, e o grupo deve conferir, ao final, que ele coincide com o
  custo recalculado a partir da rota devolvida;
- a busca termina quando nenhum vizinho 2-opt reduz o custo (ótimo local),
  seguindo o procedimento descrito a seguir.

Equivalentemente, um movimento 2-opt inverte uma **subrota** de $k$
cidades consecutivas da rota, o **tamanho** $k$ do trecho invertido (a
inversão de $k=2$ cidades troca duas cidades vizinhas; $k=3$, $k=4$ etc.
invertem trechos maiores).

**Procedimento (primeira aprimorante com reinício).** Para cada tamanho
$k = 2, 3, \ldots, n-2$, em ordem crescente, examinam-se todas as
subrotas possíveis de tamanho $k$ e calcula-se o $\Delta$ da inversão de
cada uma. Ao encontrar o primeiro movimento com $\Delta < 0$, ele é
aplicado e a busca **reinicia** a partir de $k = 2$. A busca termina quando
todos os tamanhos $k$ são examinados sem que nenhum movimento melhore a
rota; a rota obtida nesse ponto é a solução final.

## Passo 3 — Aplicação às três heurísticas

Para cada uma das quatro instâncias, apliquem a busca local 2-opt à solução
inicial de cada heurística construtiva:

- **vizinho mais próximo (cidade 1):** a rota única produzida na tarefa da
  Aula 6;
- **vizinho mais próximo multi-start:** a melhor rota entre as $n$ partidas
  (apenas essa rota recebe a busca local);
- **construção aleatória:** cada uma das 30 rotas aleatórias (mesmos seeds
  da tarefa da Aula 6) recebe a busca local; reportem custo médio,
  desvio-padrão e melhor custo, tanto antes quanto depois do 2-opt.

## Passo 4 — Tabela de resultados

Uma única tabela, com uma linha por instância e por heurística (12 linhas),
em ordem crescente de tamanho da instância:

| Instância | $n$ | Ótimo | Heurística | Custo inicial | GAP inicial | Custo após 2-opt | GAP após 2-opt | Melhoria (%) | Movimentos | Tempo do 2-opt (s) |
|---|---|---|---|---|---|---|---|---|---|---|
| berlin52 | 52 | 7.542 | NN cidade 1 | ... | ... | ... | ... | ... | ... | ... |
| berlin52 | 52 | 7.542 | NN multi-start | ... | ... | ... | ... | ... | ... | ... |
| berlin52 | 52 | 7.542 | Aleatória | ... | ... | ... | ... | ... | ... | ... |
| kroA100 | 100 | 21.282 | ... | ... | ... | ... | ... | ... | ... | ... |
| ch150 | 150 | 6.528 | ... | ... | ... | ... | ... | ... | ... | ... |
| kroA200 | 200 | 29.368 | ... | ... | ... | ... | ... | ... | ... | ... |

Onde, para cada linha:

- $\text{GAP} = (\text{Custo} - \text{Ótimo}) / \text{Ótimo}$, sempre em relação ao
  ótimo conhecido da mesma instância; `GAP inicial` usa o custo antes do
  2-opt e `GAP após 2-opt` usa o custo depois;
- $\text{Melhoria} = (\text{Custo inicial} - \text{Custo após 2-opt}) /
  \text{Custo inicial}$, em percentual;
- `Movimentos` e `Tempo do 2-opt` referem-se apenas à busca local, sem
  incluir o tempo da heurística construtiva;
- para a heurística **Aleatória**, as colunas de custo, GAP, melhoria,
  movimentos e tempo trazem a **média das 30 execuções**. Abaixo da tabela,
  acrescentem uma tabela auxiliar com o desvio-padrão e o melhor custo
  (antes e depois do 2-opt) por instância.

## Passo 5 — Ambiente computacional

Como na tarefa da Aula 6, descrevam em texto corrido as condições em que os
resultados foram obtidos: processador (modelo e número de núcleos), memória
RAM, sistema operacional, linguagem de programação e sua versão, bibliotecas
ou tecnologias usadas (com versão) e número de threads. Todas as execuções
devem ser sequenciais, com 1 thread.

## Passo 6 — Análise

Em três ou quatro parágrafos, comentem:

- quanto a busca local 2-opt melhorou a solução de cada heurística
  construtiva, em termos de GAP e de melhoria percentual, e qual das três
  foi mais beneficiada;
- se a diferença de qualidade entre as soluções iniciais se mantém, diminui
  ou desaparece depois do 2-opt — isto é, se a escolha da heurística
  construtiva ainda importa quando há busca local;
- por que a solução após o 2-opt, mesmo sendo um ótimo local, ainda
  permanece a um GAP não nulo do ótimo conhecido, relacionando a resposta
  ao conceito de ótimo local em relação a uma vizinhança;
- o custo da busca local (número de movimentos e tempo) frente ao ganho em
  qualidade, e como esse tempo cresce com o tamanho da instância.

## Entrega

Na pasta desta tarefa dentro do repositório (ver "Instruções de entrega"
no início deste enunciado), incluam dois grupos de arquivos:

**Código**

- o código-fonte, na linguagem escolhida pelo grupo, com a busca local
  2-opt (incluindo a verificação do custo final) e o código que a aplica às
  três heurísticas construtivas e gera os resultados da tabela do Passo 4;
- as rotinas da tarefa da Aula 6 (leitura de instâncias e heurísticas
  construtivas), reaproveitadas ou copiadas para a nova pasta, de modo que
  o código desta tarefa possa ser executado de forma autocontida.

**Relatório**

Um arquivo Markdown (ex.: `relatorio.md`) na raiz da pasta desta tarefa,
reunindo:

- a tabela de resultados do Passo 4 e a tabela auxiliar da heurística
  aleatória;
- a descrição do ambiente computacional do Passo 5;
- a análise do Passo 6.
