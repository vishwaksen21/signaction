from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .settings import get_settings
from .routes.dictionary import router as dictionary_router
from .routes.health import router as health_router
from .routes.speech import router as speech_router
from .routes.translator import router as translator_router


def create_app() -> FastAPI:
    settings = get_settings()
    settings.assets_dir.mkdir(parents=True, exist_ok=True)

    app = FastAPI(title="SignAction Backend", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Serve local gesture assets.
    app.mount("/assets", StaticFiles(directory=str(settings.assets_dir)), name="assets")

    app.include_router(health_router)
    app.include_router(translator_router)
    app.include_router(speech_router)
    app.include_router(dictionary_router)

    return app


app = create_app()
