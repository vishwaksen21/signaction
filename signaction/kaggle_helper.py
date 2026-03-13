"""
Kaggle dataset utilities for SignAction.

Provides easy access to download and cache sign language datasets from Kaggle.
"""

from __future__ import annotations

import os
import subprocess
from pathlib import Path
from typing import Optional


class KaggleHelper:
    """Helper to manage Kaggle sign language datasets."""

    DATASETS = {
        "asl-alphabet": {
            "id": "grassknoted/asl-alphabet",
            "description": "ASL Alphabet (A-Z) fingerspelling dataset - Most reliable",
            "type": "images",
        },
        "asl-recognition": {
            "id": "deepcontractor/american-sign-language-characters",
            "description": "ASL Character recognition dataset",
            "type": "images",
        },
        "sign-language-mnist": {
            "id": "datamunge/sign-language-mnist",
            "description": "Sign Language MNIST - 28x28 grayscale images",
            "type": "images",
        },
    }

    @staticmethod
    def is_available() -> bool:
        """Check if Kaggle CLI is available and credentials are set."""
        try:
            subprocess.run(
                ["kaggle", "--version"],
                capture_output=True,
                check=True,
                timeout=5,
            )
            cred = Path.home() / ".kaggle" / "kaggle.json"
            return cred.exists()
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    @staticmethod
    def get_assets_dir() -> Path:
        """Get the configured assets directory, or default to ./signaction_assets."""
        assets_dir = os.environ.get("SIGNACTION_ASSETS_DIR")
        if assets_dir:
            return Path(assets_dir)
        return Path("signaction_assets")

    @staticmethod
    def list_datasets() -> dict:
        """Get available Kaggle datasets."""
        return KaggleHelper.DATASETS

    @staticmethod
    def download_dataset(
        dataset_key: str,
        output_dir: Optional[Path] = None,
        force: bool = False,
    ) -> bool:
        """
        Download a dataset from Kaggle.

        Args:
            dataset_key: Key of dataset to download (e.g., 'wlasl')
            output_dir: Where to save assets (default: from $SIGNACTION_ASSETS_DIR or ./signaction_assets)
            force: If True, overwrite existing files

        Returns:
            True if successful, False otherwise
        """
        if not KaggleHelper.is_available():
            print("Kaggle CLI not available. Install with: pip install kaggle")
            print("Then configure: https://www.kaggle.com/settings/account -> API Token")
            return False

        if dataset_key not in KaggleHelper.DATASETS:
            print(f"Unknown dataset: {dataset_key}")
            return False

        if output_dir is None:
            output_dir = KaggleHelper.get_assets_dir()

        output_dir.mkdir(parents=True, exist_ok=True)
        dataset = KaggleHelper.DATASETS[dataset_key]

        print(f"Downloading {dataset_key}...")
        try:
            subprocess.run(
                ["kaggle", "datasets", "download", "-d", dataset["id"], "-p", str(output_dir)],
                check=True,
                timeout=600,
            )
            print(f"✓ Downloaded to {output_dir}")
            return True
        except subprocess.CalledProcessError:
            print(f"✗ Failed to download {dataset_key}")
            return False

    @staticmethod
    def get_setup_instructions() -> str:
        """Get instructions for setting up Kaggle API."""
        return """
Kaggle API Setup:
1. Install: pip install kaggle
2. Go to https://www.kaggle.com/settings/account
3. Click "Create New API Token" (downloads kaggle.json)
4. Place in ~/.kaggle/kaggle.json (chmod 600)
5. Verify with: kaggle datasets list
"""


# Convenience functions
def download_wlasl(output_dir: Optional[Path] = None) -> bool:
    """Download WLASL dataset."""
    return KaggleHelper.download_dataset("wlasl", output_dir)


def download_asl_alphabet(output_dir: Optional[Path] = None) -> bool:
    """Download ASL alphabet dataset."""
    return KaggleHelper.download_dataset("asl-alphabet", output_dir)
