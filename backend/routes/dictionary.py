from __future__ import annotations

import io
from pathlib import Path

from fastapi import APIRouter
from fastapi.responses import Response
from pydantic import BaseModel

from signaction.placeholder_assets import generate_placeholder_gif

from ..settings import get_settings

router = APIRouter()


_SUPPORTED = {".gif", ".mp4", ".png", ".jpg", ".jpeg"}


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
    generate_placeholder_gif(safe, out_path)
    data = out_path.read_bytes()

    return Response(content=data, media_type="image/gif")
