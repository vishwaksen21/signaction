from __future__ import annotations

import base64
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .config import default_config
from .pipeline import run_text_to_sign_pipeline
from .stt.factory import transcribe_file


class TextRequest(BaseModel):
    text: str


class TranslateResponse(BaseModel):
    text: str
    gloss: str
    tokens: list[str]
    gif_base64: str


class SpeechResponse(BaseModel):
    transcript: str
    gloss: str
    tokens: list[str]
    gif_base64: str


def _ensure_local_vosk_autodetect() -> None:
    """Best-effort: if VOSK_MODEL_PATH is unset, try ./models/vosk-model-*/."""
    if os.environ.get("VOSK_MODEL_PATH"):
        return

    repo_root = Path(__file__).resolve().parents[1]
    models_dir = repo_root / "models"
    if not models_dir.exists():
        return

    for p in sorted(models_dir.glob("vosk-model-*/")):
        if p.is_dir() and (p / "conf").exists():
            os.environ["VOSK_MODEL_PATH"] = str(p)
            return


def _infer_upload_suffix(upload: UploadFile) -> str:
    filename = upload.filename or ""
    suffix = Path(filename).suffix.lower()
    if suffix:
        return suffix

    ct = (upload.content_type or "").lower()
    if "webm" in ct:
        return ".webm"
    if "ogg" in ct:
        return ".ogg"
    if "wav" in ct:
        return ".wav"
    if "flac" in ct:
        return ".flac"

    return ".wav"


def _maybe_convert_to_wav(input_path: Path) -> Path:
    """Convert audio to WAV via ffmpeg if needed.

    The STT pipeline uses `soundfile` for decoding; browser recordings are often WEBM/Opus.
    We normalize here to keep the existing STT/model code untouched.
    """

    if input_path.suffix.lower() in {".wav", ".flac", ".ogg"}:
        return input_path

    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise ValueError(
            "Unsupported audio format. Upload WAV/FLAC/OGG. "
            "If you are uploading WEBM directly, install ffmpeg to enable automatic conversion."
        )

    fd, out_str = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    out_path = Path(out_str)

    proc = subprocess.run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(input_path),
            "-ac",
            "1",
            "-ar",
            "16000",
            "-f",
            "wav",
            str(out_path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        try:
            out_path.unlink(missing_ok=True)
        except Exception:
            pass

        stderr = (proc.stderr or "").strip()
        stderr = stderr[-1200:] if len(stderr) > 1200 else stderr
        raise ValueError(f"ffmpeg conversion failed. {stderr}".strip())

    return out_path


def create_app() -> FastAPI:
    app = FastAPI(title="SignAction API", version="0.1.0")

    # CORS: default to permissive dev settings (no credentials needed).
    cors_origins_raw = os.environ.get("SIGNACTION_CORS_ORIGINS", "*")
    cors_origins = (
        ["*"]
        if cors_origins_raw.strip() == "*"
        else [o.strip() for o in cors_origins_raw.split(",") if o.strip()]
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=False,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/api/translate/text", response_model=TranslateResponse)
    def translate_text(req: TextRequest) -> TranslateResponse:
        try:
            cfg = default_config()
            res = run_text_to_sign_pipeline(req.text, assets_dir=cfg.assets_dir)
            gif_b64 = base64.b64encode(res.gif_bytes).decode("ascii")
            return TranslateResponse(
                text=req.text,
                gloss=res.gloss.gloss,
                tokens=res.gloss.tokens,
                gif_base64=gif_b64,
            )
        except Exception as e:
            import traceback
            print(f"[ERROR in translate_text] {e}")
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/translate/speech", response_model=SpeechResponse)
    async def translate_speech(file: UploadFile = File(...)) -> SpeechResponse:
        _ensure_local_vosk_autodetect()
        cfg = default_config()

        data = await file.read()
        if not data:
            raise HTTPException(status_code=400, detail="Empty audio file")

        fd, tmp_path_str = tempfile.mkstemp(suffix=_infer_upload_suffix(file))
        os.close(fd)
        tmp_path = Path(tmp_path_str)

        converted_path: Path | None = None

        try:
            tmp_path.write_bytes(data)
            audio_path = _maybe_convert_to_wav(tmp_path)
            if audio_path != tmp_path:
                converted_path = audio_path
            transcript = transcribe_file(audio_path, backend="vosk")
        except Exception as e:  # noqa: BLE001
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Transcription failed: {e}. "
                    "Vosk works best with WAV, FLAC, or OGG. "
                    "WEBM uploads may require ffmpeg for automatic conversion. "
                    "Also ensure VOSK_MODEL_PATH is set to a downloaded Vosk model folder."
                ),
            ) from e
        finally:
            try:
                tmp_path.unlink(missing_ok=True)
            except Exception:
                pass

            if converted_path is not None:
                try:
                    converted_path.unlink(missing_ok=True)
                except Exception:
                    pass

        res = run_text_to_sign_pipeline(transcript, assets_dir=cfg.assets_dir)
        gif_b64 = base64.b64encode(res.gif_bytes).decode("ascii")
        return SpeechResponse(
            transcript=transcript,
            gloss=res.gloss.gloss,
            tokens=res.gloss.tokens,
            gif_base64=gif_b64,
        )

    # If the frontend has been built (Vite -> dist), serve it from this app.
    # This enables single-process deployment: `uvicorn signaction.web:app`.
    repo_root = Path(__file__).resolve().parents[1]
    dist_dir = repo_root / "frontend" / "dist"
    index_html = dist_dir / "index.html"
    assets_dir = dist_dir / "assets"

    if index_html.exists():
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

        @app.get("/")
        def spa_index() -> FileResponse:
            return FileResponse(str(index_html))

        # SPA fallback (must not shadow /api/* routes).
        @app.get("/{full_path:path}")
        def spa_fallback(full_path: str) -> FileResponse:
            return FileResponse(str(index_html))

    return app


app = create_app()
