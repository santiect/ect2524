## Tarefa 3 — Localização de Facilidades

Nesta tarefa vocês vão repetir, para um **problema diferente**, exatamente
os passos que fizemos em aula com o Problema de Transbordo: modelar,
escrever o modelo em AMPL, escrever uma função Python que lê os dados de um
arquivo e um script que, usando o `amplpy`, resolve o modelo — só que agora
para **três instâncias** fornecidas.

## O pedido

Imaginem que vocês formam uma pequena equipe de consultoria em otimização,
e receberam a seguinte encomenda:

> "Trabalho na área de logística de aplicação de um **exame nacional**.
> Todo ano precisamos escolher, em cada cidade, **quais locais** vão
> sediar a prova. Temos uma lista de locais possíveis (escolas,
> faculdades, centros de eventos), e cada um comporta um número máximo de
> candidatos — é a **capacidade** do local. Não podemos usar todos os
> locais: o número de **equipes de aplicação** que conseguimos montar
> limita quantos locais podem funcionar no dia. Sabemos onde mora cada
> candidato e conseguimos estimar a **distância** de cada candidato até
> cada local possível.
>
> Preciso decidir **quais locais abrir** e **em qual local cada candidato
> vai fazer a prova**, respeitando a capacidade de cada local e o limite
> de equipes, de forma que os candidatos, no geral, se desloquem o
> **menos possível**. Vocês conseguem me entregar uma ferramenta que
> leia os dados de um local e me devolva essa decisão?"

## O que fazer

1. **Modelem o problema.** Apresentem, no mesmo estilo usado em aula:
   - os **parâmetros**: número de candidatos, número de locais, número de
     locais que podem ser abertos ($p$), capacidade de cada local, e a
     distância $d_{ij}$ do candidato $i$ ao local $j$;
   - as **variáveis de decisão**: uma binária indicando se o local $j$ é
     aberto, e uma binária indicando se o candidato $i$ é alocado ao
     local $j$;
   - as **restrições**: abrir exatamente $p$ locais; a soma dos
     candidatos alocados a um local não passa da capacidade dele; cada
     candidato é alocado a **exatamente um** local, e só a um local
     **aberto**;
   - a **função objetivo** (ver item 2).

   Expliquem em uma linha o papel de cada restrição.

2. **Escolham e justifiquem o objetivo.** Há duas formas clássicas de
   medir "os candidatos se deslocam pouco":
   - **p-mediana**: minimizar a **soma** de todas as distâncias
     percorridas, $\sum_{i}\sum_{j} d_{ij}\,x_{ij}$;
   - **p-centro** (minimax): minimizar a **maior** distância que algum
     candidato precisa percorrer, $\min z$ com $z \ge d_{ij}\,x_{ij}$
     para todo $i,j$.

   Escolham uma das duas, **justifiquem** a escolha no contexto do
   problema e comentem como a solução mudaria com a outra.

3. **Escrevam o modelo em AMPL** (`facilidades.mod`), com a formulação do
   item 1 e o objetivo do item 2.

4. **Escrevam a função `ler_dados(arquivo)`** em Python, que abre um dos
   arquivos de instância e devolve um dicionário com os dados prontos
   para uso (número de candidatos, de locais, $p$, o vetor de capacidades
   e a matriz de distâncias) — mesmo papel da função que usamos em aula
   para o transbordo.

5. **Escrevam o script Python com `amplpy`** que, para **cada uma das três
   instâncias** (`instancia_facilidades1.txt`, `instancia_facilidades2.txt`
   e `instancia_facilidades3.txt`):
   - lê os dados com a função do item 4;
   - carrega o modelo e injeta os parâmetros;
   - resolve com o HiGHS, definindo um **tempo limite** (ex.: 60 ou 120
     segundos);
   - imprime: os locais abertos, o valor da função objetivo, o limitante
     inferior (LB), o GAP, o tempo de execução e o status
     (`ampl.solve_result`).

6. **Montem uma tabela de resultados** com uma linha por instância:

   | Instância | Tempo limite | Solver | Objetivo (UB) | LB | GAP | Tempo | Status |
   |---|---|---|---|---|---|---|---|
   | 1 | ... | HiGHS | ... | ... | ... | ... | ... |
   | 2 | ... | ... | ... | ... | ... | ... | ... |
   | 3 | ... | ... | ... | ... | ... | ... | ... |

   e escrevam um parágrafo curto de análise: as três foram resolvidas na
   otimalidade (GAP zero)? A instância 3, bem maior, foi tratável dentro
   do tempo limite?

## Formato dos arquivos de dados

Baixem as três instâncias:

- [instancia_facilidades1.txt](dados/instancia_facilidades1.txt) — 10 candidatos, 5 locais, $p = 3$
- [instancia_facilidades2.txt](dados/instancia_facilidades2.txt) — 100 candidatos, 10 locais, $p = 4$
- [instancia_facilidades3.txt](dados/instancia_facilidades3.txt) — 5000 candidatos, 50 locais, $p = 30$

Cada arquivo segue o formato:

```
<n_candidatos> <n_locais> <n_locais_a_abrir>
<capacidade_local_1> ... <capacidade_local_n>
<dist_candidato_1_local_1> ... <dist_candidato_1_local_n>
...
<dist_candidato_m_local_1> ... <dist_candidato_m_local_n>
```

Ou seja: a primeira linha tem três inteiros; a segunda tem as capacidades
dos locais; e as `n_candidatos` linhas seguintes são a matriz de
distâncias (uma linha por candidato, uma coluna por local).

**Atenção:** o separador não é o mesmo nos três arquivos — a instância 1
usa **espaço** e as instâncias 2 e 3 usam **tabulação**. A função
`ler_dados` precisa tratar os dois casos (dica: normalizar a linha antes
de dividir).

## Entrega

- A formulação (parâmetros, variáveis, objetivo, restrições) com a
  justificativa da escolha do objetivo;
- `facilidades.mod`;
- o script Python (função `ler_dados` + laço que resolve as três
  instâncias);
- a tabela de resultados preenchida e o parágrafo de análise;
- as respostas às perguntas de reflexão.

## Perguntas de reflexão (respondam na entrega)

1. Qual a diferença prática, para os candidatos, entre minimizar a **soma**
   das distâncias e minimizar a **maior** distância? Em que situação cada
   uma é mais justa?
2. O que acontece com o modelo se $p$ (o número de locais a abrir) for
   pequeno demais para acomodar todos os candidatos? Como o solver
   sinaliza isso?
3. Como o tempo de solução se comportou da instância 1 para a 3? O que
   isso sugere sobre resolver instâncias ainda maiores (uma cidade
   inteira, o país todo)?
4. Rodar as três instâncias num laço, sem reescrever o modelo a cada vez,
   só foi possível porque chamamos o AMPL de dentro do Python. Que outros
   experimentos essa automação permite (ex.: variar $p$, variar o tempo
   limite, comparar solvers)?
5. Onde mais, no mundo real, aparece esse mesmo problema de "escolher
   poucos pontos para atender muita gente que está espalhada" (ex.:
   postos de saúde, centros de distribuição, antenas, escolas)?
