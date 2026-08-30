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

_YT_DICT_CACHE = None

def get_youtube_dictionary() -> dict:
    global _YT_DICT_CACHE
    if _YT_DICT_CACHE is not None:
        return _YT_DICT_CACHE

    repo_root = Path(__file__).resolve().parents[2]
    json_path = repo_root / "sign_videos.json"
    if json_path.exists():
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                raw_dict = json.load(f)

            semantic_dict = {}
            for raw_key, record in raw_dict.items():
                title = record.get("title", "")
                if "private video" in title.lower() or "deleted video" in title.lower():
                    continue

                for text in (raw_key, title):
                    clean = text.lower().strip()
                    clean = re.sub(r"\(.*?\)", "", clean)
                    clean = re.sub(r"\bsign\s+\d+\b", "", clean)
                    clean = re.sub(r"\b\d+\b", "", clean)
                    clean = re.sub(r"[^a-z0-9\s,/;]", " ", clean)
                    clean = re.sub(r"\s+", " ", clean).strip()

                    # Split synonyms (commas, slashes, semicolons)
                    synonyms = [s.strip() for s in re.split(r"[,/;]", clean) if s.strip()]
                    if clean and clean not in synonyms:
                        synonyms.append(clean)

                    for syn in synonyms:
                        syn_norm = re.sub(r"\s+", " ", syn).strip()
                        if syn_norm and syn_norm not in semantic_dict:
                            semantic_dict[syn_norm] = {"youtubeUrl": record["youtubeUrl"]}
                        syn_under = syn_norm.replace(" ", "_")
                        if syn_under and syn_under not in semantic_dict:
                            semantic_dict[syn_under] = {"youtubeUrl": record["youtubeUrl"]}

            _YT_DICT_CACHE = semantic_dict
            return _YT_DICT_CACHE
        except Exception:
            return {}
    return {}
