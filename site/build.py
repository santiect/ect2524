#!/usr/bin/env python3
"""Gera o site estático em dist/ a partir do conteúdo em content/.

Uso: python3 site/build.py
"""
import shutil
from pathlib import Path

import markdown
import yaml
from jinja2 import Environment, FileSystemLoader

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
SITE = ROOT / "site"
DIST = ROOT / "dist"

GITHUB_REPO = None  # preenchido a partir de content/course.yaml


def load_yaml(path: Path) -> dict:
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def load_course():
    return load_yaml(CONTENT / "course.yaml")


def load_aulas():
    aulas = []
    aulas_dir = CONTENT / "aulas"
    if not aulas_dir.exists():
        return aulas

    for aula_dir in sorted(aulas_dir.iterdir()):
        yaml_path = aula_dir / "aula.yaml"
        if not aula_dir.is_dir() or not yaml_path.exists():
            continue

        data = load_yaml(yaml_path)
        data["slug"] = aula_dir.name
        data["_dir"] = aula_dir

        # Slides: localiza o PDF gerado a partir do .tex indicado.
        slides_pdf = None
        if data.get("slides"):
            tex_path = aula_dir / data["slides"]
            pdf_path = tex_path.with_suffix(".pdf")
            if pdf_path.exists():
                slides_pdf = f"{aula_dir.name}/slides/{pdf_path.name}"
        data["slides_pdf"] = slides_pdf

        # Tarefas: markdown vira HTML; itens sem arquivo ficam só como texto.
        for tarefa in data.get("tarefas") or []:
            if tarefa.get("arquivo"):
                md_path = aula_dir / tarefa["arquivo"]
                if md_path.exists():
                    tarefa["html"] = markdown.markdown(
                        md_path.read_text(encoding="utf-8")
                    )
                    tarefa["link"] = f"{aula_dir.name}/{tarefa['arquivo']}"

        # Notebooks: gera links para Colab e para o arquivo bruto no GitHub.
        for nb in data.get("notebooks") or []:
            caminho = nb.get("caminho")
            if caminho:
                repo_rel = f"content/aulas/{aula_dir.name}/{caminho}"
                nb["colab_url"] = (
                    f"https://colab.research.google.com/github/"
                    f"{GITHUB_REPO}/blob/main/{repo_rel}"
                )
                nb["raw_url"] = f"{aula_dir.name}/{caminho}"

        aulas.append(data)

    return aulas


def copy_static(env_ctx):
    static_src = SITE / "static"
    static_dst = DIST / "static"
    if static_dst.exists():
        shutil.rmtree(static_dst)
    shutil.copytree(static_src, static_dst)


def copy_aula_assets(aulas):
    for aula in aulas:
        src_dir = aula["_dir"]
        dst_dir = DIST / aula["slug"]
        if dst_dir.exists():
            shutil.rmtree(dst_dir)
        # Copia tudo (slides compilados, notebooks, tarefas) exceto o aula.yaml.
        shutil.copytree(
            src_dir,
            dst_dir,
            ignore=shutil.ignore_patterns("aula.yaml", "*.aux", "*.log", "*.nav",
                                           "*.snm", "*.toc", "*.out", "*.bbl",
                                           "*.blg", "*.fls", "*.fdb_latexmk"),
        )


def main():
    global GITHUB_REPO
    course = load_course()
    GITHUB_REPO = course.get("repo", "")

    aulas = load_aulas()

    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    env = Environment(loader=FileSystemLoader(str(SITE / "templates")))

    index_tpl = env.get_template("index.html")
    (DIST / "index.html").write_text(
        index_tpl.render(course=course, aulas=aulas), encoding="utf-8"
    )

    copy_static(course)
    copy_aula_assets(aulas)

    aula_tpl = env.get_template("aula.html")
    for aula in aulas:
        out_dir = DIST / aula["slug"]
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(
            aula_tpl.render(course=course, aula=aula, base_path="../"),
            encoding="utf-8",
        )

    print(f"Site gerado em {DIST} ({len(aulas)} aula(s)).")


if __name__ == "__main__":
    main()
