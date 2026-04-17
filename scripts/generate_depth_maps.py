import os
import cv2
import torch
import numpy as np
from PIL import Image
from transformers import pipeline

# --- CONFIGURATION ---
# Chemins relatifs ou absolus vers tes dossiers
INPUT_DIR = r"C:\Users\mafum\Desktop\Sac_a_dos\yeti\public\assets\garage\color"
OUTPUT_DIR = r"C:\Users\mafum\Desktop\Sac_a_dos\yeti\public\assets\garage\depth"

# Création du dossier de sortie s'il n'existe pas
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Chargement du modèle d'IA (Depth Estimation)...")
# On utilise "Depth Anything" ou "MiDaS" via Hugging Face.
# C'est très performant pour détacher les objets du fond.
pipe = pipeline(task="depth-estimation", model="LiheYoung/depth-anything-small-hf")

def process_images():
    files = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
    total = len(files)
    
    print(f"Début du traitement de {total} images...")

    for i, filename in enumerate(files):
        input_path = os.path.join(INPUT_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, filename) # On garde le même nom/extension

        try:
            # 1. Ouvrir l'image
            image = Image.open(input_path).convert("RGB")

            # 2. Prédire la profondeur
            # L'IA retourne une image où Blanc = Proche (Haut), Noir = Loin (Bas/Fond)
            depth_output = pipe(image)["depth"]

            # 3. Traitement pour les PNG transparents (Détourage)
            # Si l'image source a de la transparence, on veut que la depth map soit aussi transparente autour
            original_cv = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
            
            # Convertir le résultat de l'IA (PIL) en format OpenCV (numpy)
            depth_np = np.array(depth_output)
            
            # Si l'image originale a un canal Alpha (transparence)
            if original_cv.shape[2] == 4:
                alpha_channel = original_cv[:, :, 3]
                
                # Redimensionner la depth map pour qu'elle matche exactement l'originale (au cas où l'IA resize)
                depth_np = cv2.resize(depth_np, (original_cv.shape[1], original_cv.shape[0]))
                
                # Re-créer une image avec 4 canaux (Gris + Alpha)
                # On utilise la depth comme niveau de gris
                depth_rgba = np.zeros((original_cv.shape[0], original_cv.shape[1], 4), dtype=np.uint8)
                depth_rgba[:, :, 0] = depth_np # R
                depth_rgba[:, :, 1] = depth_np # G
                depth_rgba[:, :, 2] = depth_np # B
                depth_rgba[:, :, 3] = alpha_channel # Alpha restauré
                
                # Sauvegarder
                cv2.imwrite(output_path, depth_rgba)
            else:
                # Si pas de transparence, on sauvegarde direct
                depth_output.save(output_path)

            print(f"[{i+1}/{total}] ✅ Généré : {filename}")

        except Exception as e:
            print(f"[{i+1}/{total}] ❌ Erreur sur {filename} : {e}")

    print("\n--- Terminé ! ---")
    print(f"Les depth maps sont dans : {OUTPUT_DIR}")

if __name__ == "__main__":
    process_images()
