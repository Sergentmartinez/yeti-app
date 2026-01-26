#!/usr/bin/env python3
"""
SCRIPT DE RENOMMAGE DES IMAGES D'ÉQUIPEMENT
PHASE 4 - RENOMMAGE COHÉRENT + MISE À JOUR BASE DE DONNÉES

Renomme les fichiers images avec des noms cohérents et courts
et met à jour la base de données avec les nouveaux chemins.
"""

import json
import re
import os
import shutil
from pathlib import Path
import argparse

def clean_filename(filename):
    """Nettoie le nom du fichier pour l'identifier"""
    name = Path(filename).stem
    name = re.sub(r'[^\w\s-]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def generate_clean_filename(original_filename, item_id):
    """Génère un nom de fichier propre et court"""
    # Utiliser l'ID comme base, mais le rendre plus lisible
    clean_id = item_id.replace('-', '_')
    
    # Garder l'extension originale
    ext = Path(original_filename).suffix.lower()
    
    # Retourner le nouveau nom de fichier
    return f"{clean_id}{ext}"

def rename_images_in_raw_gear(raw_gear_path, specs_json_path):
    """Renomme les images dans raw_gear/ et met à jour les chemins"""
    
    # Charger les spécifications
    with open(specs_json_path, 'r', encoding='utf-8') as f:
        gear_items = json.load(f)
    
    if not os.path.exists(raw_gear_path):
        print(f"❌ Le répertoire {raw_gear_path} n'existe pas")
        return gear_items
    
    # Créer un mapping des anciens noms vers nouveaux noms
    rename_mapping = {}
    
    print(f"📂 Traitement des images dans {raw_gear_path}...")
    
    for item in gear_items:
        original_filename = item['original_filename']
        item_id = item['id']
        
        # Générer le nouveau nom de fichier
        new_filename = generate_clean_filename(original_filename, item_id)
        
        # Chemins complets
        old_path = os.path.join(raw_gear_path, original_filename)
        new_path = os.path.join(raw_gear_path, new_filename)
        
        # Renommer le fichier s'il existe
        if os.path.exists(old_path) and old_path != new_path:
            try:
                shutil.move(old_path, new_path)
                print(f"✅ Renommé: {original_filename} -> {new_filename}")
                rename_mapping[original_filename] = new_filename
            except Exception as e:
                print(f"❌ Erreur lors du renommage de {original_filename}: {e}")
                # Garder l'ancien nom en cas d'erreur
                new_filename = original_filename
        else:
            # Le fichier n'existe pas ou déjà renommé
            if not os.path.exists(old_path):
                print(f"⚠️  Fichier non trouvé: {original_filename}")
            new_filename = original_filename
        
        # Mettre à jour le chemin dans l'item
        item['new_filename'] = new_filename
        item['new_image_path'] = f"/assets/garage/color/{Path(new_filename).stem}.webp"
    
    return gear_items, rename_mapping

def generate_updated_database(gear_items):
    """Génère la base de données mise à jour avec les nouveaux chemins"""
    
    # Trier par catégorie
    categories = {}
    for item in gear_items:
        cat = item['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    
    # Générer le contenu TypeScript
    content = f'''// lib/gear/knolling-database.ts
// Base de données "Physical Twin" pour Yeti - MISE À JOUR AUTOMATIQUE
// Conforme au Protocole GLM 4.7 : Dimensions métriques réelles & Assets locaux
// Généré le {__import__('time').strftime('%Y-%m-%d %H:%M:%S')}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface KnollingGearItem {{
  id: string;
  name: string;
  brand: string;
  weight: number; // en grammes
  category: string;
  realSize: number; // Dimension la plus longue en MÈTRES (pour l'échelle 1:1 Three.js)
  owned: boolean;
  essential: boolean;
  price: number; // en Euros
  image: string; // Chemin local vers l'asset généré
  dimensions?: {{
    height: number; // cm
    width: number; // cm
    depth: number; // cm
  }};
  volume?: number; // litres
}}

// ============================================================================
// CATÉGORIES
// ============================================================================

export const GEAR_CATEGORIES = [
  {{ id: "shelter", name: "Abri", emoji: "⛺" }},
  {{ id: "sleep", name: "Couchage", emoji: "🛏️" }},
  {{ id: "pack", name: "Portage", emoji: "🎒" }},
  {{ id: "clothing", name: "Vêtements", emoji: "🧥" }},
  {{ id: "footwear", name: "Chaussures", emoji: "👟" }},
  {{ id: "cooking", name: "Cuisine", emoji: "🍳" }},
  {{ id: "water", name: "Eau", emoji: "💧" }},
  {{ id: "navigation", name: "Navigation", emoji: "🧭" }},
  {{ id: "safety", name: "Sécurité", emoji: "⚕️" }},
  {{ id: "electronics", name: "Électronique", emoji: "🔋" }},
  {{ id: "hygiene", name: "Hygiène", emoji: "🧴" }},
  {{ id: "misc", name: "Divers", emoji: "📦" }},
] as const;

// ============================================================================
// BASE DE DONNÉES - JUMEAUX NUMÉRIQUES (Physically Accurate)
// Note: realSize est en MÈTRES. 1.0 = 1 mètre. 0.05 = 5 cm.
// ============================================================================

export const KNOLLING_GEAR_DATABASE: KnollingGearItem[] = [
'''
    
    # Ajouter les items par catégorie
    for category_name, items in categories.items():
        content += f"\n  // =========== {category_name.upper()} ===========\n"
        for item in items:
            content += f'''  {{
    id: "{item['id']}",
    name: "{item['name']}",
    brand: "{item['brand']}",
    weight: {item['weight']},
    category: "{item['category']}",
    realSize: {item['realSize']:.2f}, // {item['dimensions']['height']}cm
    owned: {str(item['owned']).lower()},
    essential: {str(item['essential']).lower()},
    price: {item['price']},
    image: "{item['new_image_path']}",
  }},\n'''
    
    content += '''];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getGearByCategory = (category: string): KnollingGearItem[] => {
  return KNOLLING_GEAR_DATABASE.filter((item) => item.category === category);
};

export const getOwnedGear = (): KnollingGearItem[] => {
  return KNOLLING_GEAR_DATABASE.filter((item) => item.owned);
};

export const getWishlistGear = (): KnollingGearItem[] => {
  return KNOLLING_GEAR_DATABASE.filter((item) => !item.owned);
};

export const getEssentialGear = (): KnollingGearItem[] => {
  return KNOLLING_GEAR_DATABASE.filter((item) => item.essential && item.owned);
};

export const getTotalWeight = (items: KnollingGearItem[]): number => {
  return items.reduce((sum, item) => sum + item.weight, 0);
};

export const getTotalPrice = (items: KnollingGearItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
};

export const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    return `${{(grams / 1000).toFixed(2)}}kg`;
  }
  return `${{grams}}g`;
};
'''
    
    return content

def main():
    parser = argparse.ArgumentParser(description='Renommage des Images d\'Équipement')
    parser.add_argument('--raw-gear', type=str, default="raw_gear",
                       help='Répertoire contenant les images brutes')
    parser.add_argument('--specs-json', type=str, default="lib/gear-specs.json",
                       help='Fichier JSON de spécifications')
    parser.add_argument('--output', type=str, default="lib/gear/knolling-database.ts",
                       help='Fichier de base de données à mettre à jour')
    parser.add_argument('--dry-run', action='store_true',
                       help='Simuler sans renommer les fichiers')
    
    args = parser.parse_args()
    
    print("🔄 PHASE 4 - Renommage des Images d'Équipement")
    print("=" * 50)
    
    if args.dry_run:
        print("🔍 MODE SIMULATION - Aucun fichier ne sera renommé")
    
    # Renommer les images
    gear_items, rename_mapping = rename_images_in_raw_gear(
        args.raw_gear, 
        args.specs_json
    )
    
    if not gear_items:
        print("❌ Aucun item trouvé dans les spécifications")
        return
    
    print(f"✅ {len(gear_items)} items traités")
    
    # Sauvegarder les spécifications mises à jour
    updated_specs_path = args.specs_json.replace('.json', '_updated.json')
    print(f"💾 Sauvegarde des spécifications mises à jour dans {updated_specs_path}...")
    with open(updated_specs_path, 'w', encoding='utf-8') as f:
        json.dump(gear_items, f, indent=2, ensure_ascii=False)
    
    # Générer la base de données mise à jour
    print(f"🔧 Génération de la base de données mise à jour...")
    ts_content = generate_updated_database(gear_items)
    
    # Sauvegarder le fichier TypeScript
    print(f"💾 Sauvegarde TypeScript dans {args.output}...")
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    # Afficher un résumé
    print("\n📊 RÉSUMÉ DES OPÉRATIONS :")
    print("-" * 50)
    
    if rename_mapping:
        print(f"📝 {len(rename_mapping)} fichiers renommés:")
        for old, new in list(rename_mapping.items())[:10]:  # Afficher les 10 premiers
            print(f"   {old} -> {new}")
        if len(rename_mapping) > 10:
            print(f"   ... et {len(rename_mapping) - 10} autres")
    else:
        print("📝 Aucun fichier renommé")
    
    categories = {}
    for item in gear_items:
        cat = item['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    
    print(f"\n📦 Répartition par catégorie:")
    for category, items in categories.items():
        print(f"   {category.upper()}: {len(items)} items")
    
    print(f"\n✨ Terminé ! {len(gear_items)} items mis à jour")
    print(f"📄 Base de données mise à jour: {args.output}")
    print(f"📄 Spécifications détaillées: {updated_specs_path}")

if __name__ == "__main__":
    main()