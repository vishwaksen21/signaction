from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
import logging
from pathlib import Path

logger = logging.getLogger("uvicorn.error")

SYSTEM_PROMPT = """You are an expert in Sign Language Kinematics and 2D Animation.
Given an English word, describe how to translate this word into a 2D sign language stick-figure animation sequence on a 320x320 canvas.

The skeletal coordinate anchors are:
- HEAD: [160, 80]
- NECK: [160, 110]
- L_SHOULDER: [110, 125]
- R_SHOULDER: [210, 125]
- TORSO_BOT: [160, 240]
- CHEST: [160, 150] (NECK + [0, 40])
- FOREHEAD: [160, 65] (HEAD + [0, -15])
- CHIN: [160, 105] (HEAD + [0, 25])
- CHEEK_R: [180, 90] (HEAD + [20, 10])
- CHEEK_L: [140, 90] (HEAD + [-20, 10])
- NEUTRAL: [210, 170] (Base right-side neutral space)

Output a raw JSON object matching the following schema. Do NOT include markdown code blocks (like ```json).

{
  "target_landmark": "FOREHEAD" | "CHIN" | "CHEST" | "CHEEK_R" | "CHEEK_L" | "NEUTRAL",
  "r_elbow_offset": [x, y], // offset from R_SHOULDER [210, 125] to right elbow (typically [15, 10] to [40, 45])
  "l_elbow_offset": [x, y], // offset from L_SHOULDER [110, 125] to left elbow (typically [-15, 10] to [-40, 45])
  "l_wrist_offset": [x, y], // offset from left elbow to left wrist (e.g. [0, 40] hanging down, or [20, 0] at chest level)
  "r_hand": "flat" | "fist" | "point" | "v" | "pinch",
  "l_hand": "flat" | "fist" | "point" | "v" | "pinch",
  "r_hand_angle_degrees": number, // rotation angle for right hand (usually -180 to 180)
  "l_hand_angle_degrees": number, // rotation angle for left hand (usually -180 to 180)
  "motion_type": "vertical_wave" | "horizontal_wave" | "circle" | "tap" | "none",
  "motion_amplitude": number, // movement distance in pixels (usually 5 to 30)
  "motion_frequency": number, // loops per cycle (usually 0.5 to 3.0)
  "l_motion_type": "vertical_wave" | "horizontal_wave" | "circle" | "tap" | "none" | "mirror" | "opposite", // left arm motion type
  "l_motion_amplitude": number, // left arm movement distance in pixels (usually 5 to 30)
  "l_motion_frequency": number, // left arm loops per cycle (usually 0.5 to 3.0)
  "description": "Short explanation of the sign"
}

Be semantically accurate. For example:
- For 'THINK': target is FOREHEAD, r_hand is 'point', motion_type is 'tap', l_motion_type is 'none'.
- For 'DRINK': target is CHIN, r_hand is 'fist' or 'pinch', motion_type is 'vertical_wave', l_motion_type is 'none'.
- For 'FLY': target is CHEST or NEUTRAL, both hands are 'flat', motion_type is 'vertical_wave', l_motion_type is 'mirror' (both hands flapping symmetrically).
- For 'WAVE' or 'HELLO': target is CHEEK_R, r_hand is 'flat', motion_type is 'horizontal_wave', l_motion_type is 'none'.
- For 'CLIMB': target is CHEST, both hands are 'fist', motion_type is 'vertical_wave', l_motion_type is 'opposite' (hands climbing in alternating phase).
- For 'COMMENSALITY' or 'SHARE': target is CHEST, both hands are 'flat', motion_type is 'horizontal_wave', l_motion_type is 'mirror'.
"""


def call_gemini_api_keypoint_params(token: str) -> dict | None:
    """Query Gemini API to get sign gesture animation parameters for a token."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("INFO:     [LLM Client] GEMINI_API_KEY not configured. Skipping Gemini call.", flush=True)
        return None

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    prompt = f"Please generate sign parameters for the word: '{token}'"
    
    body = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": SYSTEM_PROMPT},
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "application/json"
        }
    }

    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(body).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        print(f"INFO:     [LLM Client] Querying Gemini API for token sign parameters: '{token}'", flush=True)
        
        with urllib.request.urlopen(req, timeout=8.0) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            text = res_body["candidates"][0]["content"]["parts"][0]["text"].strip()
            params = json.loads(text)
            print(f"INFO:     [LLM Client] Gemini successfully generated sign params for '{token}': {params.get('description')}", flush=True)
            return params
            
    except urllib.error.URLError as e:
        print(f"WARNING:  [LLM Client] Failed to connect to Gemini API: {e}", flush=True)
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        print(f"ERROR:    [LLM Client] Failed to parse Gemini response for '{token}': {e}", flush=True)
    except Exception as e:
        print(f"ERROR:    [LLM Client] Unexpected error querying Gemini API: {e}", flush=True)
        
    return None


def call_openai_api_keypoint_params(token: str) -> dict | None:
    """Query OpenAI GPT API to get sign gesture animation parameters for a token."""
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("INFO:     [LLM Client] OPENAI_API_KEY not configured. Skipping OpenAI call.", flush=True)
        return None

    url = "https://api.openai.com/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    body = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Please generate sign parameters for the word: '{token}'"}
        ],
        "response_format": {"type": "json_object"}
    }

    try:
        req = urllib.request.Request(
            url, 
            data=json.dumps(body).encode("utf-8"), 
            headers=headers, 
            method="POST"
        )
        print(f"INFO:     [LLM Client] Querying OpenAI API (gpt-4o-mini) for token sign parameters: '{token}'", flush=True)
        
        with urllib.request.urlopen(req, timeout=8.0) as response:
            res_body = json.loads(response.read().decode("utf-8"))
            text = res_body["choices"][0]["message"]["content"].strip()
            params = json.loads(text)
            print(f"INFO:     [LLM Client] OpenAI successfully generated sign params for '{token}': {params.get('description')}", flush=True)
            return params
            
    except urllib.error.URLError as e:
        print(f"WARNING:  [LLM Client] Failed to connect to OpenAI API: {e}", flush=True)
    except (json.JSONDecodeError, KeyError, IndexError) as e:
        print(f"ERROR:    [LLM Client] Failed to parse OpenAI response for '{token}': {e}", flush=True)
    except Exception as e:
        print(f"ERROR:    [LLM Client] Unexpected error querying OpenAI API: {e}", flush=True)
        
    return None


def call_llm_sign_params(token: str) -> dict | None:
    """Consolidated LLM client that queries Gemini first, and falls back to OpenAI GPT if Gemini fails."""
    # 1. Try Gemini
    params = call_gemini_api_keypoint_params(token)
    if params:
        return params
        
    # 2. Fallback to OpenAI GPT
    print(f"INFO:     [LLM Client] Gemini call bypassed/failed for '{token}'. Trying OpenAI GPT fallback...", flush=True)
    params = call_openai_api_keypoint_params(token)
    return params
