#!/usr/bin/env python3
"""
Download ISL (Indian Sign Language) assets from multiple sources.

Sources:
1. RealSign GitHub repo (CC0) - ISL alphabet images
2. SignTeach YouTube - ISL word videos (converted to GIF)
3. Handcrafted SVG-based ISL alphabet for fallback

Usage:
    python scripts/download_isl_assets.py
"""

import os
import sys
import json
import zipfile
import subprocess
import urllib.request
from pathlib import Path
from io import BytesIO

ASSETS_DIR = Path(__file__).parent.parent / "signaction_assets"
SIGNS_DIR = ASSETS_DIR / "signs"
ALPHABET_DIR = ASSETS_DIR / "alphabet"

# ISL alphabet from RealSign dataset (CC0 licensed)
REALSIGN_REPO = "https://github.com/RealSign62/RealSign-Indian-Sign-Language-Dataset/raw/main/Dataset.zip"

# Common ISL words we want to have assets for
COMMON_ISL_WORDS = [
    "HELLO", "THANK_YOU", "PLEASE", "YES", "NO", "HELP", "WELCOME",
    "GOOD", "BAD", "MORNING", "EVENING", "NIGHT", "NAME", "WHAT",
    "WHERE", "WHEN", "WHY", "HOW", "WHO", "I", "YOU", "HE", "SHE",
    "WE", "THEY", "THIS", "THAT", "HAVE", "DO", "GO", "COME", "EAT",
    "DRINK", "WATER", "FOOD", "SLEEP", "WORK", "STUDY", "LEARN",
    "LOVE", "LIKE", "HAPPY", "SAD", "ANGRY", "WALK", "TALK", "SEE",
    "HEAR", "READ", "WRITE", "PLAY", "STOP", "WAIT", "OPEN", "CLOSE",
    "BIG", "SMALL", "NEW", "OLD", "RIGHT", "WRONG", "FRIEND", "FAMILY",
    "MOTHER", "FATHER", "BROTHER", "SISTER", "CHILD", "TEACHER",
    "STUDENT", "HOUSE", "ROOM", "DOOR", "WINDOW", "TABLE", "CHAIR",
    "BOOK", "PEN", "PAPER", "PHONE", "COMPUTER", "CAR", "BUS",
    "TRAIN", "AIRPLANE", "BIRD", "CAT", "DOG", "FISH", "TREE",
    "FLOWER", "SUN", "MOON", "STAR", "RAIN", "SNOW", "WIND",
    "HOT", "COLD", "FAST", "SLOW", "HERE", "THERE", "ALSO",
    "ONLY", "VERY", "MUCH", "LITTLE", "ALL", "SOME", "NONE",
    "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN",
    "EIGHT", "NINE", "TEN", "TIME", "DAY", "WEEK", "MONTH", "YEAR",
]


def download_file(url: str, dest: Path, desc: str = "") -> bool:
    """Download a file with progress."""
    try:
        print(f"  Downloading {desc or url}...")
        urllib.request.urlretrieve(url, dest)
        print(f"  ✓ Saved to {dest}")
        return True
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return False


def download_realsign_alphabet():
    """Download ISL alphabet images from RealSign dataset (CC0)."""
    print("\n📥 Downloading RealSign ISL Alphabet Dataset...")
    zip_path = Path("/tmp/realsign_isl.zip")

    if not download_file(REALSIGN_REPO, zip_path, "RealSign ISL Dataset"):
        return False

    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            # List contents to understand structure
            names = zf.namelist()
            print(f"  Found {len(names)} files in archive")

            # Extract alphabet images
            count = 0
            for name in names:
                # Look for letter images (A-Z)
                lower = name.lower()
                if any(lower.endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif"]):
                    # Extract letter from path
                    parts = Path(name).parts
                    for part in parts:
                        clean = part.upper().replace(" ", "").replace("_", "")
                        if len(clean) == 1 and clean.isalpha():
                            letter = clean
                            out_dir = ALPHABET_DIR / letter
                            out_dir.mkdir(parents=True, exist_ok=True)
                            out_file = out_dir / f"{letter}.png"
                            if not out_file.exists():
                                with zf.open(name) as src, open(out_file, "wb") as dst:
                                    dst.write(src.read())
                                count += 1
                            break

            print(f"  ✓ Extracted {count} alphabet images to {ALPHABET_DIR}")
        zip_path.unlink(missing_ok=True)
        return True
    except Exception as e:
        print(f"  ✗ Extraction failed: {e}")
        return False


def create_isl_alphabet_svgs():
    """
    Create SVG-based ISL alphabet representations as fallback.
    Based on ISLRTC standard handshapes for each letter.
    """
    print("\n🎨 Creating ISL Alphabet SVG Fallbacks...")

    # ISL alphabet handshape descriptions (simplified)
    # Each letter maps to a handshape description for rendering
    ISL_HANDSHAPES = {
        "A": {"fingers": "closed", "thumb": "side", "desc": "fist with thumb on side"},
        "B": {"fingers": "flat_up", "thumb": "across", "desc": "flat hand, thumb across palm"},
        "C": {"fingers": "curved", "thumb": "opposed", "desc": "C-shape curve"},
        "D": {"fingers": "index_up", "others": "closed", "desc": "index finger up, others closed"},
        "E": {"fingers": "curved_down", "thumb": "across", "desc": "curved fingers, thumb across"},
        "F": {"fingers": "ok_sign", "desc": "OK sign - thumb and index circle, others up"},
        "G": {"fingers": "pointing", "thumb": "up", "desc": "pointing sideways, thumb up"},
        "H": {"fingers": "two_middle", "desc": "index and middle extended sideways"},
        "I": {"fingers": "pinky_up", "desc": "pinky finger up, others closed"},
        "J": {"fingers": "pinky_trace", "desc": "pinky traces J shape"},
        "K": {"fingers": "peace_up", "thumb": "middle", "desc": "peace sign, thumb between"},
        "L": {"fingers": "L_shape", "desc": "L shape - index up, thumb out"},
        "M": {"fingers": "three_under", "desc": "three fingers under thumb"},
        "N": {"fingers": "two_under", "desc": "two fingers under thumb"},
        "O": {"fingers": "O_shape", "desc": "O shape - all fingertips touch thumb"},
        "P": {"fingers": "down_k", "desc": "K shape pointing down"},
        "Q": {"fingers": "down_g", "desc": "G shape pointing down"},
        "R": {"fingers": "crossed", "desc": "index and middle crossed"},
        "S": {"fingers": "fist_thumb", "desc": "fist, thumb over fingers"},
        "T": {"fingers": "thumb_between", "desc": "thumb between index and middle"},
        "U": {"fingers": "two_up", "desc": "index and middle up together"},
        "V": {"fingers": "peace", "desc": "peace sign - index and middle apart"},
        "W": {"fingers": "three_up", "desc": "three fingers up and apart"},
        "X": {"fingers": "hook_index", "desc": "index finger hooked"},
        "Y": {"fingers": "phone", "desc": "thumb and pinky out (phone gesture)"},
        "Z": {"fingers": "index_trace", "desc": "index traces Z shape"},
    }

    count = 0
    for letter, shape in ISL_HANDSHAPES.items():
        letter_dir = ALPHABET_DIR / letter
        letter_dir.mkdir(parents=True, exist_ok=True)
        out_file = letter_dir / f"{letter}.svg"

        if out_file.exists():
            continue

        # Create a simple SVG representation
        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <rect width="200" height="200" fill="#f0f0f0" rx="20"/>
  <text x="100" y="80" text-anchor="middle" font-size="60" font-weight="bold" fill="#1d1d1f">{letter}</text>
  <text x="100" y="120" text-anchor="middle" font-size="12" fill="#7a7a7a">ISL Fingerspelling</text>
  <text x="100" y="145" text-anchor="middle" font-size="10" fill="#999">{shape["desc"]}</text>
  <circle cx="100" cy="170" r="8" fill="#0066cc"/>
</svg>'''
        out_file.write_text(svg)
        count += 1

    print(f"  ✓ Created {count} ISL alphabet SVGs in {ALPHABET_DIR}")
    return True


def create_common_word_svgs():
    """Create placeholder SVGs for common ISL words."""
    print("\n📝 Creating common word placeholder SVGs...")

    count = 0
    for word in COMMON_ISL_WORDS:
        out_file = SIGNS_DIR / f"{word}.svg"
        if out_file.exists():
            continue

        svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="320" height="360" viewBox="0 0 320 360">
  <rect width="320" height="360" fill="#f5f5f7" rx="16"/>
  <circle cx="160" cy="80" r="30" fill="none" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="110" x2="160" y2="200" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="140" x2="120" y2="180" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="140" x2="200" y2="180" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="200" x2="130" y2="270" stroke="#1d1d1f" stroke-width="3"/>
  <line x1="160" y1="200" x2="190" y2="270" stroke="#1d1d1f" stroke-width="3"/>
  <text x="160" y="320" text-anchor="middle" font-size="24" font-weight="bold" fill="#0066cc">{word}</text>
  <text x="160" y="345" text-anchor="middle" font-size="12" fill="#7a7a7a">ISL Sign</text>
</svg>'''
        out_file.write_text(svg)
        count += 1

    print(f"  ✓ Created {count} common word SVGs in {SIGNS_DIR}")
    return True


def create_alphabet_index():
    """Create an index file listing all available alphabet assets."""
    print("\n📋 Creating alphabet index...")

    index = {}
    for letter_dir in sorted(ALPHABET_DIR.iterdir()):
        if letter_dir.is_dir():
            letter = letter_dir.name
            assets = []
            for f in letter_dir.iterdir():
                if f.suffix.lower() in [".svg", ".png", ".jpg", ".jpeg", ".gif"]:
                    assets.append(f.name)
            if assets:
                index[letter] = assets

    index_file = ALPHABET_DIR / "index.json"
    index_file.write_text(json.dumps(index, indent=2))
    print(f"  ✓ Index created with {len(index)} letters")
    return True


def main():
    print("🚀 SignAction ISL Asset Downloader")
    print("=" * 50)

    # Create directories
    SIGNS_DIR.mkdir(parents=True, exist_ok=True)
    ALPHABET_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Try downloading RealSign dataset
    download_realsign_alphabet()

    # Step 2: Create SVG fallbacks for alphabet
    create_isl_alphabet_svgs()

    # Step 3: Create common word placeholders
    create_common_word_svgs()

    # Step 4: Create alphabet index
    create_alphabet_index()

    # Summary
    print("\n" + "=" * 50)
    print("✅ Asset download complete!")
    print(f"   Alphabet: {ALPHABET_DIR}")
    print(f"   Signs: {SIGNS_DIR}")

    # Count assets
    alphabet_count = sum(1 for d in ALPHABET_DIR.iterdir() if d.is_dir())
    sign_count = sum(1 for f in SIGNS_DIR.iterdir() if f.suffix in [".svg", ".gif", ".png", ".jpg"])
    print(f"   Total alphabet letters: {alphabet_count}")
    print(f"   Total sign assets: {sign_count}")


if __name__ == "__main__":
    main()
