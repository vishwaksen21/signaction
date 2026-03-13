#!/bin/bash
# Quick setup script to download Kaggle datasets and configure SignAction

set -e

echo "╔════════════════════════════════════════════════════╗"
echo "║     SignAction - Kaggle Dataset Setup Helper       ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "✗ Python 3 is required"
    exit 1
fi

# Ensure we're in the right directory
if [ ! -f "pyproject.toml" ]; then
    echo "✗ Please run this from the project root (where pyproject.toml is)"
    exit 1
fi

# Check for kaggle CLI
if ! command -v kaggle &> /dev/null; then
    echo "📦 Installing kaggle CLI..."
    pip install kaggle
fi

# Check for credentials
if [ ! -f "$HOME/.kaggle/kaggle.json" ]; then
    echo ""
    echo "⚠️  Kaggle credentials not found!"
    echo ""
    echo "Setup instructions:"
    echo "─────────────────────"
    echo "1. Go to: https://www.kaggle.com/settings/account"
    echo "2. Click 'Create New API Token'"
    echo "3. Place the downloaded kaggle.json in: ~/.kaggle/"
    echo "4. Run: chmod 600 ~/.kaggle/kaggle.json"
    echo ""
    read -p "Press Enter after setting up credentials, or Ctrl+C to exit..."
fi

# Verify credentials
if ! kaggle datasets list &> /dev/null; then
    echo "✗ Kaggle credentials not working"
    exit 1
fi

echo ""
echo "✓ Prerequisites configured!"
echo ""
echo "Available datasets:"
echo "─────────────────────"
python3 scripts/download_kaggle_dataset.py --list
echo ""
echo "To download, run:"
echo "  python3 scripts/download_kaggle_dataset.py --dataset wlasl"
echo ""
