from __future__ import annotations

import json
import os
import urllib.request
import urllib.error
import logging

logger = logging.getLogger("uvicorn.error")

SYSTEM_PROMPT = """You are an expert in Indian Sign Language (ISL) Kinematics and 2D Animation.
Given an English word, produce a reliable 2D animation pattern for an Indian Sign Language (ISL)
stick-figure signer on a 320x360 canvas.

Your response must be linguistically accurate to ISL standards. Do not output generic wave movements
unless the actual ISL sign involves them. Prefer a clear, conservative sign approximation over a
visually exciting but incorrect animation.

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

Output a raw JSON object. Prefer this keyframe schema:

{
  "token": "UPPERCASE_WORD",
  "description": "Short ISL movement explanation",
  "confidence": 0.0 to 1.0,
  "keyframes": [
    {
      "t": 0.0,
      "r_elbow_offset": [x, y],
      "l_elbow_offset": [x, y],
      "r_wrist_landmark": "FOREHEAD" | "CHIN" | "CHEST" | "CHEEK_R" | "CHEEK_L" | "NEUTRAL",
      "l_wrist_landmark": "FOREHEAD" | "CHIN" | "CHEST" | "CHEEK_R" | "CHEEK_L" | "NEUTRAL",
      "r_wrist_offset": [x, y],
      "l_wrist_offset": [x, y],
      "r_hand": "flat" | "fist" | "point" | "v" | "pinch",
      "l_hand": "flat" | "fist" | "point" | "v" | "pinch",
      "r_hand_angle_degrees": number,
      "l_hand_angle_degrees": number
    }
  ]
}

Use 3-6 keyframes. Include the start pose, contact/location pose, movement apex or repetition pose,
and release/end pose. Keep wrist offsets within -80..80 and elbow offsets within -60..80. Keep
hand angles within -180..180.

If a token cannot be represented confidently, use fingerspelling-like neutral keyframes and set
confidence below 0.45.

Legacy schema is also accepted, but keyframes are preferred:

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

Be semantically accurate to ISL. For example:
- For 'THINK': target is FOREHEAD, r_hand is 'point', motion_type is 'tap', l_motion_type is 'none'.
- For 'DRINK': target is CHIN, r_hand is 'fist' or 'pinch', motion_type is 'vertical_wave' (moving towards mouth), l_motion_type is 'none'.
- For 'FLY': target is CHEST or NEUTRAL, both hands are 'flat', motion_type is 'vertical_wave', l_motion_type is 'mirror' (wings flapping).
- For 'WAVE' or 'HELLO': target is CHEEK_R, r_hand is 'flat', motion_type is 'horizontal_wave', l_motion_type is 'none'.
- For 'CLIMB': target is CHEST, both hands are 'fist', motion_type is 'vertical_wave', l_motion_type is 'opposite' (hands climbing in alternating phase).
- For 'BIRTHDAY': target is CHIN, both hands start as closed 'fist' near chest, move upward towards chin and open up to 'flat' hands (symbolizing birth/flowering), motion_type is 'vertical_wave', l_motion_type is 'mirror'.
- For 'COMMENSALITY' or 'SHARE': target is CHEST, both hands are 'flat', motion_type is 'horizontal_wave', l_motion_type is 'mirror' (gathering together).
"""


ANIMATION_PATTERN_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["token", "description", "confidence", "keyframes"],
    "properties": {
        "token": {"type": "string"},
        "description": {"type": "string"},
        "confidence": {"type": "number", "minimum": 0.0, "maximum": 1.0},
        "keyframes": {
            "type": "array",
            "minItems": 3,
            "maxItems": 6,
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": [
                    "t",
                    "r_elbow_offset",
                    "l_elbow_offset",
                    "r_wrist_landmark",
                    "l_wrist_landmark",
                    "r_wrist_offset",
                    "l_wrist_offset",
                    "r_hand",
                    "l_hand",
                    "r_hand_angle_degrees",
                    "l_hand_angle_degrees",
                ],
                "properties": {
                    "t": {"type": "number", "minimum": 0.0, "maximum": 1.0},
                    "r_elbow_offset": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": {"type": "number"},
                    },
                    "l_elbow_offset": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": {"type": "number"},
                    },
                    "r_wrist_landmark": {
                        "type": "string",
                        "enum": ["FOREHEAD", "CHIN", "CHEST", "CHEEK_R", "CHEEK_L", "NEUTRAL"],
                    },
                    "l_wrist_landmark": {
                        "type": "string",
                        "enum": ["FOREHEAD", "CHIN", "CHEST", "CHEEK_R", "CHEEK_L", "NEUTRAL"],
                    },
                    "r_wrist_offset": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": {"type": "number"},
                    },
                    "l_wrist_offset": {
                        "type": "array",
                        "minItems": 2,
                        "maxItems": 2,
                        "items": {"type": "number"},
                    },
                    "r_hand": {
                        "type": "string",
                        "enum": ["flat", "fist", "point", "v", "pinch"],
                    },
                    "l_hand": {
                        "type": "string",
                        "enum": ["flat", "fist", "point", "v", "pinch"],
                    },
                    "r_hand_angle_degrees": {"type": "number", "minimum": -180, "maximum": 180},
                    "l_hand_angle_degrees": {"type": "number", "minimum": -180, "maximum": 180},
                },
            },
        },
    },
}


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
    
    model = os.environ.get("SIGNACTION_OPENAI_MODEL", "gpt-4o-mini")
    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Generate an ISL animation keyframe pattern for this token: '{token}'. "
                    "Return only JSON."
                ),
            },
        ],
        "temperature": 0.2,
        "response_format": {
            "type": "json_schema",
            "json_schema": {
                "name": "sign_animation_pattern",
                "strict": True,
                "schema": ANIMATION_PATTERN_SCHEMA,
            },
        },
    }

    def _send(request_body: dict) -> dict:
        req = urllib.request.Request(
            url,
            data=json.dumps(request_body).encode("utf-8"),
            headers=headers,
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=8.0) as response:
            return json.loads(response.read().decode("utf-8"))

    try:
        print(f"INFO:     [LLM Client] Querying OpenAI API ({model}) for token sign parameters: '{token}'", flush=True)

        try:
            res_body = _send(body)
        except urllib.error.HTTPError as e:
            if e.code != 400:
                raise

            print(
                f"WARNING:  [LLM Client] OpenAI schema mode rejected for '{token}'. Retrying JSON mode.",
                flush=True,
            )
            legacy_body = dict(body)
            legacy_body["response_format"] = {"type": "json_object"}
            res_body = _send(legacy_body)

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
    """Consolidated LLM client that queries OpenAI first, then falls back to Gemini."""
    params = call_openai_api_keypoint_params(token)
    if params:
        return params
        
    print(f"INFO:     [LLM Client] OpenAI call bypassed/failed for '{token}'. Trying Gemini fallback...", flush=True)
    return call_gemini_api_keypoint_params(token)
