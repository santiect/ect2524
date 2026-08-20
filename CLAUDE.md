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

## Como o pipeline funciona

- `content/course.yaml` — nome da disciplina, professor, descrição do site.
- `content/aulas/NN-slug/aula.yaml` — metadados de cada aula (título, data,
  resumo, caminho do `.tex` principal, lista de notebooks, lista de tarefas).
- `content/aulas/NN-slug/slides/*.tex` — slides Beamer. **Sempre
  `\usepackage[utf8]{inputenc}`** (não `latin1`) — os arquivos são salvos em
  UTF-8; usar `latin1` quebra a compilação com "Missing $ inserted" em
  qualquer acento (já aconteceu, ver histórico do git).
  - Se o `.tex` usa `\bibliography{\jobname}`, o `.bib` precisa ter o
    mesmo nome-base do `.tex` (jobname = nome do arquivo sem extensão).
- Notebooks **não** ficam neste repositório nem viram link de Colab por
  arquivo — vivem numa pasta compartilhada do Google Drive
  (`content/course.yaml` -> `notebooks_url`, linkada no topo do site). Em
  `aula.yaml`, `notebooks:` é só uma lista de títulos informativos (sem
  `caminho:`). Não reintroduzir lógica de link individual por notebook
  sem o usuário pedir — decisão explícita dele, pra não poluir a página.
- `content/aulas/NN-slug/tarefas` — cada item em `aula.yaml` pode ser só um
  título, ou apontar (`arquivo:`) para um `.md` que é renderizado como HTML
  direto na página (o aluno lê ali, não precisa baixar nada).
- `site/build.py` lê tudo isso e gera `dist/` usando os templates Jinja2 em
  `site/templates/` e o CSS em `site/static/css/style.css`.
- `.github/workflows/pages.yml` faz: compila LaTeX (imagem Docker
  `ghcr.io/xu-cheng/texlive-full`) → `python3 site/build.py` → publica
  `dist/` no GitHub Pages.

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

## Formato de arquivos para download

- Sempre que houver a opção de o aluno **baixar** algo (slides, material
  auxiliar de tarefa), o arquivo tem que ser **PDF** — nunca `.tex`, `.md`
  cru, `.docx`, etc. Slides já seguem isso (compilados para PDF pelo
  workflow). Se uma tarefa precisar de um material auxiliar baixável além
  do `.md` renderizado na página, gere/forneça um PDF, não linke o
  arquivo-fonte diretamente.

## Convenções

- Design é intencionalmente simples/moderno (ver `site/static/css/style.css`,
  suporta light/dark via `prefers-color-scheme`). Não adicionar
  frameworks/JS de build — o site é puramente estático.
- `antigos/` é o material antigo (slides, notebooks) ainda não migrado —
  não editar diretamente; é a fonte para futuras aulas em `content/aulas/`.
- Nunca commitar artefatos de build: `dist/`, `.aux`/`.log`/`.nav`/etc. de
  LaTeX e `content/aulas/**/slides/*.pdf` já estão no `.gitignore`.

## Git

- Sempre pedir confirmação antes de `git push` (o push publica no site ao
  vivo). Commits locais podem ser feitos sem perguntar.
