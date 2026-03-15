from __future__ import annotations

from signaction.nlp import glossify


def test_glossify_keeps_auxiliary_and_key_words() -> None:
    res = glossify("hello what is your name")

    # We don't assert exact full sequence (spaCy stopwords/lemmas can vary),
    # but these should not be dropped.
    assert "WHAT" in res.tokens
    assert "IS" in res.tokens
    assert "YOUR" in res.tokens
    assert "NAME" in res.tokens
    assert "BE" not in res.tokens
