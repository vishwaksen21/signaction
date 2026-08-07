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
              fill=color, width=3)


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
        "l_motion": lambda p: np.array([_osc(p + math.pi, -15, 2), _osc(p + math.pi, 10, 2)]),
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
        "l_motion": lambda p: np.array([_osc(p + math.pi, -12, 2), _osc(p + math.pi, 8, 2)]),
        "l_elbow_offset": [-35, 10],
        "l_wrist_offset": [0, 20],
        "r_hand": "v", "l_hand": "v",
        "r_hand_angle": -30, "l_hand_angle": -30,
        "description": "COMPUTER/CODE — V-shape (ISL)",
    },
    # ------------------------------------------------------------------ THANK_YOU
    {
        "tokens": {"THANK_YOU"},
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
    # ------------------------------------------------------------------ GOOD_MORNING
    {
        "tokens": {"GOOD_MORNING", "MORNING", "SUNRISE"},
        # Right hand flat rises from horizontal left arm (morning sun)
        "r_elbow_offset": [30, 20],
        "target": CHEST + np.array([0, 20]),
        "r_motion": lambda p: np.array([0, _osc(p, -30, 1)]),
        "l_elbow_offset": [-35, 30],
        "l_wrist_offset": [35, 0],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": -90, "l_hand_angle": 0,
        "description": "GOOD MORNING — Sun rising (ISL)",
    },
    # ------------------------------------------------------------------ GOOD_NIGHT
    {
        "tokens": {"GOOD_NIGHT", "NIGHT", "SLEEP", "BEDTIME"},
        # Hands tilt head to shoulder (sleeping pose)
        "r_elbow_offset": [20, 10],
        "target": CHEEK_R + np.array([10, 10]),
        "r_motion": lambda p: np.array([0, _osc(p, 5, 0.5)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": 45, "l_hand_angle": -90,
        "description": "GOOD NIGHT — Head tilts on hand (ISL)",
    },
    # ------------------------------------------------------------------ HOW_ARE_YOU
    {
        "tokens": {"HOW_ARE_YOU", "HOW_ARE_U", "STATUS"},
        # Flat hands move out from chest pointing forward
        "r_elbow_offset": [30, 10],
        "target": NEUTRAL,
        "r_motion": lambda p: np.array([_osc(p, 20, 1), 0]),
        "l_motion": lambda p: np.array([_osc(p, -20, 1), 0]),
        "l_elbow_offset": [-30, 10],
        "l_wrist_offset": [-20, 30],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": 0, "l_hand_angle": -180,
        "description": "HOW ARE YOU — Hands move out (ISL)",
    },
    # ------------------------------------------------------------------ HAPPY
    {
        "tokens": {"HAPPY", "JOY", "CELEBRATE", "GLAD", "CHEERFUL", "SMILE"},
        # Both hands wave near shoulders/chest
        "r_elbow_offset": [35, 0],
        "target": CHEST + np.array([30, -20]),
        "r_motion": lambda p: np.array([0, _osc(p, 15, 2)]),
        "l_motion": lambda p: np.array([0, _osc(p, 15, 2)]),
        "l_elbow_offset": [-35, 0],
        "l_wrist_offset": [-10, 15],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": -45, "l_hand_angle": -135,
        "description": "HAPPY — Hands wave near chest (ISL)",
    },
    # ------------------------------------------------------------------ FRIEND
    {
        "tokens": {"FRIEND", "BUDDY", "PARTNER", "AMIGO", "FRIENDS", "SEE_YOU", "SEE_YOU_LATER"},
        # Clasping/interlocking hands at chest level
        "r_elbow_offset": [25, 20],
        "target": CHEST + np.array([10, 20]),
        "r_motion": lambda p: np.array([_osc(p, 8, 1), 0]),
        "l_motion": lambda p: np.array([_osc(p + math.pi, 8, 1), 0]),
        "l_elbow_offset": [-25, 20],
        "l_wrist_offset": [25, 10],
        "r_hand": "fist", "l_hand": "fist",
        "r_hand_angle": 45, "l_hand_angle": 135,
        "description": "FRIEND — Clasping hands at chest (ISL)",
    },
    # ------------------------------------------------------------------ TIME
    {
        "tokens": {"TIME", "CLOCK", "WATCH", "HOUR", "MINUTE", "SECOND"},
        # Right index points to left wrist
        "r_elbow_offset": [20, 20],
        "target": CHEST + np.array([-20, 20]),
        "r_motion": lambda p: np.array([_osc(p, 6, 2), _osc(p, 8, 2)]),
        "l_elbow_offset": [-30, 30],
        "l_wrist_offset": [15, 0],
        "r_hand": "point", "l_hand": "fist",
        "r_hand_angle": 120, "l_hand_angle": 0,
        "description": "TIME — Point to wrist watch (ISL)",
    },
    # ------------------------------------------------------------------ TALK
    {
        "tokens": {"TALK", "SPEAK", "SAY", "COMMUNICATE", "TELL", "CHAT", "SPEECH"},
        # Index finger moves outward from mouth repeatedly
        "r_elbow_offset": [30, 0],
        "target": CHIN,
        "r_motion": lambda p: np.array([_osc(p, 18, 2), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": -20, "l_hand_angle": -90,
        "description": "TALK — Index moves from chin (ISL)",
    },
    # ------------------------------------------------------------------ HOUSE
    {
        "tokens": {"HOUSE", "HOME", "BUILDING", "PLACE", "ROOM", "STAY", "LIVE"},
        # Hands form a roof shape (tent) at chest level
        "r_elbow_offset": [35, 10],
        "target": CHEST + np.array([20, 10]),
        "r_motion": lambda p: np.array([_osc(p, 5, 1), 0]),
        "l_motion": lambda p: np.array([_osc(p, -5, 1), 0]),
        "l_elbow_offset": [-35, 10],
        "l_wrist_offset": [25, 0],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": -45, "l_hand_angle": -135,
        "description": "HOUSE — Hands form roof shape (ISL)",
    },
    # ------------------------------------------------------------------ SAD
    {
        "tokens": {"SAD", "CRY", "SORROW", "UNHAPPY", "DEPRESSED", "TEARS"},
        # Index fingers slide down cheeks
        "r_elbow_offset": [25, -10],
        "target": CHEEK_R,
        "r_motion": lambda p: np.array([0, _osc(p, 20, 1)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": -90, "l_hand_angle": -90,
        "description": "SAD — Index slides down cheek (ISL)",
    },
    # ------------------------------------------------------------------ NAME
    {
        "tokens": {"NAME", "CALL", "IDENTITY", "NAMED", "INTRODUCE"},
        # Two fingers tapping chest/neutral space
        "r_elbow_offset": [25, 20],
        "target": CHEST + np.array([10, 10]),
        "r_motion": lambda p: np.array([0, _osc(p, 10, 2)]),
        "l_elbow_offset": [-25, 20],
        "l_wrist_offset": [20, 15],
        "r_hand": "v", "l_hand": "v",
        "r_hand_angle": 30, "l_hand_angle": -30,
        "description": "NAME — Two fingers tap (ISL)",
    },
    # ------------------------------------------------------------------ SORRY
    {
        "tokens": {"SORRY", "APOLOGIZE", "FORGIVE", "EXCUSE", "REGRET"},
        # Rubbing chest with right fist in circles
        "r_elbow_offset": [15, 10],
        "target": CHEST,
        "r_motion": lambda p: np.array([_osc(p, 12, 1.5), _cos(p, 12, 1.5)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "fist", "l_hand": "flat",
        "r_hand_angle": 90, "l_hand_angle": -90,
        "description": "SORRY — Fist circles chest (ISL)",
    },
    # ------------------------------------------------------------------ MOTHER
    {
        "tokens": {"MOTHER", "MOM", "MUM", "MAMMA", "SISTER", "WOMAN", "GIRL", "FEMALE"},
        # Index finger taps cheek
        "r_elbow_offset": [25, 0],
        "target": CHEEK_R,
        "r_motion": lambda p: np.array([_osc(p, 6, 2), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": -45, "l_hand_angle": -90,
        "description": "MOTHER — Index taps cheek (ISL)",
    },
    # ------------------------------------------------------------------ FATHER
    {
        "tokens": {"FATHER", "DAD", "PAPA", "BROTHER", "MAN", "BOY", "MALE", "GENTLEMAN"},
        # Index taps forehead
        "r_elbow_offset": [25, -20],
        "target": FOREHEAD + np.array([15, 0]),
        "r_motion": lambda p: np.array([_osc(p, 6, 2), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": -90, "l_hand_angle": -90,
        "description": "FATHER — Index taps forehead (ISL)",
    },
    # ------------------------------------------------------------------ MONEY
    {
        "tokens": {"MONEY", "BUY", "SELL", "PRICE", "COST", "CASH", "PAY", "RICH", "EXPENSIVE", "DOLLAR", "RUPEE"},
        # Pinch handshape rubbing fingers in neutral space
        "r_elbow_offset": [30, 20],
        "target": NEUTRAL,
        "r_motion": lambda p: np.array([_osc(p, 5, 3), _cos(p, 4, 3)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "pinch", "l_hand": "flat",
        "r_hand_angle": -20, "l_hand_angle": -90,
        "description": "MONEY — Rubbing fingers (ISL)",
    },
    # ------------------------------------------------------------------ WHAT
    {
        "tokens": {"WHAT", "WHICH", "QUESTION", "QUERY", "ASK", "INTERROGATIVE"},
        # Both hands shake horizontally facing up
        "r_elbow_offset": [35, 20],
        "target": NEUTRAL + np.array([10, 0]),
        "r_motion": lambda p: np.array([_osc(p, 15, 2), 0]),
        "l_elbow_offset": [-35, 20],
        "l_wrist_offset": [-10, 25],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": 10, "l_hand_angle": -190,
        "description": "WHAT — Shaking flat hands up (ISL)",
    },
    # ------------------------------------------------------------------ WHERE
    {
        "tokens": {"WHERE", "LOCATION", "PLACE", "DIRECTIONS", "DESTINATION"},
        # Index finger points up and wags side-to-side
        "r_elbow_offset": [35, 10],
        "target": NEUTRAL + np.array([10, -20]),
        "r_motion": lambda p: np.array([_osc(p, 18, 2), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": -90, "l_hand_angle": -90,
        "description": "WHERE — Index wags side-to-side (ISL)",
    },
    # ------------------------------------------------------------------ WHEN
    {
        "tokens": {"WHEN", "DATE", "CALENDAR", "DAY", "WEEK", "YEAR", "SCHEDULE"},
        # Right index circles left index in neutral space
        "r_elbow_offset": [30, 10],
        "target": NEUTRAL,
        "r_motion": lambda p: np.array([_osc(p, 15, 1.5), _cos(p, 15, 1.5)]),
        "l_elbow_offset": [-30, 20],
        "l_wrist_offset": [15, 15],
        "r_hand": "point", "l_hand": "point",
        "r_hand_angle": 0, "l_hand_angle": 90,
        "description": "WHEN — Index circles (ISL)",
    },
    # ------------------------------------------------------------------ WHY
    {
        "tokens": {"WHY", "REASON", "CAUSE", "PURPOSE"},
        # Finger touches side of head then pulls down
        "r_elbow_offset": [20, -10],
        "target": FOREHEAD + np.array([15, 0]),
        "r_motion": lambda p: np.array([0, _osc(p, 20, 1)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": -45, "l_hand_angle": -90,
        "description": "WHY — Index pulls from forehead (ISL)",
    },
    # ------------------------------------------------------------------ HOW
    {
        "tokens": {"HOW", "METHOD", "WAY", "PROCESS", "MANNER", "STRATEGY"},
        # Hands roll inward in neutral space
        "r_elbow_offset": [25, 20],
        "target": NEUTRAL + np.array([-10, 0]),
        "r_motion": lambda p: np.array([_osc(p, 12, 1.5), _cos(p, 12, 1.5)]),
        "l_elbow_offset": [-25, 20],
        "l_wrist_offset": [25, 15],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": 45, "l_hand_angle": 135,
        "description": "HOW — Hands roll over (ISL)",
    },
    # ------------------------------------------------------------------ WHO
    {
        "tokens": {"WHO", "PERSON", "SOMEONE", "INDIVIDUAL", "PEOPLE", "HUMAN", "EVERYONE", "ANYONE"},
        # Index finger circles near chin/mouth
        "r_elbow_offset": [20, 10],
        "target": CHIN + np.array([10, -5]),
        "r_motion": lambda p: np.array([_osc(p, 8, 2), _cos(p, 8, 2)]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "point", "l_hand": "flat",
        "r_hand_angle": -30, "l_hand_angle": -90,
        "description": "WHO — Index circles chin (ISL)",
    },
    # ------------------------------------------------------------------ DRINK
    {
        "tokens": {"DRINK", "TEA", "COFFEE", "MILK", "BEVERAGE", "JUICE", "CUP"},
        # Thumb of fist points to mouth (drinking shape)
        "r_elbow_offset": [20, 10],
        "target": CHIN,
        "r_motion": lambda p: np.array([_osc(p, 10, 1), 0]),
        "l_elbow_offset": [-20, 55],
        "l_wrist_offset": [0, 40],
        "r_hand": "fist", "l_hand": "flat",
        "r_hand_angle": -60, "l_hand_angle": -90,
        "description": "DRINK — Thumb to mouth (ISL)",
    },
    # ------------------------------------------------------------------ PLAY
    {
        "tokens": {"PLAY", "GAME", "SPORT", "FUN", "TOY", "ENTERTAINMENT", "MATCH"},
        # Both hands shake thumbs/pinkies in neutral space
        "r_elbow_offset": [35, 20],
        "target": NEUTRAL + np.array([10, 0]),
        "r_motion": lambda p: np.array([_osc(p, 15, 2.5), 0]),
        "l_elbow_offset": [-35, 20],
        "l_wrist_offset": [-10, 25],
        "r_hand": "v", "l_hand": "v",
        "r_hand_angle": 0, "l_hand_angle": -180,
        "description": "PLAY — Waving hands in neutral space (ISL)",
    },
    # ------------------------------------------------------------------ WEATHER
    {
        "tokens": {"WEATHER", "RAIN", "HOT", "COLD", "WIND", "CLIMATE", "SEASON", "WINTER", "SUMMER"},
        # Flat hands move down with fluttering fingers
        "r_elbow_offset": [30, 0],
        "target": NEUTRAL + np.array([0, -20]),
        "r_motion": lambda p: np.array([0, _osc(p, 25, 1.5)]),
        "l_elbow_offset": [-30, 0],
        "l_wrist_offset": [0, 0],
        "r_hand": "flat", "l_hand": "flat",
        "r_hand_angle": 90, "l_hand_angle": 90,
        "description": "WEATHER — Fluttering hands move down (ISL)",
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
    # Check exact word boundaries
    words = t.split()
    for w in words:
        if w in _TOKEN_TO_SIGN:
            return _TOKEN_TO_SIGN[w]
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
    # --- body/shirt (filled polygon for realistic avatar body) ---
    torso_poly = [
        (int(L_SHOULDER[0]), int(L_SHOULDER[1])),
        (int(R_SHOULDER[0]), int(R_SHOULDER[1])),
        (int(TORSO_BOT[0] + 20), int(TORSO_BOT[1])),
        (int(TORSO_BOT[0] - 20), int(TORSO_BOT[1]))
    ]
    # Fill with a nice soft blue/lavender avatar shirt and outline it
    draw.polygon(torso_poly, fill=(215, 225, 255), outline=LINE_COLOR, width=2)
    
    # Neck line (thick, connects head to body)
    draw.line([tuple(NECK.astype(int)), (int(NECK[0]), int(NECK[1] + 15))], fill=(255, 218, 185), width=10) # skin colored neck
    draw.line([tuple(NECK.astype(int)), (int(NECK[0]), int(NECK[1] + 15))], fill=LINE_COLOR, width=2) # neck outline

    # --- thick arms (long sleeves) ---
    # Left sleeve
    draw.line([tuple(L_SHOULDER.astype(int)), tuple(l_elbow.astype(int)),
               tuple(l_wrist.astype(int))], fill=LINE_COLOR, width=8)
    # Right sleeve
    draw.line([tuple(R_SHOULDER.astype(int)), tuple(r_elbow.astype(int)),
               tuple(r_wrist.astype(int))], fill=LINE_COLOR, width=8)

    # --- head (drawn with eyes and a smile) ---
    hx, hy = int(HEAD[0]), int(HEAD[1])
    # Draw face ellipse
    draw.ellipse([hx - 22, hy - 28, hx + 22, hy + 28],
                 outline=LINE_COLOR, width=3, fill=(255, 245, 235)) # Warm skin fill
    
    # Draw cute eyes (filled circles)
    draw.ellipse([hx - 9, hy - 6, hx - 5, hy - 2], fill=LINE_COLOR) # Left eye
    draw.ellipse([hx + 5, hy - 6, hx + 9, hy - 2], fill=LINE_COLOR) # Right eye
    
    # Draw a cute smile arc
    draw.arc([hx - 8, hy + 2, hx + 8, hy + 12], start=0, end=180, fill=LINE_COLOR, width=2)

    # --- joints (thick red caps for highlights) ---
    for jnt in [L_SHOULDER, R_SHOULDER, l_elbow, r_elbow]:
        jx, jy = int(jnt[0]), int(jnt[1])
        draw.ellipse([jx - 5, jy - 5, jx + 5, jy + 5], fill=JOINT_COLOR)

    # --- wrists (hand base) ---
    for wrist in [l_wrist, r_wrist]:
        wx, wy = int(wrist[0]), int(wrist[1])
        draw.ellipse([wx - 9, wy - 9, wx + 9, wy + 9], fill=HAND_COLOR)

    # --- handshapes ---
    painter_r = HANDSHAPES.get(r_hand, draw_flat_hand)
    painter_l = HANDSHAPES.get(l_hand, draw_flat_hand)
    painter_r(draw, int(r_wrist[0]), int(r_wrist[1]), r_angle)
    painter_l(draw, int(l_wrist[0]), int(l_wrist[1]), l_angle)


def _parse_llm_sign_params(params: dict) -> dict:
    landmark_map = {
        "FOREHEAD": FOREHEAD,
        "CHIN": CHIN,
        "CHEST": CHEST,
        "CHEEK_R": CHEEK_R,
        "CHEEK_L": CHEEK_L,
        "NEUTRAL": NEUTRAL
    }
    target_name = params.get("target_landmark", "NEUTRAL").upper()
    target = landmark_map.get(target_name, NEUTRAL)
    
    # Right-hand motion
    motion_type = params.get("motion_type", "none").lower()
    amp = float(params.get("motion_amplitude", 10.0))
    freq = float(params.get("motion_frequency", 1.0))
    
    if motion_type == "vertical_wave":
        r_motion = lambda p: np.array([0.0, _osc(p, amp, freq)])
    elif motion_type == "horizontal_wave":
        r_motion = lambda p: np.array([_osc(p, amp, freq), 0.0])
    elif motion_type == "circle":
        r_motion = lambda p: np.array([_osc(p, amp, freq), _cos(p, amp, freq)])
    elif motion_type == "tap":
        r_motion = lambda p: np.array([0.0, _osc(p, amp, freq * 2)])
    else:
        r_motion = lambda p: np.array([0.0, 0.0])
        
    # Left-hand motion (defaults to mirroring right-hand or separate sines)
    l_motion_type = params.get("l_motion_type", "none").lower()
    l_amp = float(params.get("l_motion_amplitude", amp))
    l_freq = float(params.get("l_motion_frequency", freq))
    
    if l_motion_type == "mirror":
        l_motion = lambda p: np.array([-r_motion(p)[0], r_motion(p)[1]])
    elif l_motion_type == "opposite":
        # Mirroring but with phase shift pi
        l_motion = lambda p: np.array([-r_motion(p + math.pi)[0], r_motion(p + math.pi)[1]])
    elif l_motion_type == "vertical_wave":
        l_motion = lambda p: np.array([0.0, _osc(p, l_amp, l_freq)])
    elif l_motion_type == "horizontal_wave":
        l_motion = lambda p: np.array([_osc(p, -l_amp, l_freq), 0.0])
    elif l_motion_type == "circle":
        l_motion = lambda p: np.array([_osc(p, -l_amp, l_freq), _cos(p, l_amp, l_freq)])
    elif l_motion_type == "tap":
        l_motion = lambda p: np.array([0.0, _osc(p, l_amp, l_freq * 2)])
    else:
        l_motion = lambda p: np.array([0.0, 0.0])
        
    return {
        "r_elbow_offset": np.array(params.get("r_elbow_offset", [35, 10]), dtype=float),
        "l_elbow_offset": np.array(params.get("l_elbow_offset", [-35, 10]), dtype=float),
        "l_wrist_offset": np.array(params.get("l_wrist_offset", [0, 40]), dtype=float),
        "target": target,
        "r_motion": r_motion,
        "l_motion": l_motion,
        "r_hand": params.get("r_hand", "flat"),
        "l_hand": params.get("l_hand", "flat"),
        "r_hand_angle": float(params.get("r_hand_angle_degrees", -30.0)),
        "l_hand_angle": float(params.get("l_hand_angle_degrees", -90.0)),
        "description": params.get("description", "AI Generated Motion")
    }


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

    sign = None
    speed_factor = 1.0
    phase_offset = 0.0

    # 1. Prioritize hand-crafted local sign database matching
    matched_sign = None
    if token_upper in _TOKEN_TO_SIGN:
        matched_sign = _TOKEN_TO_SIGN[token_upper]
    else:
        # Check exact word boundaries
        words = token_upper.split()
        for w in words:
            if w in _TOKEN_TO_SIGN:
                matched_sign = _TOKEN_TO_SIGN[w]
                break

    if matched_sign:
        sign = matched_sign
        # Add deterministic phase/speed variation
        h = int(hashlib.md5(token_upper.encode()).hexdigest(), 16)
        speed_factor = 1.0 + (h % 5) * 0.15
        phase_offset = (h % 100) / 100.0 * math.pi
    else:
        # 2. Fall back to LLM-parameterized gesture for unknown words
        from .llm_client import call_llm_sign_params
        llm_params = call_llm_sign_params(token_upper)
        if llm_params:
            try:
                sign = _parse_llm_sign_params(llm_params)
            except Exception:
                sign = None

    # 3. Fall back to local hash-family if LLM also fails
    if not sign:
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
    l_motion_fn = sign.get("l_motion")

    frames: list[Image.Image] = []

    for i in range(frame_count):
        img  = Image.new("RGB", (W, H), color=BG_COLOR)
        draw = ImageDraw.Draw(img)

        # Smooth phase (ease-in-out via cosine)
        t      = i / frame_count
        phase  = 0.5 * (1 - math.cos(t * 2 * math.pi * speed_factor)) + phase_offset

        r_elbow = R_SHOULDER + r_elbow_off
        l_elbow = L_SHOULDER + l_elbow_off
        
        # Calculate left wrist with optional dynamic movement
        l_wrist = l_elbow + l_wrist_off
        if l_motion_fn is not None:
            l_wrist = l_wrist + l_motion_fn(phase)

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