import os
import cv2
import numpy as np

INPUT_DEPTH_DIR = r"C:\Users\mafum\Desktop\Sac_a_dos\yeti\public\assets\garage\depth"
OUTPUT_NORMAL_DIR = r"C:\Users\mafum\Desktop\Sac_a_dos\yeti\public\assets\garage\normal"

os.makedirs(OUTPUT_NORMAL_DIR, exist_ok=True)

def generate_normal_map(depth_path, output_path):
    try:
        depth_img = cv2.imread(depth_path, cv2.IMREAD_UNCHANGED)
        if depth_img is None: 
            print(f"⚠️  Could not read: {depth_path}")
            return

        alpha = None
        if depth_img.ndim == 3 and depth_img.shape[2] == 4:
            alpha = depth_img[:, :, 3]
            depth_gray = depth_img[:, :, 0]
        else:
            depth_gray = depth_img if depth_img.ndim == 2 else cv2.cvtColor(depth_img, cv2.COLOR_BGR2GRAY)

        d_depth = depth_gray.astype(np.float32)
        zx = cv2.Sobel(d_depth, cv2.CV_64F, 1, 0, ksize=5)
        zy = cv2.Sobel(d_depth, cv2.CV_64F, 0, 1, ksize=5)

        normal = np.dstack((-zx, -zy, np.ones_like(d_depth) * 1.0))
        n = np.linalg.norm(normal, axis=2)
        normal[:, :, 0] /= n
        normal[:, :, 1] /= n
        normal[:, :, 2] /= n

        normal += 1
        normal /= 2
        normal *= 255
        normal_bgr = cv2.cvtColor(normal.astype(np.uint8), cv2.COLOR_RGB2BGR)

        if alpha is not None:
            b, g, r = cv2.split(normal_bgr)
            final = cv2.merge([b, g, r, alpha])
        else:
            final = normal_bgr

        cv2.imwrite(output_path, final)
        print(f"✅ Generated: {os.path.basename(output_path)}")
    except Exception as e:
        print(f"❌ Error {os.path.basename(depth_path)}: {e}")

if __name__ == "__main__":
    print("🔨 Generating Normal Maps from Depth Maps...")
    print(f"📂 Input: {INPUT_DEPTH_DIR}")
    print(f"📂 Output: {OUTPUT_NORMAL_DIR}\n")
    
    if os.path.exists(INPUT_DEPTH_DIR):
        files = [f for f in os.listdir(INPUT_DEPTH_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
        total = len(files)
        
        if total == 0:
            print("⚠️  No depth maps found. Please run generate_depth_maps.py first.")
        else:
            print(f"Found {total} depth maps to process...\n")
            for i, f in enumerate(files):
                print(f"[{i+1}/{total}] Processing {f}...")
                generate_normal_map(
                    os.path.join(INPUT_DEPTH_DIR, f), 
                    os.path.join(OUTPUT_NORMAL_DIR, f)
                )
            print(f"\n✨ Done! {total} normal maps generated in {OUTPUT_NORMAL_DIR}")
    else:
        print(f"❌ Depth directory not found: {INPUT_DEPTH_DIR}")
        print("Please run generate_depth_maps.py first to create depth maps.")
