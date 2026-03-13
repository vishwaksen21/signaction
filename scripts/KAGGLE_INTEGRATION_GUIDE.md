# Kaggle Dataset Integration for SignAction

This guide explains how to download and use real sign language datasets from Kaggle with SignAction for generating authentic gesture sequences instead of placeholders.

## Quick Start

```bash
# 1. Install
pip install -e ".[kaggle,video]"

# 2. Setup Kaggle API (one-time)
python scripts/setup_kaggle.sh

# 3. Download dataset
python scripts/download_kaggle_dataset.py --dataset wlasl

# 4. Run SignAction with real assets
export SIGNACTION_ASSETS_DIR="$PWD/signaction_assets"
streamlit run mvp_text_to_sign.py
```

## Architecture

### Data Flow

```
Kaggle Dataset (MP4/Video files)
         ↓
   download_kaggle_dataset.py
         ↓
   Organize by token name
   (HELLO.mp4, THANK_YOU.mp4, etc.)
         ↓
   signaction_assets/signs/
   signaction_assets/alphabet/
         ↓
   SignAction Pipeline
         ↓
   Token → Asset Lookup
         ↓
   Render Sequence → Output GIF
```

### File Organization

After downloading, assets are organized as follows:

```
signaction_assets/
├── signs/              # Word/phrase signs
│   ├── HELLO.mp4
│   ├── THANK_YOU.mp4
│   ├── YES.mp4
│   └── ...
├── alphabet/           # A-Z fingerspelling (fallback)
│   ├── A.gif
│   ├── B.gif
│   └── ...
└── lexicon.json        # Optional: aliases & phrases
```

## Available Datasets

### 1. ASL Alphabet (Recommended First)

**Best for:** Fingerspelling (A-Z letters)

```bash
python scripts/download_kaggle_dataset.py --dataset asl-alphabet
```

**Contents:**
- GIF or image files for each letter
- Ready to use immediately
- Used as fallback when unknown words are encountered
- **Most reliable for getting started**

### 2. ASL Recognition

**Best for:** Character/word recognition

```bash
python scripts/download_kaggle_dataset.py --dataset asl-recognition
```

**Contents:**
- Images for ASL characters and words
- Organized by character class

### 3. Sign Language MNIST

**Best for:** Machine learning training

```bash
python scripts/download_kaggle_dataset.py --dataset sign-language-mnist
```

**Contents:**
- 28x28 grayscale images
- Similar to MNIST format
- Good for training ML models

## Advanced Usage

### Programmatic Download

Download datasets directly from your Python code:

```python
from signaction.kaggle_helper import KaggleHelper, download_wlasl
from pathlib import Path

# Simple download
download_wlasl()

# Or with more control
if KaggleHelper.is_available():
    KaggleHelper.download_dataset(
        "wlasl",
        output_dir=Path("my_assets"),
        force=True  # Overwrite existing files
    )
else:
    print("Kaggle not available. Setup instructions:")
    print(KaggleHelper.get_setup_instructions())
```

### Custom Dataset Structure

If you have your own sign language videos or GIFs, organize them as:

```
your_assets/
├── signs/
│   └── YOURWORD.mp4  (or .gif)
├── alphabet/
│   └── A.gif
└── lexicon.json (optional)
```

Then use it:
```bash
export SIGNACTION_ASSETS_DIR="/path/to/your_assets"
streamlit run mvp_text_to_sign.py
```

### Mixing Real and Placeholder Assets

SignAction gracefully handles incomplete asset libraries:

1. If a token has a real asset (`.mp4`, `.gif`), it uses it
2. If not found, it generates a placeholder GIF (ensuring no errors)
3. Unknown words fall back to fingerspelling using alphabet assets
4. If alphabet assets are missing, letter placeholders are generated

Example flow:
```
User input: "HELLO FRIEND"

Tokens: ["HELLO", "FRIEND"]

HELLO    → Found: signaction_assets/signs/HELLO.mp4 (real) ✓
FRIEND   → Not found → Falls back to: F-R-I-E-N-D
F, R, E, I, N, D → Uses alphabet/ or generates placeholders

Output: Real HELLO video + Fingerspelled FRIEND
```

## Troubleshooting

### 403 Forbidden Error

If you get: `403 Client Error: Forbidden for url: https://api.kaggle.com/...`

**This means your credentials are not set up properly.** Fix it:

```bash
# 1. Check your setup
python scripts/diagnose_kaggle.py

# 2. Get new API token (regenerate if needed)
# Go to: https://www.kaggle.com/settings/account
# Click: "Create New API Token" (downloads kaggle.json)

# 3. Place credentials
mkdir -p ~/.kaggle
# Copy downloaded kaggle.json to ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# 4. Re-run diagnosis
python scripts/diagnose_kaggle.py

# 5. Try download again
python scripts/download_kaggle_dataset.py --dataset asl-alphabet
```

### Dataset Not Found (404 Error)

```bash
pip install kaggle
```

### No Credentials

Setup Kaggle API credentials:

1. Go to https://www.kaggle.com/settings/account
2. Click "Create New API Token" (downloads `kaggle.json`)
3. Place it in `~/.kaggle/kaggle.json`
4. Run: `chmod 600 ~/.kaggle/kaggle.json`
5. Verify: `kaggle datasets list`

### Download Stalled/Failed

- Check internet connection
- Increase timeout: Edit the script's `timeout=600` parameter
- Try again manually: `kaggle datasets download -d {dataset_path} -p {output_dir}`

### Video Processing Issues

If you see errors about imageio or FFmpeg:

```bash
pip install -e ".[video]"
```

This installs optional video processing dependencies.

### Missing Assets After Download

1. Verify download completed: `ls signaction_assets/`
2. Check if files are in subdirectories: `find signaction_assets -type f -name "*.mp4" -o -name "*.gif"`
3. Manually set `SIGNACTION_ASSETS_DIR`:
   ```bash
   export SIGNACTION_ASSETS_DIR="$(pwd)/signaction_assets"
   echo $SIGNACTION_ASSETS_DIR  # Verify it's absolute path
   ```

### Slow Video Processing

Video-to-GIF conversion can be memory-intensive. To optimize:

1. Reduce video resolution in preprocessing
2. Limit frame count in `render.py` (default: 60 frames max)
3. Use SSD/fast storage instead of network drives

```python
# In render.py, adjust max_video_frames parameter
render_sequence_gif(items, assets_dir=assets_dir, max_video_frames=30)
```

## Dataset Statistics

| Dataset | Size | Words | Videos | Format | Quality |
|---------|------|-------|--------|--------|---------|
| WLASL | 500MB+ | 2000+ | ✓ | MP4 | High |
| ASL-Alphabet | 50MB | 26 | ✓ | GIF/PNG | Medium |
| Indian Sign | 300MB | 1000+ | ✓ | MP4 | Medium |

## Customization

### Custom Token Names

If your dataset uses different naming conventions, modify the asset lookup in `mapping.py`:

```python
# In mapping.py, customize _norm_key() function
def _norm_key(s: str) -> str:
    s = s.upper().strip().replace(" ", "_")
    # Add custom replacements if needed
    s = s.replace("_", "-")  # Use hyphens instead
    s = re.sub(r"[^A-Z0-9_-]+", "", s)
    return s
```

### Adding Lexicon Mappings

Create `signaction_assets/lexicon.json`:

```json
{
  "aliases": {
    "HI": "HELLO",
    "BYE": "GOODBYE",
    "TYVM": "THANK_YOU"
  },
  "phrases": {
    "THANK YOU": "THANK_YOU",
    "HOW ARE YOU": "HOW_ARE_YOU",
    "GOOD MORNING": "GOOD_MORNING"
  }
}
```

## Performance Tips

1. **Preload datasets:** Download once, reuse many times (set `SIGNACTION_ASSETS_DIR`)
2. **Use smaller datasets first:** ASL-Alphabet is fast to work with
3. **Cache GIF frames:** Rendering is cached by default in `render.py`
4. **Parallelize:** If processing many videos, consider batch preprocessing

## References

- [WLASL Dataset](https://github.com/dxli94/WLASL)
- [Kaggle ASL Datasets](https://www.kaggle.com/search?q=asl+sign%20language)
- [ASLLVD Lexicon](https://www.bu.edu/asllrp/3d-asl/)

## Contributing

Have a dataset or improvement? Please contribute!

- Add dataset to `KAGGLE_DATASETS` dict in `download_kaggle_dataset.py`
- Test the download and organization script
- Submit a PR with documentation

---

**See also:** [Main README.md](../README.md)
