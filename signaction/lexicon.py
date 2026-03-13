from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class LexiconConfig:
    """Configurable phrase/alias mappings.

    Users can override/extend by placing `lexicon.json` in the assets dir.

    File format:
    {
      "aliases": {"HI": "HELLO"},
      "phrases": {"THANK YOU": "THANK_YOU"}
    }
    """

    aliases: dict[str, str]
    phrases: dict[str, str]


DEFAULT_ALIASES: dict[str, str] = {
    "HI": "HELLO",
    "OK": "OKAY",
    "U": "YOU",
    "YA": "YOU",
    "IM": "I",
}

DEFAULT_PHRASES: dict[str, str] = {
    "THANK YOU": "THANK_YOU",
    "GOOD MORNING": "GOOD_MORNING",
    "GOOD NIGHT": "GOOD_NIGHT",
    "SEE YOU": "SEE_YOU",
    "SEE YOU LATER": "SEE_YOU_LATER",
    "HOW ARE YOU": "HOW_ARE_YOU",
}


def _normalize_key(s: str) -> str:
    return " ".join(s.upper().strip().split())


def load_lexicon_config(assets_dir: Path) -> LexiconConfig:
    aliases = dict(DEFAULT_ALIASES)
    phrases = dict(DEFAULT_PHRASES)

    p = assets_dir / "lexicon.json"
    if p.exists():
        try:
            raw = json.loads(p.read_text(encoding="utf-8"))
            if isinstance(raw, dict):
                if isinstance(raw.get("aliases"), dict):
                    for k, v in raw["aliases"].items():
                        if isinstance(k, str) and isinstance(v, str):
                            aliases[_normalize_key(k)] = _normalize_key(v).replace(" ", "_")
                if isinstance(raw.get("phrases"), dict):
                    for k, v in raw["phrases"].items():
                        if isinstance(k, str) and isinstance(v, str):
                            phrases[_normalize_key(k)] = _normalize_key(v)
        except Exception:
            # If user config is malformed, fall back to defaults.
            pass

    return LexiconConfig(aliases=aliases, phrases=phrases)


def apply_aliases(tokens: list[str], aliases: dict[str, str]) -> list[str]:
    out: list[str] = []
    for t in tokens:
        key = _normalize_key(t)
        out.append(aliases.get(key, key))
    return out


def apply_phrase_mapping(tokens: list[str], phrases: dict[str, str]) -> list[str]:
    """Greedy longest-match phrase mapping over token list.

    Example: ["THANK", "YOU"] -> ["THANK_YOU"]
    """

    if not tokens:
        return []

    # Precompute phrase tokenization
    phrase_to_parts: list[tuple[list[str], str]] = []
    for phrase, out in phrases.items():
        parts = phrase.split()
        phrase_to_parts.append((parts, out.replace(" ", "_")))

    phrase_to_parts.sort(key=lambda x: len(x[0]), reverse=True)

    i = 0
    out_tokens: list[str] = []
    while i < len(tokens):
        matched = False
        for parts, out in phrase_to_parts:
            n = len(parts)
            if n == 0 or i + n > len(tokens):
                continue
            if tokens[i : i + n] == parts:
                out_tokens.append(out)
                i += n
                matched = True
                break
        if not matched:
            out_tokens.append(tokens[i])
            i += 1

    return out_tokens
