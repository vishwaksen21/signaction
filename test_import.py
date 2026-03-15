#!/usr/bin/env python3
"""Quick test to verify the pipeline works."""

from pathlib import Path
from signaction.pipeline import run_text_to_sign_pipeline

assets_dir = Path("./signaction_assets")

try:
    print("Testing: 'hello' -> sign pipeline...")
    result = run_text_to_sign_pipeline("hello", assets_dir=assets_dir)
    print(f"✅ Success!")
    print(f"   Gloss: {result.gloss.gloss}")
    print(f"   Tokens: {result.gloss.tokens}")
    print(f"   GIF size: {len(result.gif_bytes)} bytes")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
