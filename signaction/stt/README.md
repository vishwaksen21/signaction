Speech-to-text backends

- Default: Vosk (offline)
  - Download a model (e.g., `vosk-model-small-en-us-0.15`)
  - Set `VOSK_MODEL_PATH=/absolute/path/to/model`

- Optional: faster-whisper
  - Install: `pip install .[whisper]`
  - Use the `FasterWhisperBackend` class directly (not yet wired into the Streamlit UI).
