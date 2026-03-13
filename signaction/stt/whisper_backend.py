from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from ..exceptions import SpeechToTextError


@dataclass
class FasterWhisperBackend:
    model_size: str = "small"

    def transcribe(self, audio_path: Path) -> str:
        """Transcribe using faster-whisper (optional dependency).

        Install with: `pip install .[whisper]`
        """

        try:
            from faster_whisper import WhisperModel  # type: ignore

            model = WhisperModel(self.model_size)
            segments, _info = model.transcribe(str(audio_path))
            return " ".join(seg.text.strip() for seg in segments).strip()
        except Exception as e:  # noqa: BLE001
            raise SpeechToTextError(f"Whisper transcription failed: {e}") from e
