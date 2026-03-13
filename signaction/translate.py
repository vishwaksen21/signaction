from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from .lexicon import apply_aliases, apply_phrase_mapping, load_lexicon_config
from .mapping import SignLexicon
from .types import SignItem


@dataclass(frozen=True)
class TranslationResult:
    tokens: list[str]
    items: list[SignItem]


def _fingerspell_tokens(token: str) -> list[str]:
    # Keep only A-Z for a minimal baseline.
    letters = [c for c in token.upper() if "A" <= c <= "Z"]
    return letters if letters else [token]


def tokens_to_signs(
    tokens: list[str],
    *,
    assets_dir: Path,
    fingerspell_unknown: bool = True,
) -> TranslationResult:
    lex_cfg = load_lexicon_config(assets_dir)
    tokens = apply_aliases(tokens, lex_cfg.aliases)
    tokens = apply_phrase_mapping(tokens, lex_cfg.phrases)

    lexicon = SignLexicon(assets_dir=assets_dir)
    items: list[SignItem] = []

    for token in tokens:
        token = token.upper().strip()
        if not token:
            continue

        item = lexicon.resolve(token)
        if item is not None:
            items.append(item)
            continue

        # Unknown token fallback:
        # - If it looks like a word and no asset exists, expand into letters.
        if fingerspell_unknown and ("_" not in token) and token.isalpha() and len(token) > 1:
            for letter in _fingerspell_tokens(token):
                li = lexicon.resolve(letter)
                if li is None:
                    li = SignItem(
                        token=letter,
                        media_type="gif",
                        media_path=assets_dir / f"{letter}.gif",
                    )
                items.append(li)
            continue

        # Placeholder: treat as GIF sign item, renderer will generate.
        items.append(SignItem(token=token, media_type="gif", media_path=assets_dir / f"{token}.gif"))

    return TranslationResult(tokens=tokens, items=items)
