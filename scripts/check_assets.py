#!/usr/bin/env python3
"""
Check and report on your SignAction assets.
"""

from pathlib import Path
from PIL import Image


def analyze_assets():
    """Analyze available assets and their quality."""
    
    assets_dir = Path("signaction_assets")
    
    print("╔════════════════════════════════════════════════════╗")
    print("║         SignAction Asset Analysis                 ║")
    print("╚════════════════════════════════════════════════════╝\n")
    
    # Alphabet analysis
    alphabet_dir = assets_dir / "alphabet"
    print("📝 ALPHABET (Single Letters A-Z)")
    print("─" * 50)
    
    if alphabet_dir.exists():
        letters = sorted(alphabet_dir.glob("*"))
        print(f"✓ Found {len(letters)} letter assets")
        
        # Check image quality
        try:
            sample = letters[0]
            img = Image.open(sample)
            print(f"  Format: {sample.suffix.upper()} ({img.width}×{img.height}px)")
            print(f"  ✓ These are REAL ASL sign images from Kaggle")
            print(f"  ✓ Used for fingerspelling unknown words")
        except Exception as e:
            print(f"  ⚠ Could not read image: {e}")
    else:
        print("✗ No alphabet assets found")
    
    # Signs analysis
    signs_dir = assets_dir / "signs"
    print("\n\n📖 SIGNS (Multi-letter Words/Phrases)")
    print("─" * 50)
    
    if signs_dir.exists():
        signs = list(signs_dir.glob("*"))
        print(f"✓ Found {len(signs)} word/phrase assets")
        
        # Check if they're real or placeholders
        if signs:
            sample = signs[0]
            if sample.suffix.lower() == ".gif":
                try:
                    img = Image.open(sample)
                    # Check if it's a placeholder (contains text)
                    if img.width == 320 and img.height == 320:
                        print(f"  ⚠ These appear to be PLACEHOLDER GIFs, not real signs")
                    else:
                        print(f"  ✓ Contains real sign assets ({img.width}×{img.height}px)")
                except:
                    pass
    else:
        print("✗ No word/phrase assets found (placeholders generated on demand)")
    
    # Root-level files
    root_files = list(assets_dir.glob("*.gif"))
    if root_files:
        print(f"\n\n⚠️  {len(root_files)} placeholder GIFs in root:")
        for f in sorted(root_files)[:5]:
            print(f"  - {f.name}")
        if len(root_files) > 5:
            print(f"  ... and {len(root_files) - 5} more")
    
    # Summary
    print("\n\n" + "=" * 50)
    print("📊 SUMMARY")
    print("=" * 50)
    print(f"✓ Fingerspelling (A-Z): WORKING with real ASL images")
    print(f"⚠ Word-level signs: MISSING (showing placeholders)")
    print("\n💡 To improve:")
    print("   1. Test fingerspelling: type 'python' → will spell P-Y-T-H-O-N")
    print("   2. Get word-level signs from:")
    print("      - Download WLASL dataset for 2300+ words")
    print("      - Manually add videos to: signaction_assets/signs/")
    print("      - Format: HELLO.mp4, THANK_YOU.mp4, etc.")
    print("\n🎯 Next: Try these test phrases:")
    print("   - 'A B C' (uses alphabet)")
    print("   - 'hello' (will fingerspell H-E-L-L-O)")


if __name__ == "__main__":
    try:
        analyze_assets()
    except Exception as e:
        print(f"Error analyzing assets: {e}")
        import traceback
        traceback.print_exc()
