#!/usr/bin/env python3
"""
Script de synchronisation des images depuis knolling-database.ts
Télécharge automatiquement les images Unsplash dans raw_gear/
"""

import os
import re
import requests
from pathlib import Path
from tqdm import tqdm

# Configuration
DATABASE_FILE = "lib/gear/knolling-database.ts"
OUTPUT_DIR = "raw_gear"
TIMEOUT = 10  # secondes

def extract_items_from_ts(file_path):
    """Extrait les items (id, image) depuis le fichier TypeScript"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Regex pour capturer les objets avec id et image
    pattern = r'id:\s*["\']([^"\']+)["\'],.*?image:\s*["\']([^"\']+)["\']'
    matches = re.findall(pattern, content, re.DOTALL)
    
    return [{"id": match[0], "url": match[1]} for match in matches]

def download_image(url, output_path):
    """Télécharge une image depuis une URL"""
    try:
        response = requests.get(url, timeout=TIMEOUT, stream=True)
        response.raise_for_status()
        
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        return True
    except Exception as e:
        print(f"  ❌ Erreur: {str(e)}")
        return False

def get_image_extension(url):
    """Détermine l'extension de l'image (jpg par défaut pour Unsplash)"""
    # Unsplash sert toujours des JPG, mais on peut vérifier l'URL
    if 'photo' in url or 'unsplash' in url:
        return '.jpg'
    return '.jpg'

def main():
    print("=" * 60)
    print("SYNCHRONISATION DES IMAGES KNOLLING")
    print("=" * 60)
    
    # Création du dossier de sortie
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Vérification du fichier source
    if not os.path.exists(DATABASE_FILE):
        print(f"❌ ERREUR: Le fichier '{DATABASE_FILE}' n'existe pas.")
        return
    
    # Extraction des items
    print(f"\n📖 Lecture de {DATABASE_FILE}...")
    items = extract_items_from_ts(DATABASE_FILE)
    print(f"✅ {len(items)} objets trouvés\n")
    
    # Statistiques
    downloaded = 0
    skipped = 0
    failed = 0
    
    # Téléchargement
    print(f"📥 Téléchargement des images dans '{OUTPUT_DIR}/'...\n")
    
    for item in tqdm(items, desc="Progression"):
        item_id = item['id']
        url = item['url']
        extension = get_image_extension(url)
        output_path = os.path.join(OUTPUT_DIR, f"{item_id}{extension}")
        
        # Vérifier si le fichier existe déjà
        if os.path.exists(output_path):
            skipped += 1
            continue
        
        # Télécharger
        if download_image(url, output_path):
            downloaded += 1
        else:
            failed += 1
    
    # Résumé
    print(f"\n{'=' * 60}")
    print("RÉSUMÉ")
    print(f"{'=' * 60}")
    print(f"✅ Téléchargées :  {downloaded}")
    print(f"⏭️  Ignorées     :  {skipped} (déjà présentes)")
    print(f"❌ Échecs       :  {failed}")
    print(f"📦 Total        :  {len(items)}")
    print(f"{'=' * 60}\n")
    
    if downloaded > 0:
        print(f"🚀 Vous pouvez maintenant lancer:")
        print(f"   python scripts/generate_assets.py")

if __name__ == "__main__":
    main()
