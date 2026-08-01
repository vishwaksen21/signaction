import cv2
import numpy as np
from PIL import Image
from pathlib import Path


def process_sprite_sheet(img_path, out_prefix):
    print(f"\nProcessing {img_path}")

    img = cv2.imread(str(img_path), cv2.IMREAD_UNCHANGED)
    if img is None:
        print("Failed to load image")
        return

    if len(img.shape) == 2:
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGRA)
    elif img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

    H, W = img.shape[:2]
    half_w = W // 2
    half_h = H // 2

    quadrants = [
        img[:half_h, :half_w],
        img[:half_h, half_w:],
        img[half_h:, :half_w],
        img[half_h:, half_w:]
    ]

    frames = []

    max_left = 0
    max_right = 0
    max_h = 0

    for i, q in enumerate(quadrants):
        q = q.copy()

        # remove border lines
        q[:5, :] = 255
        q[-5:, :] = 255
        q[:, :5] = 255
        q[:, -5:] = 255

        # remove Frame X text
        text_y = int(q.shape[0] * 0.82)
        q[text_y:, :] = 255

        ##################################################
        # Background subtraction
        ##################################################

        bg = q[0, 0, :3]

        diff = np.abs(
            q[:, :, :3].astype(np.int16)
            - bg.astype(np.int16)
        )

        mask = (
            np.any(diff > 15, axis=2)
            .astype(np.uint8)
            * 255
        )

        kernel = np.ones((5, 5), np.uint8)

        mask = cv2.morphologyEx(
            mask,
            cv2.MORPH_CLOSE,
            kernel
        )

        mask = cv2.morphologyEx(
            mask,
            cv2.MORPH_OPEN,
            kernel
        )

        coords = cv2.findNonZero(mask)

        if coords is None:
            print(f"Could not find character in frame {i+1}")
            continue

        x, y, w, h = cv2.boundingRect(coords)

        pad = 5

        x = max(0, x - pad)
        y = max(0, y - pad)

        w = min(q.shape[1] - x, w + pad * 2)
        h = min(q.shape[0] - y, h + pad * 2)

        char = q[y:y+h, x:x+w].copy()
        char_mask = mask[y:y+h, x:x+w]

        char[:, :, 3] = char_mask

        ##################################################
        # Find torso center instead of hand center
        ##################################################

        start_y = int(h * 0.35)
        end_y = int(h * 0.75)

        torso = char_mask[start_y:end_y, :]

        cols = np.where(
            np.any(torso > 0, axis=0)
        )[0]

        if len(cols):
            anchor_x = int(np.mean(cols))
        else:
            anchor_x = w // 2

        left = anchor_x
        right = w - anchor_x

        max_left = max(max_left, left)
        max_right = max(max_right, right)
        max_h = max(max_h, h)

        frames.append({
            "char": char,
            "w": w,
            "h": h,
            "anchor_x": anchor_x
        })

    if len(frames) != 4:
        print("Failed to extract all 4 frames")
        return

    ##################################################
    # Create equal canvas
    ##################################################

    padding = 20

    canvas_w = (
        max_left
        + max_right
        + padding * 2
    )

    canvas_h = max_h + padding * 2

    center_x = max_left + padding

    output_frames = []

    out_dir = Path("signaction_assets/signs")
    out_dir.mkdir(parents=True, exist_ok=True)

    for i, f in enumerate(frames):
        canvas = np.zeros(
            (canvas_h, canvas_w, 4),
            dtype=np.uint8
        )

        char = f["char"]

        paste_x = center_x - f["anchor_x"]
        paste_y = canvas_h - f["h"] - padding

        canvas[
            paste_y:paste_y + f["h"],
            paste_x:paste_x + f["w"]
        ] = char

        rgba = cv2.cvtColor(
            canvas,
            cv2.COLOR_BGRA2RGBA
        )

        pil = Image.fromarray(rgba)

        frame_path = (
            out_dir
            / f"{out_prefix}_frame_{i+1}.png"
        )

        pil.save(frame_path)
        print("Saved", frame_path)

        output_frames.append(pil)

    ##################################################
    # Create GIF
    ##################################################

    seq = [
        output_frames[0],
        output_frames[1],
        output_frames[2],
        output_frames[3],
        output_frames[2],
        output_frames[1]
    ]

    seq = [
        f.convert(
            "P",
            palette=Image.ADAPTIVE
        )
        for f in seq
    ]

    gif_path = out_dir / f"{out_prefix}.gif"

    seq[0].save(
        gif_path,
        save_all=True,
        append_images=seq[1:],
        duration=300,
        loop=0,
        disposal=2
    )

    print("Saved", gif_path)


def main():
    base_dir = Path(
        "/Users/vishwaksen/.gemini/antigravity-ide/brain/4be55be2-982d-4553-9aef-1014879fe0a3"
    )

    files = {
        "HELLO": "sign_hello_strict_1783406557205.png",
        "THANK_YOU": "sign_thank_you_strict_1783406745051.png",
        "WELCOME": "sign_welcome_strict_1783406797111.png",
        "WHERE": "sign_where_strict_1783406817181.png",
        "DOING": "sign_doing_strict_1783406838206.png"
    }

    for prefix, filename in files.items():
        src = base_dir / filename

        if src.exists():
            process_sprite_sheet(src, prefix)
        else:
            print(f"Missing {src}")


if __name__ == "__main__":
    main()