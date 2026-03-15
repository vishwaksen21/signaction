# Build frontend
FROM node:20-bookworm-slim AS frontend
WORKDIR /frontend

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build


# Build backend
FROM python:3.11-slim AS backend
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# System deps (kept minimal). If you want server-side WEBM conversion, add ffmpeg.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY signaction/ ./signaction/
COPY scripts/ ./scripts/

RUN pip install --no-cache-dir -U pip \
  && pip install --no-cache-dir .

# Copy built frontend into the image so FastAPI can serve it.
COPY --from=frontend /frontend/dist ./frontend/dist

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "signaction.web:app", "--host", "0.0.0.0", "--port", "8000"]
