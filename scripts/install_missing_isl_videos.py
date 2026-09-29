#!/usr/bin/env python3
"""
Install Missing ISL Sign Language Videos for SignAction.

Cross-references the core Indian Sign Language vocabulary with the verified
ISLRTC sign language video repository (sign_videos.json) and downloads/installs
high-definition MP4 videos directly into the app's local asset directory.

Updates:
1. frontend/public/assets/signs/
2. signaction_assets/signs/
3. frontend/lib/asset-resolver.ts (KNOWN_SIGN_TOKENS)
4. frontend/public/dictionary.json
5. frontend/lib/offline-setup.ts
6. signaction_assets/asset_index.json
"""

import concurrent.futures
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PUBLIC_SIGNS_DIR = REPO_ROOT / "frontend" / "public" / "assets" / "signs"
SIGNACTION_ASSETS_DIR = REPO_ROOT / "signaction_assets" / "signs"
SIGN_VIDEOS_PATH = REPO_ROOT / "sign_videos.json"
TEMP_DIR = Path("/tmp/isl_video_install")

def get_target_words() -> list[tuple[str, str]]:
    """Determine target words missing from app that have verified ISL videos."""
    existing = {f.stem.upper() for f in PUBLIC_SIGNS_DIR.glob("*.mp4")}

    with open(SIGN_VIDEOS_PATH, "r", encoding="utf-8") as f:
        sign_videos = json.load(f)

    # Normalize lookup table
    yt_map: dict[str, str] = {}
    for k, v in sign_videos.items():
        norm = k.upper().strip().replace(" ", "_")
        url = v.get("youtubeUrl") or (f"https://www.youtube.com/watch?v={v['videoId']}" if "videoId" in v else None)
        if not url:
            continue
        yt_map[norm] = url
        if "_SIGN_" in norm:
            base = norm.split("_SIGN_")[0]
            if base not in yt_map:
                yt_map[base] = url

    # Read vocabulary from download_isl_datasets.py & download_isl_assets.py
    vocab_words = set()
    script1 = REPO_ROOT / "scripts" / "download_isl_datasets.py"
    if script1.exists():
        vocab_words |= set(re.findall(r'\"([A-Z0-9_]{2,})\"', script1.read_text()))

    script2 = REPO_ROOT / "scripts" / "download_isl_assets.py"
    if script2.exists():
        vocab_words |= set(re.findall(r'\"([A-Z0-9_]{2,})\"', script2.read_text()))

    # Additional high-value everyday communication words
    essential_words = [
        "WATER", "FOOD", "INDIA", "TEA", "COFFEE", "MILK", "BREAD", "RICE", "APPLE", "BANANA",
        "CARROT", "POTATO", "TOMATO", "EGG", "MEAT", "FISH", "FRUIT", "VEGETABLE", "BREAKFAST",
        "LUNCH", "DINNER", "FATHER", "MOTHER", "BROTHER", "SISTER", "BABY", "CHILD", "FAMILY",
        "FRIEND", "DOCTOR", "HOSPITAL", "MEDICINE", "NURSE", "POLICE", "TEACHER", "STUDENT",
        "SCHOOL", "COLLEGE", "BOOK", "PEN", "PENCIL", "PAPER", "BAG", "CHAIR", "TABLE", "BED",
        "ROOM", "DOOR", "WINDOW", "HOUSE", "BUILDING", "CAR", "BUS", "TRAIN", "BOAT", "BICYCLE",
        "ROAD", "STREET", "CITY", "VILLAGE", "SHOP", "MARKET", "MONEY", "BANK", "PHONE", "CAMERA",
        "COMPUTER", "LAPTOP", "INTERNET", "CLOCK", "WATCH", "SHIRT", "PANTS", "SHOES", "CLOTHES",
        "SUN", "MOON", "STAR", "SKY", "RAIN", "WIND", "TREE", "FLOWER", "DOG", "CAT", "COW",
        "HORSE", "BIRD", "BIG", "SMALL", "HOT", "COLD", "FAST", "SLOW", "NEW", "OLD", "GOOD",
        "BAD", "CLEAN", "DIRTY", "EASY", "HARD", "TRUE", "FALSE", "RICH", "POOR", "HAPPY", "SAD",
        "ANGRY", "TIRED", "SICK", "HEALTHY", "HUNGRY", "THIRSTY", "RED", "BLUE", "GREEN", "YELLOW",
        "BLACK", "WHITE", "ORANGE", "PINK", "BROWN", "PURPLE", "TODAY", "TOMORROW", "YESTERDAY",
        "MORNING", "AFTERNOON", "EVENING", "NIGHT", "WEEK", "MONTH", "YEAR", "TIME", "MINUTE",
        "HOUR", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
        "ZERO", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE", "TEN",
        "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN",
        "NINETEEN", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY",
        "HUNDRED", "THOUSAND", "MILLION", "GIVE", "TAKE", "MAKE", "GET", "FIND", "PUT", "LOOK",
        "LISTEN", "THINK", "KNOW", "WANT", "NEED", "OPEN", "CLOSE", "BUY", "SELL", "PAY", "RUN",
        "SIT", "STAND", "SLEEP", "READ", "WRITE", "COOK", "CLEAN", "MEET", "LOVE", "HATE", "WIN",
        "LOSE", "START", "FEEL", "HELP", "STOP", "WAIT", "CALL", "TALK", "WALK", "DRINK", "EAT"
    ]
    vocab_words |= set(essential_words)

    candidates: list[tuple[str, str]] = []
    for word in sorted(vocab_words):
        if word not in existing and word in yt_map:
            candidates.append((word, yt_map[word]))

    return candidates


def download_video(item: tuple[str, str]) -> tuple[str, bool, str]:
    """Download single ISL video with yt-dlp."""
    word, url = item
    dest_file = TEMP_DIR / f"{word}.mp4"

    if dest_file.exists() and dest_file.stat().st_size > 10000:
        return word, True, "cached"

    cmd = [
        "yt-dlp",
        "-f", "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
        "--no-playlist",
        "--quiet",
        "--no-warnings",
        "--output", str(dest_file),
        url
    ]

    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if res.returncode == 0 and dest_file.exists() and dest_file.stat().st_size > 10000:
            return word, True, "downloaded"
        return word, False, res.stderr[:100]
    except Exception as e:
        return word, False, str(e)


def sync_assets(installed_words: list[str]):
    """Copy downloaded videos to public and assets directories."""
    PUBLIC_SIGNS_DIR.mkdir(parents=True, exist_ok=True)
    SIGNACTION_ASSETS_DIR.mkdir(parents=True, exist_ok=True)

    copied = 0
    for word in installed_words:
        src = TEMP_DIR / f"{word}.mp4"
        if not src.exists():
            continue

        dest_pub = PUBLIC_SIGNS_DIR / f"{word}.mp4"
        dest_assets = SIGNACTION_ASSETS_DIR / f"{word}.mp4"

        shutil.copy2(src, dest_pub)
        shutil.copy2(src, dest_assets)
        copied += 1

    print(f"✓ Synchronized {copied} video files into frontend and signaction_assets directories.")


def update_frontend_dictionaries():
    """Update asset-resolver.ts, dictionary.json, offline-setup.ts, and asset_index.json."""
    all_files = sorted(PUBLIC_SIGNS_DIR.glob("*.mp4"))
    all_tokens = sorted({f.stem.upper() for f in all_files})

    print(f"\nUpdating app configuration with {len(all_tokens)} total sign assets...")

    # 1. Update frontend/lib/asset-resolver.ts
    resolver_file = REPO_ROOT / "frontend" / "lib" / "asset-resolver.ts"
    if resolver_file.exists():
        content = resolver_file.read_text(encoding="utf-8")
        tokens_json = json.dumps(all_tokens, indent=2)
        new_set = f"export const KNOWN_SIGN_TOKENS = new Set({tokens_json});"
        content = re.sub(
            r"export const KNOWN_SIGN_TOKENS = new Set\(\[[^\]]*\]\);",
            new_set,
            content,
            flags=re.DOTALL
        )
        resolver_file.write_text(content, encoding="utf-8")
        print("  ✓ Updated frontend/lib/asset-resolver.ts (KNOWN_SIGN_TOKENS)")

    # 2. Update frontend/public/dictionary.json
    dict_file = REPO_ROOT / "frontend" / "public" / "dictionary.json"
    dict_items = [
        {"token": token, "url": f"/assets/signs/{token}.mp4", "media_type": "mp4"}
        for token in all_tokens
    ]
    with open(dict_file, "w", encoding="utf-8") as f:
        json.dump({"items": dict_items}, f, indent=2)
    print(f"  ✓ Updated frontend/public/dictionary.json ({len(dict_items)} items)")

    # 3. Update frontend/lib/offline-setup.ts
    setup_file = REPO_ROOT / "frontend" / "lib" / "offline-setup.ts"
    if setup_file.exists():
        setup_content = setup_file.read_text(encoding="utf-8")
        asset_rel_paths = [f"signs/{token}.mp4" for token in all_tokens]
        asset_json = json.dumps(asset_rel_paths, indent=2)
        new_asset_list = f"export const ALL_ASSET_FILES: string[] = {asset_json};"
        setup_content = re.sub(
            r"export const ALL_ASSET_FILES: string\[\] = \[[^\]]*\];",
            new_asset_list,
            setup_content,
            flags=re.DOTALL
        )
        setup_file.write_text(setup_content, encoding="utf-8")
        print("  ✓ Updated frontend/lib/offline-setup.ts (ALL_ASSET_FILES)")

    # 4. Update signaction_assets/asset_index.json
    index_file = REPO_ROOT / "signaction_assets" / "asset_index.json"
    index_data = {
        "alphabet": {},
        "signs": {token: f"{token}.mp4" for token in all_tokens}
    }
    alpha_dir = REPO_ROOT / "signaction_assets" / "alphabet"
    if alpha_dir.exists():
        for f in sorted(alpha_dir.iterdir()):
            if f.suffix.lower() in (".svg", ".jpg", ".png"):
                index_data["alphabet"][f.stem.upper()] = f.name

    with open(index_file, "w", encoding="utf-8") as f:
        json.dump(index_data, f, indent=2)
    print("  ✓ Updated signaction_assets/asset_index.json")


def main():
    print("=" * 60)
    print("🚀 SignAction: Installing Missing ISL Sign Language Videos")
    print("=" * 60)

    TEMP_DIR.mkdir(parents=True, exist_ok=True)

    candidates = get_target_words()
    print(f"\nFound {len(candidates)} high-value ISL words available to install.")
    if not candidates:
        print("All target words are already installed!")
        sys.exit(0)

    print(f"Starting parallel download with 6 workers...\n")

    successful_words: list[str] = []
    failed_words: list[str] = []

    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
        future_to_word = {executor.submit(download_video, item): item[0] for item in candidates}
        total = len(candidates)
        completed = 0

        for future in concurrent.futures.as_completed(future_to_word):
            completed += 1
            word, success, status = future.result()
            if success:
                successful_words.append(word)
                print(f"[{completed}/{total}] ✓ Installed: {word} ({status})")
            else:
                failed_words.append(word)
                print(f"[{completed}/{total}] ✗ Failed: {word} ({status})")

    print("\n" + "=" * 60)
    print(f"Download Summary:")
    print(f"  Successfully downloaded: {len(successful_words)}")
    print(f"  Failed / Skipped: {len(failed_words)}")
    print("=" * 60)

    if successful_words:
        sync_assets(successful_words)
        update_frontend_dictionaries()
        print("\n🎉 All missing sign language videos successfully installed into SignAction!")


if __name__ == "__main__":
    main()
