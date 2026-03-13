from __future__ import annotations

import io
from pathlib import Path
from functools import lru_cache

from PIL import Image

from .placeholder_assets import generate_placeholder_gif
from .types import SignItem


@lru_cache(maxsize=256)
def _load_gif_frames_cached(path_str: str, mtime_ns: int) -> list[Image.Image]:
    path = Path(path_str)
    with Image.open(str(path)) as im:
        frames: list[Image.Image] = []
        try:
            while True:
                frames.append(im.convert("RGB"))
                im.seek(im.tell() + 1)
        except EOFError:
            pass
        return frames


def _load_gif_frames(path: Path) -> list[Image.Image]:
    try:
        mtime_ns = path.stat().st_mtime_ns
    except FileNotFoundError:
        return []
    return _load_gif_frames_cached(str(path), mtime_ns)


def ensure_item_gif(item: SignItem, assets_dir: Path) -> Path:
    if item.media_type == "gif" and item.media_path.exists():
        return item.media_path

    # If a token doesn't have a real asset yet, create a placeholder GIF.
    out_path = assets_dir / f"{item.token.upper()}.gif"
    if not out_path.exists():
        generate_placeholder_gif(item.token, out_path)
    return out_path


def _frames_from_item(item: SignItem, *, assets_dir: Path, max_video_frames: int = 60) -> list[Image.Image]:
    if item.media_type == "gif":
        gif_path = ensure_item_gif(item, assets_dir)
        return _load_gif_frames(gif_path)

    if item.media_type == "img":
        try:
            with Image.open(str(item.media_path)) as im:
                return [im.convert("RGB")]
        except Exception:
            return _load_gif_frames(ensure_item_gif(item, assets_dir))

    if item.media_type == "mp4":
        # Optional dependency: imageio + imageio-ffmpeg
        try:
            import imageio.v3 as iio  # type: ignore

            arr = iio.imread(str(item.media_path), index=None)
            # arr: (frames, h, w, c)
            total = int(arr.shape[0]) if hasattr(arr, "shape") else 0
            if total <= 0:
                return _load_gif_frames(ensure_item_gif(item, assets_dir))

            # Uniformly sample frames to cap memory.
            step = max(1, total // max_video_frames)
            frames: list[Image.Image] = []
            for idx in range(0, total, step):
                frame = arr[idx]
                frames.append(Image.fromarray(frame).convert("RGB"))
            return frames
        except Exception:
            # Fallback to placeholder
            return _load_gif_frames(ensure_item_gif(item, assets_dir))

    return _load_gif_frames(ensure_item_gif(item, assets_dir))


def render_sequence_gif(
    items: list[SignItem],
    *,
    assets_dir: Path,
    hold_frames: int = 6,
    per_frame_duration_ms: int = 70,
) -> bytes:
    """Render a sequence of SignItems into one animated GIF (returned as bytes)."""

    frames: list[Image.Image] = []

    for item in items:
        item_frames = _frames_from_item(item, assets_dir=assets_dir)
        if not item_frames:
            continue

        frames.extend(item_frames)
        # Hold last frame a bit longer between tokens
        frames.extend([item_frames[-1]] * max(0, hold_frames))

    if not frames:
        # Minimal empty gif
        empty = Image.new("RGB", (320, 320), color=(245, 245, 245))
        frames = [empty]

    out = io.BytesIO()
    frames[0].save(
        out,
        format="GIF",
        save_all=True,
        append_images=frames[1:],
        duration=per_frame_duration_ms,
        loop=0,
        optimize=False,
    )
    return out.getvalue()
