#!/usr/bin/env bash
# Reproduz localmente o que o GitHub Actions faz em .github/workflows/pages.yml:
# compila todos os slides .tex e gera o site em dist/.
#
# Uso: scripts/build-local.sh [--open]

set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v latexmk >/dev/null 2>&1; then
  echo "latexmk não encontrado. Instale o TeX Live (ex.: sudo apt install texlive-full)." >&2
  exit 1
fi

echo "==> Compilando slides (.tex -> .pdf)"
shopt -s globstar nullglob
tex_files=(content/aulas/**/slides/*.tex)
if [ ${#tex_files[@]} -eq 0 ]; then
  echo "Nenhum .tex encontrado em content/aulas/**/slides/."
else
  for tex in "${tex_files[@]}"; do
    echo "--- $tex"
    latexmk -pdf -interaction=nonstopmode -halt-on-error -cd "$tex"
  done
fi

echo "==> Gerando site (dist/)"
python3 site/build.py

echo "==> Pronto: dist/index.html"

if [ "${1:-}" = "--open" ]; then
  xdg-open dist/index.html >/dev/null 2>&1 || open dist/index.html >/dev/null 2>&1 || true
fi
