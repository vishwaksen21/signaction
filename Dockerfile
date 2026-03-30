# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# System deps needed by some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./
COPY signaction/ ./signaction/
COPY backend/ ./backend/

RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -e ".[video]" \
 && pip install --no-cache-dir google-genai python-dotenv

# Download spaCy model
RUN python -m spacy download en_core_web_sm

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11 /usr/local/lib/python3.11
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy application source
COPY --from=builder /app /app

# Copy the ISL sign assets (151 real MP4 videos + lexicon.json)
COPY signaction_assets/ /app/signaction_assets/

ENV SIGNACTION_ASSETS_DIR=/app/signaction_assets
ENV PORT=8000

EXPOSE 8000

CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}
