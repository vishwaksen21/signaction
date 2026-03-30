"""
AI Fallback GIF Generator — ISL-Inspired Skeletal Animations
============================================================
Renders deterministic animated stick figures that approximate ISL (Indian Sign
Language) body-region signs for common vocabulary words.  Each sign encodes:
  • Location  – where in signing space the gesture occurs (forehead / chin /
                chest / neutral / non-dominant hand)
  • Movement  – the dynamic path of the dominant hand per frame
  • Handshape – rendered as simplified finger strokes on the wrist joint

Signs are sourced from ISLRTC dictionary descriptions and ISL research papers
(INCLUDE dataset vocab, IIT-Madras ISL corpus).  For words without an explicit
entry the renderer falls back to a family-of-4 neutral animation so that
different unknown words still look distinct.
"""
from __future__ import annotations

import hashlib
import math
from pathlib import Path
from typing import Callable

import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------------------
# Canvas & colour constants
# ---------------------------------------------------------------------------
BG_COLOR   = (248, 249, 252)
LINE_COLOR = (30, 70, 200)
JOINT_COLOR = (220, 60, 60)
HAND_COLOR  = (255, 180, 0)
FINGER_COLOR = (255, 120, 30)
LABEL_BG    = (40, 40, 60)
LABEL_FG    = (130, 255, 130)

W, H = 320, 360          # canvas size
THICK = 3                # arm line thickness

# ---------------------------------------------------------------------------
# Base skeleton (static, relative to canvas centre)
# ---------------------------------------------------------------------------
CX, CY = W // 2, H // 4 + 10       # chest centre reference

HEAD       = np.array([CX,      CY - 50], dtype=float)
NECK       = np.array([CX,      CY - 20], dtype=float)
L_SHOULDER = np.array([CX - 45, CY],     dtype=float)
R_SHOULDER = np.array([CX + 45, CY],     dtype=float)
TORSO_BOT  = np.array([CX,      CY + 90], dtype=float)

# Convenient landmark points used by sign definitions
FOREHEAD = HEAD + np.array([0, -15], dtype=float)
CHIN     = HEAD + np.array([0, +25], dtype=float)
CHEEK_R  = HEAD + np.array([20, 10], dtype=float)
CHEEK_L  = HEAD + np.array([-20, 10], dtype=float)
CHEST    = NECK + np.array([0, 40], dtype=float)
NEUTRAL  = np.array([CX + 50, CY + 60], dtype=float)   # neutral signing space


# ---------------------------------------------------------------------------
# Handshape painter helpers
# Called with (draw, wrist_xy, angle_rad, scale, color)
# ---------------------------------------------------------------------------
def _finger_ray(draw: ImageDraw.ImageDraw,
                base: np.ndarray,
                angle: float,
                length: float,
                color: tuple) -> None:
    tip = base + np.array([math.cos(angle) * length,
                            math.sin(angle) * length])
    draw.line([tuple(base.astype(int)), tuple(tip.astype(int))],
              fill=color, width=2)


def draw_flat_hand(draw, wx, wy, base_angle=0.0, scale=1.0):
    """Open flat hand — 4 fingers spread."""
    b = np.array([wx, wy], dtype=float)
    for i, offset in enumerate([-30, -15, 0, 15]):
        a = math.radians(base_angle + offset)
        _finger_ray(draw, b, a, 20 * scale, FINGER_COLOR)
    # thumb
    _finger_ray(draw, b, math.radians(base_angle + 60), 14 * scale, FINGER_COLOR)


def draw_fist(draw, wx, wy, base_angle=0.0, scale=1.0):
    """Closed fist — short nubs."""
    b = np.array([wx, wy], dtype=float)
    for offset in [-15, 0, 15]:
        a = math.radians(base_angle + offset)
        _finger_ray(draw, b, a, 8 * scale, FINGER_COLOR)
    _finger_ray(draw, b, math.radians(base_angle + 50), 10 * scale, FINGER_COLOR)


def draw_point(draw, wx, wy, base_angle=0.0, scale=1.0):
    """Index finger extended — pointing."""
    b = np.array([wx, wy], dtype=float)
    _finger_ray(draw, b, math.radians(base_angle), 22 * scale, FINGER_COLOR)
    for offset in [20, 35, 50]:
        _finger_ray(draw, b, math.radians(base_angle + offset), 8 * scale, FINGER_COLOR)
    _finger_ray(draw, b, math.radians(base_angle + 70), 10 * scale, FINGER_COLOR)


def draw_letter_v(draw, wx, wy, base_angle=0.0, scale=1.0):
    """V / peace handshape — index + middle extended."""
    b = np.array([wx, wy], dtype=float)
    _finger_ray(draw, b, math.radians(base_angle - 12), 22 * scale, FINGER_COLOR)
    _finger_ray(draw, b, math.radians(base_angle + 12), 22 * scale, FINGER_COLOR)
    for offset in [30, 50]:
        _finger_ray(draw, b, math.radians(base_angle + offset), 8 * scale, FINGER_COLOR)
    _finger_ray(draw, b, math.radians(base_angle + 65), 10 * scale, FINGER_COLOR)


def draw_hook(draw, wx, wy, base_angle=0.0, scale=1.0):
    """Bent / hooked index finger."""
    b = np.array([wx, wy], dtype=float)
    # Index extends then curves
    mid = b + np.array([math.cos(math.radians(base_angle)) * 12 * scale,
                         math.sin(math.radians(base_angle)) * 12 * scale])
    tip = mid + np.array([math.cos(math.radians(base_angle + 45)) * 8 * scale,
                           math.sin(math.radians(base_angle + 45)) * 8 * scale])
    draw.line([tuple(b.astype(int)), tuple(mid.astype(int)),
               tuple(tip.astype(int))], fill=FINGER_COLOR, width=2)
    for offset in [30, 50]:
        _finger_ray(draw, b, math.radians(base_angle + offset), 8 * scale, FINGER_COLOR)
    _finger_ray(draw, b, math.radians(base_angle + 65), 10 * scale, FINGER_COLOR)


def draw_pinch(draw, wx, wy, base_angle=0.0, scale=1.0):
    """Pinch (O-shape) — all fingers curled toward thumb."""
    b = np.array([wx, wy], dtype=float)
    for i, offset in enumerate([-30, -15, 0, 15, 35]):
        length = 10 * scale if i < 4 else 12 * scale
        _finger_ray(draw, b, math.radians(base_angle + offset), length, FINGER_COLOR)


# Map handshape name → painter
HANDSHAPES: dict[str, Callable] = {
    "flat":  draw_flat_hand,
    "fist":  draw_fist,
    "point": draw_point,
    "v":     draw_letter_v,
    "hook":  draw_hook,
    "pinch": draw_pinch,
}


# ---------------------------------------------------------------------------
# ISL Sign definitions
# ---------------------------------------------------------------------------
# Each entry is a dict with:
#   tokens          – set of uppercase words this covers
#   r_elbow_offset  – dominant (right) elbow relative to r_shoulder  [dx, dy]
#   target          – landmark array the dominant wrist moves toward
#   r_motion        – function(phase) → [dx, dy] offset on top of target
#   l_elbow_offset  – non-dominant elbow
#   l_wrist_offset  – non-dominant wrist relative to l_elbow
#   r_hand          – dominant handshape name
#   l_hand          – non-dominant handshape name
#   r_hand_angle    – base angle (degrees, measured rightward from +x)
#   l_hand_angle    – same for left
#   description     – human label for the overlay

def _osc(phase, amp, freq=1.0):
    return np.sin(phase * freq) * amp

def _cos(phase, amp, freq=1.0):
    return np.cos(phase * freq) * amp


ISL_SIGNS = [
    # ------------------------------------------------------------------ HELLO
    {
        "tokens": {"HELLO", "HI", "NAMASTE", "GREET", "GREETING"},
        # Right hand flat near forehead, moves outward (salute motion)
        "r_elbow_offset": [30, -20],
        "target": FOREHEAD,
        "r_motion": lambda p: np.array([_osc(p, 18, 1), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": -70, "l_hand_angle": -90,
        "description": "HELLO — Salute outward (ISL)",
    },
    # ------------------------------------------------------------------ APPLE
    {
        "tokens": {"APPLE"},
        # Hooked index finger twists at cheek (ISLRTC)
        "r_elbow_offset": [30, 10],
        "target": CHEEK_R,
        "r_motion": lambda p: np.array([_osc(p, 4, 2), _cos(p, 4, 2)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "hook", "l_hand": "flat",
        "r_hand_angle": -20, "l_hand_angle": -90,
        "description": "APPLE — Hook twist at cheek (ISL)",
    },
    # ------------------------------------------------------------------ STOP / NO
    {
        "tokens": {"STOP", "NO", "CANCEL", "WAIT", "HALT", "ENOUGH"},
        # Right chops onto left palm (ISLRTC)
        "r_elbow_offset": [20, 20],
        "target": np.array([CX - 10, CY + 50], dtype=float),
        "r_motion": lambda p: np.array([0, _osc(p, 20, 2)]),
        "l_elbow_offset": [-30, 30],
        "l_wrist_offset": [20, 30],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": 0, "l_hand_angle": -90,
        "description": "STOP — Chop onto left palm (ISL)",
    },
    # ------------------------------------------------------------------ THANK YOU / GOOD
    {
        "tokens": {"THANK", "THANKS", "THANK YOU", "GOOD", "NICE", "WONDERFUL"},
        # Flat hand from chin moves forward
        "r_elbow_offset": [20, 10],
        "target": CHIN,
        "r_motion": lambda p: np.array([_osc(p, 20, 1), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": -50, "l_hand_angle": -90,
        "description": "THANK YOU — Chin forward (ISL)",
    },
    # ------------------------------------------------------------------ HELP
    {
        "tokens": {"HELP", "ASSIST", "SUPPORT", "AID"},
        # Fist on open non-dominant palm, lifts upward
        "r_elbow_offset": [10, 30],
        "target": np.array([CX - 10, CY + 50], dtype=float),
        "r_motion": lambda p: np.array([0, _osc(p, -25, 1)]),
        "l_elbow_offset": [-30, 30],
        "l_wrist_offset": [20, 30],
        "r_hand": "fist", "l_hand": "flat",
        "r_hand_angle": 0, "l_hand_angle": -90,
        "description": "HELP — Fist lifts on palm (ISL)",
    },
    # ------------------------------------------------------------------ PLEASE / REQUEST
    {
        "tokens": {"PLEASE", "REQUEST", "WANT", "NEED"},
        # Flat right hand circles on chest
        "r_elbow_offset": [20, 10],
        "target": CHEST,
        "r_motion": lambda p: np.array([_osc(p, 16, 1), _cos(p, 16, 1)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": 30, "l_hand_angle": -90,
        "description": "PLEASE — Flat hand circles chest (ISL)",
    },
    # ------------------------------------------------------------------ YES / AGREE
    {
        "tokens": {"YES", "AGREE", "OK", "OKAY", "CORRECT", "RIGHT"},
        # Fist nods (wrist bends down-up repeatedly)
        "r_elbow_offset": [30, 10],
        "target": NEUTRAL,
        "r_motion": lambda p: np.array([0, _osc(p, 18, 2)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "fist", "l_hand": "fist",
        "r_hand_angle": -10, "l_hand_angle": -90,
        "description": "YES — Fist nods (ISL)",
    },
    # ------------------------------------------------------------------ COME / COME HERE
    {
        "tokens": {"COME", "APPROACH", "ARRIVE", "HERE"},
        # Index finger beckons toward body
        "r_elbow_offset": [50, 0],
        "target": NEUTRAL + np.array([20, 0]),
        "r_motion": lambda p: np.array([_osc(p, -22, 1), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": 180, "l_hand_angle": -90,
        "description": "COME — Beckoning index (ISL)",
    },
    # ------------------------------------------------------------------ GO / LEAVE
    {
        "tokens": {"GO", "LEAVE", "MOVE", "WALK", "RUN", "EXIT"},
        # Index points and moves forward
        "r_elbow_offset": [30, 0],
        "target": NEUTRAL,
        "r_motion": lambda p: np.array([_osc(p, 22, 1), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": 0, "l_hand_angle": -90,
        "description": "GO — Index points forward (ISL)",
    },
    # ------------------------------------------------------------------ LOVE / LIKE
    {
        "tokens": {"LOVE", "LIKE", "CARE", "HEART", "HAPPY"},
        # Both arms cross over chest
        "r_elbow_offset": [-10, 10],
        "target": CHEST + np.array([-15, 0]),
        "r_motion": lambda p: np.array([_osc(p, 6, 1), 0]),
        "l_elbow_offset": [10, 10],
        "l_wrist_offset": [-15, 10],
        "r_hand": "fist", "l_hand": "fist",
        "r_hand_angle": 90, "l_hand_angle": 90,
        "description": "LOVE — Arms cross chest (ISL)",
    },
    # ------------------------------------------------------------------ FOOD / EAT
    {
        "tokens": {"FOOD", "EAT", "MEAL", "LUNCH", "DINNER", "BREAKFAST", "DRINK"},
        # Pinched fingers move to mouth
        "r_elbow_offset": [20, 10],
        "target": CHIN + np.array([10, -10]),
        "r_motion": lambda p: np.array([_osc(p, 6, 2), _cos(p, 5, 2)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "pinch", "l_hand": "flat",
        "r_hand_angle": -50, "l_hand_angle": -90,
        "description": "EAT — Pinch to mouth (ISL)",
    },
    # ------------------------------------------------------------------ WATER
    {
        "tokens": {"WATER", "DRINK", "THIRSTY"},
        # W-shape (3 fingers) near mouth, moves down
        "r_elbow_offset": [25, 10],
        "target": CHIN + np.array([15, 0]),
        "r_motion": lambda p: np.array([_osc(p, 8, 1), _osc(p, 10, 1)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "v", "l_hand": "flat",
        "r_hand_angle": -60, "l_hand_angle": -90,
        "description": "WATER — V-shape near mouth (ISL)",
    },
    # ------------------------------------------------------------------ BAD / WRONG
    {
        "tokens": {"BAD", "WRONG", "EVIL", "UGLY", "TERRIBLE"},
        # Hand from chin flips down/away
        "r_elbow_offset": [20, 10],
        "target": CHIN,
        "r_motion": lambda p: np.array([_osc(p, 25, 1), _osc(p, 15, 1)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": -30, "l_hand_angle": -90,
        "description": "BAD — Chin flip away (ISL)",
    },
    # ------------------------------------------------------------------ I / ME / MYSELF
    {
        "tokens": {"I", "ME", "MYSELF", "MY"},
        # Index points to chest
        "r_elbow_offset": [10, 10],
        "target": CHEST,
        "r_motion": lambda p: np.array([0, 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": 90, "l_hand_angle": -90,
        "description": "ME — Index to chest (ISL)",
    },
    # ------------------------------------------------------------------ YOU
    {
        "tokens": {"YOU", "YOUR", "YOURS"},
        # Index points forward toward viewer
        "r_elbow_offset": [40, 0],
        "target": NEUTRAL + np.array([30, -10]),
        "r_motion": lambda p: np.array([_osc(p, 5, 1), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": 0, "l_hand_angle": -90,
        "description": "YOU — Index points forward (ISL)",
    },
    # ------------------------------------------------------------------ LEARN / STUDY
    {
        "tokens": {"LEARN", "STUDY", "EDUCATION", "SCHOOL", "LEARNING"},
        # Flat hand from forehead moves down to neutral
        "r_elbow_offset": [20, -10],
        "target": FOREHEAD,
        "r_motion": lambda p: np.array([0, _osc(p, 30, 1)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": -80, "l_hand_angle": -90,
        "description": "LEARN — Forehead down (ISL)",
    },
    # ------------------------------------------------------------------ WORK / BUILD
    {
        "tokens": {"WORK", "BUILD", "MAKE", "CREATE", "BUILDING", "APPS", "APP"},
        # Both fists alternate beat forward
        "r_elbow_offset": [30, 20],
        "target": NEUTRAL,
        "r_motion": lambda p: np.array([_osc(p, 15, 2), _osc(p, 10, 2)]),
        "l_elbow_offset": [-30, 20],
        "l_wrist_offset": [0, 20],
        "r_hand": "fist", "l_hand": "fist",
        "r_hand_angle": 0, "l_hand_angle": 0,
        "description": "WORK — Alternating fists (ISL)",
    },
    # ------------------------------------------------------------------ PYTHON / COMPUTER / CODE
    {
        "tokens": {"PYTHON", "CODE", "COMPUTER", "PROGRAM", "SOFTWARE", "AI"},
        # V-shape (technology/typing gesture) in neutral space
        "r_elbow_offset": [35, 10],
        "target": NEUTRAL + np.array([10, -10]),
        "r_motion": lambda p: np.array([_osc(p, 12, 2), _osc(p, 8, 2)]),
        "l_elbow_offset": [-35, 10],
        "l_wrist_offset": [0, 20],
        "r_hand": "v", "l_hand": "v",
        "r_hand_angle": -30, "l_hand_angle": -30,
        "description": "COMPUTER/CODE — V-shape (ISL)",
    },
]

# Build fast lookup: uppercase token → sign dict
_TOKEN_TO_SIGN: dict[str, dict] = {}
for _sign in ISL_SIGNS:
    for _tok in _sign["tokens"]:
        _TOKEN_TO_SIGN[_tok] = _sign


# ---------------------------------------------------------------------------
# Default fallback families (4 visually distinct motions for unknown words)
# ---------------------------------------------------------------------------
_FALLBACK_SIGNS = [
    {   # 0 – neutral bilateral wave
        "r_elbow_offset": [-20, 20], "target": NEUTRAL,
        "r_motion": lambda p: np.array([_osc(p, 30, 1), _cos(p, 10, 1)]),
        "l_elbow_offset": [20, 20], "l_wrist_offset": [0, 30],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": -60, "l_hand_angle": -90,
        "description": "SIGN (AI generated)",
    },
    {   # 1 – chest-level arc
        "r_elbow_offset": [10, 20], "target": CHEST + np.array([20, 0]),
        "r_motion": lambda p: np.array([_osc(p, 20, 1), _cos(p, 20, 1)]),
        "l_elbow_offset": [-20, 55], "l_wrist_offset": [0, 40],
        "r_hand": "fist", "l_hand": "flat",
        "r_hand_angle": -30, "l_hand_angle": -90,
        "description": "SIGN (AI generated)",
    },
    {   # 2 – forehead tap
        "r_elbow_offset": [25, -15], "target": FOREHEAD,
        "r_motion": lambda p: np.array([_osc(p, 8, 2), 0]),
        "l_elbow_offset": [-20, 55], "l_wrist_offset": [0, 40],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": -80, "l_hand_angle": -90,
        "description": "SIGN (AI generated)",
    },
    {   # 3 – forward sweep
        "r_elbow_offset": [40, 10], "target": NEUTRAL + np.array([10, -15]),
        "r_motion": lambda p: np.array([_osc(p, 25, 1), 0]),
        "l_elbow_offset": [-20, 55], "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": 0, "l_hand_angle": -90,
        "description": "SIGN (AI generated)",
    },
]


def _get_sign(token: str) -> dict:
    t = token.upper().strip()
    if t in _TOKEN_TO_SIGN:
        return _TOKEN_TO_SIGN[t]
    # Check if token contains any known keyword
    for key, sign in _TOKEN_TO_SIGN.items():
        if key in t or t in key:
            return sign
    # Hash-select fallback family so different words look different
    h = int(hashlib.md5(t.encode()).hexdigest(), 16)
    return _FALLBACK_SIGNS[h % 4]


# ---------------------------------------------------------------------------
# Skeleton renderer
# ---------------------------------------------------------------------------
def _draw_skeleton(draw: ImageDraw.ImageDraw,
                   r_elbow: np.ndarray,
                   r_wrist: np.ndarray,
                   l_elbow: np.ndarray,
                   l_wrist: np.ndarray,
                   r_hand: str,
                   l_hand: str,
                   r_angle: float,
                   l_angle: float) -> None:
    # --- body lines ---
    draw.line([tuple(NECK.astype(int)), tuple(TORSO_BOT.astype(int))],
              fill=LINE_COLOR, width=THICK)
    draw.line([tuple(L_SHOULDER.astype(int)), tuple(R_SHOULDER.astype(int))],
              fill=LINE_COLOR, width=THICK)
    draw.line([tuple(L_SHOULDER.astype(int)), tuple(l_elbow.astype(int)),
               tuple(l_wrist.astype(int))], fill=LINE_COLOR, width=THICK)
    draw.line([tuple(R_SHOULDER.astype(int)), tuple(r_elbow.astype(int)),
               tuple(r_wrist.astype(int))], fill=LINE_COLOR, width=THICK)

    # --- head (drawn after torso so arms appear behind head) ---
    hx, hy = int(HEAD[0]), int(HEAD[1])
    draw.ellipse([hx - 20, hy - 26, hx + 20, hy + 26],
                 outline=LINE_COLOR, width=3, fill=(255, 255, 255))

    # --- joints ---
    for jnt in [NECK, L_SHOULDER, R_SHOULDER, TORSO_BOT,
                l_elbow, r_elbow]:
        jx, jy = int(jnt[0]), int(jnt[1])
        draw.ellipse([jx - 5, jy - 5, jx + 5, jy + 5], fill=JOINT_COLOR)

    # --- wrists (hand dots) ---
    for wrist in [l_wrist, r_wrist]:
        wx, wy = int(wrist[0]), int(wrist[1])
        draw.ellipse([wx - 7, wy - 7, wx + 7, wy + 7], fill=HAND_COLOR)

    # --- handshapes ---
    painter_r = HANDSHAPES.get(r_hand, draw_flat_hand)
    painter_l = HANDSHAPES.get(l_hand, draw_flat_hand)
    painter_r(draw, int(r_wrist[0]), int(r_wrist[1]), r_angle)
    painter_l(draw, int(l_wrist[0]), int(l_wrist[1]), l_angle)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def generate_ai_fallback_gif(
    token: str,
    out_path: Path,
    *,
    size: tuple[int, int] = (W, H),
    frame_count: int = 24,
    duration_ms: int = 60,
) -> Path:
    """Render an ISL-inspired skeletal animation for *token* and save as GIF."""
    if out_path.exists():
        return out_path

    out_path.parent.mkdir(parents=True, exist_ok=True)
    token_upper = token.upper().strip() or "(UNKNOWN)"

    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    # Per-token deterministic variation (speed / phase only — sign shape fixed)
    h = int(hashlib.md5(token_upper.encode()).hexdigest(), 16)
    speed_factor = 1.0 + (h % 5) * 0.15
    phase_offset = (h % 100) / 100.0 * math.pi

    sign = _get_sign(token_upper)
    description = sign.get("description", f"SIGN: {token_upper}")

    r_elbow_off = np.array(sign["r_elbow_offset"], dtype=float)
    l_elbow_off = np.array(sign["l_elbow_offset"], dtype=float)
    l_wrist_off = np.array(sign["l_wrist_offset"], dtype=float)
    target      = sign["target"]
    r_motion_fn = sign["r_motion"]

    frames: list[Image.Image] = []

    for i in range(frame_count):
        img  = Image.new("RGB", (W, H), color=BG_COLOR)
        draw = ImageDraw.Draw(img)

        # Smooth phase (ease-in-out via cosine)
        t      = i / frame_count
        phase  = 0.5 * (1 - math.cos(t * 2 * math.pi * speed_factor)) + phase_offset

        r_elbow = R_SHOULDER + r_elbow_off
        l_elbow = L_SHOULDER + l_elbow_off
        l_wrist = l_elbow   + l_wrist_off

        # Dominant wrist = target landmark + sign-specific oscillation
        r_wrist = target + r_motion_fn(phase)

        _draw_skeleton(
            draw,
            r_elbow=r_elbow, r_wrist=r_wrist,
            l_elbow=l_elbow, l_wrist=l_wrist,
            r_hand=sign["r_hand"], l_hand=sign["l_hand"],
            r_angle=sign["r_hand_angle"], l_angle=sign["l_hand_angle"],
        )

        # Label overlay
        label = f"ISL: {description}"
        bbox = draw.textbbox((0, 0), label, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        draw.rectangle([6, 6, 14 + tw, 14 + th], fill=LABEL_BG)
        draw.text((10, 10), label, fill=LABEL_FG, font=font)

        frames.append(img)

    frames[0].save(
        str(out_path),
        save_all=True,
        append_images=frames[1:],
        duration=duration_ms,
        loop=0,
        optimize=False,
    )
    return out_path