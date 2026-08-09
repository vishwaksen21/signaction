import requests
import json
import re
import os
from pathlib import Path

# Load env variables from root .env if it exists
def load_env():
    repo_root = Path(__file__).resolve().parents[1]
    env_path = repo_root / ".env"
    if env_path.exists():
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#"):
                        continue
                    if "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip().strip("'\""))
        except Exception:
            pass

load_env()

# ==========================================
# CONFIGURATION
# ==========================================

API_KEY = os.environ.get("YOUTUBE_API_KEY", "")
PLAYLIST_ID = os.environ.get("YOUTUBE_PLAYLIST_ID", "")

BASE_URL = "https://www.googleapis.com/youtube/v3"


# ==========================================
# GET UPLOADS PLAYLIST
# ==========================================

def get_uploads_playlist_id():
    url = f"{BASE_URL}/channels"

    params = {
        "part": "contentDetails",
        "id": CHANNEL_ID,
        "key": API_KEY
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()

    if "items" not in data or len(data["items"]) == 0:
        raise Exception(
            "Channel not found. Check your CHANNEL_ID."
        )

    return (
        data["items"][0]
        ["contentDetails"]
        ["relatedPlaylists"]
        ["uploads"]
    )


# ==========================================
# GET ALL VIDEOS
# ==========================================

import time

def get_all_videos(playlist_id):
    videos = []
    next_page_token = None

    while True:
        params = {
            "part": "snippet,contentDetails",
            "playlistId": playlist_id,
            "maxResults": 50,
            "key": API_KEY
        }

        if next_page_token:
            params["pageToken"] = next_page_token

        response = None
        for attempt in range(1, 6):
            try:
                response = requests.get(
                    f"{BASE_URL}/playlistItems",
                    params=params,
                    timeout=15.0
                )
                response.raise_for_status()
                break
            except Exception as e:
                print(f"Connection issue on attempt {attempt}: {e}. Retrying in {attempt * 2} seconds...")
                time.sleep(attempt * 2)
        else:
            raise Exception("Failed to query YouTube API after 5 attempts.")

        data = response.json()

        for item in data.get("items", []):
            video_id = item["contentDetails"]["videoId"]
            title = item["snippet"]["title"]

            videos.append({
                "videoId": video_id,
                "title": title
            })

        print(f"Fetched {len(videos)} videos...")

        next_page_token = data.get("nextPageToken")

        if not next_page_token:
            break

        time.sleep(0.1)

    return videos


# ==========================================
# CONVERT TITLE TO WORD
# ==========================================

def normalize_title(title):

    title = title.strip()

    # Convert to lowercase
    title = title.lower()

    # Remove common prefixes
    prefixes = [
        "sign language",
        "sign",
        "isl",
        "indian sign language"
    ]

    for prefix in prefixes:

        pattern = rf"^{re.escape(prefix)}\s*[-_:|]?\s*"

        title = re.sub(
            pattern,
            "",
            title,
            flags=re.IGNORECASE
        )

    # Remove numbering
    # Example:
    # "001 - hello" -> "hello"
    title = re.sub(
        r"^\s*\d+\s*[-._:)]\s*",
        "",
        title
    )

    # Replace special characters
    title = re.sub(
        r"[^a-zA-Z0-9\s]",
        "",
        title
    )

    # Remove extra spaces
    title = re.sub(
        r"\s+",
        " ",
        title
    )

    return title.strip()


# ==========================================
# CREATE JSON
# ==========================================

def create_json(videos):

    result = {}

    duplicates = []

    for video in videos:

        word = normalize_title(
            video["title"]
        )

        if not word:
            continue

        key = word.lower()

        # Detect duplicate names
        if key in result:

            duplicates.append({
                "word": key,
                "existing": result[key]["videoId"],
                "duplicate": video["videoId"]
            })

            continue

        result[key] = {
            "videoId": video["videoId"],
            "title": video["title"],
            "youtubeUrl":
                f"https://www.youtube.com/watch?v={video['videoId']}"
        }

    return result, duplicates


# ==========================================
# MAIN
# ==========================================

def main():
    print(f"\nTarget Playlist: {PLAYLIST_ID}")
    print("\nFetching videos...")
    videos = get_all_videos(PLAYLIST_ID)

    print(
        f"\nTotal videos found: {len(videos)}"
    )

    print("\nCreating JSON...")

    result, duplicates = create_json(
        videos
    )

    # Save main JSON
    with open(
        "sign_videos.json",
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            result,
            file,
            indent=2,
            ensure_ascii=False
        )

    # Save duplicate information
    with open(
        "duplicates.json",
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            duplicates,
            file,
            indent=2,
            ensure_ascii=False
        )

    print("\n================================")
    print("DONE")
    print("================================")

    print(
        f"Videos fetched     : {len(videos)}"
    )

    print(
        f"Unique signs       : {len(result)}"
    )

    print(
        f"Duplicates found   : {len(duplicates)}"
    )

    print("\nGenerated files:")
    print("  sign_videos.json")
    print("  duplicates.json")


if __name__ == "__main__":
    main()