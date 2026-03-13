#!/bin/bash
# Clean up broken assets and re-download fresh

echo "🧹 Cleaning up broken symlinks..."
rm -rf signaction_assets .kaggle_tmp signaction_assets.zip 2>/dev/null

echo "✓ Cleaned"
echo ""
echo "📥 Re-downloading ASL Alphabet dataset..."
python3 scripts/download_kaggle_dataset.py --dataset asl-alphabet --output signaction_assets

echo ""
echo "✅ Download complete!"
echo ""
echo "Verifying assets..."
python3 scripts/check_assets.py
