from pathlib import Path
import subprocess

def compile_video(frames_dir: Path, out_file: Path):
    """Uses FFmpeg to compile individual PNG frames into a 60fps MP4."""
    # cmd = [
    #     "ffmpeg", "-y", "-framerate", "60", 
    #     "-i", f"{frames_dir}/frame_%04d.png", 
    #     "-c:v", "libx264", "-pix_fmt", "yuv420p", 
    #     str(out_file)
    # ]
    # subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    pass

def extract_mediapipe_keypoints(video_file: Path, keypoints_dir: Path):
    """
    STUB: Runs MediaPipe Holistic over the generated video to extract JSON landmarks.
    """
    pass

def generate_sprite(frames_dir: Path, sprite_file: Path):
    """
    STUB: Uses Pillow or ImageMagick to stitch frames into a sprite sheet.
    """
    pass

def extract_3d_joints(blender_output: Path, joints_file: Path):
    """
    STUB: Extracts the raw 3D joint coordinates (e.g., SMPL-X joints) to a numpy array.
    """
    pass

def extract_smplx_params(blender_output: Path, params_file: Path):
    """
    STUB: Saves the precise SMPL-X shape and pose parameters used in the render.
    """
    pass

def process_rendered_frames(word_dir: Path):
    print(f"    [Extract] Post-processing rendered output for {word_dir.name}...")
    
    frames_dir = word_dir / "frames"
    video_file = word_dir / "video.mp4"
    keypoints_dir = word_dir / "keypoints"
    sprite_file = word_dir / "sprite_sheet.png"
    joints_file = word_dir / "joints.npy"
    smplx_params_file = word_dir / "smplx_params.npz"
    
    # 1. Compile MP4
    compile_video(frames_dir, video_file)
    
    # 2. Extract Keypoints
    extract_mediapipe_keypoints(video_file, keypoints_dir)
    
    # 3. Generate Sprites
    generate_sprite(frames_dir, sprite_file)
    
    # 4. Extract Raw 3D Data
    extract_3d_joints(frames_dir, joints_file)
    extract_smplx_params(frames_dir, smplx_params_file)
    
    print("    [Extract] Post-processing complete.")
