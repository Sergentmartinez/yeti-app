#!/usr/bin/env python3
"""
SCRIPT RAPIDE DE TRAITEMENT D'ÉQUIPEMENT - SANS SCRAPING INTENSIF
PHASE 3.5 - ANALYSE RAPIDE + ESTIMATIONS INTELLIGENTES

Analyse rapidement les fichiers images et génère une base de données
avec des estimations intelligentes basées sur les noms de fichiers.
"""

import json
import re
import time
import os
from pathlib import Path
import argparse

def clean_filename(filename):
    """Nettoie le nom du fichier pour l'identifier"""
    name = Path(filename).stem
    name = re.sub(r'[^\w\s-]', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def extract_brand_model(filename):
    """Extrait la marque et le modèle du nom de fichier"""
    clean_name = clean_filename(filename)
    
    brands = [
        "Osprey", "MSR", "Arc'teryx", "Patagonia", "Salomon", "Black Diamond",
        "Nitecore", "Sea to Summit", "Therm-a-Rest", "Nemo", "Deuter",
        "Garmin", "Sawyer", "Jetboil", "TOAKS", "Petzl", "Victorinox",
        "Hydro Flask", "Forclaz", "Opinel", "Silva", "ANKER", "Nalgene",
        "Frontier", "Gridlock", "DD", "MSR"
    ]
    
    brand = None
    model = clean_name
    
    for b in brands:
        if b.lower() in clean_name.lower():
            brand = b
            model = clean_name.lower().replace(b.lower(), "", 1).strip()
            break
    
    model = re.sub(r'\s+', ' ', model).strip()
    return brand, model

def get_intelligent_specs(filename, brand, model):
    """Obtient des spécifications intelligentes basées sur le nom du fichier"""
    clean_name = clean_filename(filename).lower()
    
    # Spécifications par défaut
    specs = {
        'weight': 500,
        'dimensions': {'height': 20, 'width': 15, 'depth': 10},
        'volume': None,
        'category': 'misc',
        'price': 50
    }
    
    # Détecter le type de produit et ajuster les spécifications
    if any(word in clean_name for word in ['tent', 'tente', 'hubba', 'hubba']):
        specs.update({
            'category': 'shelter',
            'weight': 1500,
            'dimensions': {'height': 100, 'width': 200, 'depth': 120},
            'price': 450
        })
    elif any(word in clean_name for word in ['sleeping', 'sac', 'spark', 'down']):
        specs.update({
            'category': 'sleep',
            'weight': 800,
            'dimensions': {'height': 180, 'width': 60, 'depth': 30},
            'price': 300
        })
    elif any(word in clean_name for word in ['mat', 'ether', 'insulated']):
        specs.update({
            'category': 'sleep',
            'weight': 600,
            'dimensions': {'height': 180, 'width': 50, 'depth': 8},
            'price': 250
        })
    elif any(word in clean_name for word in ['pillow', 'almohada', 'aeros']):
        specs.update({
            'category': 'sleep',
            'weight': 80,
            'dimensions': {'height': 10, 'width': 30, 'depth': 20},
            'price': 50
        })
    elif any(word in clean_name for word in ['backpack', 'exos', 'sac']):
        specs.update({
            'category': 'pack',
            'weight': 1200,
            'dimensions': {'height': 70, 'width': 35, 'depth': 25},
            'price': 200
        })
    elif any(word in clean_name for word in ['daypack', 'speed']):
        specs.update({
            'category': 'pack',
            'weight': 400,
            'dimensions': {'height': 45, 'width': 30, 'depth': 20},
            'price': 80
        })
    elif any(word in clean_name for word in ['jacket', 'beta', 'retro', 'vest']):
        specs.update({
            'category': 'clothing',
            'weight': 400,
            'dimensions': {'height': 75, 'width': 60, 'depth': 5},
            'price': 400
        })
    elif any(word in clean_name for word in ['gloves', 'gants']):
        specs.update({
            'category': 'clothing',
            'weight': 100,
            'dimensions': {'height': 25, 'width': 15, 'depth': 5},
            'price': 60
        })
    elif any(word in clean_name for word in ['boots', 'salomon', 'chaussures']):
        specs.update({
            'category': 'footwear',
            'weight': 800,
            'dimensions': {'height': 30, 'width': 12, 'depth': 10},
            'price': 150
        })
    elif any(word in clean_name for word in ['stove', 'jetboil', 'minimo', 'réchaud']):
        specs.update({
            'category': 'cooking',
            'weight': 400,
            'dimensions': {'height': 15, 'width': 12, 'depth': 12},
            'price': 140
        })
    elif any(word in clean_name for word in ['pot', 'toaks', 'titanium']):
        specs.update({
            'category': 'cooking',
            'weight': 100,
            'dimensions': {'height': 10, 'width': 10, 'depth': 10},
            'price': 40
        })
    elif any(word in clean_name for word in ['spork', 'cutlery', 'fork']):
        specs.update({
            'category': 'cooking',
            'weight': 15,
            'dimensions': {'height': 18, 'width': 3, 'depth': 2},
            'price': 12
        })
    elif any(word in clean_name for word in ['bottle', 'gourde', 'nalgene', 'flask']):
        specs.update({
            'category': 'water',
            'weight': 180,
            'dimensions': {'height': 25, 'width': 8, 'depth': 8},
            'price': 12
        })
        # Extraire le volume
        vol_match = re.search(r'(\d+)\s*(?:ml|l|liter)', clean_name)
        if vol_match:
            volume = int(vol_match.group(1))
            if volume < 100:  # Probablement en litres
                volume *= 1000
            specs['volume'] = volume
            if volume >= 1000:
                specs['weight'] = 180 + (volume - 1000) // 100  # Poids ajusté selon volume
    elif any(word in clean_name for word in ['filter', 'purifier', 'sawyer']):
        specs.update({
            'category': 'water',
            'weight': 90,
            'dimensions': {'height': 15, 'width': 5, 'depth': 5},
            'price': 35
        })
    elif any(word in clean_name for word in ['watch', 'garmin', 'fenix', 'gps']):
        specs.update({
            'category': 'navigation',
            'weight': 85,
            'dimensions': {'height': 5, 'width': 5, 'depth': 1.5},
            'price': 850
        })
    elif any(word in clean_name for word in ['inreach', 'mini']):
        specs.update({
            'category': 'navigation',
            'weight': 100,
            'dimensions': {'height': 10, 'width': 5, 'depth': 3},
            'price': 400
        })
    elif any(word in clean_name for word in ['boussole', 'silva', 'expedition']):
        specs.update({
            'category': 'navigation',
            'weight': 60,
            'dimensions': {'height': 3, 'width': 8, 'depth': 8},
            'price': 40
        })
    elif any(word in clean_name for word in ['headlamp', 'lampe', 'nitecore', 'petzl']):
        specs.update({
            'category': 'electronics',
            'weight': 90,
            'dimensions': {'height': 6, 'width': 4, 'depth': 4},
            'price': 90
        })
    elif any(word in clean_name for word in ['powerbank', 'battery', 'anker']):
        specs.update({
            'category': 'electronics',
            'weight': 180,
            'dimensions': {'height': 12, 'width': 7, 'depth': 2},
            'price': 30
        })
        # Extraire la capacité
        cap_match = re.search(r'(\d+)\s*mah', clean_name)
        if cap_match:
            capacity = int(cap_match.group(1))
            specs['weight'] = 100 + capacity // 1000  # Poids approximatif selon capacité
    elif any(word in clean_name for word in ['panneau', 'solaire', 'solar']):
        specs.update({
            'category': 'electronics',
            'weight': 300,
            'dimensions': {'height': 25, 'width': 15, 'depth': 1},
            'price': 60
        })
    elif any(word in clean_name for word in ['trekking', 'poles', 'bâtons', 'black diamond']):
        specs.update({
            'category': 'misc',
            'weight': 300,
            'dimensions': {'height': 40, 'width': 3, 'depth': 3},
            'price': 170
        })
    elif any(word in clean_name for word in ['knife', 'couteau', 'victorinox', 'opinel']):
        specs.update({
            'category': 'safety',
            'weight': 90,
            'dimensions': {'height': 9, 'width': 2, 'depth': 1.5},
            'price': 35
        })
    elif any(word in clean_name for word in ['mousqueton', 'screwgate', 'gridlock']):
        specs.update({
            'category': 'safety',
            'weight': 60,
            'dimensions': {'height': 10, 'width': 6, 'depth': 1.5},
            'price': 12
        })
    elif any(word in clean_name for word in ['cord', 'rope', 'climbing']):
        specs.update({
            'category': 'safety',
            'weight': 40,
            'dimensions': {'height': 1, 'width': 1, 'depth': 100},
            'price': 1
        })
    elif any(word in clean_name for word in ['cartouche', 'fuel', 'canister']):
        specs.update({
            'category': 'cooking',
            'weight': 230,
            'dimensions': {'height': 11, 'width': 8, 'depth': 8},
            'price': 8
        })
    elif any(word in clean_name for word in ['repas', 'lyophilisé', 'meal']):
        specs.update({
            'category': 'cooking',
            'weight': 120,
            'dimensions': {'height': 15, 'width': 12, 'depth': 5},
            'price': 6
        })
    elif any(word in clean_name for word in ['carte', 'ign', 'map']):
        specs.update({
            'category': 'navigation',
            'weight': 30,
            'dimensions': {'height': 22, 'width': 14, 'depth': 0.1},
            'price': 9
        })
    elif any(word in clean_name for word in ['sunglasses', 'lunettes']):
        specs.update({
            'category': 'misc',
            'weight': 25,
            'dimensions': {'height': 5, 'width': 14, 'depth': 4},
            'price': 80
        })
    
    # Extraire les poids spécifiques mentionnés dans le nom
    weight_matches = re.findall(r'(\d+)\s*g', clean_name)
    if weight_matches:
        specs['weight'] = int(weight_matches[0])
    
    # Extraire les prix spécifiques si mentionnés
    price_matches = re.findall(r'(\d+)\s*€?', clean_name)
    if price_matches:
        price = int(price_matches[0])
        if 10 < price < 2000:  # Prix raisonnable
            specs['price'] = price
    
    # Ajuster les prix selon la marque
    if brand:
        brand_multipliers = {
            'Arc\'teryx': 2.5,
            'Patagonia': 2.0,
            'Garmin': 1.8,
            'MSR': 1.5,
            'Black Diamond': 1.3,
            'Osprey': 1.2,
            'Therm-a-Rest': 1.4,
            'Sea to Summit': 1.3,
            'Nemo': 1.4
        }
        
        if brand in brand_multipliers:
            specs['price'] = int(specs['price'] * brand_multipliers[brand])
    
    return specs

def process_raw_gear_directory(raw_gear_path):
    """Traite tous les fichiers dans le répertoire raw_gear"""
    gear_items = []
    
    if not os.path.exists(raw_gear_path):
        print(f"❌ Le répertoire {raw_gear_path} n'existe pas")
        return gear_items
    
    files = [f for f in os.listdir(raw_gear_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.avif'))]
    
    print(f"📂 {len(files)} fichiers images trouvés dans {raw_gear_path}")
    
    for i, filename in enumerate(files, 1):
        print(f"🔄 Traitement {i}/{len(files)}: {filename}")
        
        # Extraire marque et modèle
        brand, model = extract_brand_model(filename)
        
        # Obtenir les spécifications intelligentes
        specs = get_intelligent_specs(filename, brand, model)
        
        # Créer un ID unique
        clean_name = clean_filename(filename)
        item_id = clean_name.lower().replace(' ', '-').replace('_', '-')
        
        # Créer l'item
        gear_item = {
            'id': item_id,
            'name': model or clean_name,
            'brand': brand or 'Unknown',
            'weight': specs['weight'],
            'category': specs['category'],
            'realSize': specs['dimensions']['height'] / 100,  # Convertir en mètres
            'owned': True,
            'essential': False,
            'price': specs['price'],
            'image': f"/assets/garage/color/{item_id}.webp",
            'dimensions': specs['dimensions'],
            'volume': specs.get('volume'),
            'original_filename': filename
        }
        
        gear_items.append(gear_item)
    
    return gear_items

def generate_knolling_database(gear_items):
    """Génère le fichier knolling-database.ts"""
    
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
// Généré le {time.strftime('%Y-%m-%d %H:%M:%S')}

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
    image: "{item['image']}",
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
    parser = argparse.ArgumentParser(description='Traitement Rapide d\'Équipement')
    parser.add_argument('--raw-gear', type=str, default="raw_gear",
                       help='Répertoire contenant les images brutes')
    parser.add_argument('--output', type=str, default="lib/gear/knolling-database.ts",
                       help='Fichier de base de données à générer')
    parser.add_argument('--json-output', type=str, default="lib/gear-specs.json",
                       help='Fichier JSON de sortie avec spécifications détaillées')
    
    args = parser.parse_args()
    
    print("⚡ PHASE 3.5 - Traitement Rapide d'Équipement")
    print("=" * 50)
    
    # Traiter les fichiers raw_gear
    print(f"📂 Traitement des fichiers dans {args.raw_gear}...")
    gear_items = process_raw_gear_directory(args.raw_gear)
    
    if not gear_items:
        print("❌ Aucun fichier trouvé ou traité")
        return
    
    print(f"✅ {len(gear_items)} items traités")
    
    # Sauvegarder en JSON
    print(f"💾 Sauvegarde JSON dans {args.json_output}...")
    with open(args.json_output, 'w', encoding='utf-8') as f:
        json.dump(gear_items, f, indent=2, ensure_ascii=False)
    
    # Générer la base de données TypeScript
    print(f"🔧 Génération de la base de données TypeScript...")
    ts_content = generate_knolling_database(gear_items)
    
    # Sauvegarder le fichier TypeScript
    print(f"💾 Sauvegarde TypeScript dans {args.output}...")
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    # Afficher un résumé
    print("\n📊 RÉSUMÉ DES OPÉRATIONS :")
    print("-" * 50)
    
    categories = {}
    for item in gear_items:
        cat = item['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    
    for category, items in categories.items():
        print(f"📦 {category.upper()}: {len(items)} items")
        total_weight = sum(item['weight'] for item in items)
        total_price = sum(item['price'] for item in items)
        print(f"   Poids total: {total_weight}g")
        print(f"   Prix total: {total_price}€")
        print()
    
    print(f"✨ Terminé ! {len(gear_items)} items enrichis")
    print(f"📄 Base de données générée: {args.output}")
    print(f"📄 Spécifications détaillées: {args.json_output}")

if __name__ == "__main__":
    main()