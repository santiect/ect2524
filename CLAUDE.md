# ECT2524 — Introdução à Otimização

Repositório de material didático (slides LaTeX, tarefas, notebooks)
publicado como site estático em GitHub Pages via GitHub Actions.

## Regra principal: sempre testar localmente antes do push

Este repo publica direto: um push na `main` dispara
`.github/workflows/pages.yml`, que compila **todos** os `.tex` em
`content/aulas/**/slides/` e publica o site. Um erro de LaTeX ou de build
só aparece no Actions minutos depois — e derruba o site até ser corrigido.

Sempre que alterar qualquer coisa em `content/` ou `site/`, rode antes de
propor o push:

```bash
scripts/build-local.sh
```

Isso reproduz os mesmos passos do workflow (compila os `.tex` com
`latexmk` e roda `site/build.py`). Se esse script falhar, o Actions
também vai falhar — corrija antes de fazer push. Não empurre um commit
que quebra `scripts/build-local.sh`.

Se `latexmk`/`pdflatex` não estiverem instalados na máquina, avise o
usuário em vez de pular a checagem — não é seguro assumir que o `.tex`
vai compilar sem testar. Rodar só `python3 site/build.py` (sem LaTeX)
verifica apenas o HTML/CSS, não os slides.

## GitHub Pages precisa estar em "Source: GitHub Actions"

O GitHub tem dois modos de publicar Pages: "Deploy from a branch" (build
Jekyll interno do próprio GitHub, a partir do `README.md` da raiz) ou
"GitHub Actions" (usa o artefato que `.github/workflows/pages.yml`
gera em `dist/`). Este repo depende do segundo modo.

Se o Source cair (ou nunca tiver sido trocado) para "Deploy from a
branch", o site ao vivo passa a mostrar o `README.md` renderizado pelo
Jekyll padrão do GitHub -- não o site gerado por `site/build.py` --
mesmo que o workflow `Publicar site` continue rodando com sucesso a
cada push (nesse caso, no histórico do Actions aparece também um
workflow separado chamado `pages-build-deployment`, sinal de que o
Source está em modo branch). Sintoma: `https://santiect.github.io/ect2524/`
mostra o conteúdo do README em vez do site, ou o HTML da página tem
`<meta name="generator" content="Jekyll ...">`.

Correção (manual, feita direto no GitHub, sem passar por commit/push):
**Settings → Pages → Build and deployment → Source → "GitHub Actions"**.
Trocar o Source sozinho não redispara o deploy -- depois de trocar, é
preciso rodar o workflow de novo (`Actions → Publicar site → Run
workflow`, ou um novo push na `main`) pra ele publicar o `dist/`
correto.

## Como o pipeline funciona

- `content/course.yaml` — nome da disciplina, professor, descrição do site.
- `content/aulas/NN-slug/aula.yaml` — metadados de cada aula (título, data,
  resumo, caminho do `.tex` principal, lista de tarefas).
- `content/aulas/NN-slug/slides/*.tex` — slides Beamer. **Sempre
  `\usepackage[utf8]{inputenc}`** (não `latin1`) — os arquivos são salvos em
  UTF-8; usar `latin1` quebra a compilação com "Missing $ inserted" em
  qualquer acento (já aconteceu, ver histórico do git).
  - Se o `.tex` usa `\bibliography{\jobname}`, o `.bib` precisa ter o
    mesmo nome-base do `.tex` (jobname = nome do arquivo sem extensão).
- Notebooks **não** ficam neste repositório, não têm link de Colab por
  arquivo, e **não são listados por título** em cada aula — o professor
  trabalha sempre a partir de um notebook em branco, ao vivo, então não
  há um arquivo fixo pra apontar. Existe só um link geral (a pasta
  compartilhada do Google Drive, `content/course.yaml` ->
  `notebooks_url`), mostrado no cabeçalho do site e repetido na seção
  "Notebooks" de cada página de aula. `aula.yaml` não tem mais chave
  `notebooks:`. Não reintroduzir listagem por arquivo/título sem o
  usuário pedir — decisão explícita dele.
- `content/aulas/NN-slug/tarefas` — cada item em `aula.yaml` pode ser só um
  título, ou apontar (`arquivo:`) para um `.md` que é renderizado como HTML
  direto na página (o aluno lê ali, não precisa baixar nada).
- `site/build.py` lê tudo isso e gera `dist/` usando os templates Jinja2 em
  `site/templates/` e o CSS em `site/static/css/style.css`.
- `.github/workflows/pages.yml` faz: instala um subconjunto mínimo de
  TeX Live via `apt` (com cache, ver seção de performance abaixo) →
  compila os `.tex` com `latexmk` → `python3 site/build.py` → publica
  `dist/` no GitHub Pages. **Não** usa `texlive-full` nem uma imagem
  Docker -- foi trocado de propósito por ser muito mais lento (imagem de
  vários GB, sem cache entre runs).

## Performance do build no CI

- O workflow instala só `texlive-base`, `texlive-latex-base`,
  `texlive-latex-recommended`, `texlive-pictures`,
  `texlive-lang-portuguese` e `latexmk` -- o suficiente pro conteúdo
  atual (beamer, babel brazilian, amsmath, booktabs, listings, xcolor).
  Isso é uma fração do tamanho de `texlive-full`
  (que inclui `texlive-fonts-extra`, ~670MB sozinho, puxado só por um
  ajuste cosmético opcional do beamer que o conteúdo nem usa).
- Os `.deb` baixados ficam em cache (`actions/cache`, chave
  `apt-texlive-v1-...`) entre runs.
- **Se um `.tex` novo usar um pacote que não está nessa lista**, o
  `pdflatex` vai falhar dizendo exatamente qual `.sty`/`.cls` faltou.
  Não é bug -- é só adicionar o pacote Debian correspondente na lista de
  `apt-get install` do workflow (descobrir o nome do pacote: instalar
  `texlive-full` localmente uma vez, compilar, e rodar `dpkg -S
  caminho/do/arquivo.sty` para achar de qual pacote Debian ele veio; ou
  usar `apt-file search nome.sty`). Não adicionar `texlive-full` de
  volta como atalho -- isso reintroduziria o problema de performance que
  motivou essa mudança.

## Estilo de escrita do conteúdo

- **Slides (`.tex`)**: sempre em bullet points, nunca parágrafos de texto
  corrido. O professor explica o conteúdo ao vivo — o slide é apoio
  visual em tópicos, não um texto para ser lido. Isso vale mesmo para
  descrições conceituais (ex.: estudo de caso): quebrar em bullets, não
  assumir que o aluno já conhece o problema, mas sem virar parágrafo.
- **Tarefas (`.md`)**: aqui pode (e deve, quando ajudar a clareza) usar
  texto corrido normalmente — é material para leitura assíncrona pelo
  aluno, não apoio de fala em aula. Bullets só onde fizer sentido (listas
  de itens, passos), não como regra geral.

## Sem citação de notebooks/Colab no corpo do material

- Nenhum material (slides `.tex`, tarefas `.md`, resumos em `aula.yaml`)
  pode citar notebooks específicos pelo nome (ex.: "OPT001_intro") nem
  mencionar "Colab" no meio do texto. O único lugar onde notebooks
  aparecem é o link geral pra pasta do Drive (nav do site + seção
  "Notebooks" da aula, ver seção acima) — nunca citados dentro de uma
  explicação, tarefa ou slide. Motivo: o professor trabalha a partir de
  notebooks em branco, criados ao vivo, então citar um nome fixo no
  material publicado fica desatualizado/sem sentido.

## Fórmulas matemáticas nas tarefas

- As tarefas (`.md`) podem usar notação LaTeX para fórmulas: `$...$`
  para fórmulas inline, `$$...$$` para fórmulas em bloco. O site renderiza
  isso em runtime, no navegador, via KaTeX carregado por CDN em
  `site/templates/base.html` (script `auto-render` varre a página
  procurando esses delimitadores depois que o HTML carrega) — não há
  passo de build envolvido, e o `.md` cru continua sendo markdown normal
  fora dos trechos `$...$`.
- Cuidado com o caractere `$`: como o auto-render trata qualquer par de
  `$...$` como fórmula, não use `$` para outra coisa (ex.: valores em
  reais) dentro de um `.md` de tarefa sem escapar/evitar ambiguidade.
- Os slides (`.tex`) continuam sendo LaTeX de verdade, compilado pelo
  workflow para PDF — isso aqui é só para as tarefas em Markdown
  renderizadas na página HTML, que antes só suportavam texto puro.

## Formato de arquivos para download

- **Material didático para leitura** (slides, apostila/material auxiliar
  de tarefa): sempre que o aluno puder **baixar** para ler, tem que ser
  **PDF** — nunca `.tex`, `.md` cru, `.docx`, etc. Slides já seguem isso
  (compilados para PDF pelo workflow). Se uma tarefa precisar de um
  material auxiliar de leitura baixável além do `.md` renderizado na
  página, gere/forneça um PDF, não linke o arquivo-fonte diretamente.
- **Arquivos de dados / instâncias** que o aluno baixa para o programa
  dele **ler como entrada** (ex.: os `.txt` de instâncias de um problema
  de otimização) ficam no **formato nativo** (`.txt`, `.csv`, `.dat`,
  `.json`…) — a regra do PDF não se aplica, não faz sentido "PDF-ificar"
  dados que serão parseados por código. Basta colocar o arquivo na pasta
  da aula (o `build.py` copia tudo para `dist/<slug>/`) e linká-lo do
  `.md` da tarefa por caminho relativo.

## Convenções

- Design é intencionalmente simples/moderno (ver `site/static/css/style.css`,
  suporta light/dark via `prefers-color-scheme`). Não adicionar
  frameworks/JS de build — o site é puramente estático (HTML gerado, sem
  passo de bundling). Exceção deliberada: KaTeX via CDN em
  `site/templates/base.html`, carregado em runtime no navegador (sem
  build), usado para renderizar fórmulas LaTeX (`$...$` / `$$...$$`) nas
  tarefas em Markdown — ver seção "Fórmulas matemáticas nas tarefas"
  abaixo.
- `antigos/` é o material antigo (slides, notebooks) ainda não migrado —
  não editar diretamente; é a fonte para futuras aulas em `content/aulas/`.
- Nunca commitar artefatos de build: `dist/`, `.aux`/`.log`/`.nav`/etc. de
  LaTeX e `content/aulas/**/slides/*.pdf` já estão no `.gitignore`.

## Git

- Sempre pedir confirmação antes de `git push` (o push publica no site ao
  vivo). Commits locais podem ser feitos sem perguntar.
