#!/usr/bin/env python3
"""Test script to verify backend API response format and GIF generation."""

import json
import base64
import sys
from pathlib import Path

# Add the signaction package to the path
sys.path.insert(0, str(Path(__file__).parent))

from signaction.config import default_config
from signaction.pipeline import run_text_to_sign_pipeline

# Test the pipeline
print("[TEST] Running text-to-sign pipeline for 'hello'...")
cfg = default_config()
result = run_text_to_sign_pipeline("hello", assets_dir=cfg.assets_dir)

print(f"[TEST] Result gloss: {result.gloss.gloss}")
print(f"[TEST] Result tokens: {result.gloss.tokens}")
print(f"[TEST] GIF bytes length: {len(result.gif_bytes)}")
print(f"[TEST] GIF starts with: {result.gif_bytes[:10]}")

# Test base64 encoding as done in the backend
gif_b64 = base64.b64encode(result.gif_bytes).decode("ascii")
print(f"[TEST] Base64 length: {len(gif_b64)}")
print(f"[TEST] Base64 starts with: {gif_b64[:50]}")

# Create response as the backend would
response = {
    "text": "hello",
    "gloss": result.gloss.gloss,
    "tokens": result.gloss.tokens,
    "gif_base64": gif_b64,
}

print(f"\n[TEST] Response JSON size: {len(json.dumps(response))}")
print(f"[TEST] Response structure: {json.dumps({k: (type(v).__name__, len(str(v)) if isinstance(v, str) else len(v) if isinstance(v, list) else v) for k, v in response.items()})}")

# Test data URI
data_uri = f"data:image/gif;base64,{gif_b64}"
print(f"\n[TEST] Data URI length: {len(data_uri)}")
print(f"[TEST] Data URI starts with: {data_uri[:80]}")

# Verify it's valid GIF
if result.gif_bytes[:6] in {b"GIF87a", b"GIF89a"}:
    print("\n[SUCCESS] GIF header is valid!")
else:
    print(f"\n[ERROR] Invalid GIF header: {result.gif_bytes[:6]}")

print(f"\n[TEST] Complete! Response would contain:")
print(f"  - gloss: {result.gloss.gloss}")
print(f"  - tokens: {len(result.gloss.tokens)} tokens")
print(f"  - gif_base64: {len(gif_b64)} character string")
