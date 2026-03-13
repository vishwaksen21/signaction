from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from functools import lru_cache
import os
import re

from .types import SignItem


@dataclass(frozen=True)
class SignLexicon:
    """Resolves tokens to local media assets.

    Expected asset naming (simple convention):
    - GIF:  <TOKEN>.gif
    - MP4:  <TOKEN>.mp4

    You can replace generated placeholder GIFs with real sign clips using the same filenames.
    """

    assets_dir: Path

    def ensure_dirs(self) -> None:
        self.assets_dir.mkdir(parents=True, exist_ok=True)

    @property
    def debug(self) -> bool:
        return os.environ.get("SIGNACTION_DEBUG", "").strip() in {"1", "true", "TRUE", "yes", "YES"}


_SUPPORTED_SUFFIXES = {".gif", ".mp4", ".png", ".jpg", ".jpeg"}


def _norm_key(s: str) -> str:
    s = s.upper().strip().replace(" ", "_")
    s = re.sub(r"[^A-Z0-9_]+", "", s)
    s = re.sub(r"_+", "_", s)
    return s


@lru_cache(maxsize=32)
def _build_asset_index(dir_path: str, mtime_ns: int) -> dict[str, Path]:
    """Index assets by normalized stem for fast, case-insensitive lookup."""
    assets_dir = Path(dir_path)
    index: dict[str, Path] = {}

    if not assets_dir.exists():
        return index

    for p in assets_dir.iterdir():
        if not p.is_file():
            continue
        if p.suffix.lower() not in _SUPPORTED_SUFFIXES:
            continue
        key = _norm_key(p.stem)
        if key:
            # Prefer GIF over others if duplicates exist
            if key in index and index[key].suffix.lower() == ".gif":
                continue
            index[key] = p

    return index


def _dir_mtime_ns(p: Path) -> int:
    try:
        return p.stat().st_mtime_ns
    except FileNotFoundError:
        return 0


def _search_dirs(base_dir: Path) -> list[Path]:
    """Search order for assets.

    Supports either:
    - flat folder: assets_dir/HELLO.gif
    - structured: assets_dir/signs/hello.gif and assets_dir/alphabet/h.gif
    """

    return [base_dir, base_dir / "signs", base_dir / "alphabet"]

    def resolve(self, token: str) -> SignItem | None:
        self.ensure_dirs()
        token = token.strip()
        if not token:
            return None

        key = _norm_key(token)

        # Try a couple common variants
        candidates = [key, _norm_key(key.replace("_", ""))]

        # Search structured datasets too. Prefer alphabet folder for single letters.
        dirs = _search_dirs(self.assets_dir)
        if len(key) == 1 and ("A" <= key <= "Z"):
            ordered_dirs = [self.assets_dir / "alphabet", self.assets_dir / "signs", self.assets_dir]
        else:
            ordered_dirs = [self.assets_dir / "signs", self.assets_dir, self.assets_dir / "alphabet"]

        found: Path | None = None
        found_in: Path | None = None

        for d in ordered_dirs:
            index = _build_asset_index(str(d), _dir_mtime_ns(d))
            for c in candidates:
                if not c:
                    continue
                found = index.get(c)
                if found is not None:
                    found_in = d
                    break
            if found is not None:
                break

        if self.debug:
            print(
                "[SIGNACTION_DEBUG] resolve "
                f"token={token!r} key={key!r} candidates={candidates} "
                f"searched={[str(p) for p in dirs]} found={str(found) if found else None} "
                f"found_in={str(found_in) if found_in else None}"
            )

        if found is None:
            return None

        suffix = found.suffix.lower()
        if suffix == ".gif":
            media_type = "gif"
        elif suffix == ".mp4":
            media_type = "mp4"
        else:
            media_type = "img"

        return SignItem(token=_norm_key(token), media_type=media_type, media_path=found)
