SignAction

Python MVP that translates **typed text** or **spoken speech** into a **sign-language-like “gloss”** and renders a **visual gesture sequence**.

This repo intentionally ships with **placeholder sign GIFs** that are generated on demand (non-copyrighted). You can later replace them with real sign clips/GIFs.

Features

- Dual input: text or speech
- Speech-to-text (offline): Vosk
- NLP preprocessing: tokenization, stopword removal, lemmatization, simple gloss rules
- Text-to-sign: token → asset mapping (GIF/MP4), fallback to generated placeholder GIF
- Visualization: renders the sign sequence as a single animated GIF
- Interfaces: Streamlit UI + CLI

Architecture

Speech → STT → Text
Text → NLP (gloss) → Token sequence → Sign mapping → GIF renderer → Output

Note: the glossing step uses heuristics (e.g., it may drop auxiliaries like "is/are") but preserves pronouns/content words so phrases like "what is your name" keep "YOUR NAME".

Project layout

- `signaction/`
	- `nlp.py`: text normalization + gloss tokens
	- `stt/`: speech-to-text backends (Vosk default)
	- `translate.py`: tokens → sign items
	- `render.py`: sequence → animated GIF
	- `app.py`: Streamlit UI
	- `cli.py`: CLI
- `signaction_assets/` (created at runtime): token assets cache

Setup

1) Create a venv and install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -e .
```

Microphone recording (CLI) requires an extra:

```bash
pip install -e ".[mic]"
```

Web app (FastAPI backend + Next.js frontend)

This keeps the existing Python pipeline unchanged and only wraps it behind HTTP.

1) Start the backend (FastAPI)

```bash
./backend_dev.sh
```

If you see `command not found`, you probably ran `backend_dev.sh` without `./`. Either run `./backend_dev.sh` from the repo root, or:

```bash
bash backend_dev.sh
```

If you are currently in `frontend/`, run:

```bash
../backend_dev.sh
```

Backend runs on `http://localhost:8000`.

2) Start the frontend (Next.js)

Create a local env file (optional but recommended):

```bash
cd frontend
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
```

```bash
cd frontend
npm install
npm run dev
```

Set the API base URL (recommended):

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Frontend runs on `http://localhost:3000` and calls the backend.

Backend endpoints used by the UI:

- `POST /translate-text`
- `POST /translate-speech`
- `GET /dictionary`
- `GET /health`

Deploy (single container)

The production build serves the frontend from the backend, so deployment is a single web service.

```bash
docker build -t signaction .
docker run --rm -p 8000:8000 signaction
```

Open `http://localhost:8000`.

Deploy (recommended split: Vercel + Render/Railway)

- Frontend (Vercel)
	- Project root: `frontend/`
	- Env var: `NEXT_PUBLIC_API_URL=https://<your-backend-domain>`

- Backend (Render/Railway/Docker)
	- Start command: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
	- Env vars:
		- `SIGNACTION_ASSETS_DIR=/path/to/signaction_assets`
		- `VOSK_MODEL_PATH=/path/to/vosk-model-*` (speech)
		- `SIGNACTION_CORS_ORIGINS=https://<your-vercel-domain>`

Deploy (docker compose)

```bash
docker compose up --build
```

Optional configuration:

```bash
export SIGNACTION_ASSETS_DIR="$PWD/signaction_assets"
export VOSK_MODEL_PATH="/absolute/path/to/vosk-model-small-en-us-0.15"
export SIGNACTION_CORS_ORIGINS="*"
```


2) Install the spaCy English model

```bash
python -m spacy download en_core_web_sm
```

Note: this model improves lemmatization quality, but the app will still run without it (it falls back to a basic tokenizer).

Fastest MVP (text → GIF only)

If you only want the simplest MVP (typed text → sign GIF output) run:

```bash
streamlit run mvp_text_to_sign.py
```

The MVP reads assets from `SIGNACTION_ASSETS_DIR` if set (otherwise it uses `./signaction_assets`).

Speech MVP (voice → text → sign GIF)

1) Install full dependencies from the repo root:

```bash
pip install -e .
```

2) Download a Vosk model and set:

```bash
export VOSK_MODEL_PATH="/absolute/path/to/vosk-model-small-en-us-0.15"
```

Tip: If you place a Vosk model folder under `./models/` (e.g., `models/vosk-model-small-en-us-0.15/`), the MVP app will auto-detect it.

3) Run the same MVP app and switch to the **Speech** tab:

```bash
streamlit run mvp_text_to_sign.py
```

Getting sign assets (you currently have none)

This project does **not** ship real sign-language media by default. You have 2 paths:

1) Quick local demo assets (recommended first)

Generate an alphabet + a few common word/phrase GIFs so the output is not just placeholders:

```bash
python scripts/bootstrap_demo_assets.py
export SIGNACTION_ASSETS_DIR="$PWD/signaction_assets"
```

Then run:

```bash
streamlit run mvp_text_to_sign.py
```

2) Use a real dataset (manual download required)

Datasets are often distributed as **videos (MP4)** rather than GIFs. This project can render MP4 assets too.

- Recommended datasets to look up and download:
	- WLASL (word-level ASL)
	- ASLLVD (lexicon)
	- RWTH-PHOENIX-Weather (continuous signing; more complex)

After downloading, place assets into your assets folder using one of these layouts:

- Flat: `ASSETS_DIR/HELLO.gif`
- Structured: `ASSETS_DIR/signs/hello.gif` and `ASSETS_DIR/alphabet/h.gif`

If your dataset is MP4 and you want it rendered into the output GIF, install the optional video extra:

```bash
pip install -e ".[video]"
```

Kaggle ASL Alphabet (images) → instant improvement

If you downloaded Kaggle dataset `grassknoted/asl-alphabet` into `.kaggle_tmp/` (this repo’s helper scripts do that), import one sample image per letter into your assets folder:

```bash
python scripts/import_kaggle_asl_alphabet.py
export SIGNACTION_ASSETS_DIR="$PWD/signaction_assets"
```

Then run the MVP and try:

- Input: `c` (should show an alphabet image)
- Input: `hello` (in the full app pipeline, unknown words can fingerspell H-E-L-L-O)

3) Download a Vosk model (speech mode)

- Download a model folder such as `vosk-model-small-en-us-0.15`.
- Point `VOSK_MODEL_PATH` to the extracted folder.

Example:

```bash
export VOSK_MODEL_PATH="$HOME/models/vosk-model-small-en-us-0.15"
```

Optionally override the assets folder (where token GIF/MP4 files live):

```bash
export SIGNACTION_ASSETS_DIR="/path/to/your/sign/assets"
```

Run (Streamlit)

```bash
streamlit run streamlit_app.py
```

- **Text** mode: type a sentence and click **Translate**.
- **Speech** mode: record (if your Streamlit version supports mic capture) or upload audio, then click **Transcribe + Translate**.

Supported upload formats are `wav`, `flac`, `ogg`.

Note: some browsers record microphone audio as `webm`. The FastAPI backend will try to auto-convert `webm` → `wav` if `ffmpeg` is installed.

Run (CLI)

Text:

```bash
signaction text --text "hello how are you" --out out.gif
```

Audio file:

```bash
signaction audio --path sample.wav --backend vosk --out out.gif
```

Microphone (records N seconds):

```bash
signaction mic --seconds 4 --backend vosk --out out.gif
```

Getting real sign assets from Kaggle (Recommended!)

**Easy way: Use the Kaggle downloader**

The project now includes scripts to automatically download and organize sign language datasets from Kaggle:

1) **Setup Kaggle API (one-time)**

```bash
pip install kaggle

# Go to https://www.kaggle.com/settings/account, click "Create New API Token"
# This downloads kaggle.json. Then:

mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# Verify setup:
kaggle datasets list
```

2) **Download a dataset**

List available datasets:

```bash
python scripts/download_kaggle_dataset.py --list
```

Download ASL Alphabet (A-Z fingerspelling, recommended first):

```bash
python scripts/download_kaggle_dataset.py --dataset asl-alphabet --output signaction_assets
```

Or download other ASL datasets:

```bash
# ASL Character Recognition
python scripts/download_kaggle_dataset.py --dataset asl-recognition

# Sign Language MNIST
python scripts/download_kaggle_dataset.py --dataset sign-language-mnist
```

3) **Use the assets**

Once downloaded, assets are automatically organized into your `signaction_assets/` directory structured as:
- `signaction_assets/signs/WORD.mp4` (or .gif)
- `signaction_assets/alphabet/A.gif` (fingerspelling fallback)

Then run the app:

```bash
export SIGNACTION_ASSETS_DIR="$PWD/signaction_assets"
streamlit run mvp_text_to_sign.py
# or: streamlit run streamlit_app.py
```

**Available Kaggle Datasets**

| Dataset | Type | Coverage | Best For |
|---------|------|----------|----------|
| **ASL Alphabet** | Images/GIFs | A-Z fingerspelling | First-time setup, letter recognition |
| **ASL Recognition** | Images | A-Z + words | Character & word recognition |
| **Sign Language MNIST** | Images (28x28) | Digit signs + letters | Machine learning training |

**Programmatic access**

You can also download datasets directly in Python:

```python
from signaction.kaggle_helper import download_wlasl, KaggleHelper

# Download WLASL dataset
download_wlasl()

# Or check if Kaggle is available first
if KaggleHelper.is_available():
    KaggleHelper.download_dataset("wlasl")
```

**Note**: Video conversion happens automatically. If MP4 files are large, install the video extra:

```bash
pip install -e ".[video]"
```

Where to put real sign assets (manual method)

By default, assets are read from and generated into `signaction_assets/` at the repo root.

- Put per-token assets like `hello.gif` / `HELLO.gif` or `thank_you.mp4` / `THANK_YOU.mp4` in your assets directory.
- Supported layouts:
	- Flat: `signaction_assets/hello.gif`
	- Structured: `signaction_assets/signs/hello.gif` and `signaction_assets/alphabet/h.gif`
- Tokens are produced by the NLP step in uppercase (see `Gloss` output).
- If a token asset is missing, the app generates a placeholder GIF automatically.

Debugging missing signs

- Turn on resolver debug logs:

```bash
export SIGNACTION_DEBUG=1
```

- The resolver is case-insensitive and indexes your assets directory, so `hello.gif` works for the token `HELLO`.

Phrase + alias mapping (optional)

You can define multi-word signs and token aliases by adding `lexicon.json` to your assets directory:

```json
{
	"aliases": {
		"HI": "HELLO"
	},
	"phrases": {
		"THANK YOU": "THANK_YOU",
		"GOOD MORNING": "GOOD_MORNING"
	}
}
```

There’s also a ready-to-copy example file at: `signaction_assets_lexicon.example.json`.

Unknown-word fallback

If a token has no matching asset and looks like an alphabetic word (e.g., `PYTHON`), the translator will fall back to **fingerspelling** (P-Y-T-H-O-N) using per-letter assets if you provide them (or placeholders otherwise).

Notes / Limitations

- The NLP “gloss” rules are a baseline and **not a full sign-language translation model**.
- For production-quality translation, replace `signaction/nlp.py` + `signaction/translate.py` with a learned model and a curated dataset.

