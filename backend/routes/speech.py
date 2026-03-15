from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from signaction.mapping import SignLexicon
from signaction.nlp import glossify
from signaction.translate import tokens_to_signs
from signaction.stt.factory import transcribe_file

from ..settings import get_settings

router = APIRouter()


class TranslateSpeechResponse(BaseModel):
    transcript: str
    tokens: list[str]
    gestures: list[str]
    gloss: str | None = None


def _ensure_local_vosk_autodetect() -> None:
    if os.environ.get("VOSK_MODEL_PATH"):
        return

    repo_root = Path(__file__).resolve().parents[2]
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


def _asset_url_for(path: Path, *, assets_dir: Path) -> str:
    rel = path.relative_to(assets_dir).as_posix()
    return f"/assets/{rel}"


@router.post("/translate-speech", response_model=TranslateSpeechResponse)
async def translate_speech(file: UploadFile = File(...)) -> TranslateSpeechResponse:
    _ensure_local_vosk_autodetect()
    settings = get_settings()

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

    gloss = glossify(transcript)
    translation = tokens_to_signs(gloss.tokens, assets_dir=settings.assets_dir, fingerspell_unknown=True)

    lex = SignLexicon(assets_dir=settings.assets_dir)
    tokens_out: list[str] = []
    gestures: list[str] = []

    for item in translation.items:
        tokens_out.append(item.token)
        resolved = lex.resolve(item.token)
        if resolved is not None and resolved.media_path.exists():
            gestures.append(_asset_url_for(resolved.media_path, assets_dir=settings.assets_dir))
        else:
            gestures.append(f"/placeholder/{item.token}.gif")

    return TranslateSpeechResponse(transcript=transcript, tokens=tokens_out, gestures=gestures, gloss=gloss.gloss)
