## Projeto final — Unidade 2

Este projeto **substitui todas as outras avaliações da Unidade 2** e corresponde a **100% da nota da unidade**. Não há prova nem outra atividade avaliativa nesta unidade — a nota do projeto é a nota da unidade.

Os grupos são os mesmos das atividades anteriores (3 pessoas). A entrega é até **11/12/2026 às 23h59** via repositório público no GitHub (link submetido via SIGAA). As apresentações ocorrem na própria aula do dia **11/12**, com **10 minutos por equipe**.

---

## Duas opções de projeto

Cada equipe escolhe uma das duas opções abaixo. Os entregáveis e os critérios de avaliação são os mesmos para as duas.

### Opção 1 — Metaheurística para o TSP

Implementar uma metaheurística (à escolha da equipe) para o Problema do Caixeiro Viajante e resolver as quatro instâncias da TSPLIB utilizadas nas avaliações anteriores:

| Instância | $n$ (cidades) | Ótimo conhecido |
|-----------|--------------|-----------------|
| berlin52  | 52           | 7.542           |
| kroA100   | 100          | 21.282          |
| ch150     | 150          | 6.528           |
| kroA200   | 200          | 29.368          |

Fonte: TSPLIB (Reinelt, Heidelberg). Arquivos `.tsp` com coordenadas euclidianas (`EUC_2D`); distâncias calculadas como a distância euclidiana arredondada para o inteiro mais próximo.

O critério de parada — tempo máximo, número de iterações, número de iterações sem melhora, ou outro — deve ser definido pela equipe e estar explicitamente documentado no relatório e na apresentação.

### Opção 2 — Problema à escolha

A equipe define um problema de otimização combinatória de seu interesse e implementa uma metaheurística para ele.

**Confirmação obrigatória:** o problema escolhido deve ser comunicado ao professor — com uma descrição breve e a referência que a equipe pretende usar como base — até **01/12/2026**, via SIGAA ou e-mail. Projetos não confirmados nesse prazo serão avaliados pela Opção 1.

A estrutura de entregáveis e de apresentação é a mesma da Opção 1, adaptada ao problema escolhido (substituindo as instâncias TSPLIB pelas instâncias do problema em questão, e os ótimos conhecidos por uma referência adequada — resultado de um solver exato, resultado da literatura, ou heurística construtiva).

---

## Protocolo experimental

Metaheurísticas são estocásticas: dois runs do mesmo código com sementes diferentes podem produzir resultados distintos. Reportar um único run é insuficiente — não é possível saber se o resultado obtido é representativo do método ou um caso atípico.

O protocolo mínimo esperado:

- Executar o método **pelo menos 10 vezes** por instância, cada execução com uma semente diferente e **fixada** (para garantir reprodutibilidade).
- Fixar todos os parâmetros antes de iniciar os experimentos; ajustar parâmetros observando os resultados de instâncias específicas invalida a comparação.
- Para cada instância, reportar:
  - **Best:** melhor valor de UB encontrado entre todas as execuções
  - **Média:** média dos valores finais
  - **Desvio padrão**
  - **Tempo médio** de execução (em segundos)
  - **Gap (%)** em relação ao ótimo/referência: $\text{gap} = \dfrac{UB - \text{referência}}{\text{referência}} \times 100$
- Registrar as especificações da máquina utilizada (processador, RAM, sistema operacional) — o tempo de execução depende do hardware e precisa constar no relatório para que os resultados sejam interpretáveis.

---

## Entregáveis

Os três itens abaixo devem estar no repositório GitHub entregue.

### 1. Código-fonte

Código em Python (ou outra linguagem acordada previamente com o professor), organizado e suficientemente comentado para que o método possa ser executado e os experimentos reproduzidos.

Incluir um arquivo `README.md` na raiz com instruções de execução: dependências, comando para rodar, como reproduzir os resultados do relatório.

### 2. Relatório

Arquivo `relatorio.md` no repositório, contendo:

- Descrição do problema e da metaheurística implementada
- Representação da solução, vizinhança/operadores de perturbação, geração da solução inicial
- Critério de parada adotado e justificativa
- Protocolo experimental: número de réplicas, sementes utilizadas, valores de todos os parâmetros e como foram escolhidos
- Especificações da máquina utilizada nos experimentos
- Tabela de resultados por instância (best, média, desvio padrão, tempo médio, gap)
- Análise dos resultados: discussão do gap obtido, comparação entre instâncias, dificuldades encontradas

### 3. Apresentação

PDF de slides (`apresentacao.pdf` no repositório), **10 minutos**, seguindo o mesmo formato do seminário da Aula 8. A equipe apresenta o próprio trabalho cobrindo:

- Descrição do problema e motivação
- Método: representação da solução, vizinhança, solução inicial, critério de parada
- Instâncias utilizadas (origem, tamanho, características)
- Protocolo experimental (réplicas, sementes, parâmetros)
- Desempenho computacional (tempos, especificações da máquina)
- Qualidade das soluções (tabela de gaps, discussão)
- Contribuições e limitações

---

## Estrutura sugerida do repositório

```
README.md
codigo/
    main.py
    ...
relatorio.md
apresentacao.pdf
```

O repositório deve ser **público**. Após criar e popular o repositório, submeta o link na **tarefa correspondente no SIGAA** até **11/12/2026 às 23h59**. Entregas fora do SIGAA (e-mail, mensagem, etc.) não serão consideradas.

---

## Critérios de avaliação

- **Código:** corretude, organização, reprodutibilidade (instruções claras, sementes fixadas)
- **Protocolo experimental:** mínimo de 10 réplicas por instância, parâmetros documentados, máquina registrada
- **Relatório:** tabelas completas, análise dos resultados (não apenas listagem de números), gap calculado corretamente
- **Apresentação:** clareza, cobertura dos itens exigidos, respeito ao tempo de 10 minutos
