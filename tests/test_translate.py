from __future__ import annotations

from pathlib import Path

from signaction.translate import tokens_to_signs


def test_fingerspell_unknown_word_expands_letters(tmp_path: Path) -> None:
    # No assets exist; still should expand into per-letter SignItems.
    result = tokens_to_signs(["PYTHON"], assets_dir=tmp_path, fingerspell_unknown=True)
    assert [i.token for i in result.items] == list("PYTHON")
