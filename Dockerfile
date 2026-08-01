FROM python:3.11-slim

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy ALL source first (needed for editable install to find the signaction package)
COPY pyproject.toml ./
COPY signaction/ ./signaction/
COPY backend/ ./backend/
COPY signaction_assets/ ./signaction_assets/

# Install Python dependencies (now signaction/ exists for pip install -e .)
RUN pip install --no-cache-dir --upgrade pip \
 && pip install --no-cache-dir -e ".[video]" \
 && pip install --no-cache-dir google-genai python-dotenv \
 && python -m spacy download en_core_web_sm

ENV SIGNACTION_ASSETS_DIR=/app/signaction_assets
ENV PORT=8000

EXPOSE 8000

CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}
