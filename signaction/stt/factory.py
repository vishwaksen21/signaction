from __future__ import annotations

from pathlib import Path
from typing import Literal

from ..exceptions import ModelNotConfiguredError
from .vosk_backend import VoskBackend


BackendName = Literal["vosk"]


def transcribe_file(audio_path: Path, *, backend: BackendName = "vosk") -> str:
    if backend == "vosk":
        stt = VoskBackend.from_env()
        return stt.transcribe(audio_path)

    raise ModelNotConfiguredError(f"Unsupported backend: {backend}")
