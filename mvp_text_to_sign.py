from __future__ import annotations

import io
import re
import os
import tempfile
from dataclasses import dataclass
from pathlib import Path

import streamlit as st
from PIL import Image, ImageDraw, ImageFont, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True


@dataclass(frozen=True)
class MVPConfig:
    assets_dir: Path


def default_config() -> MVPConfig:
    # Runtime assets folder (gitignored by this repo's .gitignore)
    # Users can override via SIGNACTION_ASSETS_DIR.
    return MVPConfig(assets_dir=Path(os.environ.get("SIGNACTION_ASSETS_DIR", "signaction_assets")))


STOPWORDS = {
    "a",
    "an",
    "the",
    "and",
    "or",
    "but",
    "to",
    "of",
    "in",
    "on",
    "at",
    "for",
    "with",
    "as",
    "from",
    "by",
    "is",
    "am",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "do",
    "does",
    "did",
}

PHRASES = {
    "THANK YOU": "THANK_YOU",
    "GOOD MORNING": "GOOD_MORNING",
    "GOOD NIGHT": "GOOD_NIGHT",
    "HOW ARE YOU": "HOW_ARE_YOU",
}

ALIASES = {
    "HI": "HELLO",
}


def normalize_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    return text


def tokenize(text: str) -> list[str]:
    # Simple regex tokenizer: keep words/numbers, drop punctuation.
    # NOTE: Stopword filtering is handled separately so phrase mapping can run first.
    raw = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?|\d+", text)
    out: list[str] = []
    for t in raw:
        up = t.upper()
        out.append(up)
    return out


def filter_stopwords(tokens: list[str]) -> list[str]:
    out: list[str] = []
    for t in tokens:
        tl = t.lower()
        # Never drop A-Z single letters.
        if len(t) == 1 and ("A" <= t <= "Z"):
            out.append(t)
            continue
        # Keep phrase tokens like HOW_ARE_YOU
        if "_" in t:
            out.append(t)
            continue
        if tl in STOPWORDS:
            continue
        out.append(t)
    return out


def apply_aliases(tokens: list[str]) -> list[str]:
    return [ALIASES.get(t, t) for t in tokens]


def apply_phrases(tokens: list[str]) -> list[str]:
    # Greedy longest phrase match (space-joined)
    if not tokens:
        return []

    phrase_parts = [(k.split(), v) for k, v in PHRASES.items()]
    phrase_parts.sort(key=lambda x: len(x[0]), reverse=True)

    i = 0
    out: list[str] = []
    while i < len(tokens):
        matched = False
        for parts, repl in phrase_parts:
            n = len(parts)
            if i + n <= len(tokens) and tokens[i : i + n] == parts:
                out.append(repl)
                i += n
                matched = True
                break
        if not matched:
            out.append(tokens[i])
            i += 1
    return out


def ensure_placeholder_gif(token: str, assets_dir: Path) -> Path:
    assets_dir.mkdir(parents=True, exist_ok=True)
    out_path = assets_dir / f"{token}.gif"
    if out_path.exists():
        return out_path

    w, h = 320, 320
    frames: list[Image.Image] = []

    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    for i in range(12):
        dx = int((i - 6) * 2)
        img = Image.new("RGB", (w, h), (245, 245, 245))
        draw = ImageDraw.Draw(img)
        draw.rectangle([8, 8, w - 8, h - 8], outline=(80, 80, 80), width=3)

        bbox = draw.textbbox((0, 0), token, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        x = (w - tw) // 2 + dx
        y = (h - th) // 2
        draw.text((x, y), token, fill=(10, 10, 10), font=font)
        frames.append(img)

    frames[0].save(
        str(out_path),
        save_all=True,
        append_images=frames[1:],
        duration=80,
        loop=0,
        optimize=False,
    )

    return out_path


def resolve_existing_asset(token: str, assets_dir: Path) -> tuple[Path, str] | None:
    """Resolve token to an existing dataset asset.

    Returns (path, kind) where kind is 'gif' or 'img'.
    """

    token_u = token.strip().upper()
    search_dirs = [assets_dir / "signs", assets_dir, assets_dir / "alphabet"]

    for d in search_dirs:
        if not d.exists() or not d.is_dir():
            continue
        for p in d.iterdir():
            if not p.is_file():
                continue
            if p.stem.strip().upper() != token_u:
                continue
            suf = p.suffix.lower()
            if suf == ".gif":
                return p, "gif"
            if suf in {".png", ".jpg", ".jpeg"}:
                return p, "img"
    return None


def resolve_or_generate_asset(token: str, assets_dir: Path) -> tuple[Path, str, bool]:
    """Return (path, kind, is_placeholder_generated)."""
    assets_dir.mkdir(parents=True, exist_ok=True)

    existing = resolve_existing_asset(token, assets_dir)
    if existing is not None:
        p, kind = existing
        return p, kind, False

    p = ensure_placeholder_gif(token, assets_dir)
    return p, "gif", True


def expand_with_fingerspelling(tokens: list[str], assets_dir: Path) -> list[str]:
    """If a word sign is missing, expand into letters (using alphabet assets)."""
    out: list[str] = []
    for t in tokens:
        # If there's no direct sign asset for this token (including phrase tokens like HOW_ARE_YOU),
        # fall back to spelling only the A-Z letters.
        if resolve_existing_asset(t, assets_dir) is None:
            letters = [c for c in t.upper() if "A" <= c <= "Z"]
            if len(letters) > 1:
                out.extend(letters)
                continue

        out.append(t)
    return out


def _frames_from_asset(path: Path, kind: str, *, fallback_token: str, assets_dir: Path) -> list[Image.Image]:
    try:
        if kind == "gif":
            return load_gif_frames(path)
        with Image.open(str(path)) as im:
            return [im.convert("RGB")]
    except Exception:
        # If the dataset image is corrupted/unreadable, fall back to placeholder.
        p = ensure_placeholder_gif(fallback_token, assets_dir)
        return load_gif_frames(p)


def load_gif_frames(path: Path) -> list[Image.Image]:
    with Image.open(str(path)) as im:
        frames: list[Image.Image] = []
        try:
            while True:
                frames.append(im.convert("RGB"))
                im.seek(im.tell() + 1)
        except EOFError:
            pass
        return frames


def render_sequence_gif(tokens: list[str], assets_dir: Path) -> bytes:
    frames: list[Image.Image] = []

    for token in tokens:
        asset_path, kind, _is_placeholder = resolve_or_generate_asset(token, assets_dir)
        token_frames = _frames_from_asset(
            asset_path,
            kind,
            fallback_token=token,
            assets_dir=assets_dir,
        )
        if not token_frames:
            continue
        frames.extend(token_frames)
        frames.extend([token_frames[-1]] * 6)

    if not frames:
        frames = [Image.new("RGB", (320, 320), (245, 245, 245))]

    out = io.BytesIO()
    frames[0].save(
        out,
        format="GIF",
        save_all=True,
        append_images=frames[1:],
        duration=70,
        loop=0,
        optimize=False,
    )
    return out.getvalue()


def main() -> None:
    st.set_page_config(page_title="SignAction MVP", layout="centered")
    st.title("Text / Speech → Sign GIF (MVP)")

    cfg = default_config()

    st.caption("Assets folder is searched in: assets/signs, assets/, assets/alphabet")
    assets_dir_str = st.text_input("Assets folder", value=str(cfg.assets_dir))
    assets_dir = Path(assets_dir_str).expanduser()

    mode = st.radio("Input type", options=["Text", "Speech"], horizontal=True)

    text = ""

    if mode == "Text":
        text = st.text_area("Enter text", placeholder="Type a sentence to translate…")

    if mode == "Speech":
        st.caption("Speech-to-text uses Vosk (offline). You must download a Vosk model.")

        # Auto-detect a model downloaded into this workspace.
        repo_root = Path(__file__).resolve().parent
        models_dir = repo_root / "models"
        detected_model = ""
        if models_dir.exists():
            for p in sorted(models_dir.glob("vosk-model-*/")):
                if p.is_dir() and (p / "conf").exists():
                    detected_model = str(p)
                    break

        default_model_path = os.environ.get("VOSK_MODEL_PATH") or detected_model
        if detected_model and not os.environ.get("VOSK_MODEL_PATH"):
            os.environ["VOSK_MODEL_PATH"] = detected_model
            st.caption(f"Detected Vosk model: {detected_model}")

        model_path = st.text_input(
            "Vosk model path (folder)",
            value=default_model_path,
            placeholder="/absolute/path/to/vosk-model-...",
        ).strip()
        if model_path:
            os.environ["VOSK_MODEL_PATH"] = model_path

        audio_bytes: bytes | None = None
        if hasattr(st, "audio_input"):
            captured = st.audio_input("Record from microphone")  # type: ignore[attr-defined]
            if captured is not None:
                audio_bytes = captured.getvalue()

        uploaded = st.file_uploader(
            "…or upload an audio file (WAV/FLAC/OGG)",
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

            try:
                from signaction.stt.factory import transcribe_file
            except Exception as e:  # noqa: BLE001
                st.error(
                    "Speech mode requires the full project dependencies. "
                    "Install from repo root with: pip install -e ."
                )
                st.stop()

            fd, tmp_path_str = tempfile.mkstemp(suffix=".wav")
            os.close(fd)
            tmp_path = Path(tmp_path_str)
            try:
                tmp_path.write_bytes(audio_bytes)
                text = transcribe_file(tmp_path, backend="vosk")
            except Exception as e:  # noqa: BLE001
                st.error(
                    f"Transcription failed: {e}. "
                    "Make sure VOSK_MODEL_PATH points to a downloaded Vosk model folder."
                )
                st.stop()
            finally:
                try:
                    tmp_path.unlink(missing_ok=True)
                except Exception:
                    pass

            st.subheader("Transcript")
            st.write(text or "(empty)")

    c1, c2 = st.columns(2)
    with c1:
        remove_stopwords = st.checkbox("Remove stopwords", value=True)
    with c2:
        enable_phrases = st.checkbox("Phrase mapping", value=True)

    fingerspell_missing = st.checkbox(
        "Fingerspell missing words (HELLO → H E L L O)",
        value=True,
        help="Uses assets/alphabet (A-Z) when a full word sign isn't available.",
    )

    if mode == "Text" and st.button("Translate", type="primary"):
        normalized = normalize_text(text)
        if not normalized:
            st.error("Enter some text.")
            return

        base_tokens = tokenize(normalized)
        base_tokens = apply_aliases(base_tokens)
        if enable_phrases:
            base_tokens = apply_phrases(base_tokens)
        if remove_stopwords:
            base_tokens = filter_stopwords(base_tokens)

        render_tokens = expand_with_fingerspelling(base_tokens, assets_dir) if fingerspell_missing else base_tokens

        st.subheader("Tokens")
        st.write(base_tokens)

        with st.expander("Render tokens (what gets displayed)"):
            st.write(render_tokens)

        resolved: list[dict[str, str]] = []
        for t in render_tokens:
            p, kind, is_placeholder = resolve_or_generate_asset(t, assets_dir)
            resolved.append(
                {
                    "token": t,
                    "asset": str(p),
                    "kind": kind,
                    "source": "placeholder" if is_placeholder else "dataset",
                }
            )

        with st.expander("Debug: resolved assets"):
            st.write({
                "assets_dir": str(assets_dir),
                "searched": [str(assets_dir / 'signs'), str(assets_dir), str(assets_dir / 'alphabet')],
            })
            st.table(resolved)

        gif_bytes = render_sequence_gif(render_tokens, assets_dir)
        st.subheader("Sign output")
        st.image(gif_bytes)

    if mode == "Speech" and text:
        # After transcription we can reuse the same pipeline immediately.
        normalized = normalize_text(text)
        base_tokens = tokenize(normalized)
        base_tokens = apply_aliases(base_tokens)
        if enable_phrases:
            base_tokens = apply_phrases(base_tokens)
        if remove_stopwords:
            base_tokens = filter_stopwords(base_tokens)

        render_tokens = expand_with_fingerspelling(base_tokens, assets_dir) if fingerspell_missing else base_tokens

        st.subheader("Tokens")
        st.write(base_tokens)

        with st.expander("Render tokens (what gets displayed)"):
            st.write(render_tokens)

        resolved: list[dict[str, str]] = []
        for t in render_tokens:
            p, kind, is_placeholder = resolve_or_generate_asset(t, assets_dir)
            resolved.append(
                {
                    "token": t,
                    "asset": str(p),
                    "kind": kind,
                    "source": "placeholder" if is_placeholder else "dataset",
                }
            )

        with st.expander("Debug: resolved assets"):
            st.write(
                {
                    "assets_dir": str(assets_dir),
                    "searched": [
                        str(assets_dir / "signs"),
                        str(assets_dir),
                        str(assets_dir / "alphabet"),
                    ],
                }
            )
            st.table(resolved)

        gif_bytes = render_sequence_gif(render_tokens, assets_dir)
        st.subheader("Sign output")
        st.image(gif_bytes)


if __name__ == "__main__":
    main()
