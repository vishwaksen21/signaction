from __future__ import annotations

import io
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from signaction.ai_fallback import generate_ai_fallback_gif

from ..settings import get_settings

router = APIRouter()


_SUPPORTED = {".gif", ".mp4", ".png", ".jpg", ".jpeg", ".svg"}


class DictionaryItem(BaseModel):
    token: str
    url: str
    media_type: str


class DictionaryResponse(BaseModel):
    items: list[DictionaryItem]


def _media_type_for(suffix: str) -> str:
    s = suffix.lower()
    if s == ".gif":
        return "gif"
    if s == ".mp4":
        return "mp4"
    return "img"


@router.get("/dictionary", response_model=DictionaryResponse)
def dictionary() -> DictionaryResponse:
    settings = get_settings()

    items: list[DictionaryItem] = []
    if not settings.assets_dir.exists():
        return DictionaryResponse(items=[])

    for p in settings.assets_dir.rglob("*"):
        if not p.is_file():
            continue

        rel_parts = p.relative_to(settings.assets_dir).parts
        if any(part.startswith(".") for part in rel_parts):
            continue
        if p.suffix.lower() not in _SUPPORTED:
            continue

        token = p.stem.upper().strip().replace(" ", "_")
        rel = p.relative_to(settings.assets_dir).as_posix()
        items.append(DictionaryItem(token=token, url=f"/assets/{rel}", media_type=_media_type_for(p.suffix)))

    items.sort(key=lambda i: i.token)
    return DictionaryResponse(items=items)


@router.get("/placeholder/{token}.gif")
def placeholder_gif(token: str) -> Response:
    settings = get_settings()

    safe = "".join(c for c in token.upper().strip() if (c.isalnum() or c in {"_", "-"}))
    safe = (safe[:64] or "EMPTY")

    # Generate placeholder in-memory.
    tmp_dir = settings.assets_dir / ".placeholders"
    out_path = tmp_dir / f"{safe}.gif"
    generate_ai_fallback_gif(safe, out_path)
    data = out_path.read_bytes()

    return Response(content=data, media_type="image/gif")


import json
import re
from signaction.nlp import _load_nlp

_YT_DICT_CACHE = None

def _build_semantic_dictionary(raw_dict: dict) -> dict:
    nlp = _load_nlp()
    semantic_dict = {}

    for raw_key, record in raw_dict.items():
        # 1. Clean the key (remove (sign 1), sign 2, numbers, parentheses)
        clean = raw_key.lower().strip()
        clean = re.sub(r"\(.*?\)", "", clean)
        clean = re.sub(r"\bsign\s+\d+\b", "", clean)
        clean = re.sub(r"\b\d+\b", "", clean)
        clean = clean.strip()
        
        # 2. Split by commas/slashes to find synonyms
        synonyms = [s.strip() for s in re.split(r"[,/]", clean) if s.strip()]
        
        # Add the raw key itself to preserve exact lookups
        synonyms.append(raw_key.lower().strip())
        
        for syn in synonyms:
            # Map the clean synonym phrase itself
            semantic_dict[syn] = record
            
            # 3. Use SpaCy to extract lemmas for each individual word
            doc = nlp(syn)
            for token in doc:
                if token.is_space or token.is_punct or token.is_stop:
                    continue
                lemma = (token.lemma_ or "").strip().lower()
                if lemma and lemma != "-pron-":
                    # Map the lemma
                    if lemma not in semantic_dict:
                        semantic_dict[lemma] = record
                
                # Also map the raw word token
                word = token.text.strip().lower()
                if word and word not in semantic_dict:
                    semantic_dict[word] = record

    return semantic_dict

def get_youtube_dictionary() -> dict:
    global _YT_DICT_CACHE
    if _YT_DICT_CACHE is not None:
        return _YT_DICT_CACHE

    # Use the pre-built static dictionary.json from frontend/public instead
    # of building a semantic dictionary at runtime (which is too slow)
    repo_root = Path(__file__).resolve().parents[2]
    dict_json = repo_root / "frontend" / "public" / "dictionary.json"
    if dict_json.exists():
        try:
            with open(dict_json, "r", encoding="utf-8") as f:
                data = json.load(f)
            items = data.get("items", [])
            _YT_DICT_CACHE = {item["token"].lower(): {"youtubeUrl": item["url"]} for item in items}
            return _YT_DICT_CACHE
        except Exception:
            return {}
    return {}
