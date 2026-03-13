from __future__ import annotations

import io
import wave
from dataclasses import dataclass
from pathlib import Path
from typing import BinaryIO

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly


@dataclass(frozen=True)
class AudioData:
    samples: np.ndarray  # float32 in [-1, 1]
    sample_rate: int


def load_audio(file: str | Path | BinaryIO | bytes) -> AudioData:
    """Load audio to mono float32 using soundfile."""

    if isinstance(file, (str, Path)):
        data, sr = sf.read(str(file), dtype="float32", always_2d=True)
    elif isinstance(file, (bytes, bytearray)):
        bio = io.BytesIO(file)
        data, sr = sf.read(bio, dtype="float32", always_2d=True)
    else:
        data, sr = sf.read(file, dtype="float32", always_2d=True)

    # Mixdown to mono
    mono = np.mean(data, axis=1).astype(np.float32)
    return AudioData(samples=mono, sample_rate=int(sr))


def ensure_sample_rate(audio: AudioData, target_sr: int) -> AudioData:
    if audio.sample_rate == target_sr:
        return audio

    # Rational resampling via polyphase filtering.
    gcd = np.gcd(audio.sample_rate, target_sr)
    up = target_sr // gcd
    down = audio.sample_rate // gcd
    resampled = resample_poly(audio.samples, up, down).astype(np.float32)
    return AudioData(samples=resampled, sample_rate=target_sr)


def to_pcm16_bytes(audio: AudioData) -> bytes:
    clipped = np.clip(audio.samples, -1.0, 1.0)
    pcm = (clipped * 32767.0).astype(np.int16)
    return pcm.tobytes()


def write_wav_pcm16(path: str | Path, audio: AudioData) -> Path:
    path = Path(path)
    pcm_bytes = to_pcm16_bytes(audio)

    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(audio.sample_rate)
        wf.writeframes(pcm_bytes)

    return path
