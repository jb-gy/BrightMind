#!/usr/bin/env bash
set -euo pipefail
# shellcheck disable=SC1091
source .venv/bin/activate
export UVICORN_WORKERS="${UVICORN_WORKERS:-1}"
export PORT="${PORT:-8000}"
echo "[+] Starting dev server on http://localhost:${PORT}"
uvicorn app:app --reload --port "${PORT}"
