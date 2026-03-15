from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter
from pydantic import BaseModel

from signaction.mapping import SignLexicon
from signaction.nlp import glossify
from signaction.translate import tokens_to_signs

from ..settings import get_settings

router = APIRouter()


class TranslateTextRequest(BaseModel):
    text: str


class TranslateResponse(BaseModel):
    tokens: list[str]
    gestures: list[str]
    gloss: str | None = None


def _asset_url_for(path: Path, *, assets_dir: Path) -> str:
    rel = path.relative_to(assets_dir).as_posix()
    return f"/assets/{rel}"


@router.post("/translate-text", response_model=TranslateResponse)
def translate_text(req: TranslateTextRequest) -> TranslateResponse:
    settings = get_settings()

    gloss = glossify(req.text)
    translation = tokens_to_signs(gloss.tokens, assets_dir=settings.assets_dir, fingerspell_unknown=True)

    lex = SignLexicon(assets_dir=settings.assets_dir)

    tokens_out: list[str] = []
    gestures: list[str] = []

    for item in translation.items:
        tokens_out.append(item.token)

        resolved = lex.resolve(item.token)
        if resolved is not None and resolved.media_path.exists():
            gestures.append(_asset_url_for(resolved.media_path, assets_dir=settings.assets_dir))
            continue

        # Fallback: dynamic placeholder.
        gestures.append(f"/placeholder/{item.token}.gif")

    return TranslateResponse(tokens=tokens_out, gestures=gestures, gloss=gloss.gloss)
