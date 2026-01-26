# 🎯 ROADMAP: Système de Dimensions Réelles pour Knolling

**Date**: 26/01/2026 - 22h43  
**Version de départ**: v0.1-garage-knolling

## 🎨 Vision

Transformer le garage Yeti pour afficher les objets avec leurs **dimensions réelles** sur le knolling floor, créant une vue réaliste de l'équipement.

---

## 📊 Architecture Proposée

### 1. Base de Données des Dimensions

**Fichier**: `lib/gear/dimensions-database.json`

```json
{
  "items": [
    {
      "id": "osprey_exos_58",
      "realDimensions": {
        "width": 340,  // mm
        "height": 780, // mm
        "depth": 280   // mm
      },
      "displayScale": 0.15, // facteur pour l'affichage (15% taille réelle)
      "source": "https://www.osprey.com/...",
      "scrapedAt": "2026-01-26"
    }
  ]
}
```

### 2. Script de Scraping

**Fichier**: `scripts/scrape_dimensions.py`

```python
# Scraper les dimensions depuis:
# - Decathlon API
# - Sites constructeurs (Osprey, Patagonia, MSR, etc.)
# - Amazon (fallback)
```

**Sites prioritaires**:
- Decathlon API (meilleur structure)
- Osprey.com
- Patagonia.com
- MSR Gear
- Sea to Summit
- Black Diamond

### 3. Toggle Mode dans UI

**Composant**: `KnollingFloor.tsx`

Ajouter un bouton toggle:
```
[ ] Mode Uniforme (1x1)
[x] Mode Réaliste (dimensions réelles)
```

---

## 🚀 Plan d'Implémentation

### Phase 1: Structure (1-2h)
- [ ] Créer `dimensions-database.json`
- [ ] Créer types TypeScript pour dimensions
- [ ] Modifier `GearItem` interface pour inclure `realDimensions`

### Phase 2: Scraping (3-4h)
- [ ] Script Python scraper Decathlon
- [ ] Script scraper sites constructeurs
- [ ] Script de validation données
- [ ] Remplir base pour les 31 items actuels

### Phase 3: UI/UX (2h)
- [ ] Toggle "Mode Réaliste" dans `KnollingFloor`
- [ ] Adapter calcul `size` dans `DraggableItem`
- [ ] Ajuster auto-zoom pour grandes variations
- [ ] Légende échelle (ex: "1:10")

### Phase 4: Persistence (1h)
- [ ] LocalStorage pour sauver positions
- [ ] Réinitialisation intelligente si changement dimensions

---

## 📏 Calculs d'Échelle

**Exemple**: Osprey Exos 58
- Dimensions réelles: 34cm x 78cm x 28cm
- Surface au sol (knolling): 34cm x 78cm = 2652 cm²
- Échelle affichage: 1:10 → 3.4cm x 7.8cm à l'écran
- En pixels (150 DPI): 51px x 117px

**Formule**:
```javascript
const pixelWidth = (realWidth_mm / 10) * (DPI / 25.4) * displayScale
```

---

## 🎨 Exemples de Dimensions à Scraper

| Catégorie | Item | Dimensions (L x H x P) |
|-----------|------|------------------------|
| Sac | Osprey Exos 58 | 34 x 78 x 28 cm |
| Tente | MSR Hubba Hubba | 213 x 127 x 100 cm (packée: 51 x 17 cm) |
| Matelas | Sea to Summit | 183 x 55 x 8 cm (packée: 28 x 11 cm) |
| Veste | Patagonia | 60 x 70 cm (pliée: 20 x 15 cm) |
| Gourde | Nalgene 1L | Ø 9 x H 20 cm |

**Note**: Pour le knolling, utiliser dimensions **packées/pliées**.

---

## 🔍 Sources de Données

### API Publiques
1. **Decathlon API**: Structure JSON claire
2. **REI API**: Bien documentée
3. **Amazon Product API**: Fallback

### Scraping Direct
- Parsing HTML structure produit
- Extraction depuis images (OCR si nécessaire)
- Manuellement pour items critiques

---

## 🎯 Critères de Succès

- [ ] 100% des items ont des dimensions réelles
- [ ] Scraper automatique pour nouveaux items
- [ ] Toggle fluide entre modes
- [ ] Rendu visuel réaliste et esthétique
- [ ] Documentation complète du système

---

## ⏱️ Estimation Totale

**Minimum Viable**: 6-8 heures  
**Version Complète**: 15-20 heures

---

## 📝 Notes Techniques

### Challenges
1. **Variation de format**: Chaque site a son propre format
2. **Données manquantes**: Tous les produits n'ont pas dimensions
3. **Dimensions packées vs dépliées**: Choix à faire par catégorie
4. **Échelle d'affichage**: Trouver bon compromis visuel

### Solutions
- Base manuelle pour items essentiels (priorité)
- Scraping automatique pour compléter
- Fallback sur estimation par catégorie
- Permettre édition manuelle par utilisateur

---

**Prochaine étape**: Phase 1 - Créer la structure de base
