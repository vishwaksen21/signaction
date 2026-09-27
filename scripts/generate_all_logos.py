#!/usr/bin/env python3
"""
Generate all logos, app icons, favicons, and splash screens from signaction-.png.
"""

import os
from PIL import Image, ImageDraw

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SRC_LOGO = os.path.join(ROOT_DIR, "public", "signaction-.png")
FRONTEND_DIR = os.path.join(ROOT_DIR, "frontend")
PUBLIC_DIR = os.path.join(FRONTEND_DIR, "public")
APP_DIR = os.path.join(FRONTEND_DIR, "app")
RES_DIR = os.path.join(FRONTEND_DIR, "android", "app", "src", "main", "res")

def create_circular_icon(img_rgba, size):
    """Create a round launcher icon on a white circular background."""
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(canvas)
    draw.ellipse((0, 0, size - 1, size - 1), fill=(255, 255, 255, 255))

    # Scale logo to ~76% of diameter
    logo_size = int(size * 0.76)
    scaled_logo = img_rgba.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    offset = (size - logo_size) // 2
    canvas.paste(scaled_logo, (offset, offset), scaled_logo)
    return canvas

def create_adaptive_foreground(img_rgba, canvas_size):
    """Create adaptive icon foreground with logo centered in safe zone."""
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    logo_size = int(canvas_size * 0.65)
    scaled_logo = img_rgba.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    offset = (canvas_size - logo_size) // 2
    canvas.paste(scaled_logo, (offset, offset), scaled_logo)
    return canvas

def create_splash_screen(img_rgba, width, height):
    """Create a splash screen with centered logo on pure white background."""
    canvas = Image.new("RGBA", (width, height), (255, 255, 255, 255))
    shorter_dim = min(width, height)
    logo_size = int(shorter_dim * 0.32)
    logo_size = max(logo_size, 96)
    scaled_logo = img_rgba.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    offset_x = (width - logo_size) // 2
    offset_y = (height - logo_size) // 2
    canvas.paste(scaled_logo, (offset_x, offset_y), scaled_logo)
    return canvas

def main():
    if not os.path.exists(SRC_LOGO):
        raise FileNotFoundError(f"Source logo not found at {SRC_LOGO}")

    orig = Image.open(SRC_LOGO).convert("RGBA")
    print(f"Loaded master logo from {SRC_LOGO} ({orig.size})")

    # 1. Web & PWA Assets in frontend/public/
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    os.makedirs(os.path.join(PUBLIC_DIR, "icons"), exist_ok=True)
    os.makedirs(APP_DIR, exist_ok=True)

    # Master files
    orig.save(os.path.join(PUBLIC_DIR, "signaction-.png"), "PNG")
    orig.save(os.path.join(PUBLIC_DIR, "logo.png"), "PNG")
    orig.save(os.path.join(PUBLIC_DIR, "logo1.png"), "PNG")
    print("Saved master logo copies to frontend/public/")

    # Web sizes
    web_targets = [
        ("apple-touch-icon.png", 180),
        ("icon-192.png", 192),
        ("icon-512.png", 512),
        ("favicon.png", 48),
        ("icons/icon-192.png", 192),
        ("icons/icon-512.png", 512),
    ]

    for rel_path, sz in web_targets:
        out_path = os.path.join(PUBLIC_DIR, rel_path)
        resized = orig.resize((sz, sz), Image.Resampling.LANCZOS)
        resized.save(out_path, "PNG")
        print(f"Generated {out_path} ({sz}x{sz})")

    # Maskable PWA icons (with safe zone margin)
    for sz in [192, 512]:
        maskable = Image.new("RGBA", (sz, sz), (255, 255, 255, 255))
        logo_sz = int(sz * 0.75)
        scaled = orig.resize((logo_sz, logo_sz), Image.Resampling.LANCZOS)
        offset = (sz - logo_sz) // 2
        maskable.paste(scaled, (offset, offset), scaled)
        out_path = os.path.join(PUBLIC_DIR, f"icons/icon-maskable-{sz}.png")
        maskable.save(out_path, "PNG")
        print(f"Generated {out_path} ({sz}x{sz} maskable)")

    # Favicon.ico multi-resolution
    ico_sizes = [(16, 16), (32, 32), (48, 48)]
    ico_images = [orig.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
    fav_path = os.path.join(PUBLIC_DIR, "favicon.ico")
    ico_images[0].save(fav_path, format="ICO", sizes=ico_sizes)
    print(f"Generated multi-resolution ICO at {fav_path}")

    # App directory icons for Next.js App Router
    app_icon_32 = orig.resize((32, 32), Image.Resampling.LANCZOS)
    app_icon_32.save(os.path.join(APP_DIR, "icon.png"), "PNG")
    app_apple = orig.resize((180, 180), Image.Resampling.LANCZOS)
    app_apple.save(os.path.join(APP_DIR, "apple-icon.png"), "PNG")
    ico_images[0].save(os.path.join(APP_DIR, "favicon.ico"), format="ICO", sizes=ico_sizes)
    print("Generated Next.js app/icon.png, app/apple-icon.png, app/favicon.ico")

    # 2. Android Mipmaps
    mipmap_configs = {
        "mipmap-mdpi": {"standard": 48, "foreground": 108},
        "mipmap-hdpi": {"standard": 72, "foreground": 162},
        "mipmap-xhdpi": {"standard": 96, "foreground": 216},
        "mipmap-xxhdpi": {"standard": 144, "foreground": 324},
        "mipmap-xxxhdpi": {"standard": 192, "foreground": 432},
    }

    for folder, cfg in mipmap_configs.items():
        folder_path = os.path.join(RES_DIR, folder)
        os.makedirs(folder_path, exist_ok=True)

        # Standard launcher icon
        std_size = cfg["standard"]
        std_icon = create_circular_icon(orig, std_size)
        std_icon.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")

        # Round launcher icon
        std_icon.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

        # Foreground adaptive icon
        fg_size = cfg["foreground"]
        fg_icon = create_adaptive_foreground(orig, fg_size)
        fg_icon.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")
        print(f"Generated Android icons for {folder}: {std_size}x{std_size}, fg: {fg_size}x{fg_size}")

    # Remove the old hardcoded Android vector head from drawable-v24 so @mipmap/ic_launcher_foreground is used!
    old_robot_vector = os.path.join(RES_DIR, "drawable-v24", "ic_launcher_foreground.xml")
    if os.path.exists(old_robot_vector):
        os.remove(old_robot_vector)
        print("Removed obsolete drawable-v24/ic_launcher_foreground.xml")

    # 3. Android Splash Screens
    splash_targets = [
        ("drawable/splash.png", 1080, 1920),
        ("drawable-port-mdpi/splash.png", 320, 480),
        ("drawable-port-hdpi/splash.png", 480, 800),
        ("drawable-port-xhdpi/splash.png", 720, 1280),
        ("drawable-port-xxhdpi/splash.png", 960, 1600),
        ("drawable-port-xxxhdpi/splash.png", 1280, 1920),
        ("drawable-land-mdpi/splash.png", 480, 320),
        ("drawable-land-hdpi/splash.png", 800, 480),
        ("drawable-land-xhdpi/splash.png", 1280, 720),
        ("drawable-land-xxhdpi/splash.png", 1600, 960),
        ("drawable-land-xxxhdpi/splash.png", 1920, 1280),
    ]

    for rel_path, w, h in splash_targets:
        full_path = os.path.join(RES_DIR, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        splash_img = create_splash_screen(orig, w, h)
        splash_img.save(full_path, "PNG")
        print(f"Generated splash screen: {rel_path} ({w}x{h})")

    print("\nSUCCESS: All logos, favicons, app icons, and splash screens generated.")

if __name__ == "__main__":
    main()
