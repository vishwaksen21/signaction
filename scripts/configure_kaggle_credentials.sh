#!/bin/bash
# Setup Kaggle API credentials securely

# This script should be run with your API key and secret
# Usage: bash configure_kaggle.sh <username> <api_key>

USERNAME="$1"
API_KEY="$2"

if [ -z "$USERNAME" ] || [ -z "$API_KEY" ]; then
    echo "Usage: bash configure_kaggle.sh <username> <api_key>"
    echo ""
    echo "Your Kaggle credentials are stored in ~/.kaggle/kaggle.json"
    exit 1
fi

# Create .kaggle directory if it doesn't exist
mkdir -p ~/.kaggle

# Create kaggle.json with credentials
cat > ~/.kaggle/kaggle.json << EOF
{"username":"$USERNAME","key":"$API_KEY"}
EOF

# Set secure permissions (owner read/write only)
chmod 600 ~/.kaggle/kaggle.json

echo "✓ Kaggle credentials configured in ~/.kaggle/kaggle.json"
echo "✓ Permissions set to 600 (secure)"
echo ""
echo "Testing connection..."
kaggle datasets list -s asl 2>/dev/null && echo "✓ Kaggle API connection successful!" || echo "⚠ Could not verify connection (kaggle CLI may not be installed)"
