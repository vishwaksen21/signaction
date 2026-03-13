from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def generate_placeholder_gif(
    token: str,
    out_path: Path,
    *,
    size: tuple[int, int] = (320, 320),
    frame_count: int = 12,
    duration_ms: int = 80,
) -> Path:
    """Create a simple animated GIF containing the token text.

    This is a non-copyrighted stand-in until you plug in real sign assets.
    """

    out_path.parent.mkdir(parents=True, exist_ok=True)

    token = token.upper().strip() or "(EMPTY)"
    w, h = size

    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    frames: list[Image.Image] = []
    for i in range(frame_count):
        # Simple motion: text shifts horizontally.
        dx = int((i - frame_count / 2) * 2)
        img = Image.new("RGB", (w, h), color=(245, 245, 245))
        draw = ImageDraw.Draw(img)

        # Border
        draw.rectangle([8, 8, w - 8, h - 8], outline=(80, 80, 80), width=3)

        # Centered text box
        text = token
        bbox = draw.textbbox((0, 0), text, font=font)
        tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
        x = (w - tw) // 2 + dx
        y = (h - th) // 2
        draw.text((x, y), text, fill=(10, 10, 10), font=font)

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
