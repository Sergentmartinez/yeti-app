from PIL import Image, ImageDraw
import numpy as np
import os

# --- CONFIGURATION ---
OUTPUT_DIR = "public/images"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "yeti_background_hd.png")
WIDTH = 4096  # Résolution 4K (Très haute qualité)
HEIGHT = 4096
BASE_COLOR = (105, 122, 109) # Le "Vert Yeti" (Sage Green desaturé) approximatif
NOISE_LEVEL = 10  # Intensité du grain (texture)

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

print("🎨 Génération du fond HD en cours...")

# Ensure output directory exists
os.makedirs(OUTPUT_DIR, exist_ok=True)

# 1. Créer la couleur unie
# On utilise numpy pour aller vite sur 16 millions de pixels
data = np.full((HEIGHT, WIDTH, 3), BASE_COLOR, dtype=np.uint8)

# 2. Ajouter du Bruit (Grain) pour le réalisme
# Cela évite l'effet "plat" du CSS et donne l'aspect "tapis de sol"
noise = np.random.normal(0, NOISE_LEVEL, (HEIGHT, WIDTH, 3)).astype(np.int16)
data_noise = data.astype(np.int16) + noise

# 3. Clamper les valeurs (rester entre 0 et 255) et convertir
data_noise = np.clip(data_noise, 0, 255).astype(np.uint8)

# 4. Sauvegarder
img = Image.fromarray(data_noise, 'RGB')
img.save(OUTPUT_FILE, quality=95)

print(f"✅ Image générée : {OUTPUT_FILE} ({WIDTH}x{HEIGHT}px)")
