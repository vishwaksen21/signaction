#!/usr/bin/env bash
set -euo pipefail

# Dev server for the FastAPI backend
# Usage: ./backend_dev.sh
# Port 8000 will be automatically forwarded in Codespaces

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload --log-level info
