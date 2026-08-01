import cv2
import numpy as np
from pathlib import Path
import subprocess
import shutil
import os


def cartoonize_video(input_path, output_path):
    print(f"Processing {input_path}...")

    cap = cv2.VideoCapture(str(input_path))
    if not cap.isOpened():
        print(f"Failed to open {input_path}")
        return False

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0 or np.isnan(fps):
        fps = 30.0

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    temp_avi = str(output_path).replace(".mp4", "_temp.avi")

    fourcc = cv2.VideoWriter_fourcc(*"XVID")
    out = cv2.VideoWriter(temp_avi, fourcc, fps, (width, height))

    if not out.isOpened():
        print("Failed to create output video.")
        cap.release()
        return False

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Downsample for faster processing
            small = cv2.resize(frame, None, fx=0.5, fy=0.5)

            # Edge detection
            gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
            gray = cv2.medianBlur(gray, 5)

            edges = cv2.adaptiveThreshold(
                gray,
                255,
                cv2.ADAPTIVE_THRESH_MEAN_C,
                cv2.THRESH_BINARY,
                9,
                9,
            )

            # Smooth colors
            color = cv2.bilateralFilter(small, 9, 250, 250)

            # Cartoon effect
            cartoon = cv2.bitwise_and(color, color, mask=edges)

            # Subtle cyan tint
            b, g, r = cv2.split(cartoon)
            b = np.clip(b.astype(np.int16) + 25, 0, 255).astype(np.uint8)
            g = np.clip(g.astype(np.int16) + 10, 0, 255).astype(np.uint8)
            cartoon = cv2.merge((b, g, r))

            cartoon = cv2.resize(
                cartoon,
                (width, height),
                interpolation=cv2.INTER_LINEAR,
            )

            out.write(cartoon)

    finally:
        cap.release()
        out.release()

    # Check ffmpeg
    if shutil.which("ffmpeg") is None:
        print("ffmpeg not found. Keeping AVI output.")
        return False

    print("Converting to web-safe MP4...")

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        temp_avi,
        "-i",
        str(input_path),          # original video for audio
        "-map",
        "0:v:0",
        "-map",
        "1:a?",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-shortest",
        str(output_path),
    ]

    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )

    if result.returncode != 0:
        print("ffmpeg conversion failed.")
        print(result.stderr.decode(errors="ignore"))

        if os.path.exists(temp_avi):
            os.remove(temp_avi)

        return False

    if os.path.exists(temp_avi):
        os.remove(temp_avi)

    print(f"Saved to {output_path}")
    return True


def main():
    signs_dir = Path("signaction_assets/signs")

    for name in ["HELLO.mp4", "WORLD.mp4", "AI.mp4"]:
        in_path = signs_dir / name

        if not in_path.exists():
            print(f"Missing: {in_path}")
            continue

        out_path = signs_dir / f"{in_path.stem}.tmp.mp4"

        success = cartoonize_video(in_path, out_path)

        if success and out_path.exists():
            os.replace(out_path, in_path)
            print(f"Updated {in_path}")


if __name__ == "__main__":
    main()