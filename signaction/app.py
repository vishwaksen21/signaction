from __future__ import annotations

import os
import tempfile
from pathlib import Path

import streamlit as st

from .config import default_config
from .exceptions import ModelNotConfiguredError, SignActionError, SpeechToTextError
from .pipeline import run_text_to_sign_pipeline
from .stt.factory import transcribe_file


def _save_uploaded_audio_to_temp(audio_bytes: bytes, suffix: str = ".wav") -> Path:
    fd, path = tempfile.mkstemp(suffix=suffix)
    os.close(fd)
    p = Path(path)
    p.write_bytes(audio_bytes)
    return p


def main() -> None:
    st.set_page_config(page_title="SignAction", layout="centered")
    st.title("SignAction — Text / Speech → Sign (MVP)")

    cfg = default_config()
    cfg.assets_dir.mkdir(parents=True, exist_ok=True)

    input_mode = st.radio("Input type", options=["Text", "Speech"], horizontal=True)

    text: str | None = None

    if input_mode == "Text":
        text = st.text_area("Enter text", placeholder="Type a sentence to translate…")

    if input_mode == "Speech":
        st.caption(
            "Speech-to-text uses Vosk offline. Set `VOSK_MODEL_PATH` to a downloaded model folder."
        )

        model_path = st.text_input(
            "Vosk model path (folder)",
            value=os.environ.get("VOSK_MODEL_PATH", ""),
            placeholder="/absolute/path/to/vosk-model-...",
        )
        if model_path.strip():
            os.environ["VOSK_MODEL_PATH"] = model_path.strip()

        backend = st.selectbox("Speech backend", options=["vosk"], index=0)

        audio_bytes: bytes | None = None

        # Newer Streamlit has `st.audio_input` (microphone capture).
        if hasattr(st, "audio_input"):
            captured = st.audio_input("Record from microphone")  # type: ignore[attr-defined]
            if captured is not None:
                audio_bytes = captured.getvalue()

        uploaded = st.file_uploader(
            "…or upload an audio file (WAV recommended)",
            type=["wav", "flac", "ogg"],
            accept_multiple_files=False,
        )
        if uploaded is not None:
            audio_bytes = uploaded.getvalue()

        if audio_bytes is not None:
            st.audio(audio_bytes)

        if st.button("Transcribe + Translate", type="primary"):
            if audio_bytes is None:
                st.error("Provide microphone audio or upload a file.")
                return

            tmp_audio = _save_uploaded_audio_to_temp(audio_bytes)
            try:
                text = transcribe_file(tmp_audio, backend=backend)  # type: ignore[arg-type]
            except (ModelNotConfiguredError, SpeechToTextError) as e:
                st.error(str(e))
                st.stop()
            except Exception as e:  # noqa: BLE001
                st.error(
                    f"Audio decode/transcribe failed: {e}. "
                    "Try uploading a WAV/FLAC/OGG file."
                )
                st.stop()
            finally:
                try:
                    tmp_audio.unlink(missing_ok=True)
                except Exception:
                    pass

            st.subheader("Transcript")
            st.write(text or "(empty)")

            try:
                result = run_text_to_sign_pipeline(text or "", assets_dir=cfg.assets_dir)
            except SignActionError as e:
                st.error(str(e))
                st.stop()
            except OSError as e:
                st.error(str(e))
                st.stop()

            st.subheader("Gloss")
            st.code(result.gloss.gloss or "(empty)")

            st.subheader("Sign output")
            st.image(result.gif_bytes)

            with st.expander("Tokens"):
                st.write(result.gloss.tokens)

    if input_mode == "Text":
        if st.button("Translate", type="primary"):
            if not (text or "").strip():
                st.error("Enter some text.")
                return

            try:
                result = run_text_to_sign_pipeline(text or "", assets_dir=cfg.assets_dir)
            except SignActionError as e:
                st.error(str(e))
                return
            except OSError as e:
                st.error(str(e))
                return

            st.subheader("Gloss")
            st.code(result.gloss.gloss or "(empty)")

            st.subheader("Sign output")
            st.image(result.gif_bytes)

            with st.expander("Tokens"):
                st.write(result.gloss.tokens)

if __name__ == "__main__":
    main()
