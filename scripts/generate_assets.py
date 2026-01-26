import os
import cv2
import torch
import numpy as np
import json
from pathlib import Path
from PIL import Image
from rembg import remove
from tqdm import tqdm
import io
import argparse

# --- ARGUMENT PARSER ---
def parse_args():
    parser = argparse.ArgumentParser(description='PHASE 1 - Traitement des Assets 2D (GLM 4.7)')
    parser.add_argument('--input', type=str, default="raw_gear", 
                       help='Dossier contenant les images brutes')
    parser.add_argument('--output', type=str, default="public/gear", 
                       help='Dossier de sortie pour les assets traités')
    parser.add_argument('--size', type=int, default=1024, choices=[1024, 2048],
                       help='Résolution cible (1024 Standard, 2048 Ultra)')
    parser.add_argument('--padding', type=int, default=5,
                       help='Pourcentage de padding (5% par défaut)')
    parser.add_argument('--erosion', type=int, default=2,
                       help='Taille d\'érosion du masque (2px par défaut)')
    parser.add_argument('--format', type=str, default='webp', choices=['webp', 'png'],
                       help='Format de sortie (webp par défaut)')
    parser.add_argument('--db', type=str, default="lib/gear-database.json",
                       help='Fichier de base de données JSON')
    return parser.parse_args()

args = parse_args()

# --- CONFIGURATION ---
INPUT_DIR = args.input
OUTPUT_DIR = args.output
OUTPUT_COLOR = f"{OUTPUT_DIR}/color"
OUTPUT_NORMAL = f"{OUTPUT_DIR}/normal"
DB_FILE = args.db
TARGET_SIZE = args.size
PADDING_PERCENT = args.padding / 100.0
EROSION_SIZE = args.erosion
OUTPUT_FORMAT = args.format

# --- INIT MODELS ---
print("⚙️  Chargement des modèles IA...")

# 1. MiDaS (Profondeur -> Normales)
# DPT_Hybrid est un excellent compromis vitesse/qualité
model_type = "DPT_Hybrid"
midas = torch.hub.load("intel-isl/MiDaS", model_type)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
midas.to(device)
midas.eval()
midas_transforms = torch.hub.load("intel-isl/MiDaS", "transforms").dpt_transform

print(f"✅ Modèles chargés sur {device}")


# --- FONCTIONS ---

def create_normal_map(depth_map, strength=5.0):
    """Génère une Normal Map (Violet) à partir d'une Depth Map (N&B)"""
    # Calcul des gradients (pentes)
    zy, zx = np.gradient(depth_map)
    
    # Création des vecteurs normaux (x, y, z)
    # On divise par 'strength' pour atténuer ou renforcer le relief
    normal = np.dstack((-zx, -zy, np.ones_like(depth_map) / (strength / 10.0)))
    
    # Normalisation vectorielle
    n = np.linalg.norm(normal, axis=2)
    normal[:, :, 0] /= n
    normal[:, :, 1] /= n
    normal[:, :, 2] /= n
    
    # Conversion [-1, 1] vers RGB [0, 255]
    normal += 1
    normal /= 2
    return (normal * 255).astype(np.uint8)

def process_image(filename):
    file_path = os.path.join(INPUT_DIR, filename)
    file_id = Path(filename).stem
    
    # 1. DÉTOURAGE (Rembg) - Configuration GLM 4.7 : Érosion configurée via arguments
    with open(file_path, 'rb') as f:
        img_data = f.read()
        # Alpha matting avec seuils agressifs pour supprimer les pixels blancs résiduels
        subject = remove(
            img_data, 
            alpha_matting=True,
            alpha_matting_foreground_threshold=250,  # Plus agressif (défaut: 240)
            alpha_matting_background_threshold=15,    # Plus strict (défaut: 10)
            alpha_matting_erode_size=EROSION_SIZE    # GLM 4.7 : Érosion configurée via arguments
        )
    
    # Conversion PIL -> RGBA
    img_pil = Image.open(io.BytesIO(subject)).convert("RGBA")
    
    # 2. CADRAGE (Trim & Padding) - GLM 4.7
    # Rogner le vide (Trim)
    bbox = img_pil.getbbox()
    if bbox:
        img_pil = img_pil.crop(bbox)
    
    # Ajouter le padding configuré via arguments
    width, height = img_pil.size
    padding_x = int(width * PADDING_PERCENT)
    padding_y = int(height * PADDING_PERCENT)
    
    # Créer une image plus grande avec fond transparent
    padded_img = Image.new("RGBA", (width + 2*padding_x, height + 2*padding_y), (0, 0, 0, 0))
    padded_img.paste(img_pil, (padding_x, padding_y), img_pil)
    img_pil = padded_img
    
    # 3. FORMAT - GLM 4.7 : Ratio 1:1 carré, résolution 1024x1024 ou 2048x2048
    # Forcer le ratio 1:1
    width, height = img_pil.size
    size = max(width, height)
    
    # Créer image carrée
    square_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    # Centrer l'image
    paste_x = (size - width) // 2
    paste_y = (size - height) // 2
    square_img.paste(img_pil, (paste_x, paste_y), img_pil)
    
    # Redimensionner à la résolution configurée via arguments
    final_img = square_img.resize((TARGET_SIZE, TARGET_SIZE), Image.Resampling.LANCZOS)
    
    # Sauvegarde Couleur - GLM 4.7 : Format configuré via arguments
    if OUTPUT_FORMAT == 'webp':
        color_path = os.path.join(OUTPUT_COLOR, f"{file_id}.webp")
        final_img.save(color_path, "WEBP", quality=90, lossless=False)  # Q90 par défaut
    else:  # png
        color_path = os.path.join(OUTPUT_COLOR, f"{file_id}.png")
        final_img.save(color_path, "PNG")
    
    # Mettre à jour img_pil pour la suite du traitement
    img_pil = final_img
    
    # 2. ESTIMATION PROFONDEUR (MiDaS)
    # Préparation : on colle l'image sur fond blanc pour aider MiDaS
    bg = Image.new("RGB", img_pil.size, (255, 255, 255))
    bg.paste(img_pil, mask=img_pil.split()[3])
    img_cv = np.array(bg)
    
    input_batch = midas_transforms(img_cv).to(device)
    
    with torch.no_grad():
        prediction = midas(input_batch)
        prediction = torch.nn.functional.interpolate(
            prediction.unsqueeze(1),
            size=img_cv.shape[:2],
            mode="bicubic",
            align_corners=False,
        ).squeeze()
    
    depth_map = prediction.cpu().numpy()
    
    # 3. GÉNÉRATION NORMALE
    normal_map_rgb = create_normal_map(depth_map, strength=2.5)
    
    # 4. MASQUAGE (Réappliquer l'alpha)
    normal_pil = Image.fromarray(normal_map_rgb).convert("RGBA")
    normal_pil.putalpha(img_pil.split()[3]) # Remettre l'alpha original
    
    # Sauvegarde Normale - GLM 4.7 : Format configuré via arguments
    if OUTPUT_FORMAT == 'webp':
        normal_path = os.path.join(OUTPUT_NORMAL, f"{file_id}.webp")
        normal_pil.save(normal_path, "WEBP", quality=90, lossless=False)  # Q90 par défaut
    else:  # png
        normal_path = os.path.join(OUTPUT_NORMAL, f"{file_id}.png")
        normal_pil.save(normal_path, "PNG")
    
    # 5. METADATA - GLM 4.7 : Mise à jour des chemins selon le format
    w, h = img_pil.size
    extension = OUTPUT_FORMAT
    return {
        "id": file_id,
        "name": file_id.replace("-", " ").title(),
        "texturePath": f"/gear/color/{file_id}.{extension}",
        "normalPath": f"/gear/normal/{file_id}.{extension}",
        "ratio": w / h,
        "width": w,
        "height": h
    }


# --- MAIN ---
if __name__ == "__main__":
    # Création des dossiers
    os.makedirs(OUTPUT_COLOR, exist_ok=True)
    os.makedirs(OUTPUT_NORMAL, exist_ok=True)
    
    files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    database = []
    
    print(f"🚀 Traitement de {len(files)} images...")
    
    for f in tqdm(files):
        try:
            item_data = process_image(f)
            database.append(item_data)
        except Exception as e:
            print(f"❌ Erreur sur {f}: {e}")
            
    # Sauvegarde DB
    with open(DB_FILE, 'w') as f:
        json.dump(database, f, indent=2)
        
    print(f"✨ Terminé ! {len(database)} items générés dans {DB_FILE}")
