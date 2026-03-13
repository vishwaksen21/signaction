from __future__ import annotations

import re
from functools import lru_cache

import spacy

from .types import GlossResult


@lru_cache(maxsize=1)
def _load_nlp() -> spacy.language.Language:
    """Load NLP pipeline.

    Preferred: `en_core_web_sm` for proper lemmatization.
    Fallback: `spacy.blank('en')` so the MVP still runs without model downloads.
    """

    try:
        return spacy.load("en_core_web_sm")
    except OSError:
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
    """Convert English text to a simplified sign-language-style 'gloss'.

    Notes:
    - Real sign language translation is non-trivial and language-dependent.
    - This is a rule-based baseline intended to be replaced by an ML/NLP model.
    """

    original_text = text
    normalized = normalize_text(text)
    if not normalized:
        return GlossResult(original_text=original_text, normalized_text=normalized, tokens=[], gloss="")

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
            # Keep negation (important) and wh-words.
            if lower in {"not", "no", "never", "who", "what", "where", "when", "why", "how"}:
                pass
            else:
                continue

        # Drop common auxiliaries ("is", "are", "do", etc.) to mimic a simple gloss.
        if lower in {"am", "is", "are", "was", "were", "be", "been", "being", "do", "does", "did"}:
            continue

        if lower in _PRONOUN_MAP:
            out = _PRONOUN_MAP[lower]
        else:
            if lemmatize:
                lemma = (t.lemma_ or "").strip()
                # Blank pipelines may return empty/unchanged lemmas; fall back to surface form.
                out = lemma if lemma and lemma != "-PRON-" else t.text
            else:
                out = t.text
            out = out.upper()

        # Basic cleanup for spacy lemma artifacts.
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
