from __future__ import annotations

import os
import shutil
from pathlib import Path

from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/")
def root() -> dict[str, str]:
    return {
        "name": "SignAction Backend",
        "health": "/health",
        "docs": "/docs",
    }


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/stt")
def health_stt() -> dict[str, object]:
    vosk_path = os.environ.get("VOSK_MODEL_PATH", "")
    model_exists = bool(vosk_path and Path(vosk_path).is_dir())

    # Also check common fallback locations
    search_dirs = [
        Path(__file__).resolve().parents[2] / "models",
        Path("/app/models"),
    ]
    found_models: list[str] = []
    for d in search_dirs:
        if d.exists():
            for p in sorted(d.glob("vosk-model-*/")):
                if p.is_dir():
                    found_models.append(str(p))

    return {
        "vosk_model_path_env": vosk_path or "(not set)",
        "vosk_model_exists": model_exists,
        "vosk_models_found": found_models,
        "ffmpeg_available": shutil.which("ffmpeg") is not None,
    }


@router.get("/__routes")
def list_routes(request: Request) -> dict[str, list[dict[str, object]]]:
    routes: list[dict[str, object]] = []
    for r in request.app.routes:
        methods = sorted([m for m in getattr(r, "methods", []) if m])
        routes.append(
            {
                "path": getattr(r, "path", None),
                "name": getattr(r, "name", None),
                "methods": methods,
            }
        )

    routes.sort(key=lambda x: (str(x.get("path")), ",".join(x.get("methods") or [])))
    return {"routes": routes}
