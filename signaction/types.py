from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal


@dataclass(frozen=True)
class GlossResult:
    original_text: str
    normalized_text: str
    tokens: list[str]
    gloss: str


@dataclass(frozen=True)
class SignItem:
    token: str
    media_type: Literal["gif", "mp4", "img"]
    media_path: Path
