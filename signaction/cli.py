from __future__ import annotations

import argparse
import os
import sys
import tempfile
from pathlib import Path

from .audio import AudioData, write_wav_pcm16
from .config import default_config
from .pipeline import run_text_to_sign_pipeline
from .stt.factory import transcribe_file


def _record_mic(seconds: float, sample_rate: int = 16000) -> AudioData:
    try:
        import sounddevice as sd  # type: ignore
    except Exception as e:  # noqa: BLE001
        raise RuntimeError(
            "Microphone recording requires the optional dependency 'sounddevice'. "
            "Install with: pip install -e '.[mic]'"
        ) from e

    frames = int(seconds * sample_rate)
    audio = sd.rec(frames, samplerate=sample_rate, channels=1, dtype="float32")
    sd.wait()
    return AudioData(samples=audio.reshape(-1), sample_rate=sample_rate)


def _write_gif(out_path: Path, gif_bytes: bytes) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_bytes(gif_bytes)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="signaction")
    parser.add_argument(
        "--assets-dir",
        type=Path,
        default=None,
        help="Directory containing token assets (default: ./signaction_assets)",
    )

    sub = parser.add_subparsers(dest="cmd", required=True)

    p_text = sub.add_parser("text", help="Translate typed text")
    p_text.add_argument("--text", required=True)

    p_audio = sub.add_parser("audio", help="Transcribe an audio file then translate")
    p_audio.add_argument("--path", type=Path, required=True)
    p_audio.add_argument("--backend", choices=["vosk"], default="vosk")

    p_mic = sub.add_parser("mic", help="Record microphone then translate")
    p_mic.add_argument("--seconds", type=float, default=4.0)
    p_mic.add_argument("--backend", choices=["vosk"], default="vosk")

    parser.add_argument(
        "--out",
        type=Path,
        default=Path("out.gif"),
        help="Output GIF path (default: out.gif)",
    )

    args = parser.parse_args(argv)

    cfg = default_config()
    assets_dir = args.assets_dir or cfg.assets_dir
    assets_dir.mkdir(parents=True, exist_ok=True)

    if args.cmd == "text":
        result = run_text_to_sign_pipeline(args.text, assets_dir=assets_dir)
        _write_gif(args.out, result.gif_bytes)
        print(result.gloss.gloss)
        print(f"Wrote: {args.out}")
        return 0

    if args.cmd == "audio":
        text = transcribe_file(args.path, backend=args.backend)
        print(f"Transcript: {text}")
        result = run_text_to_sign_pipeline(text, assets_dir=assets_dir)
        _write_gif(args.out, result.gif_bytes)
        print(result.gloss.gloss)
        print(f"Wrote: {args.out}")
        return 0

    if args.cmd == "mic":
        # Record and save to a temp wav so backends can consume a file path.
        audio = _record_mic(args.seconds)
        fd, tmp = tempfile.mkstemp(suffix=".wav")
        os.close(fd)
        tmp_path = Path(tmp)
        try:
            write_wav_pcm16(tmp_path, audio)
            text = transcribe_file(tmp_path, backend=args.backend)
            print(f"Transcript: {text}")
            result = run_text_to_sign_pipeline(text, assets_dir=assets_dir)
            _write_gif(args.out, result.gif_bytes)
            print(result.gloss.gloss)
            print(f"Wrote: {args.out}")
            return 0
        finally:
            try:
                tmp_path.unlink(missing_ok=True)
            except Exception:
                pass

    return 2


if __name__ == "__main__":
    raise SystemExit(main())
