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
API_ROUTES_BACKUP_DIR=".tmp-api-routes"
mkdir -p "$API_ROUTES_BACKUP_DIR"

restore_api_routes() {
  if [ -d "$API_ROUTES_BACKUP_DIR" ]; then
    echo "=== Restoring API routes ==="
    for route in "${API_ROUTES[@]}"; do
      src="$API_ROUTES_BACKUP_DIR/$route"
      if [ -f "$src" ]; then
        mkdir -p "$(dirname "$route")"
        mv "$src" "$route"
        echo "  Restored: $route"
      fi
    done
    rm -rf "$API_ROUTES_BACKUP_DIR"
  fi
}
trap restore_api_routes EXIT

for route in "${API_ROUTES[@]}"; do
  if [ -f "$route" ]; then
    dir=$(dirname "$route")
    mkdir -p "$API_ROUTES_BACKUP_DIR/$dir"
    mv "$route" "$API_ROUTES_BACKUP_DIR/$route"
    echo "  Moved: $route"
  fi
done

echo "=== Step 2: Next.js static export ==="
NEXT_EXPORT=true npx next build

echo "=== Step 3: Restore API routes ==="
restore_api_routes
trap - EXIT

# Exclude non-app artifacts (self-APK & LaTeX manuscripts) from static output and APK assets
rm -f out/signaction.apk
find out -name "*.tex" -delete 2>/dev/null || true
rm -f android/app/src/main/assets/public/signaction.apk
find android/app/src/main/assets/public -name "*.tex" -delete 2>/dev/null || true

echo "=== Step 4: Capacitor sync ==="
npx cap sync android

# Ensure signaction.apk and .tex files are excluded after sync
rm -f android/app/src/main/assets/public/signaction.apk
find android/app/src/main/assets/public -name "*.tex" -delete 2>/dev/null || true

# Ensure WebViewLocalServer has range request fix for video playback
python3 ../scripts/patch_webview_local_server.py

echo "=== Step 5: Build Android APK ==="
if [ -d "/opt/homebrew/opt/openjdk@21" ]; then
  export JAVA_HOME="/opt/homebrew/opt/openjdk@21"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

cd android
./gradlew assembleDebug -Dorg.gradle.java.home="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21}"

APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$APK_PATH" ]; then
  echo ""
  echo "=== APK built successfully ==="
  echo "Location: android/$APK_PATH"
  echo "Size: $(du -h "$APK_PATH" | cut -f1)"
  cp "$APK_PATH" "../public/signaction.apk"
  echo "Updated public/signaction.apk"
else
  echo "ERROR: APK not found at $APK_PATH"
  exit 1
fi
