from __future__ import annotations

from pathlib import Path

from signaction.pipeline import run_text_to_sign_pipeline


def test_pipeline_runs_and_returns_gif_bytes(tmp_path: Path) -> None:
    res = run_text_to_sign_pipeline("thank you", assets_dir=tmp_path)
    assert res.gif_bytes[:6] in {b"GIF87a", b"GIF89a"}
