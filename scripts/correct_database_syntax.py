#!/usr/bin/env python3
"""
SCRIPT DE CORRECTION DE LA BASE DE DONNÉES
PHASE 5 - CORRECTION SYNTAXE + CATÉGORIES CORRECTES

Corrige les erreurs de syntaxe dans la base de données TypeScript
et rétablit les catégories correctes pour chaque équipement.
"""

import json
import re
import time
import os
from pathlib import Path
import argparse

def load_gear_specs(specs_path):
    """Charge les spécifications d'équipement"""
    with open(specs_path, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_correct_category(filename, brand, name):
    """Détermine la catégorie correcte pour un équipement"""
    filename_lower = filename.lower()
    name_lower = name.lower()
    
    # Tente de déterminer la catégorie en fonction du nom et du type
    if any(word in filename_lower for word in ['tent', 'hubba', 'tente']):
        return 'shelter'
    elif any(word in filename_lower for word in ['sleeping', 'spark', 'sac', 'almohada', 'aeros', 'ether']):
        return 'sleep'
    elif any(word in filename_lower for word in ['backpack', 'exos', 'sac', 'daypack']):
        return 'pack'
    elif any(word in filename_lower for word in ['jacket', 'vest', 'retro', 'gloves', 'veste']):
        return 'clothing'
    elif any(word in filename_lower for word in ['boots', 'salomon', 'chaussures']):
        return 'footwear'
    elif any(word in filename_lower for word in ['stove', 'jetboil', 'minimo', 'réchaud', 'cartouche', 'repas', 'cutlery']):
        return 'cooking'
    elif any(word in filename_lower for word in ['bottle', 'gourde', 'nalgene', 'hydro', 'flask', 'filter', 'purifier']):
        return 'water'
    elif any(word in filename_lower for word in ['watch', 'garmin', 'fenix', 'boussole', 'carte']):
        return 'navigation'
    elif any(word in filename_lower for word in ['knife', 'couteau', 'opinel', 'gridlock', 'mousqueton', 'cord', 'rope']):
        return 'safety'
    elif any(word in filename_lower for word in ['headlamp', 'lampe', 'nitecore', 'powerbank', 'panneau', 'solaire']):
        return 'electronics'
    else:
        return 'misc'

def get_correct_specs(filename, brand, name):
    """Retourne les spécifications correctes pour un équipement"""
    category = get_correct_category(filename, brand, name)
    
    # Spécifications par défaut
    specs = {
        'weight': 500,
        'dimensions': {'height': 20, 'width': 15, 'depth': 10},
        'volume': None,
        'category': category,
        'price': 50
    }
    
    filename_lower = filename.lower()
    name_lower = name.lower()
    
    # Ajuster selon la catégorie
    if category == 'shelter':
        specs.update({
            'weight': 1500,
            'dimensions': {'height': 100, 'width': 200, 'depth': 120},
            'price': 450
        })
    elif category == 'sleep':
        if any(word in filename_lower for word in ['sleeping', 'spark']):
            specs.update({
                'weight': 800,
                'dimensions': {'height': 180, 'width': 60, 'depth': 30},
                'price': 300
            })
        elif any(word in filename_lower for word in ['ether', 'mat']):
            specs.update({
                'weight': 600,
                'dimensions': {'height': 180, 'width': 50, 'depth': 8},
                'price': 250
            })
        elif any(word in filename_lower for word in ['almohada', 'aeros', 'pillow']):
            specs.update({
                'weight': 80,
                'dimensions': {'height': 10, 'width': 30, 'depth': 20},
                'price': 50
            })
    elif category == 'pack':
        if any(word in filename_lower for word in ['backpack', 'exos']):
            specs.update({
                'weight': 1200,
                'dimensions': {'height': 70, 'width': 35, 'depth': 25},
                'price': 200
            })
        elif any(word in filename_lower for word in ['daypack']):
            specs.update({
                'weight': 400,
                'dimensions': {'height': 45, 'width': 30, 'depth': 20},
                'price': 80
            })
    elif category == 'clothing':
        if any(word in filename_lower for word in ['jacket', 'vest']):
            specs.update({
                'weight': 400,
                'dimensions': {'height': 75, 'width': 60, 'depth': 5},
                'price': 400
            })
        elif any(word in filename_lower for word in ['gloves']):
            specs.update({
                'weight': 100,
                'dimensions': {'height': 25, 'width': 15, 'depth': 5},
                'price': 60
            })
    elif category == 'footwear':
        specs.update({
            'weight': 800,
            'dimensions': {'height': 30, 'width': 12, 'depth': 10},
            'price': 150
        })
    elif category == 'cooking':
        if any(word in filename_lower for word in ['stove', 'jetboil']):
            specs.update({
                'weight': 400,
                'dimensions': {'height': 15, 'width': 12, 'depth': 12},
                'price': 140
            })
        elif any(word in filename_lower for word in ['cartouche', 'canister']):
            specs.update({
                'weight': 230,
                'dimensions': {'height': 11, 'width': 8, 'depth': 8},
                'price': 8
            })
        elif any(word in filename_lower for word in ['repas', 'meal']):
            specs.update({
                'weight': 120,
                'dimensions': {'height': 15, 'width': 12, 'depth': 5},
                'price': 6
            })
        elif any(word in filename_lower for word in ['cutlery', 'fork']):
            specs.update({
                'weight': 15,
                'dimensions': {'height': 18, 'width': 3, 'depth': 2},
                'price': 12
            })
    elif category == 'water':
        if any(word in filename_lower for word in ['bottle', 'gourde', 'nalgene']):
            specs.update({
                'weight': 180,
                'dimensions': {'height': 25, 'width': 8, 'depth': 8},
                'price': 12
            })
            # Extraire le volume
            vol_match = re.search(r'(\d+)\s*(?:ml|l|liter)', filename_lower)
            if vol_match:
                volume = int(vol_match.group(1))
                if volume < 100:  # Probablement en litres
                    volume *= 1000
                specs['volume'] = volume
        elif any(word in filename_lower for word in ['filter', 'purifier']):
            specs.update({
                'weight': 90,
                'dimensions': {'height': 15, 'width': 5, 'depth': 5},
                'price': 35
            })
    elif category == 'navigation':
        if any(word in filename_lower for word in ['watch', 'garmin']):
            specs.update({
                'weight': 85,
                'dimensions': {'height': 5, 'width': 5, 'depth': 1.5},
                'price': 850
            })
        elif any(word in filename_lower for word in ['boussole']):
            specs.update({
                'weight': 60,
                'dimensions': {'height': 3, 'width': 8, 'depth': 8},
                'price': 40
            })
        elif any(word in filename_lower for word in ['carte']):
            specs.update({
                'weight': 30,
                'dimensions': {'height': 22, 'width': 14, 'depth': 0.1},
                'price': 9
            })
    elif category == 'safety':
        if any(word in filename_lower for word in ['knife', 'couteau']):
            specs.update({
                'weight': 90,
                'dimensions': {'height': 9, 'width': 2, 'depth': 1.5},
                'price': 35
            })
        elif any(word in filename_lower for word in ['mousqueton']):
            specs.update({
                'weight': 60,
                'dimensions': {'height': 10, 'width': 6, 'depth': 1.5},
                'price': 12
            })
        elif any(word in filename_lower for word in ['cord', 'rope']):
            specs.update({
                'weight': 40,
                'dimensions': {'height': 1, 'width': 1, 'depth': 100},
                'price': 1
            })
    elif category == 'electronics':
        if any(word in filename_lower for word in ['headlamp', 'lampe']):
            specs.update({
                'weight': 90,
                'dimensions': {'height': 6, 'width': 4, 'depth': 4},
                'price': 90
            })
        elif any(word in filename_lower for word in ['powerbank', 'battery']):
            specs.update({
                'weight': 180,
                'dimensions': {'height': 12, 'width': 7, 'depth': 2},
                'price': 30
            })
            # Extraire la capacité
            cap_match = re.search(r'(\d+)\s*mah', filename_lower)
            if cap_match:
                capacity = int(cap_match.group(1))
                specs['weight'] = 100 + capacity // 1000
        elif any(word in filename_lower for word in ['panneau', 'solaire']):
            specs.update({
                'weight': 300,
                'dimensions': {'height': 25, 'width': 15, 'depth': 1},
                'price': 60
            })
    elif category == 'misc':
        if any(word in filename_lower for word in ['trekking', 'poles', 'bâtons']):
            specs.update({
                'weight': 300,
                'dimensions': {'height': 40, 'width': 3, 'depth': 3},
                'price': 170
            })
        elif any(word in filename_lower for word in ['sunglasses']):
            specs.update({
                'weight': 25,
                'dimensions': {'height': 5, 'width': 14, 'depth': 4},
                'price': 80
            })
    
    # Extraire les poids spécifiques mentionnés dans le nom
    weight_matches = re.findall(r'(\d+)\s*g', filename_lower)
    if weight_matches:
        specs['weight'] = int(weight_matches[0])
    
    # Extraire les prix spécifiques si mentionnés
    price_matches = re.findall(r'(\d+)\s*€?', filename_lower)
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

def generate_corrected_typescript(gear_items):
    """Génère la base de données TypeScript corrigée"""
    
    # Trier par catégorie
    categories = {}
    for item in gear_items:
        cat = item['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    
    # Générer le contenu TypeScript avec syntaxe correcte
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
    
    # Corriger les doubles accolades
    content = content.replace('{{{', '{{').replace('}}}', '}}')
    
    return content

def main():
    parser = argparse.ArgumentParser(description='Correction de la Base de Données')
    parser.add_argument('--specs-json', type=str, default="lib/gear-specs_updated.json",
                       help='Fichier JSON de spécifications à corriger')
    parser.add_argument('--output', type=str, default="lib/gear/knolling-database.ts",
                       help='Fichier de base de données à générer')
    
    args = parser.parse_args()
    
    print("🔧 PHASE 5 - Correction de la Base de Données")
    print("=" * 50)
    
    # Charger les spécifications
    gear_items = load_gear_specs(args.specs_json)
    
    if not gear_items:
        print("❌ Aucun item trouvé dans les spécifications")
        return
    
    print(f"📂 Correction de {len(gear_items)} items...")
    
    # Corriger les spécifications
    corrected_items = []
    for item in gear_items:
        original_filename = item['original_filename']
        brand = item['brand']
        name = item['name']
        
        # Obtenir les spécifications correctes
        specs = get_correct_specs(original_filename, brand, name)
        
        # Mettre à jour l'item
        item.update(specs)
        item['realSize'] = item['dimensions']['height'] / 100  # Convertir en mètres
        
        corrected_items.append(item)
    
    # Générer la base de données TypeScript corrigée
    print(f"🔧 Génération de la base de données TypeScript corrigée...")
    ts_content = generate_corrected_typescript(corrected_items)
    
    # Sauvegarder le fichier TypeScript
    print(f"💾 Sauvegarde TypeScript dans {args.output}...")
    with open(args.output, 'w', encoding='utf-8') as f:
        f.write(ts_content)
    
    # Sauvegarder les spécifications corrigées
    corrected_specs_path = args.specs_json.replace('_updated.json', '_corrected.json')
    print(f"💾 Sauvegarde des spécifications corrigées dans {corrected_specs_path}...")
    with open(corrected_specs_path, 'w', encoding='utf-8') as f:
        json.dump(corrected_items, f, indent=2, ensure_ascii=False)
    
    # Afficher un résumé
    print("\n📊 RÉSUMÉ DES OPÉRATIONS :")
    print("-" * 50)
    
    categories = {}
    for item in corrected_items:
        cat = item['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
    
    print(f"📦 Répartition par catégorie:")
    for category, items in categories.items():
        total_weight = sum(item['weight'] for item in items)
        total_price = sum(item['price'] for item in items)
        print(f"   {category.upper()}: {len(items)} items (Poids: {total_weight}g, Prix: {total_price}€)")
    
    print(f"\n✨ Terminé ! {len(corrected_items)} items corrigés")
    print(f"📄 Base de données corrigée: {args.output}")
    print(f"📄 Spécifications détaillées: {corrected_specs_path}")

if __name__ == "__main__":
    main()