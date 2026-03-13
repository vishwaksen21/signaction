#!/usr/bin/env python3
"""
Download WLASL dataset from GitHub (not Kaggle) for word-level signs.

WLASL has ~2,300 words with real sign language video clips.
This script downloads the dataset and organizes it for SignAction.
"""

import subprocess
import sys
from pathlib import Path
from typing import Optional


def download_wlasl(output_dir: Optional[Path] = None) -> bool:
    """Download WLASL dataset from GitHub."""
    
    if output_dir is None:
        output_dir = Path("signaction_assets/signs")
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print("📥 Downloading WLASL dataset from GitHub...")
    print("   (This is a video dataset - requires video extra)")
    print("")
    
    # WLASL is hosted on GitHub
    wlasl_url = "https://github.com/dxli94/WLASL/releases/download/v0.3/WLASL_v0.3.json"
    
    try:
        # Download JSON index
        print("1. Downloading dataset index (metadata)...")
        subprocess.run(
            ["wget", "-q", wlasl_url, "-O", str(output_dir.parent / "WLASL_v0.3.json")],
            check=True,
            timeout=60,
        )
        print("   ✓ Index downloaded")
        
        # The actual videos need to be downloaded from the URLs in the JSON
        print("\n2. Note: Individual videos must be downloaded separately")
        print("   See: https://github.com/dxli94/WLASL for download instructions")
        print("\n   Alternative: Use smaller datasets like:")
        print("   - asl-alphabet (A-Z, already installed)")
        print("   - Download individual video datasets from Kaggle")
        
        return True
        
    except Exception as e:
        print(f"✗ Download failed: {e}")
        print("\nAlternative: Manually download from:")
        print("  https://github.com/dxli94/WLASL")
        return False


def show_current_assets() -> None:
    """Show what assets are currently available."""
    assets_dir = Path("signaction_assets")
    
    print("\n📊 Current Assets Summary:")
    print("=" * 50)
    
    # Alphabet
    alphabet_dir = assets_dir / "alphabet"
    if alphabet_dir.exists():
        images = list(alphabet_dir.glob("*"))
        print(f"✓ Alphabet: {len(images)} letters")
    else:
        print("✗ Alphabet: Not found")
    
    # Signs
    signs_dir = assets_dir / "signs"
    if signs_dir.exists():
        signs = list(signs_dir.glob("*"))
        print(f"✓ Signs (words): {len(signs)} words")
    else:
        print("✗ Signs (words): None yet")
    
    print("\n💡 To show real signs for words like 'HEY', 'THANK YOU', etc.:")
    print("   Download a word-level dataset:")
    print("   - WLASL (2300+ words, complex)")
    print("   - Or manually add word videos to: signaction_assets/signs/")
    print("   - Name them: HELLO.mp4, THANK_YOU.mp4, etc.")


if __name__ == "__main__":
    show_current_assets()
    print("\n" + "=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == "--download":
        download_wlasl()
    else:
        print("\nTo download WLASL, run:")
        print("  python scripts/download_wlasl.py --download")
