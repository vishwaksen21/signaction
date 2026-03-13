"""
Download and organize sign language datasets from Kaggle.

This script uses the Kaggle API to download popular sign language datasets
and organizes them into the expected asset structure for SignAction.

Usage:
    python scripts/download_kaggle_dataset.py --dataset wlasl --output signaction_assets

Supported datasets:
    - wlasl: Word-Level American Sign Language (videos)
    - asl-recognition: ASL Recognition dataset (images/videos)
    - indian-sign-language: Indian Sign Language dataset
"""

import argparse
import json
import subprocess
import sys
import zipfile
import shutil
from pathlib import Path
from typing import Optional


KAGGLE_DATASETS = {
    "asl-alphabet": {
        "name": "grassknoted/asl-alphabet",
        "description": "ASL Alphabet dataset (A-Z fingerspellings) - Most reliable",
    },
    "asl-recognition": {
        "name": "deepcontractor/american-sign-language-characters",
        "description": "ASL Character recognition dataset",
    },
    "sign-language-mnist": {
        "name": "datamunge/sign-language-mnist",
        "description": "Sign Language MNIST - 28x28 grayscale images",
    },
}


def check_kaggle_installed() -> bool:
    """Check if kaggle CLI is installed."""
    try:
        subprocess.run(
            ["kaggle", "--version"],
            capture_output=True,
            check=True,
            timeout=5,
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False


def check_kaggle_credentials() -> bool:
    """Check if Kaggle API credentials are configured."""
    cred_file = Path.home() / ".kaggle" / "kaggle.json"
    return cred_file.exists()


def extract_zip_files(directory: Path) -> None:
    """Extract all zip files in a directory."""
    for zip_file in directory.glob("*.zip"):
        print(f"Extracting {zip_file.name}...")
        try:
            with zipfile.ZipFile(zip_file, 'r') as z:
                z.extractall(directory)
            zip_file.unlink()  # Remove zip after extraction
            print(f"✓ Extracted {zip_file.name}")
        except zipfile.BadZipFile:
            print(f"✗ Invalid zip file: {zip_file}")
        except Exception as e:
            print(f"✗ Error extracting {zip_file}: {e}")


def download_kaggle_dataset(dataset_key: str, output_dir: Path) -> bool:
    """Download a dataset from Kaggle using the CLI."""
    if dataset_key not in KAGGLE_DATASETS:
        print(f"Unknown dataset: {dataset_key}")
        print(f"Available datasets: {', '.join(KAGGLE_DATASETS.keys())}")
        return False

    dataset_path = KAGGLE_DATASETS[dataset_key]["name"]
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"Downloading {dataset_key} from Kaggle...")
    print(f"Dataset: {dataset_path}")
    print(f"Output: {output_dir}")

    try:
        subprocess.run(
            ["kaggle", "datasets", "download", "-d", dataset_path, "-p", str(output_dir)],
            check=True,
            capture_output=True,
            timeout=600,
        )
        print("✓ Download complete")
        
        # Extract zip files
        extract_zip_files(output_dir)
        
        return True
    except subprocess.CalledProcessError as e:
        # Provide better error messages
        error_msg = e.stderr.decode() if isinstance(e.stderr, bytes) else str(e.stderr)
        if "403" in error_msg or "Forbidden" in error_msg:
            print(f"✗ Download failed: 403 Forbidden")
            print("\n  Your Kaggle credentials are not configured properly!")
            print("  Run this diagnostic to fix it:")
            print("  python scripts/diagnose_kaggle.py")
        elif "404" in error_msg or "not found" in error_msg.lower():
            print(f"✗ Download failed: Dataset not found")
            print(f"  Check available datasets with:")
            print(f"  python scripts/download_kaggle_dataset.py --list")
        else:
            print(f"✗ Download failed: {e}")
        return False
    except FileNotFoundError:
        print("✗ kaggle CLI not found. Install with: pip install kaggle")
        return False
    except subprocess.TimeoutExpired:
        print("✗ Download timeout - dataset may be too large or connection too slow")
        return False


def extract_wlasl_videos(dataset_dir: Path, output_dir: Path) -> None:
    """Extract and organize WLASL videos into sign language assets.
    
    WLASL contains a JSON index with video paths. This extracts video metadata
    and creates symlinks or copies organized by token name.
    
    Note: WLASL is typically obtained via GitHub, not Kaggle.
    """
    json_file = dataset_dir / "WLASL_v0.3.json"
    if not json_file.exists():
        print(f"WLASL JSON index not found: {json_file}")
        print("Tip: WLASL is available on GitHub: https://github.com/dxli94/WLASL")
        return

    signs_dir = output_dir / "signs"
    signs_dir.mkdir(parents=True, exist_ok=True)

    print("Organizing WLASL videos...")
    try:
        with open(json_file) as f:
            entries = json.load(f)

        count = 0
        err_count = 0
        for entry in entries[:500]:  # Limit to first 500 for MVP
            gloss = entry.get("gloss", "").upper()
            if not gloss:
                continue

            # Find first video (usually highest quality)
            instances = entry.get("instances", [])
            if not instances:
                continue

            video_id = instances[0].get("video_id")
            if not video_id:
                continue

            # Video is typically at: url/download/<video_id>/mp4
            # For now, create a token mapping file
            video_path = dataset_dir / f"{video_id}.mp4"
            if video_path.exists():
                output_path = signs_dir / f"{gloss}.mp4"
                # Create symlink or copy
                try:
                    output_path.symlink_to(video_path)
                except (FileExistsError, OSError):
                    # If symlink fails, note it
                    pass
                count += 1

        print(f"✓ Organized {count} WLASL signs")
        if err_count > 0:
            print(f"  (⚠ {err_count} errors)")

    except json.JSONDecodeError as e:
        print(f"✗ Failed to parse WLASL JSON: {e}")


def organize_asl_alphabet(dataset_dir: Path, output_dir: Path) -> None:
    """Organize ASL alphabet dataset into alphabet folder.
    
    Expected structure: dataset has images/videos for A-Z letters.
    Supports nested directories and multiple image formats.
    """
    alphabet_dir = output_dir / "alphabet"
    alphabet_dir.mkdir(parents=True, exist_ok=True)

    print("Organizing ASL Alphabet dataset...")
    organized = 0

    # Search for all image files recursively
    for media in dataset_dir.rglob("*"):
        if not media.is_file():
            continue
        
        if media.suffix.lower() not in {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".mp4"}:
            continue
        
        # Try to match letter from filename or parent directory
        letter = None
        
        # Check filename: "A.jpg", "letter_A.jpg", etc.
        for char in media.stem.upper():
            if "A" <= char <= "Z":
                letter = char
                break
        
        # Check parent directory name: "A/", "letter_A/", etc.
        if not letter:
            for char in media.parent.name.upper():
                if "A" <= char <= "Z":
                    letter = char
                    break
        
        if letter and len(letter) == 1:
            output_path = alphabet_dir / f"{letter}{media.suffix.lower()}"
            try:
                # Skip if already exists (prefer first found)
                if not output_path.exists():
                    # Copy file instead of symlinking (more reliable)
                    shutil.copy2(media, output_path)
                    organized += 1
            except (FileExistsError, OSError, shutil.Error) as e:
                print(f"  ⚠ Could not copy {media.name}: {e}")

    print(f"✓ Organized {organized} alphabet signs")
    
    if organized == 0:
        print("  ⚠ No images found. Check dataset structure in:", dataset_dir)


def setup_kaggle_instructions() -> str:
    """Print instructions for setting up Kaggle API."""
    return """
Kaggle API Setup Instructions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Install kaggle-cli:
   pip install kaggle

2. Get API credentials:
   - Go to https://www.kaggle.com/settings/account
   - Click "Create New API Token"
   - This downloads kaggle.json

3. Place credentials in home directory:
   mkdir -p ~/.kaggle
   mv ~/Downloads/kaggle.json ~/.kaggle/
   chmod 600 ~/.kaggle/kaggle.json

4. Verify setup:
   kaggle datasets list

Then re-run this script!
"""


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Download sign language datasets from Kaggle for SignAction"
    )
    parser.add_argument(
        "--dataset",
        choices=list(KAGGLE_DATASETS.keys()),
        required=False,
        help="Which dataset to download",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("signaction_assets"),
        help="Output directory for assets (default: signaction_assets)",
    )
    parser.add_argument(
        "--no-download",
        action="store_true",
        help="Skip download, only organize existing files",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List available datasets",
    )

    args = parser.parse_args()

    if args.list:
        print("\nAvailable Kaggle Sign Language Datasets:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        for key, info in KAGGLE_DATASETS.items():
            print(f"\n{key}:")
            print(f"  Description: {info['description']}")
            print(f"  Dataset: {info['name']}")
        return

    if not args.dataset:
        parser.error("--dataset is required (use --list to see available datasets)")

    # Check requirements
    if not args.no_download:
        if not check_kaggle_installed():
            print("\n✗ kaggle CLI not installed")
            print(setup_kaggle_instructions())
            sys.exit(1)

        if not check_kaggle_credentials():
            print("\n✗ Kaggle credentials not configured")
            print(setup_kaggle_instructions())
            sys.exit(1)

        # Download
        temp_dir = Path(".kaggle_tmp")
        if not download_kaggle_dataset(args.dataset, temp_dir):
            sys.exit(1)
    else:
        temp_dir = args.output

    # Organize based on dataset type
    print(f"\nOrganizing assets into: {args.output}")
    if args.dataset == "wlasl":
        extract_wlasl_videos(temp_dir, args.output)
    elif args.dataset in ("asl-recognition", "asl-alphabet", "sign-language-mnist"):
        organize_asl_alphabet(temp_dir, args.output)
    else:
        print(f"Organization for {args.dataset} not yet implemented")

    # Update environment
    output_abs = args.output.resolve()
    print(f"\n✓ Assets ready at: {output_abs}")
    print(f"\nTo use these assets, set:")
    print(f"  export SIGNACTION_ASSETS_DIR='{output_abs}'")


if __name__ == "__main__":
    main()
