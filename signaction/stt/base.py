from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path


class SpeechToTextBackend(ABC):
    @abstractmethod
    def transcribe(self, audio_path: Path) -> str:
        raise NotImplementedError
