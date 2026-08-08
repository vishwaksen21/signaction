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


def _fingerspell(token: str, lex: SignLexicon, assets_dir: Path) -> list[tuple[str, str]]:
    """Break a word into ISL letter-by-letter fingerspelling using real ISL letter videos.
    Returns list of (display_label, gesture_url) pairs.
    Only includes letters that have real ISL videos.
    """
    results = []
    for char in token.upper():
        if not char.isalpha():
            continue
        letter_item = lex.resolve(char)
        if letter_item and letter_item.media_path.exists():
            url = _asset_url_for(letter_item.media_path, assets_dir=assets_dir)
            results.append((char, url))
    return results


@router.post("/translate-text", response_model=TranslateResponse)
def translate_text(req: TranslateTextRequest) -> TranslateResponse:
    settings = get_settings()

    gloss = glossify(req.text)
    translation = tokens_to_signs(gloss.tokens, assets_dir=settings.assets_dir, fingerspell_unknown=False)

    lex = SignLexicon(assets_dir=settings.assets_dir)

    # Query YouTube playlist dictionary
    from .dictionary import get_youtube_dictionary
    yt_dict = get_youtube_dictionary()

    tokens_out: list[str] = []
    gestures: list[str] = []

    for item in translation.items:
        resolved = lex.resolve(item.token)

        if resolved is not None and resolved.media_path.exists():
            # Word has a direct local ISL video
            tokens_out.append(item.token)
            gestures.append(_asset_url_for(resolved.media_path, assets_dir=settings.assets_dir))
        else:
            clean_token = item.token.lower().strip()
            yt_match = yt_dict.get(clean_token)
            if not yt_match:
                from signaction.nlp import _load_nlp
                nlp = _load_nlp()
                doc = nlp(clean_token)
                if len(doc) > 0:
                    lemma = doc[0].lemma_.lower().strip()
                    yt_match = yt_dict.get(lemma)

            if yt_match:
                tokens_out.append(item.token)
                gestures.append(yt_match["youtubeUrl"])
            else:
                # Omit unmapped tokens (AI fallback is turned off)
                pass

    return TranslateResponse(tokens=tokens_out, gestures=gestures, gloss=gloss.gloss)
