import os
import sys

def main():
    try:
        from PIL import Image
    except ImportError:
        print("[!] Pillow (PIL) is not installed. Installing Pillow now...")
        os.system(f"{sys.executable} -m pip install pillow")
        try:
            from PIL import Image
        except ImportError:
            print("[ERROR] Could not install Pillow automatically. Please run: pip install pillow")
            return

    # Paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)

    src_logo = os.path.join(base_dir, "..", "empirecodes", "empirecodes_logo.jpg")
    if not os.path.exists(src_logo):
        src_logo = r"c:\Users\PC\Downloads\empirecodes_edit_now\empirecodes\empirecodes_logo.jpg"

    if not os.path.exists(src_logo):
        print(f"[ERROR] Source logo not found at {src_logo}")
        return

    print(f"[*] Found source emblem: {src_logo}")
    logo = Image.open(src_logo).convert("RGBA")

    # 1. Generate 1024x1024 icon.png (Full bleed / standard square)
    icon_canvas = Image.new("RGBA", (1024, 1024), (2, 2, 2, 255)) # #020202
    
    # Calculate aspect ratio resize for logo (max 820 width/height)
    logo_w, logo_h = logo.size
    scale = min(820 / logo_w, 820 / logo_h)
    new_w = int(logo_w * scale)
    new_h = int(logo_h * scale)
    resized_logo = logo.resize((new_w, new_h), Image.Resampling.LANCZOS)
    
    pos_x = (1024 - new_w) // 2
    pos_y = (1024 - new_h) // 2
    icon_canvas.paste(resized_logo, (pos_x, pos_y), resized_logo)
    
    icon_path = os.path.join(assets_dir, "icon.png")
    icon_canvas.save(icon_path, "PNG", optimize=True)
    print(f"[OK] Saved primary icon: {icon_path} (1024x1024)")

    # 2. Generate 1024x1024 adaptive-icon.png (Android Adaptive Icon with 660px safe zone)
    # Android launchers mask adaptive icons with circular or squircle masks (diameter ~660px)
    adaptive_canvas = Image.new("RGBA", (1024, 1024), (2, 2, 2, 255)) # #020202
    adaptive_scale = min(620 / logo_w, 620 / logo_h)
    adapt_w = int(logo_w * adaptive_scale)
    adapt_h = int(logo_h * adaptive_scale)
    adaptive_logo = logo.resize((adapt_w, adapt_h), Image.Resampling.LANCZOS)
    
    adapt_x = (1024 - adapt_w) // 2
    adapt_y = (1024 - adapt_h) // 2
    adaptive_canvas.paste(adaptive_logo, (adapt_x, adapt_y), adaptive_logo)
    
    adaptive_path = os.path.join(assets_dir, "adaptive-icon.png")
    adaptive_canvas.save(adaptive_path, "PNG", optimize=True)
    print(f"[OK] Saved Android adaptive icon: {adaptive_path} (1024x1024, safe circle compliant)")

    # 3. Generate 1024x1024 splash.png (Splash Screen)
    splash_canvas = Image.new("RGBA", (1024, 1024), (2, 2, 2, 255))
    splash_canvas.paste(adaptive_logo, (adapt_x, adapt_y), adaptive_logo)
    splash_path = os.path.join(assets_dir, "splash.png")
    splash_canvas.save(splash_path, "PNG", optimize=True)
    print(f"[OK] Saved launch splash: {splash_path} (1024x1024)")

    # 4. Generate 192x192 favicon.png (Web favicon)
    favicon_canvas = icon_canvas.resize((192, 192), Image.Resampling.LANCZOS)
    favicon_path = os.path.join(assets_dir, "favicon.png")
    favicon_canvas.save(favicon_path, "PNG", optimize=True)
    print(f"[OK] Saved favicon: {favicon_path} (192x192)")

    print("\n[SUCCESS] All EmpireCodes branding assets generated with zero clipping!")

if __name__ == "__main__":
    main()

