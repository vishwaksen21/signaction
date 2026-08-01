import cv2
import numpy as np
from PIL import Image
from pathlib import Path


def process_and_align_spritesheet(img_path, out_path):
    print(f"Processing {img_path}...")

    img = cv2.imread(str(img_path), cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Failed to read {img_path}")
        return

    # Ensure BGRA
    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGRA)
    elif img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

    h, w = img.shape[:2]
    mid_x, mid_y = w // 2, h // 2

    quads = [
        img[:mid_y, :mid_x],
        img[:mid_y, mid_x:],
        img[mid_y:, :mid_x],
        img[mid_y:, mid_x:]
    ]

    aligned_frames = []
    max_w = 0
    max_h = 0

    for q in quads:
        gray = cv2.cvtColor(q, cv2.COLOR_BGRA2GRAY)

        # Detect non-white pixels
        mask = gray < 245
        thresh = (mask * 255).astype(np.uint8)

        # Remove frame labels at bottom
        crop_y = int(q.shape[0] * 0.85)
        thresh[crop_y:, :] = 0

        coords = cv2.findNonZero(thresh)

        if coords is not None:
            x, y, bw, bh = cv2.boundingRect(coords)
            character = q[y:y + bh, x:x + bw]

            char_gray = cv2.cvtColor(character, cv2.COLOR_BGRA2GRAY)
            alpha = np.where(char_gray < 245, 255, 0).astype(np.uint8)

            kernel = np.ones((3, 3), np.uint8)
            alpha = cv2.morphologyEx(alpha, cv2.MORPH_CLOSE, kernel)

            character[:, :, 3] = alpha

            aligned_frames.append(character)
            max_w = max(max_w, bw)
            max_h = max(max_h, bh)
        else:
            aligned_frames.append(q)
            fh, fw = q.shape[:2]
            max_w = max(max_w, fw)
            max_h = max(max_h, fh)

    final_frames = []

    canvas_h = max_h + 20
    canvas_w = max_w + 40

    for f in aligned_frames:
        fh, fw = f.shape[:2]

        canvas = np.zeros((canvas_h, canvas_w, 4), dtype=np.uint8)

        x_off = (canvas_w - fw) // 2
        y_off = canvas_h - fh

        canvas[y_off:y_off + fh, x_off:x_off + fw] = f

        rgba = cv2.cvtColor(canvas, cv2.COLOR_BGRA2RGBA)
        pil_img = Image.fromarray(rgba)

        bg = Image.new("RGBA", pil_img.size, (255, 255, 255, 255))
        final = Image.alpha_composite(bg, pil_img)

        final_frames.append(final.convert("P", palette=Image.ADAPTIVE))

    if len(final_frames) == 4:
        seq = [
            final_frames[0],
            final_frames[1],
            final_frames[2],
            final_frames[3],
            final_frames[2],
            final_frames[1],
        ]

        seq[0].save(
            out_path,
            save_all=True,
            append_images=seq[1:],
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
            process_and_align_spritesheet(src, out_dir / out_name)
        else:
            print(f"Missing: {src}")


if __name__ == "__main__":
    main()