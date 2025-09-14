#!/usr/bin/env bash
set -euo pipefail

PYTHON_BIN="${PYTHON_BIN:-python}"
VENV=".venv"

if [ ! -d "$VENV" ]; then
  echo "[+] Creating virtualenv at $VENV"
  $PYTHON_BIN -m venv "$VENV"
fi

# shellcheck disable=SC1091
source "$VENV/bin/activate"

echo "[+] Upgrading pip"
python -m pip install --upgrade pip

echo "[+] Installing backend requirements"
pip install -r requirements.txt

if [ ! -f ".env" ]; then
  echo "[+] Creating .env from template"
  cp .env.example .env
fi

echo "[✓] Bootstrap complete. Activate with: source $VENV/bin/activate"
