import os
import json
from pathlib import Path

# The base directory where your new custom dataset will be stored
DATASET_ROOT = Path("dataset")

# The starter vocabulary you want to record
WORDS = [
    "HELLO", "WORLD", "YES", "NO", "PLEASE", "THANK_YOU", 
    "I", "YOU", "LOVE", "AI", "GOOD", "BAD", "HELP", "SORRY", "SIGN", "ACTION", "TRANSLATE"
]

def generate_empty_metadata(word: str) -> dict:
    """Generates the advanced ML-ready metadata schema."""
    return {
        "word": word,
        "gloss": word,
        "sentence_type": "",
        "handshape": "",
        "movement": "",
        "location": "",
        "orientation": "",
        "dominant_hand": "",
        "handedness": "",
        "non_manual_features": {
            "eyebrows": "neutral",
            "mouth": "neutral",
            "head": "neutral"
        },
        "fps": 60,
        "duration_ms": 0,
        "num_frames": 0,
        "start_pose": "neutral",
        "end_pose": "neutral",
        "keyframes": [],
        "difficulty": "",
        "frames": []
    }

def scaffold_dataset():
    if not DATASET_ROOT.exists():
        DATASET_ROOT.mkdir(parents=True)
        print(f"Created root directory: {DATASET_ROOT}")

    for word in WORDS:
        word_dir = DATASET_ROOT / word
        
        # Create main word directory
        if not word_dir.exists():
            word_dir.mkdir()
            print(f"Scaffolding directory for: {word}")
        
        # Create subdirectories for ML extraction pipelines
        for subdir in ["frames", "masks", "keypoints"]:
            (word_dir / subdir).mkdir(exist_ok=True)
            
        # Create metadata.json if it doesn't exist
        metadata_path = word_dir / "metadata.json"
        if not metadata_path.exists():
            with open(metadata_path, "w") as f:
                json.dump(generate_empty_metadata(word), f, indent=2)

    print("\nDataset scaffolding complete!")
    print(f"Check the '{DATASET_ROOT}' directory to begin dropping your raw video.mp4 files!")

if __name__ == "__main__":
    scaffold_dataset()
