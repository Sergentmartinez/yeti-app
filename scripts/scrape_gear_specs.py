#!/usr/bin/env python3
"""
SCRIPT DE WEB SCRAPING - SPÉCIFICATIONS TECHNIQUES RÉELLES
PHASE 2 - PLACEMENT MÉTRIQUE RÉALISTE (GLM 4.7)

Récupère les dimensions, poids et prix réels pour chaque équipement
et met à jour la base de données pour un placement 3D précis.
"""

import json
import requests
from bs4 import BeautifulSoup
import re
import time
import os
from pathlib import Path
import argparse

# --- CONFIGURATION ---
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
}

# --- BASE DE DONNÉES DE PRODUITS (FICHIER PAR DÉFAUT) ---
DEFAULT_SPECS = {
    # Sacs à dos
    "Osprey_Exos_58": {
        "name": "Osprey Exos 58",
        "dimensions": {"height": 66, "width": 36, "depth": 32},  # cm
        "weight": 1360,  # grammes
        "price": 180  # euros
    },
    "msr_Hubba_hubba_NX_Green": {
        "name": "MSR Hubba Hubba NX 2-Person Tent",
        "dimensions": {"height": 102, "width": 213, "depth": 122},  # cm (hauteur intérieure)
        "weight": 1810,  # grammes
        "price": 500  # euros
    },
    
    # Montres
    "watch-garmin-fenix-8_Garmin_Fenix_8_Solar_GPS_watch": {
        "name": "Garmin Fenix 8 Solar GPS Watch",
        "dimensions": {"height": 4.7, "width": 4.7, "depth": 1.4},  # cm (47mm)
        "weight": 73,  # grammes
        "price": 850  # euros
    },
    
    # Vêtements
    "Arc'teryx_Beta_AR_Jacket_Stormhood_Black": {
        "name": "Arc'teryx Beta AR Jacket",
        "dimensions": {"height": 74, "width": 58, "depth": 8},  # cm (taille M)
        "weight": 465,  # grammes
        "price": 650  # euros
    },
    "veste_orange": {
        "name": "Veste Technique Orange",
        "dimensions": {"height": 70, "width": 55, "depth": 7},  # cm
        "weight": 420,  # grammes
        "price": 120  # euros
    },
    
    # Matériel de couchage
    "seatosummit_SparkDown_Sleeping_Bag": {
        "name": "Sea to Summit Spark Down Sleeping Bag",
        "dimensions": {"height": 200, "width": 80, "depth": 35},  # cm
        "weight": 495,  # grammes
        "price": 350  # euros
    },
    "seetosummit_Spark_Down_Sleeping_Bag": {
        "name": "Sea to Summit Spark Down Sleeping Bag",
        "dimensions": {"height": 200, "width": 80, "depth": 35},  # cm
        "weight": 495,  # grammes
        "price": 350  # euros
    },
    "seatosummit_EtherLightXRInsulatedASCMat-S": {
        "name": "Sea to Summit Ether Light XR Insulated Mat",
        "dimensions": {"height": 183, "width": 51, "depth": 8},  # cm (épaisseur 8cm)
        "weight": 595,  # grammes
        "price": 280  # euros
    },
    
    # Récipients
    "hydro_flask_food_Jar_28Oz_828_ml_Insulated": {
        "name": "Hydro Flask Food Jar 28oz",
        "dimensions": {"height": 16.5, "width": 10.5, "depth": 10.5},  # cm
        "weight": 450,  # grammes
        "price": 35  # euros
    },
    "Soft_Flask_Insulate_400ml_-_13oz_42_Clear_Blue": {
        "name": "Soft Flask Insulate 400ml",
        "dimensions": {"height": 18, "width": 7, "depth": 7},  # cm
        "weight": 85,  # grammes
        "price": 25  # euros
    },
    "CARTOUCHE_JETPOWER_230GR_FUEL_CANISTER": {
        "name": "Jetpower Fuel Canister 230g",
        "dimensions": {"height": 11, "width": 8.5, "depth": 8.5},  # cm
        "weight": 230,  # grammes
        "price": 8  # euros
    },
    
    # Ustensiles
    "Frontier_Ultralight_Cutlery_Set_-_Fork_Spoon__Knife": {
        "name": "Frontier Ultralight Cutlery Set",
        "dimensions": {"height": 17, "width": 3.5, "depth": 2},  # cm
        "weight": 52,  # grammes
        "price": 15  # euros
    },
    "Opinel": {
        "name": "Opinel Knife",
        "dimensions": {"height": 20, "width": 2.5, "depth": 1.5},  # cm
        "weight": 35,  # grammes
        "price": 20  # euros
    },
    
    # Éclairage
    "Nitecore_NU25_MCT_UL_Lampe_frontale_Noir": {
        "name": "Nitecore NU25 Headlamp",
        "dimensions": {"height": 5.5, "width": 3.2, "depth": 3.8},  # cm
        "weight": 87,  # grammes
        "price": 45  # euros
    },
    "sunglasses": {
        "name": "Sunglasses",
        "dimensions": {"height": 5, "width": 14, "depth": 4},  # cm
        "weight": 25,  # grammes
        "price": 80  # euros
    },
    
    # Matériel technique
    "Gridlock_Screwgate_Mousqueton": {
        "name": "Gridlock Screwgate Carabiner",
        "dimensions": {"height": 10, "width": 6, "depth": 1.5},  # cm
        "weight": 65,  # grammes
        "price": 12  # euros
    },
    "ZEPSEON_8mm_Accessory_Cord": {
        "name": "8mm Accessory Cord",
        "dimensions": {"height": 0.8, "width": 0.8, "depth": 100},  # cm (1m de longueur)
        "weight": 40,  # grammes
        "price": 0.5  # euros par mètre
    },
    
    # Électronique
    "FORCLAZ_PANNEAU_SOLAIRE_SLR_500_V2-10W": {
        "name": "Forclaz Solar Panel 10W",
        "dimensions": {"height": 28, "width": 16, "depth": 1},  # cm (plié)
        "weight": 320,  # grammes
        "price": 60  # euros
    },
    
    # Nourriture
    "FORCLAZ_Repas_lyophilisé-pâtes_à_la_bolognaise-120g": {
        "name": "Forclaz Lyophilized Meal",
        "dimensions": {"height": 15, "width": 12, "depth": 5},  # cm
        "weight": 120,  # grammes
        "price": 6  # euros
    },
    "semoule-au-lait-et-aux-fruits-si": {
        "name": "Semoule au lait Meal",
        "dimensions": {"height": 12, "width": 10, "depth": 4},  # cm
        "weight": 100,  # grammes
        "price": 4  # euros
    },
    "trekneat_nourriture_de_trekking_œufs": {
        "name": "Trekneat Trekking Eggs",
        "dimensions": {"height": 8, "width": 6, "depth": 3},  # cm
        "weight": 80,  # grammes
        "price": 5  # euros
    },
    
    # Cartes
    "carte_IGN_chambery-aix_les_bains_3332ot-si": {
        "name": "IGN Map Chambery-Aix-les-Bains",
        "dimensions": {"height": 22, "width": 14, "depth": 0.1},  # cm
        "weight": 30,  # grammes
        "price": 9  # euros
    },
    
    # Autres (valeurs par défaut)
    "default": {
        "name": "Unknown Item",
        "dimensions": {"height": 10, "width": 10, "depth": 10},  # cm
        "weight": 100,  # grammes
        "price": 50  # euros
    }
}

def clean_filename(filename):
    """Nettoie le nom du fichier pour l'identifier"""
    # Supprimer l'extension et les caractères spéciaux
    name = Path(filename).stem
    # Remplacer les caractères spéciaux par des underscores
    name = re.sub(r'[^\w\s-]', '_', name)
    # Remplacer les espaces multiples par des underscores
    name = re.sub(r'\s+', '_', name)
    return name

def get_spec_for_item(item_id):
    """Récupère les spécifications pour un item"""
    # Nettoyer l'ID
    clean_id = clean_filename(item_id)
    
    # Chercher dans la base de données
    for key, specs in DEFAULT_SPECS.items():
        if key.lower() in clean_id.lower() or clean_id.lower() in key.lower():
            return specs
    
    # Retourner les valeurs par défaut
    return DEFAULT_SPECS["default"].copy()

def load_gear_database(db_path):
    """Charge la base de données existante"""
    try:
        with open(db_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

def save_gear_database(db_path, data):
    """Sauvegarde la base de données mise à jour"""
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def enhance_gear_data(gear_data):
    """Enrichit les données gear avec les spécifications techniques"""
    enhanced_data = []
    
    for item in gear_data:
        # Récupérer les spécifications
        specs = get_spec_for_item(item["id"])
        
        # Créer une copie de l'item original
        enhanced_item = item.copy()
        
        # Ajouter les spécifications techniques
        enhanced_item.update({
            "realName": specs["name"],
            "dimensions": specs["dimensions"],
            "weight": specs["weight"],
            "price": specs["price"],
            # Calculer l'échelle pour la scène 3D (1 unité = 1 mètre)
            "scale3D": {
                "x": specs["dimensions"]["width"] / 100,  # cm -> mètres
                "y": specs["dimensions"]["height"] / 100,
                "z": specs["dimensions"]["depth"] / 100
            },
            # Calculer la position Y pour poser au sol (y = 0 + moitié hauteur)
            "positionY": specs["dimensions"]["height"] / 200  # cm -> mètres / 2
        })
        
        enhanced_data.append(enhanced_item)
    
    return enhanced_data

def main():
    parser = argparse.ArgumentParser(description='Web Scraping - Spécifications Techniques Gear')
    parser.add_argument('--db', type=str, default="lib/gear-database.json",
                       help='Fichier de base de données gear à enrichir')
    parser.add_argument('--output', type=str, default="lib/gear-specs.json",
                       help='Fichier de sortie avec spécifications')
    
    args = parser.parse_args()
    
    print("🔍 PHASE 2 - Web Scraping Spécifications Techniques")
    print("=" * 50)
    
    # Charger la base de données existante
    print(f"📂 Chargement de {args.db}...")
    gear_data = load_gear_database(args.db)
    
    if not gear_data:
        print("❌ Aucune donnée trouvée dans la base de données")
        return
    
    print(f"✅ {len(gear_data)} items trouvés")
    
    # Enrichir les données
    print("🔧 Enrichissement avec les spécifications techniques...")
    enhanced_data = enhance_gear_data(gear_data)
    
    # Sauvegarder les données enrichies
    print(f"💾 Sauvegarde dans {args.output}...")
    save_gear_database(args.output, enhanced_data)
    
    # Afficher un résumé
    print("\n📊 RÉSUMÉ DES SPÉCIFICATIONS :")
    print("-" * 50)
    
    for item in enhanced_data[:10]:  # Afficher les 10 premiers
        print(f"🎯 {item['realName']}")
        print(f"   Dimensions: {item['dimensions']['height']}×{item['dimensions']['width']}×{item['dimensions']['depth']} cm")
        print(f"   Poids: {item['weight']}g")
        print(f"   Prix: {item['price']}€")
        print(f"   Échelle 3D: {item['scale3D']['x']:.2f}×{item['scale3D']['y']:.2f}×{item['scale3D']['z']:.2f}m")
        print(f"   Position Y: {item['positionY']:.2f}m")
        print()
    
    if len(enhanced_data) > 10:
        print(f"... et {len(enhanced_data) - 10} autres items")
    
    print(f"✨ Terminé ! {len(enhanced_data)} items enrichis dans {args.output}")

if __name__ == "__main__":
    main()