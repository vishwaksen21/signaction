#!/usr/bin/env python3
from __future__ import annotations

import shutil
from pathlib import Path


def _pick_first_image(class_dir: Path) -> Path | None:
    if not class_dir.exists() or not class_dir.is_dir():
        return None

    for ext in (".jpg", ".jpeg", ".png"):
        files = sorted(class_dir.glob(f"*{ext}"))
        if files:
            return files[0]
    return None


def main() -> None:
    repo_root = Path(__file__).resolve().parents[1]
    kaggle_root = repo_root / ".kaggle_tmp" / "asl_alphabet_train" / "asl_alphabet_train"

    assets_dir = repo_root / "signaction_assets"
    out_alpha = assets_dir / "alphabet"
    out_alpha.mkdir(parents=True, exist_ok=True)

    if not kaggle_root.exists():
        raise SystemExit(
            f"Kaggle ASL alphabet dataset not found at: {kaggle_root}\n"
            "Expected the Kaggle dataset 'grassknoted/asl-alphabet' to be extracted under .kaggle_tmp/."
        )

    # Dataset class folders usually include A-Z plus SPACE, DEL, NOTHING.
    classes = [p for p in kaggle_root.iterdir() if p.is_dir()]
    if not classes:
        raise SystemExit(f"No class folders found under: {kaggle_root}")

    copied = 0
    for class_dir in sorted(classes, key=lambda p: p.name):
        name = class_dir.name.strip().upper()
        if len(name) == 1 and "A" <= name <= "Z":
            src = _pick_first_image(class_dir)
            if src is None:
                continue
            dst = out_alpha / f"{name}{src.suffix.lower()}"
            shutil.copyfile(src, dst)
            copied += 1

    print(f"Imported {copied} alphabet images into: {out_alpha}")
    print("Tip: type an unknown word like 'hello' in the main app to see fingerspelling.")


if __name__ == "__main__":
    main()
