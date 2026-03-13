from __future__ import annotations

from pathlib import Path

from signaction.placeholder_assets import generate_placeholder_gif


def main() -> None:
    assets_dir = Path("signaction_assets")
    signs_dir = assets_dir / "signs"
    alpha_dir = assets_dir / "alphabet"

    signs_dir.mkdir(parents=True, exist_ok=True)
    alpha_dir.mkdir(parents=True, exist_ok=True)

    # Alphabet placeholders (for fingerspelling fallback)
    for ch in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        generate_placeholder_gif(ch, alpha_dir / f"{ch}.gif")

    # A few common words/phrases
    for token in [
        "HELLO",
        "THANK_YOU",
        "YES",
        "NO",
        "GOOD_MORNING",
        "GOOD_NIGHT",
        "HOW_ARE_YOU",
    ]:
        generate_placeholder_gif(token, signs_dir / f"{token}.gif")

    print(f"Wrote demo assets under: {assets_dir}/")


if __name__ == "__main__":
    main()
