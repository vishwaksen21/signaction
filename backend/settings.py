from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    assets_dir: Path
    cors_origins: list[str]


def load_env_file(repo_root: Path) -> None:
    env_path = repo_root / ".env"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("'\"")
                        if k:
                            os.environ.setdefault(k, v)
        except Exception:
            pass


def get_settings() -> Settings:
    repo_root = Path(__file__).resolve().parents[1]
    load_env_file(repo_root)

    assets_dir = Path(os.environ.get("SIGNACTION_ASSETS_DIR", repo_root / "signaction_assets"))

    cors_raw = os.environ.get("SIGNACTION_CORS_ORIGINS", "*").strip()
    cors_origins = ["*"] if cors_raw == "*" else [o.strip() for o in cors_raw.split(",") if o.strip()]

    return Settings(assets_dir=assets_dir, cors_origins=cors_origins)
