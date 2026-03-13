#!/usr/bin/env python3
"""
SignAction Kaggle Asset Manager

Convenient CLI tool to manage sign language assets from Kaggle.
"""

import argparse
import sys
from pathlib import Path

from signaction.kaggle_helper import KaggleHelper


def cmd_list(args: argparse.Namespace) -> int:
    """List available datasets."""
    print("\n📊 Available Kaggle Datasets for SignAction")
    print("=" * 60)
    
    datasets = KaggleHelper.list_datasets()
    for key, info in datasets.items():
        print(f"\n🔹 {key}")
        print(f"   Description: {info['description']}")
        print(f"   Type: {info['type']}")
        print(f"   Usage: --dataset {key}")
    
    print("\n" + "=" * 60)
    return 0


def cmd_setup(args: argparse.Namespace) -> int:
    """Setup Kaggle credentials."""
    if KaggleHelper.is_available():
        print("✓ Kaggle is already configured!")
        return 0
    
    print(KaggleHelper.get_setup_instructions())
    return 1


def cmd_download(args: argparse.Namespace) -> int:
    """Download a dataset from Kaggle."""
    dataset = args.dataset
    output_dir = Path(args.output) if args.output else None
    
    if not dataset:
        print("✗ Please specify --dataset")
        print("Available datasets:")
        for key in KaggleHelper.list_datasets().keys():
            print(f"  - {key}")
        return 1
    
    print(f"\n📥 Downloading {dataset}...")
    if KaggleHelper.download_dataset(dataset, output_dir):
        print(f"✓ Success!")
        assets_dir = output_dir or KaggleHelper.get_assets_dir()
        print(f"\n📁 Assets location: {assets_dir.resolve()}")
        print(f"\n🚀 To use these assets, run:")
        print(f"   export SIGNACTION_ASSETS_DIR='{assets_dir.resolve()}'")
        print(f"   streamlit run mvp_text_to_sign.py")
        return 0
    else:
        print("✗ Download failed")
        return 1


def cmd_status(args: argparse.Namespace) -> int:
    """Check status of assets and Kaggle setup."""
    print("\n📋 SignAction Kaggle Status")
    print("=" * 60)
    
    # Check Kaggle
    if KaggleHelper.is_available():
        print("✓ Kaggle API: Configured")
    else:
        print("✗ Kaggle API: Not configured")
        print("  Run: signaction-kaggle setup")
    
    # Check assets
    assets_dir = KaggleHelper.get_assets_dir()
    if assets_dir.exists():
        print(f"✓ Assets directory: {assets_dir}")
        
        # Count files
        sign_files = list((assets_dir / "signs").glob("*")) if (assets_dir / "signs").exists() else []
        alpha_files = list((assets_dir / "alphabet").glob("*")) if (assets_dir / "alphabet").exists() else []
        
        print(f"  - Signs: {len(sign_files)} files")
        print(f"  - Alphabet: {len(alpha_files)} files")
    else:
        print(f"⁉ Assets directory not found: {assets_dir}")
    
    print("\n" + "=" * 60)
    return 0


def cmd_info(args: argparse.Namespace) -> int:
    """Show info about a specific dataset."""
    dataset = args.dataset
    datasets = KaggleHelper.list_datasets()
    
    if not dataset:
        print("✗ Please specify --dataset")
        return 1
    
    if dataset not in datasets:
        print(f"✗ Unknown dataset: {dataset}")
        return 1
    
    info = datasets[dataset]
    print(f"\n📖 Information: {dataset}")
    print("=" * 60)
    print(f"Description: {info['description']}")
    print(f"Type: {info['type']}")
    print(f"Dataset ID: {info['id']}")
    print("=" * 60)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="SignAction Kaggle Asset Manager",
        prog="signaction-kaggle",
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # list command
    subparsers.add_parser("list", help="List available datasets")
    
    # setup command
    subparsers.add_parser("setup", help="Setup Kaggle credentials")
    
    # download command
    download_parser = subparsers.add_parser("download", help="Download a dataset")
    download_parser.add_argument("--dataset", help="Dataset to download")
    download_parser.add_argument("--output", help="Output directory")
    
    # status command
    subparsers.add_parser("status", help="Check status of Kaggle setup and assets")
    
    # info command
    info_parser = subparsers.add_parser("info", help="Show info about a dataset")
    info_parser.add_argument("--dataset", help="Dataset to get info about")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 0
    
    if args.command == "list":
        return cmd_list(args)
    elif args.command == "setup":
        return cmd_setup(args)
    elif args.command == "download":
        return cmd_download(args)
    elif args.command == "status":
        return cmd_status(args)
    elif args.command == "info":
        return cmd_info(args)
    else:
        parser.print_help()
        return 1


if __name__ == "__main__":
    sys.exit(main())
