import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

signs_dir = Path("signaction_assets/signs")
files = list(signs_dir.glob("*.mp4"))

def convert_video(p):
    tmp_out = p.with_suffix(".tmp.mp4")
    try:
        # Check codec first
        res = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name", "-of", "default=noprint_wrappers=1:nokey=1", str(p)], capture_output=True, text=True)
        codec = res.stdout.strip()
        if codec == "h264":
            return True # already h264
            
        subprocess.run([
            "ffmpeg", "-y", "-i", str(p), 
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "28", 
            "-c:a", "copy", str(tmp_out)
        ], capture_output=True, check=True)
        tmp_out.replace(p)
        return True
    except Exception as e:
        if tmp_out.exists():
            tmp_out.unlink()
        return False

print(f"Checking and fixing {len(files)} videos...")
success = 0
with ThreadPoolExecutor(max_workers=8) as executor:
    for res in executor.map(convert_video, files):
        if res:
            success += 1

print(f"Successfully processed {success}/{len(files)} videos.")
