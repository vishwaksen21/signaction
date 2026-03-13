from __future__ import annotations

import json
import os
import wave
from dataclasses import dataclass
from pathlib import Path

from vosk import KaldiRecognizer, Model

from ..audio import ensure_sample_rate, load_audio, write_wav_pcm16
from ..exceptions import ModelNotConfiguredError, SpeechToTextError


@dataclass
class VoskBackend:
    model_path: Path
    target_sample_rate: int = 16000

    @classmethod
    def from_env(cls) -> "VoskBackend":
        p = os.environ.get("VOSK_MODEL_PATH")
        if not p:
            raise ModelNotConfiguredError(
                "VOSK_MODEL_PATH is not set. Download a Vosk model and set this env var."
            )
        return cls(model_path=Path(p))

    def transcribe(self, audio_path: Path) -> str:
        if not self.model_path.exists():
            raise ModelNotConfiguredError(f"Vosk model not found: {self.model_path}")

        # Normalize the audio to 16kHz mono PCM16 WAV for Vosk.
        audio = ensure_sample_rate(load_audio(audio_path), self.target_sample_rate)
        tmp_wav = audio_path.with_suffix(".vosk.tmp.wav")
        write_wav_pcm16(tmp_wav, audio)

        try:
            model = Model(str(self.model_path))
            rec = KaldiRecognizer(model, self.target_sample_rate)

            with wave.open(str(tmp_wav), "rb") as wf:
                while True:
                    data = wf.readframes(4000)
                    if len(data) == 0:
                        break
                    rec.AcceptWaveform(data)

            result = json.loads(rec.FinalResult())
            text = (result.get("text") or "").strip()
            return text
        except Exception as e:  # noqa: BLE001 - wrap backend errors
            raise SpeechToTextError(f"Vosk transcription failed: {e}") from e
        finally:
            try:
                tmp_wav.unlink(missing_ok=True)
            except Exception:
                pass
