import json
import random
from pathlib import Path
import subprocess

from extract_features import process_rendered_frames

DATASET_ROOT = Path("../../dataset")
MOTIONS_DIR = Path("../../motions")
AVATARS_DIR = Path("../../avatars")
SAMPLES_PER_WORD = 3  # Set to 1000+ for actual generation

WORDS = [
    "HELLO", "WORLD", "YES", "NO"
]

def load_motion_template(word: str) -> Path:
    """Loads the pre-validated .fbx motion template."""
    template_path = MOTIONS_DIR / f"{word}.fbx"
    if not template_path.exists():
        template_path.parent.mkdir(exist_ok=True, parents=True)
        template_path.touch()
    return template_path

def generate_random_domain() -> dict:
    """Generates a comprehensive randomization profile for the sample."""
    return {
        "avatar": {
            "gender": random.choice(["male", "female"]),
            "skin_tone": random.choice(["light", "medium", "dark"]),
            "clothing": random.choice(["blue", "red", "grey", "black"])
        },
        "camera": {
            "distance": round(random.uniform(1.5, 3.0), 2),
            "yaw": round(random.uniform(-5.0, 5.0), 2),
            "pitch": round(random.uniform(-3.0, 3.0), 2)
        },
        "lighting": {
            "intensity": round(random.uniform(0.5, 2.0), 2),
            "temperature": random.choice([3200, 4500, 5600, 6500])
        },
        "motion": {
            "speed_multiplier": round(random.uniform(0.8, 1.2), 2),
            "left_handed": random.choice([True, False]),
            "pose_noise": round(random.uniform(0.0, 0.05), 3)
        }
    }

def generate_metadata(word: str, sample_id: str, template: Path, domain: dict) -> dict:
    """Generates the advanced JSON metadata schema."""
    return {
        "word": word,
        "template": template.name,
        "sample_id": sample_id,
        "randomization": domain
    }

def render_avatar(motion_file: Path, domain: dict, output_dir: Path):
    """Calls Blender headlessly with domain randomization parameters."""
    print(f"      [Blender] Rendering {domain['avatar']['gender']}, speed={domain['motion']['speed_multiplier']}")
    # In a real setup, you would pass the domain dictionary as a JSON string to the Blender script
    pass

def main():
    print(f"Starting Domain-Randomized ISL Generation Pipeline...")
    DATASET_ROOT.mkdir(parents=True, exist_ok=True)
    AVATARS_DIR.mkdir(parents=True, exist_ok=True)
        
    for word in WORDS:
        print(f"\nProcessing word: {word}")
        word_dir = DATASET_ROOT / word
        
        # Load the base ISL grammar motion template
        motion_template = load_motion_template(word)
        print(f"  -> Loaded template: {motion_template.name}")
        
        # Generate N randomized variations
        for i in range(1, SAMPLES_PER_WORD + 1):
            sample_id = f"sample_{i:04d}"
            sample_dir = word_dir / sample_id
            
            # Setup directories
            for d in ["frames", "masks", "keypoints"]:
                (sample_dir / d).mkdir(parents=True, exist_ok=True)
                
            # 1. Generate Domain Randomization Profile
            domain = generate_random_domain()
            
            # 2. Render Avatar in Blender
            render_avatar(motion_template, domain, sample_dir)
            
            # 3. Post-processing Extractors
            process_rendered_frames(sample_dir)
            
            # 4. Save Metadata
            meta_path = sample_dir / "metadata.json"
            with open(meta_path, "w") as f:
                json.dump(generate_metadata(word, sample_id, motion_template, domain), f, indent=2)
            
    print("\n✅ Pipeline complete. Randomized dataset generated.")

if __name__ == "__main__":
    main()
