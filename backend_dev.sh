#!/usr/bin/env bash
set -euo pipefail

# Dev server for the FastAPI backend
# Usage: ./backend_dev.sh
# Port 8000 will be automatically forwarded in Codespaces

PYTHON_BIN="${PYTHON_BIN:-$(command -v python3 || command -v python)}"
exec "$PYTHON_BIN" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
