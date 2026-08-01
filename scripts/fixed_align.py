from PIL import Image
from pathlib import Path


def process_fixed_crop(img_path, out_path):
    print(f"Processing {img_path} -> {out_path}")

    try:
        img = Image.open(img_path).convert("RGBA")
    except Exception as e:
        print(f"Could not open {img_path}: {e}")
        return

    width, height = img.size
    half_w = width // 2
    half_h = height // 2

    # Margins inside each quadrant
    margin_left = int(half_w * 0.10)
    margin_right = int(half_w * 0.10)
    margin_top = int(half_h * 0.05)
    margin_bottom = int(half_h * 0.20)

    def clamp_box(left, top, right, bottom):
        return (
            max(0, left),
            max(0, top),
            min(width, right),
            min(height, bottom),
        )

    boxes = [
        # Top-left
        clamp_box(
            margin_left,
            margin_top,
            half_w - margin_right,
            half_h - margin_bottom,
        ),

        # Top-right
        clamp_box(
            half_w + margin_left,
            margin_top,
            width - margin_right,
            half_h - margin_bottom,
        ),

        # Bottom-left
        clamp_box(
            margin_left,
            half_h + margin_top,
            half_w - margin_right,
            height - margin_bottom,
        ),

        # Bottom-right
        clamp_box(
            half_w + margin_left,
            half_h + margin_top,
            width - margin_right,
            height - margin_bottom,
        ),
    ]

    frames = []

    for box in boxes:
        frame = img.crop(box)
        frames.append(frame)

    if len(frames) != 4:
        print("Failed to create 4 frames.")
        return

    # Animation sequence: 1 → 2 → 3 → 4 → 3 → 2
    sequence = [
        frames[0],
        frames[1],
        frames[2],
        frames[3],
        frames[2],
        frames[1],
    ]

    # Convert to palette mode for GIF compatibility
    sequence = [
        frame.convert("P", palette=Image.ADAPTIVE)
        for frame in sequence
    ]

    sequence[0].save(
        out_path,
        save_all=True,
        append_images=sequence[1:],
        duration=300,
        loop=0,
        disposal=2,
    )

    print(f"Saved {out_path}")


def main():
    base_dir = Path(
        "/Users/vishwaksen/.gemini/antigravity-ide/brain/4be55be2-982d-4553-9aef-1014879fe0a3"
    )

    out_dir = Path("signaction_assets/signs")
    out_dir.mkdir(parents=True, exist_ok=True)

    files = {
        "HELLO.gif": "sign_hello_sprite_1783188859027.png",
        "WORLD.gif": "sign_world_sprite_consistent_1783189453735.png",
        "AI.gif": "sign_ai_sprite_consistent_1783189471537.png",
    }

    for out_name, in_name in files.items():
        src = base_dir / in_name
        if src.exists():
            process_fixed_crop(src, out_dir / out_name)
        else:
            print(f"Missing: {src}")


if __name__ == "__main__":
    main()