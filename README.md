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

## Rodar localmente

```bash
pip install -r site/requirements.txt
python3 site/build.py
```

Isso gera a pasta `dist/` (ignorada pelo git). Sem um TeX Live instalado
localmente, o PDF dos slides não é gerado — a página mostra "PDF ainda não
disponível" até que o build rode no GitHub Actions (que tem LaTeX completo).

Para compilar os slides localmente também (opcional, requer `latexmk`):

```bash
latexmk -pdf -cd content/aulas/00-exemplo/slides/aula06.tex
```

## Ajustes pendentes

- `content/aulas/00-exemplo/` é uma aula de demonstração (migrada de
  `antigos/Complexidade_Heurísticas_Metaherísticas/aula06.tex`) só para
  validar o pipeline — pode ser apagada quando as aulas reais forem criadas.
- A pasta `antigos/` guarda o material anterior (slides e notebooks) que
  ainda será reorganizado em `content/aulas/`.
