#!/bin/bash
# Build the SignAction APK
# 1. Temporarily move API routes that are incompatible with static export
# 2. Build Next.js as static export
# 3. Restore API routes
# 4. Sync Capacitor
# 5. Build Android APK

set -e

cd "$(dirname "$0")"

# Routes that use server features (req.headers, dynamic, etc.) and can't be statically exported
API_ROUTES=(
  "app/health/route.ts"
  "app/translate-text/route.ts"
  "app/translate-speech/route.ts"
  "app/download-apk/route.ts"
  "app/api/dictionary/route.ts"
  "app/api/vosk-model/route.ts"
)

echo "=== Step 1: Temporarily move API routes ==="
TMPDIR=".tmp-api-routes"
mkdir -p "$TMPDIR"
for route in "${API_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    dir=$(dirname "$route")
    mkdir -p "$TMPDIR/$dir"
    mv "$route" "$TMPDIR/$route"
    echo "  Moved: $route"
  fi
done

echo "=== Step 2: Next.js static export ==="
NEXT_EXPORT=true npx next build

echo "=== Step 3: Restore API routes ==="
for route in "${API_ROUTES[@]}"; do
  src="$TMPDIR/$route"
  if [ -f "$src" ]; then
    mkdir -p "$(dirname "$route")"
    mv "$src" "$route"
    echo "  Restored: $route"
  fi
done
rm -rf "$TMPDIR"

echo "=== Step 4: Capacitor sync ==="
npx cap sync android

echo "=== Step 5: Build Android APK ==="
cd android
./gradlew assembleDebug

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo ""
  echo "=== APK built successfully ==="
  echo "Location: android/$APK_PATH"
  echo "Size: $(du -h "$APK_PATH" | cut -f1)"
else
  echo "ERROR: APK not found at $APK_PATH"
  exit 1
fi
