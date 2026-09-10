## Tarefa 4 — Localização de Facilidades

Nesta tarefa vocês vão repetir, para um **problema diferente**, exatamente
os três passos que vimos na Aula 3 com o Problema de Transbordo:

- **Passo 1 — Modelar** o problema (identificar parâmetros, variáveis de
  decisão, função objetivo e restrições);
- **Passo 2 — Escrever o modelo em AMPL**;
- **Passo 3 — Escrever o código Python** (a função que lê os dados de um
  arquivo e o script que, usando o `amplpy`, resolve o modelo) — só que
  agora para **três instâncias** fornecidas e para **duas formulações**.

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
> possível. Não quero escolher no escuro: implementem **as duas**, rodem
> nas instâncias que tenho e me mostrem, lado a lado, o que muda na
> decisão e no deslocamento dos candidatos. A partir dessa comparação eu
> decido."

## Passo 1 — Modelar o problema

A partir da descrição acima, vocês precisam identificar e apresentar, no
mesmo estilo usado em aula:

- quais são os **parâmetros** (os dados de entrada do problema);
- quais são as **variáveis de decisão**;
- quais são as **restrições** — expliquem em uma linha o papel de cada uma.

As duas formulações compartilham parâmetros, variáveis e restrições; elas
diferem **apenas na função objetivo**:

- **p-mediana** — minimizar a **soma** (equivalentemente, a média) das
  distâncias percorridas por todos os candidatos;
- **p-centro** — minimizar a **maior** distância percorrida por um
  candidato. Como a função "máximo" não é linear diretamente, vocês vão
  precisar de uma variável auxiliar $z \ge 0$ e de restrições que a
  forcem a ser pelo menos a distância de cada candidato alocado;
  minimiza-se $z$.

Apresentem as **duas** funções objetivo já linearizadas.

## Passo 2 — Escrever o modelo em AMPL

Transcrevam a formulação do Passo 1 para um arquivo `facilidades.mod`.
Como só o objetivo muda, mantenham um único arquivo com as **duas**
`minimize` declaradas (`p_mediana` e `p_centro`) e escolham qual resolver
em cada rodada com `ampl.eval("objective p_mediana;")` /
`ampl.eval("objective p_centro;")` — ou usem dois arquivos `.mod`, como
preferirem.

## Passo 3 — Escrever o código Python

**3.1. Função `ler_dados(arquivo)`** — abre um dos arquivos de instância e
devolve um dicionário com os dados prontos para uso (número de candidatos,
de locais, $p$, o vetor de capacidades e a matriz de distâncias) — mesmo
papel da função que usamos em aula para o transbordo. Ver o formato dos
arquivos mais abaixo.

**3.2. Script com `amplpy`** — para **cada uma das três instâncias** e
para **cada uma das duas formulações** (6 execuções no total), o script
deve:

- ler os dados com a função de 3.1;
- carregar o modelo, selecionar o objetivo e injetar os parâmetros;
- resolver com o HiGHS, com **tempo limite de 5 minutos** (300 s) em
  todas as execuções;
- recuperar, da solução, **a alocação candidato → local** e, a partir
  dela, a distância que **cada candidato** percorre;
- registrar, para aquela execução: o LB, o UB (valor da função
  objetivo), o GAP, o tempo de execução, o status
  (`ampl.solve_result`), e as estatísticas do deslocamento dos
  candidatos — **maior** distância, **menor** distância, **média** e
  **desvio padrão**.

**3.3. Tabela de resultados** — uma linha por instância **e** por
formulação (6 linhas), com tempo limite de 300 s e solver HiGHS em todas:

| Instância | Formulação | LB | UB | GAP | Tempo (s) | Status | Dist. máx. | Dist. mín. | Dist. média | Desvio padrão |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | p-mediana | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 1 | p-centro  | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 2 | p-mediana | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 2 | p-centro  | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 3 | p-mediana | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| 3 | p-centro  | ... | ... | ... | ... | ... | ... | ... | ... | ... |

Observações:

- para a p-mediana, `UB` é a soma das distâncias; para a p-centro, `UB` é
  a própria maior distância. Por isso as estatísticas de deslocamento
  (máx./mín./média/desvio) são o que torna as duas soluções
  **comparáveis** na mesma escala;
- se numa instância a mesma formulação não fechar na otimalidade dentro
  dos 5 min, registrem o GAP e o status (`limit`) e comparem assim mesmo.

**3.4. Análise da comparação** — um ou dois parágrafos, para cada
instância, respondendo:

- os **locais abertos** são os mesmos nas duas soluções? A alocação muda
  muito?
- quanto a p-centro **reduz** a maior distância em relação à p-mediana? E
  quanto ela **aumenta** a distância média e a soma?
- qual das duas você recomendaria ao cliente, e por quê? A resposta é a
  mesma para as três instâncias?

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

- A formulação (parâmetros, variáveis, restrições e as **duas** funções
  objetivo linearizadas);
- `facilidades.mod`;
- o script Python (função `ler_dados` + laço que resolve as três
  instâncias nas duas formulações);
- a tabela de resultados preenchida (6 linhas) e a análise da comparação;
- as respostas às perguntas de reflexão.

## Perguntas de reflexão (respondam na entrega)

1. Olhando as estatísticas de deslocamento na sua tabela: a p-centro
   sempre tem a **menor** "distância máxima"? E a p-mediana sempre tem a
   **menor** média? Isso era esperado pela definição de cada objetivo?
2. Em que situação minimizar a soma é mais justo com os candidatos, e em
   que situação minimizar a maior distância é mais justo? O desvio padrão
   ajuda a enxergar isso — como?
3. O que acontece com o modelo se $p$ (o número de locais a abrir) for
   pequeno demais para acomodar todos os candidatos? Como o solver
   sinaliza isso?
4. Como o tempo de solução se comportou da instância 1 para a 3, e da
   p-mediana para a p-centro na mesma instância? O que isso sugere sobre
   resolver instâncias ainda maiores (uma cidade inteira, o país todo)?
5. Rodar 6 execuções num laço, sem reescrever o modelo a cada vez, só foi
   possível porque chamamos o AMPL de dentro do Python. Que outros
   experimentos essa automação permite (ex.: variar $p$, variar o tempo
   limite, comparar solvers)?
6. Onde mais, no mundo real, aparece esse mesmo problema de "escolher
   poucos pontos para atender muita gente que está espalhada" (ex.:
   postos de saúde, centros de distribuição, antenas, escolas)?
