from PIL import Image
from pathlib import Path


def create_gif_from_spritesheet(img_path, out_path):
    print(f"Processing {img_path} -> {out_path}")

    try:
        img = Image.open(img_path).convert("RGBA")
    except Exception as e:
        print(f"Failed to open {img_path}: {e}")
        return

    width, height = img.size

    if width < 2 or height < 2:
        print(f"Image too small: {img_path}")
        return

    # 2x2 grid
    half_w = width // 2
    half_h = height // 2

    # Extract frames
    frames = [
        img.crop((0, 0, half_w, half_h)),              # Top-left
        img.crop((half_w, 0, width, half_h)),          # Top-right
        img.crop((0, half_h, half_w, height)),         # Bottom-left
        img.crop((half_w, half_h, width, height)),     # Bottom-right
    ]

    # Remove "Frame X" text at bottom
    crop_h = max(1, int(half_h * 0.85))

    clean_frames = [
        frame.crop((0, 0, frame.width, crop_h))
        for frame in frames
    ]

    # Ping-pong animation
    sequence = [
        clean_frames[0],
        clean_frames[1],
        clean_frames[2],
        clean_frames[3],
        clean_frames[2],
        clean_frames[1],
    ]

    # Convert to palette mode for better GIF compatibility
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
        "WORLD.gif": "sign_world_sprite_1783188877283.png",
        "AI.gif": "sign_ai_sprite_1783188893647.png",
    }

    for out_name, in_name in files.items():
        src = base_dir / in_name

        if src.exists():
            create_gif_from_spritesheet(
                src,
                out_dir / out_name,
            )
        else:
            print(f"Missing file: {src}")


if __name__ == "__main__":
    main()