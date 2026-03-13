from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


@dataclass(frozen=True)
class AppConfig:
    assets_dir: Path
    vosk_model_dir: Path | None


def default_config() -> AppConfig:
    # A project-local assets cache that is safe to commit-ignore.
    repo_root = Path(__file__).resolve().parents[1]
    assets_dir = Path(os.environ.get("SIGNACTION_ASSETS_DIR", repo_root / "signaction_assets"))

    # Optional: user downloads a Vosk model and points this at it.
    vosk_model_dir = None
    return AppConfig(assets_dir=assets_dir, vosk_model_dir=vosk_model_dir)
