from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .nlp import glossify
from .render import render_sequence_gif
from .translate import TranslationResult, tokens_to_signs
from .types import GlossResult


@dataclass(frozen=True)
class PipelineResult:
    gloss: GlossResult
    translation: TranslationResult
    gif_bytes: bytes


def run_text_to_sign_pipeline(text: str, *, assets_dir: Path) -> PipelineResult:
    gloss = glossify(text)
    translation = tokens_to_signs(gloss.tokens, assets_dir=assets_dir, fingerspell_unknown=True)
    gif_bytes = render_sequence_gif(translation.items, assets_dir=assets_dir)
    return PipelineResult(gloss=gloss, translation=translation, gif_bytes=gif_bytes)
