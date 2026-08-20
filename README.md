# ECT2524 — Introdução à Otimização

Material didático publicado em GitHub Pages. Este repositório contém o
**conteúdo** (slides em LaTeX, tarefas, notebooks) e o **gerador do site**;
o PDF dos slides é compilado automaticamente a cada push na `main`.

Site publicado em: `https://santiect.github.io/ect2524/`
(confirme em Settings → Pages que a source está definida como **GitHub Actions**).

## Como adicionar uma aula

1. Crie uma pasta em `content/aulas/`, com prefixo numérico para ordenar
   (ex.: `content/aulas/01-introducao/`).
2. Dentro dela, crie um `aula.yaml` (use `content/aulas/00-exemplo/aula.yaml`
   como referência) com título, data, resumo e os caminhos dos arquivos.
3. Coloque os slides em `slides/` (o `.tex` principal + `.bib` + `images/`).
   O nome do `.tex` também é usado como `\jobname`, então se o seu `.tex`
   referencia `\bibliography{\jobname}`, mantenha o `.bib` com o mesmo nome.
4. Coloque notebooks `.ipynb` em `notebooks/`. Eles ganham automaticamente
   um botão "Abrir no Colab" (via `https://colab.research.google.com/github/...`).
5. Tarefas podem ser só um título (sem arquivo) ou apontar para um `.md`
   dentro da pasta da aula (renderizado como HTML na página da aula).
6. Dê `git push` na `main`. O GitHub Actions compila o LaTeX, gera o site
   e publica no Pages — nenhum passo manual é necessário.

## Estrutura

```
content/
  course.yaml           # nome da disciplina, professor, etc.
  aulas/
    00-exemplo/
      aula.yaml
      slides/aula06.tex
      slides/aula06.bib
      slides/images/
      notebooks/OPT001_intro.ipynb
site/
  build.py              # gera dist/ a partir de content/
  templates/            # HTML (Jinja2)
  static/css/style.css  # layout
.github/workflows/pages.yml
```

## Rodar localmente (testar antes do push)

Requer TeX Live instalado (`sudo apt install texlive-full`, ou um subconjunto
com `texlive-latex-extra texlive-fonts-recommended texlive-lang-portuguese
texlive-bibtex-extra` — o suficiente para beamer/algorithmicx/babel/apalike)
e as dependências Python:

```bash
pip install -r site/requirements.txt
```

Depois, para reproduzir exatamente o que o GitHub Actions faz (compila todos
os `.tex` em `content/aulas/**/slides/` e gera o site):

```bash
scripts/build-local.sh          # gera dist/
scripts/build-local.sh --open   # gera e abre dist/index.html no navegador
```

Rodar isso antes de cada `git push` evita descobrir erro de LaTeX só depois
que o Actions falhar. Sem TeX Live instalado, dá pra rodar só
`python3 site/build.py` — o PDF fica marcado como "não disponível" na página,
mas o resto do layout pode ser conferido.

## Ajustes pendentes

- A pasta `antigos/` guarda o material anterior (slides e notebooks) que
  ainda será reorganizado em `content/aulas/`.
