from __future__ import annotations

from pathlib import Path

from signaction.lexicon import apply_phrase_mapping, load_lexicon_config


def test_default_phrase_mapping_collapses_tokens() -> None:
    tokens = ["THANK", "YOU"]
    cfg = load_lexicon_config(Path("./does_not_exist"))
    out = apply_phrase_mapping(tokens, cfg.phrases)
    assert out == ["THANK_YOU"]
