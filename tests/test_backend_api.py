from __future__ import annotations

import io
import wave

from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def _make_silence_wav(duration_sec: float = 0.5, sample_rate: int = 16000) -> bytes:
    buf = io.BytesIO()
    num_frames = int(duration_sec * sample_rate)
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        wf.writeframes(b"\x00\x00" * num_frames)
    return buf.getvalue()


def test_health_endpoint():
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "ok"}


def test_dictionary_has_no_duplicate_tokens():
    resp = client.get("/dictionary")
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert len(items) >= 347
    tokens = [item["token"] for item in items]
    assert len(tokens) == len(set(tokens)), "Dictionary should not contain duplicate tokens"


def test_translate_phrases_and_vocabulary():
    cases = {
        "Thank you": ["THANK_YOU"],
        "See you": ["SEE", "YOU"],
        "Good morning": ["GOOD_MORNING"],
        "Excuse me": ["EXCUSE_ME"],
        "I understand": ["I_UNDERSTAND"],
        "I like food": ["ME", "LIKE", "FOOD"],
        "My name is": ["MY_NAME_IS"],
    }
    for sentence, expected_tokens in cases.items():
        resp = client.post("/translate-text", json={"text": sentence, "offline_only": True})
        assert resp.status_code == 200, f"Failed for {sentence}: {resp.text}"
        body = resp.json()
        assert body["tokens"] == expected_tokens
        assert len(body["gestures"]) == len(expected_tokens)
        assert all(url.startswith("/assets/") for url in body["gestures"])


def test_translate_digits_and_offline_fingerspelling():
    resp = client.post(
        "/translate-text",
        json={"text": "Zebra 42", "offline_only": True},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["tokens"] == ["Z", "E", "B", "R", "A", "4", "2"]
    assert all("youtube" not in url.lower() for url in body["gestures"])
    assert all(url.endswith(".mp4") for url in body["gestures"])


def test_translate_empty_input_rejected():
    resp = client.post("/translate-text", json={"text": "   "})
    assert resp.status_code == 400


def test_translate_speech_validation_and_wav():
    bad = client.post(
        "/translate-speech",
        files={"file": ("notes.txt", b"not audio", "text/plain")},
    )
    assert bad.status_code in (400, 415)

    wav_bytes = _make_silence_wav()
    ok = client.post(
        "/translate-speech",
        files={"file": ("silence.wav", wav_bytes, "audio/wav")},
    )
    assert ok.status_code == 200
    data = ok.json()
    assert "transcript" in data
    assert "tokens" in data
    assert "gestures" in data
