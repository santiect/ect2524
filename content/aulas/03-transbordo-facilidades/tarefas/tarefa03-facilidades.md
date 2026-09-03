## Tarefa 3 — Localização de Facilidades

Nesta tarefa vocês vão repetir, para um **problema diferente**, exatamente
os três passos que fizemos em aula com o Problema de Transbordo:

- **Passo 1 — Modelar** o problema (identificar parâmetros, variáveis de
  decisão, função objetivo e restrições);
- **Passo 2 — Escrever o modelo em AMPL**;
- **Passo 3 — Escrever o código Python** (a função que lê os dados de um
  arquivo e o script que, usando o `amplpy`, resolve o modelo) — só que
  agora para **três instâncias** fornecidas.

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
> de equipes, de forma que os candidatos se **desloquem pouco**. Aí eu
> tenho duas visões possíveis do que é "deslocar pouco", e não sei qual
> usar: uma é fazer a **soma de todas as distâncias** percorridas ser a
> menor possível; a outra é olhar para o **candidato mais prejudicado** e
> fazer a **maior distância** que alguém precisa percorrer ser a menor
> possível. Escolham uma dessas duas visões, me expliquem por que, e me
> entreguem uma ferramenta que leia os dados de um local e me devolva a
> decisão."

## Passo 1 — Modelar o problema

A partir da descrição acima, vocês é que precisam identificar e
apresentar, no mesmo estilo usado em aula:

- quais são os **parâmetros** (os dados de entrada do problema);
- quais são as **variáveis de decisão**;
- qual é a **função objetivo**. Aqui entra a escolha entre as duas visões
  que o cliente descreveu (na literatura, minimizar a soma das distâncias
  é a *p-mediana*; minimizar a maior distância é o *p-centro*). Escolham
  uma, **justifiquem** no contexto do problema e comentem como a solução
  mudaria com a outra;
- quais são as **restrições** — expliquem em uma linha o papel de cada uma.

## Passo 2 — Escrever o modelo em AMPL

Transcrevam a formulação do Passo 1 para um arquivo `facilidades.mod`.

## Passo 3 — Escrever o código Python

**3.1. Função `ler_dados(arquivo)`** — abre um dos arquivos de instância e
devolve um dicionário com os dados prontos para uso (número de candidatos,
de locais, $p$, o vetor de capacidades e a matriz de distâncias) — mesmo
papel da função que usamos em aula para o transbordo. Ver o formato dos
arquivos mais abaixo.

**3.2. Script com `amplpy`** — para **cada uma das três instâncias**
(`instancia_facilidades1.txt`, `instancia_facilidades2.txt` e
`instancia_facilidades3.txt`), o script deve:

- ler os dados com a função de 3.1;
- carregar o modelo e injetar os parâmetros;
- resolver com o HiGHS, definindo um **tempo limite** (ex.: 60 ou 120
  segundos);
- imprimir: os locais abertos, o valor da função objetivo, o limitante
  inferior (LB), o GAP, o tempo de execução e o status
  (`ampl.solve_result`).

**3.3. Tabela de resultados** — uma linha por instância:

| Instância | Tempo limite | Solver | Objetivo (UB) | LB | GAP | Tempo | Status |
|---|---|---|---|---|---|---|---|
| 1 | ... | HiGHS | ... | ... | ... | ... | ... |
| 2 | ... | ... | ... | ... | ... | ... | ... |
| 3 | ... | ... | ... | ... | ... | ... | ... |

Acompanhada de um parágrafo curto de análise: as três foram resolvidas na
otimalidade (GAP zero)? A instância 3, bem maior, foi tratável dentro do
tempo limite?

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
distâncias (uma linha por candidato, uma coluna por local). Os valores em
cada linha são separados por **espaço**.

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
