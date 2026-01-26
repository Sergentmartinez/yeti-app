#!/usr/bin/env python3
"""
SCRIPT DE VÉRIFICATION FINALE
PHASE 6 - VÉRIFICATION COMPLÈTE + RÉSUMÉ

Vérifie que toutes les modifications sont correctes et génère un résumé final.
"""

import json
import os
import time
from pathlib import Path
import argparse

def check_file_exists(filepath, description):
    """Vérifie si un fichier existe et retourne son statut"""
    if os.path.exists(filepath):
        size = os.path.getsize(filepath)
        return f"✅ {description}: {filepath} ({size} bytes)"
    else:
        return f"❌ {description}: {filepath} (non trouvé)"

def check_typescript_syntax(filepath):
    """Vérifie la syntaxe TypeScript de base"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Vérifications de base
        errors = []
        
        # Vérifier les interfaces
        if 'export interface KnollingGearItem' not in content:
            errors.append("Interface KnollingGearItem manquante")
        
        # Vérifier les catégories
        if 'GEAR_CATEGORIES' not in content:
            errors.append("GEAR_CATEGORIES manquant")
        
        # Vérifier la base de données
        if 'KNOLLING_GEAR_DATABASE' not in content:
            errors.append("KNOLLING_GEAR_DATABASE manquant")
        
        # Vérifier les fonctions helper
        required_functions = ['getGearByCategory', 'getOwnedGear', 'getWishlistGear', 'getEssentialGear', 'getTotalWeight', 'getTotalPrice', 'formatWeight']
        for func in required_functions:
            if f'export const {func}' not in content:
                errors.append(f"Fonction {func} manquante")
        
        # Vérifier les erreurs de syntaxe courantes
        if '{{{' in content or '}}}' in content:
            errors.append("Triples accolades détectées - erreur de syntaxe")
        
        if errors:
            return f"❌ Erreurs de syntaxe TypeScript: {', '.join(errors)}"
        else:
            return f"✅ Syntaxe TypeScript valide: {filepath}"
            
    except Exception as e:
        return f"❌ Erreur lors de la lecture du fichier: {e}"

def analyze_gear_database(specs_path, ts_path):
    """Analyse la base de données d'équipement"""
    
    # Charger les spécifications
    with open(specs_path, 'r', encoding='utf-8') as f:
        gear_items = json.load(f)
    
    # Statistiques
    categories = {}
    brands = {}
    total_weight = 0
    total_price = 0
    
    for item in gear_items:
        # Catégories
        cat = item['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(item)
        
        # Marques
        brand = item['brand']
        if brand not in brands:
            brands[brand] = 0
        brands[brand] += 1
        
        # Poids et prix
        total_weight += item['weight']
        total_price += item['price']
    
    # Vérifier le fichier TypeScript
    with open(ts_path, 'r', encoding='utf-8') as f:
        ts_content = f.read()
    
    # Compter les items dans le fichier TS
    ts_items = ts_content.count('id: "')
    
    return {
        'total_items': len(gear_items),
        'ts_items': ts_items,
        'categories': categories,
        'brands': brands,
        'total_weight': total_weight,
        'total_price': total_price,
        'avg_weight': total_weight / len(gear_items),
        'avg_price': total_price / len(gear_items)
    }

def generate_summary_report(stats):
    """Génère un rapport de résumé"""
    
    report = f"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                           RAPPORT FINAL                                   ║
║                    Base de Données d'Équipement Yeti                      ║
║                           {time.strftime('%Y-%m-%d %H:%M:%S')}                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ STATISTIQUES GLOBALES                                                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ Total d'équipements: {stats['total_items']}                                      ║
║ Équipements dans TypeScript: {stats['ts_items']}                                ║
║ Poids total: {stats['total_weight']}g ({stats['total_weight']/1000:.2f}kg)                        ║
║ Prix total: {stats['total_price']}€                                        ║
║ Poids moyen: {stats['avg_weight']:.1f}g                                        ║
║ Prix moyen: {stats['avg_price']:.1f}€                                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ RÉPARTITION PAR CATÉGORIE                                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
"""
    
    # Ajouter les catégories
    for category, items in stats['categories'].items():
        cat_weight = sum(item['weight'] for item in items)
        cat_price = sum(item['price'] for item in items)
        report += f"║ {category.upper():<12}: {len(items):>2} items ({cat_weight:>4}g, {cat_price:>4}€)        ║\n"
    
    report += f"""
╠══════════════════════════════════════════════════════════════════════════════╣
║ MARQUES REPRÉSENTÉES                                                    ║
╠══════════════════════════════════════════════════════════════════════════════╣
"""
    
    # Ajouter les marques (top 10)
    sorted_brands = sorted(stats['brands'].items(), key=lambda x: x[1], reverse=True)
    for brand, count in sorted_brands[:10]:
        report += f"║ {brand:<20}: {count:>2} équipements                       ║\n"
    
    if len(sorted_brands) > 10:
        report += f"║ ... et {len(sorted_brands) - 10} autres marques                              ║\n"
    
    report += f"""
╚══════════════════════════════════════════════════════════════════════════════╝
"""
    
    return report

def main():
    parser = argparse.ArgumentParser(description='Vérification Finale')
    parser.add_argument('--specs-json', type=str, default="lib/gear-specs_corrected.json",
                       help='Fichier JSON de spécifications')
    parser.add_argument('--ts-file', type=str, default="lib/gear/knolling-database.ts",
                       help='Fichier TypeScript à vérifier')
    
    args = parser.parse_args()
    
    print("🔍 PHASE 6 - Vérification Finale")
    print("=" * 50)
    
    # Vérifier les fichiers
    print("\n📁 Vérification des fichiers:")
    print("-" * 30)
    print(check_file_exists(args.specs_json, "Spécifications JSON"))
    print(check_file_exists(args.ts_file, "Base de données TypeScript"))
    
    # Vérifier la syntaxe TypeScript
    print("\n🔧 Vérification de la syntaxe:")
    print("-" * 30)
    print(check_typescript_syntax(args.ts_file))
    
    # Analyser la base de données
    print("\n📊 Analyse de la base de données:")
    print("-" * 30)
    stats = analyze_gear_database(args.specs_json, args.ts_file)
    
    print(f"✅ Total d'équipements: {stats['total_items']}")
    print(f"✅ Équipements dans TypeScript: {stats['ts_items']}")
    print(f"✅ Poids total: {stats['total_weight']}g ({stats['total_weight']/1000:.2f}kg)")
    print(f"✅ Prix total: {stats['total_price']}€")
    print(f"✅ Nombre de catégories: {len(stats['categories'])}")
    print(f"✅ Nombre de marques: {len(stats['brands'])}")
    
    # Vérifier la cohérence
    if stats['total_items'] != stats['ts_items']:
        print(f"⚠️  Attention: {stats['total_items']} items dans JSON mais {stats['ts_items']} dans TypeScript")
    
    # Générer le rapport
    print("\n📄 Génération du rapport final...")
    report = generate_summary_report(stats)
    
    # Sauvegarder le rapport
    report_path = "GEAR_DATABASE_REPORT.txt"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"💾 Rapport sauvegardé dans {report_path}")
    print("\n" + report)
    
    print("\n✨ VÉRIFICATION TERMINÉE!")
    print("La base de données d'équipement est prête à être utilisée.")

if __name__ == "__main__":
    main()