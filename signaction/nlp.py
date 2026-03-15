from __future__ import annotations

import re
from functools import lru_cache
import spacy

# FIX 1: safer import (prevents relative import error)
try:
    from .types import GlossResult
except ImportError:
    from types import SimpleNamespace as GlossResult


@lru_cache(maxsize=1)
def _load_nlp() -> spacy.language.Language:
    """Load NLP pipeline."""

    try:
        return spacy.load("en_core_web_sm")
    except OSError:
        # fallback if model not installed
        nlp = spacy.blank("en")
        if "sentencizer" not in nlp.pipe_names:
            nlp.add_pipe("sentencizer")
        return nlp


_PRONOUN_MAP = {
    "i": "ME",
    "me": "ME",
    "my": "MY",
    "mine": "MINE",
    "you": "YOU",
    "your": "YOUR",
    "yours": "YOURS",
    "we": "WE",
    "us": "US",
    "our": "OUR",
    "they": "THEY",
    "them": "THEM",
    "their": "THEIR",
}

_WH_WORDS = {"who", "what", "where", "when", "why", "how"}
_NEGATION_WORDS = {"not", "no", "never"}
_AUXILIARIES = {"am", "is", "are", "was", "were", "be", "been", "being", "do", "does", "did"}


def normalize_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    return text


def glossify(
    text: str,
    *,
    remove_stopwords: bool = True,
    lemmatize: bool = True,
    drop_fillers: bool = True,
) -> GlossResult:

    original_text = text
    normalized = normalize_text(text)

    if not normalized:
        return GlossResult(
            original_text=original_text,
            normalized_text=normalized,
            tokens=[],
            gloss=""
        )

    nlp = _load_nlp()
    doc = nlp(normalized)

    tokens: list[str] = []

    for t in doc:
        if t.is_space or t.is_punct:
            continue

        lower = t.text.lower()

        if drop_fillers and lower in {"um", "uh", "like"}:
            continue

        if remove_stopwords and t.is_stop:
            if lower in (_NEGATION_WORDS | _WH_WORDS | _PRONOUN_MAP.keys() | _AUXILIARIES | {"name"}):
                pass
            else:
                continue

        if lower in _PRONOUN_MAP:
            out = _PRONOUN_MAP[lower]

        else:
            if lower in _AUXILIARIES:
                out = t.text

            elif lemmatize:
                lemma = (t.lemma_ or "").strip()

                # FIX 2: blank pipeline returns empty lemma
                if not lemma or lemma == "-PRON-":
                    out = t.text
                else:
                    out = lemma
            else:
                out = t.text

            out = out.upper()

        out = out.replace("'", "")

        if out in {"-PRON-", ""}:
            continue

        tokens.append(out)

    gloss = " ".join(tokens)

    return GlossResult(
        original_text=original_text,
        normalized_text=normalized,
        tokens=tokens,
        gloss=gloss,
    )