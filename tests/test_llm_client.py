from __future__ import annotations

import os
from pathlib import Path
import numpy as np
from signaction.ai_fallback import _parse_llm_sign_params, generate_ai_fallback_gif

def test_parse_llm_sign_params() -> None:
    raw_params = {
        "target_landmark": "FOREHEAD",
        "r_elbow_offset": [30, 20],
        "l_elbow_offset": [-30, 20],
        "l_wrist_offset": [10, 10],
        "r_hand": "point",
        "l_hand": "flat",
        "r_hand_angle_degrees": 45.0,
        "l_hand_angle_degrees": -45.0,
        "motion_type": "vertical_wave",
        "motion_amplitude": 15.0,
        "motion_frequency": 2.0,
        "description": "Mocked test climb sign"
    }
    
    parsed = _parse_llm_sign_params(raw_params)
    assert parsed["r_hand"] == "point"
    assert parsed["l_hand"] == "flat"
    assert parsed["r_hand_angle"] == 45.0
    assert parsed["l_hand_angle"] == -45.0
    assert parsed["description"] == "Mocked test climb sign"
    
    # Check that coordinate targets are correct (FOREHEAD coordinates should be resolved)
    from signaction.ai_fallback import FOREHEAD
    assert np.array_equal(parsed["target"], FOREHEAD)
    
    # Check motion function generates expected numpy offsets
    motion_fn = parsed["r_motion"]
    # At phase = 0, sin is 0
    assert np.allclose(motion_fn(0.0), [0.0, 0.0])

import math

def test_parse_two_handed_motion_params() -> None:
    raw_params = {
        "target_landmark": "CHEST",
        "motion_type": "vertical_wave",
        "motion_amplitude": 10.0,
        "motion_frequency": 1.0,
        "l_motion_type": "opposite",
        "l_motion_amplitude": 10.0,
        "l_motion_frequency": 1.0,
        "r_hand": "fist",
        "l_hand": "fist",
    }
    parsed = _parse_llm_sign_params(raw_params)
    assert "l_motion" in parsed
    r_motion = parsed["r_motion"]
    l_motion = parsed["l_motion"]
    
    # At phase = 0, sin(0) and sin(pi) are 0
    assert np.allclose(r_motion(0.0), [0.0, 0.0])
    assert np.allclose(l_motion(0.0), [0.0, 0.0])
    
    # At phase = pi/2:
    # r_motion = sin(pi/2) * amp = 10 -> [0, 10]
    # l_motion = opposite phase: sin(pi/2 + pi) * amp = -10 -> [0, -10]
    assert np.allclose(r_motion(math.pi / 2), [0.0, 10.0])
    assert np.allclose(l_motion(math.pi / 2), [0.0, -10.0])


def test_parse_llm_keyframe_pattern_clamps_and_interpolates() -> None:
    raw_params = {
        "token": "BIRTHDAY",
        "description": "Hands rise from chest and open near chin",
        "confidence": 0.8,
        "keyframes": [
            {
                "t": 0.0,
                "r_elbow_offset": [200, 10],
                "l_elbow_offset": [-200, 10],
                "r_wrist_landmark": "CHEST",
                "l_wrist_landmark": "CHEST",
                "r_wrist_offset": [20, 20],
                "l_wrist_offset": [-20, 20],
                "r_hand": "fist",
                "l_hand": "fist",
                "r_hand_angle_degrees": 90,
                "l_hand_angle_degrees": 90,
            },
            {
                "t": 0.5,
                "r_elbow_offset": [20, 0],
                "l_elbow_offset": [-20, 0],
                "r_wrist_landmark": "CHIN",
                "l_wrist_landmark": "CHIN",
                "r_wrist_offset": [10, 10],
                "l_wrist_offset": [-10, 10],
                "r_hand": "flat",
                "l_hand": "flat",
                "r_hand_angle_degrees": -45,
                "l_hand_angle_degrees": -135,
            },
            {
                "t": 1.0,
                "r_elbow_offset": [20, 10],
                "l_elbow_offset": [-20, 10],
                "r_wrist_landmark": "CHIN",
                "l_wrist_landmark": "CHIN",
                "r_wrist_offset": [30, -10],
                "l_wrist_offset": [-30, -10],
                "r_hand": "flat",
                "l_hand": "flat",
                "r_hand_angle_degrees": -20,
                "l_hand_angle_degrees": -160,
            },
        ],
    }

    parsed = _parse_llm_sign_params(raw_params)
    assert parsed["uses_keyframes"] is True
    assert parsed["description"] == "Hands rise from chest and open near chin"
    assert parsed["r_elbow_offset"][0] == 80.0
    assert parsed["l_elbow_offset"][0] == -80.0

    start = parsed["r_motion"](0.0)
    end = parsed["r_motion"](1.0)
    assert np.allclose(start, [180.0, 140.0])
    assert np.allclose(end, [190.0, 65.0])

def test_generate_ai_fallback_gif_falls_back_without_key(tmp_path: Path) -> None:
    # Temporarily remove keys if present
    old_gemini = os.environ.get("GEMINI_API_KEY")
    old_openai = os.environ.get("OPENAI_API_KEY")
    os.environ.pop("GEMINI_API_KEY", None)
    os.environ.pop("OPENAI_API_KEY", None)
        
    try:
        out = tmp_path / "CLIMB.gif"
        # Should execute successfully using standard heuristic mappings
        res = generate_ai_fallback_gif("CLIMB", out)
        assert res.exists()
        assert res == out
    finally:
        # Restore keys
        if old_gemini is not None:
            os.environ["GEMINI_API_KEY"] = old_gemini
        if old_openai is not None:
            os.environ["OPENAI_API_KEY"] = old_openai


from unittest.mock import MagicMock, patch
import json
from signaction.llm_client import call_gemini_api_keypoint_params, call_openai_api_keypoint_params, call_llm_sign_params

@patch("urllib.request.urlopen")
def test_call_gemini_api_keypoint_params(mock_urlopen) -> None:
    os.environ["GEMINI_API_KEY"] = "mock-gemini-key"
    
    mock_res = MagicMock()
    mock_res.read.return_value = json.dumps({
        "candidates": [{
            "content": {
                "parts": [{
                    "text": '{"target_landmark": "CHIN", "motion_type": "vertical_wave", "description": "Mocked sign description"}'
                }]
            }
        }]
    }).encode("utf-8")
    
    mock_urlopen.return_value.__enter__.return_value = mock_res
    
    res = call_gemini_api_keypoint_params("swim")
    assert res is not None
    assert res["target_landmark"] == "CHIN"
    assert res["description"] == "Mocked sign description"


@patch("urllib.request.urlopen")
def test_call_openai_api_keypoint_params(mock_urlopen) -> None:
    os.environ["OPENAI_API_KEY"] = "mock-openai-key"
    
    mock_res = MagicMock()
    mock_res.read.return_value = json.dumps({
        "choices": [{
            "message": {
                "content": '{"target_landmark": "FOREHEAD", "motion_type": "tap", "description": "OpenAI description"}'
            }
        }]
    }).encode("utf-8")
    
    mock_urlopen.return_value.__enter__.return_value = mock_res
    
    res = call_openai_api_keypoint_params("think")
    assert res is not None
    assert res["target_landmark"] == "FOREHEAD"
    assert res["description"] == "OpenAI description"

    request = mock_urlopen.call_args.args[0]
    body = json.loads(request.data.decode("utf-8"))
    assert body["response_format"]["type"] == "json_schema"
    assert body["response_format"]["json_schema"]["strict"] is True


@patch("urllib.request.urlopen")
def test_call_llm_sign_params_fallback_flow(mock_urlopen) -> None:
    # Bypasses Gemini if key is not set, tries OpenAI
    os.environ.pop("GEMINI_API_KEY", None)
    os.environ["OPENAI_API_KEY"] = "mock-openai-key"
    
    mock_res = MagicMock()
    mock_res.read.return_value = json.dumps({
        "choices": [{
            "message": {
                "content": '{"target_landmark": "CHEST", "description": "Fallback to OpenAI"}'
            }
        }]
    }).encode("utf-8")
    
    mock_urlopen.return_value.__enter__.return_value = mock_res
    
    res = call_llm_sign_params("climb")
    assert res is not None
    assert res["target_landmark"] == "CHEST"
    assert res["description"] == "Fallback to OpenAI"
