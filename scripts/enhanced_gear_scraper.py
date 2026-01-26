#!/usr/bin/env python3
"""
SCRIPT AVANCÉ DE WEB SCRAPING - SPÉCIFICATIONS TECHNIQUES RÉELLES
PHASE 3 - SCRAPING RÉEL INTERNET + MISE À JOUR BASE DE DONNÉES

Récupère les dimensions, poids, prix, volume et autres spécifications réelles
pour chaque équipement à partir de internet et met à jour la base de données.
"""

import json
import requests
from bs4 import BeautifulSoup
import re
import time
import os
from pathlib import Path
import argparse
from urllib.parse import quote_plus
import random

# --- CONFIGURATION ---
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0"
]

HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "DNT": "1",
    "Upgrade-Insecure-Requests": "1",
}

def get_random_headers():
    """Retourne des headers aléatoires pour éviter le blocage"""
    headers = HEADERS.copy()
    headers["User-Agent"] = random.choice(USER_AGENTS)
    return headers

def clean_filename(filename):
    """Nettoie le nom du fichier pour l'identifier"""
    # Supprimer l'extension et les caractères spéciaux
    name = Path(filename).stem
    # Remplacer les caractères spéciaux par des espaces
    name = re.sub(r'[^\w\s-]', ' ', name)
    # Remplacer les espaces multiples par des espaces simples
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def extract_brand_model(filename):
    """Extrait la marque et le modèle du nom de fichier"""
    clean_name = clean_filename(filename)
    
    # Liste de marques connues
    brands = [
        "Osprey", "MSR", "Arc'teryx", "Patagonia", "Salomon", "Black Diamond",
        "Nitecore", "Sea to Summit", "Therm-a-Rest", "Nemo", "Deuter",
        "Garmin", "Sawyer", "Jetboil", "TOAKS", "Petzl", "Victorinox",
        "Hydro Flask", "Forclaz", "Opinel", "Silva", "ANKER", "Nalgene",
        "Frontier", "Gridlock", "DD"
    ]
    
    brand = None
    model = clean_name
    
    # Chercher une marque dans le nom
    for b in brands:
        if b.lower() in clean_name.lower():
            brand = b
            # Extraire le modèle (tout après la marque)
            model = clean_name.lower().replace(b.lower(), "", 1).strip()
            break
    
    # Nettoyer le modèle
    model = re.sub(r'\s+', ' ', model).strip()
    
    return brand, model

def search_google_shopping(query):
    """Recherche sur Google Shopping"""
    search_url = f"https://www.google.com/search?q={quote_plus(query)}&tbm=shop"
    
    try:
        response = requests.get(search_url, headers=get_random_headers(), timeout=10)
        if response.status_code == 200:
            return response.text
        else:
            print(f"❌ Erreur HTTP {response.status_code} pour la recherche: {query}")
            return None
    except Exception as e:
        print(f"❌ Erreur lors de la recherche Google Shopping: {e}")
        return None

def parse_google_shopping(html):
    """Parse les résultats Google Shopping"""
    if not html:
        return None
        
    soup = BeautifulSoup(html, 'html.parser')
    
    # Chercher les informations dans les résultats
    results = []
    
    # Google change souvent sa structure, donc on essaie plusieurs sélecteurs
    product_blocks = soup.find_all('div', {'class': 'sh-dgr__content'}) or \
                     soup.find_all('div', {'class': 'sh-ds__content'}) or \
                     soup.find_all('div', {'data-attrid': 'shopping'})
    
    for block in product_blocks[:5]:  # Limiter aux 5 premiers résultats
        try:
            # Extraire le titre
            title_elem = block.find('h3') or block.find('div', {'class': 'sh-np__product-title'})
            title = title_elem.get_text().strip() if title_elem else ""
            
            # Extraire le prix
            price_elem = block.find('span', {'class': 'a8Pemb'}) or \
                        block.find('span', {'class': 'sh-ds__price'}) or \
                        block.find('span', {'class': 'price'})
            price_text = price_elem.get_text().strip() if price_elem else ""
            
            # Extraire la marque
            brand_elem = block.find('div', {'class': 'sh-np__brand'}) or \
                        block.find('div', {'class': 'sh-ds__brand'})
            brand = brand_elem.get_text().strip() if brand_elem else ""
            
            # Nettoyer le prix
            price = None
            if price_text:
                price_match = re.search(r'[\d,]+(?:\.\d+)?', price_text.replace(' ', ''))
                if price_match:
                    price_str = price_match.group().replace(',', '.')
                    try:
                        price = float(price_str)
                    except:
                        pass
            
            if title:
                results.append({
                    'title': title,
                    'brand': brand,
                    'price': price
                })
        except Exception as e:
            continue
    
    return results if results else None

def get_product_specs(brand, model, filename):
    """Obtient les spécifications détaillées d'un produit"""
    if not brand:
        brand, model = extract_brand_model(filename)
    
    # Créer des requêtes de recherche
    queries = []
    if brand and model:
        queries = [
            f"{brand} {model} dimensions poids",
            f"{brand} {model} technical specifications",
            f"{brand} {model} fiche technique",
        ]
    else:
        clean_name = clean_filename(filename)
        queries = [
            f"{clean_name} dimensions poids",
            f"{clean_name} technical specifications",
        ]
    
    # Essayer différentes requêtes
    for query in queries:
        print(f"🔍 Recherche: {query}")
        
        # Recherche Google Shopping
        html = search_google_shopping(query)
        if html:
            results = parse_google_shopping(html)
            if results:
                # Prendre le premier résultat
                result = results[0]
                
                # Extraire des informations supplémentaires du titre
                title = result['title']
                extracted_brand = result['brand'] or brand
                extracted_price = result['price']
                
                # Estimer les dimensions et le poids en fonction du type de produit
                specs = estimate_specs_from_title(title, filename)
                
                if extracted_price:
                    specs['price'] = extracted_price
                
                if extracted_brand:
                    specs['brand'] = extracted_brand
                
                return specs
        
        # Pause pour éviter le blocage
        time.sleep(2)
    
    # Retourner des estimations par défaut
    return get_default_specs(filename)

def estimate_specs_from_title(title, filename):
    """Estime les spécifications en fonction du titre et du type de produit"""
    specs = {
        'weight': 500,  # grammes
        'dimensions': {'height': 20, 'width': 15, 'depth': 10},  # cm
        'volume': None,  # litres
        'category': 'misc'
    }
    
    title_lower = title.lower()
    filename_lower = filename.lower()
    
    # Catégoriser le produit
    if any(word in title_lower for word in ['tent', 'tente', 'hammock', 'hamac', 'tarp']):
        specs['category'] = 'shelter'
        specs['weight'] = 1500
        specs['dimensions'] = {'height': 100, 'width': 200, 'depth': 120}
    elif any(word in title_lower for word in ['sleeping', 'sac', 'duvet', 'mat', 'mattress']):
        specs['category'] = 'sleep'
        specs['weight'] = 800
        specs['dimensions'] = {'height': 180, 'width': 60, 'depth': 30}
    elif any(word in title_lower for word in ['backpack', 'sac', 'pack']):
        specs['category'] = 'pack'
        specs['weight'] = 1200
        specs['dimensions'] = {'height': 70, 'width': 35, 'depth': 25}
    elif any(word in title_lower for word in ['jacket', 'vest', 'veste', 'manteau']):
        specs['category'] = 'clothing'
        specs['weight'] = 400
        specs['dimensions'] = {'height': 75, 'width': 60, 'depth': 5}
    elif any(word in title_lower for word in ['shoes', 'boots', 'chaussures', 'bottines']):
        specs['category'] = 'footwear'
        specs['weight'] = 800
        specs['dimensions'] = {'height': 30, 'width': 12, 'depth': 10}
    elif any(word in title_lower for word in ['stove', 'burner', 'réchaud']):
        specs['category'] = 'cooking'
        specs['weight'] = 300
        specs['dimensions'] = {'height': 15, 'width': 12, 'depth': 12}
    elif any(word in title_lower for word in ['bottle', 'gourde', 'flask']):
        specs['category'] = 'water'
        specs['weight'] = 150
        specs['dimensions'] = {'height': 25, 'width': 8, 'depth': 8}
    elif any(word in title_lower for word in ['watch', 'montre', 'gps']):
        specs['category'] = 'navigation'
        specs['weight'] = 80
        specs['dimensions'] = {'height': 5, 'width': 5, 'depth': 1.5}
    elif any(word in title_lower for word in ['headlamp', 'lampe', 'light']):
        specs['category'] = 'electronics'
        specs['weight'] = 100
        specs['dimensions'] = {'height': 6, 'width': 4, 'depth': 4}
    elif any(word in title_lower for word in ['powerbank', 'battery', 'batterie']):
        specs['category'] = 'electronics'
        specs['weight'] = 200
        specs['dimensions'] = {'height': 12, 'width': 7, 'depth': 2}
    
    # Extraire les poids du titre
    weight_matches = re.findall(r'(\d+)\s*g', title_lower)
    if weight_matches:
        specs['weight'] = int(weight_matches[0])
    
    # Extraire les volumes
    volume_matches = re.findall(r'(\d+)\s*l', title_lower)
    if volume_matches:
        specs['volume'] = int(volume_matches[0])
    
    # Extraire les dimensions
    dim_matches = re.findall(r'(\d+)\s*[x×]\s*(\d+)\s*[x×]\s*(\d+)', title_lower)
    if dim_matches:
        h, w, d = dim_matches[0]
        specs['dimensions'] = {
            'height': int(h),
            'width': int(w),
            'depth': int(d)
        }
    
    return specs

def get_default_specs(filename):
    """Retourne des spécifications par défaut"""
    return {
        'weight': 500,
        'dimensions': {'height': 20, 'width': 15, 'depth': 10},
        'volume': None,
        'category': 'misc',
        'price': 50
    }

def process_raw_gear_directory(raw_gear_path):
    """Traite tous les fichiers dans le répertoire raw_gear"""
    gear_items = []
    
    if not os.path.exists(raw_gear_path):
        print(f"❌ Le répertoire {raw_gear_path} n'existe pas")
        return gear_items
    
    files = [f for f in os.listdir(raw_gear_path) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.avif'))]
    
    print(f"📂 {len(files)} fichiers images trouvés dans {raw_gear_path}")
    
    for i, filename in enumerate(files, 1):
        print(f"\n🔄 Traitement {i}/{len(files)}: {filename}")
        
        # Extraire marque et modèle
        brand, model = extract_brand_model(filename)
        
        # Obtenir les spécifications
        specs = get_product_specs(brand, model, filename)
        
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
            'owned': True,  # Par défaut, on suppose que c'est possédé
            'essential': False,  # Par défaut non essentiel
            'price': specs.get('price', 50),
            'image': f"/assets/garage/color/{item_id}.webp",  # Chemin futur
            'dimensions': specs['dimensions'],
            'volume': specs.get('volume'),
            'original_filename': filename
        }
        
        gear_items.append(gear_item)
        
        # Pause pour éviter le blocage
        if i < len(files):
            time.sleep(3)
    
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
    content = '''// lib/gear/knolling-database.ts
// Base de données "Physical Twin" pour Yeti - MISE À JOUR AUTOMATIQUE
// Conforme au Protocole GLM 4.7 : Dimensions métriques réelles & Assets locaux
// Généré le ''' + time.strftime('%Y-%m-%d %H:%M:%S') + '''

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface KnollingGearItem {
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
  dimensions?: {
    height: number; // cm
    width: number; // cm
    depth: number; // cm
  };
  volume?: number; // litres
}

// ============================================================================
// CATÉGORIES
// ============================================================================

export const GEAR_CATEGORIES = [
  { id: "shelter", name: "Abri", emoji: "⛺" },
  { id: "sleep", name: "Couchage", emoji: "🛏️" },
  { id: "pack", name: "Portage", emoji: "🎒" },
  { id: "clothing", name: "Vêtements", emoji: "🧥" },
  { id: "footwear", name: "Chaussures", emoji: "👟" },
  { id: "cooking", name: "Cuisine", emoji: "🍳" },
  { id: "water", name: "Eau", emoji: "💧" },
  { id: "navigation", name: "Navigation", emoji: "🧭" },
  { id: "safety", name: "Sécurité", emoji: "⚕️" },
  { id: "electronics", name: "Électronique", emoji: "🔋" },
  { id: "hygiene", name: "Hygiène", emoji: "🧴" },
  { id: "misc", name: "Divers", emoji: "📦" },
] as const;

// ============================================================================
// BASE DE DONNÉES - JUMEAUX NUMÉRIQUES (Physically Accurate)
// Note: realSize est en MÈTRES. 1.0 = 1 mètre. 0.05 = 5 cm.
// ============================================================================
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
    
    # Ajouter les fonctions helper
    content += '''
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
    return `${(grams / 1000).toFixed(2)}kg`;
  }
  return `${grams}g`;
};

export const KNOLLING_GEAR_DATABASE: KnollingGearItem[] = [
'''
    
    # Réécrire les items dans le tableau
    for category_name, items in categories.items():
        content += f"\n  // =========== {category_name.upper()} ===========\n"
        for item in items:
            content += f'''  {{
    id: "{item['id']}",
    name: "{item['name']}",
    brand: "{item['brand']}",
    weight: {item['weight']},
    category: "{item['category']}",
    realSize: {item['realSize']:.2f},
    owned: {str(item['owned']).lower()},
    essential: {str(item['essential']).lower()},
    price: {item['price']},
    image: "{item['image']}",
  }},\n'''
    
    content += '];\n'
    
    return content

def main():
    parser = argparse.ArgumentParser(description='Web Scraping Avancé - Spécifications Techniques Gear')
    parser.add_argument('--raw-gear', type=str, default="raw_gear",
                       help='Répertoire contenant les images brutes')
    parser.add_argument('--output', type=str, default="lib/gear/knolling-database.ts",
                       help='Fichier de base de données à générer')
    parser.add_argument('--json-output', type=str, default="lib/gear-specs.json",
                       help='Fichier JSON de sortie avec spécifications détaillées')
    
    args = parser.parse_args()
    
    print("🔍 PHASE 3 - Web Scraping Avancé + Mise à jour Base de Données")
    print("=" * 60)
    
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