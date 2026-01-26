# Système Knolling 2.5D (Relighting)

Ce module permet de générer et d'afficher des objets "Flat Lay" avec un éclairage dynamique réagissant à la souris, sans utiliser de modèles 3D lourds.

## 🛠️ Installation

### 1. Backend (Python)
Installez les dépendances nécessaires pour le traitement d'image :
```bash
pip install -r scripts/requirements.txt
```

### 2. Frontend (Node)
Assurez-vous d'avoir les libs Three.js :
```bash
npm install three @types/three @react-three/fiber @react-three/drei
```

## 🚀 Utilisation

### Étape 1 : Ajouter des objets
Déposez vos images brutes (JPG/PNG sur fond blanc ou uni) dans le dossier `raw_gear` à la racine du projet.

### Étape 2 : Générer les Assets
Lancez le script de traitement. Attention, la première exécution téléchargera les modèles IA (~1-2 Go).
```bash
python scripts/generate_assets.py
```

Cela va générer :
- `public/gear/color/*.png` : Images détourées.
- `public/gear/normal/*.png` : Cartes de relief (violettes).
- `lib/gear-database.json` : Base de données des objets.

### Étape 3 : Voir le résultat
Lancez votre serveur de dev et allez sur `/basecamp/garage`.

```bash
npm run dev
```

## ⚙️ Personnalisation

### Intensité du relief
Modifiez `strength=2.5` dans `generate_assets.py` (plus haut = plus de relief).

### Matériau
Modifiez `roughness` et `metalness` dans `GearObject.tsx` pour changer l'aspect (plastique vs métal).

### Layout de la grille
Dans `app/basecamp/garage/page.tsx`, ajustez les paramètres de la grille :
```typescript
const col = i % 5;           // Objets par ligne
const spacing = 4;           // Espacement entre objets
```

## 📁 Structure des fichiers générés

```
public/
  gear/
    color/          # Images détourées (PNG avec alpha)
      item_1.png
      item_2.png
      ...
    normal/         # Normal maps (PNG RGBA)
      item_1.png
      item_2.png
      ...

lib/
  gear-database.json  # Base de données des objets
```

## 🎯 Format de la base de données JSON

```json
[
  {
    "id": "tent_msr",
    "name": "Tent Msr",
    "texturePath": "/gear/color/tent_msr.png",
    "normalPath": "/gear/normal/tent_msr.png",
    "ratio": 1.5,
    "width": 1200,
    "height": 800
  }
]
```

## 🔧 Fonctionnement technique

### Relighting (2.5D)

1. **Normal Map** : Encode les informations de surface en RGB
   - Rouge (R) : Normale X (-1 à 1)
   - Vert (G) : Normale Y (-1 à 1)
   - Bleu (B) : Normale Z (0 à 1)

2. **MouseLight** : Lumière ponctuelle qui suit le curseur
   - Intensité : 2.5
   - Distance : 15 unités
   - Position : Suit la souris en temps réel

3. **Material** : meshStandardMaterial
   - Roughness : 0.4
   - Metalness : 0.1
   - NormalScale : (1.5, 1.5)
   - AlphaTest : 0.5

### Optimisations

- Chargement asynchrone des textures (Suspense)
- Color space approprié (SRGB pour couleur, Linear pour normales)
- Anisotropie 16x pour la netteté
- DPR adaptatif [1, 2] pour les écrans Retina
- Contact Shadows pour les ombres au sol

## 🐛 Dépannage

### Erreur : Module 'torch' not found
```bash
pip install torch torchvision
```

### Erreur : rembg not installed
```bash
pip install rembg
```

### Images ne s'affichent pas
- Vérifiez que les chemins dans `gear-database.json` sont corrects
- Assurez-vous que les fichiers PNG existent dans `public/gear/`
- Consultez la console du navigateur pour les erreurs de chargement

### Performance lente
- Réduisez le nombre d'objets affichés simultanément
- Optimisez la taille des textures (max 1024x1024 recommandé)
- Utilisez le niveau de détail (LOD) pour les objets éloignés

## 🚧 Prochaines étapes

- [ ] Ajouter un système de filtrage/recherche
- [ ] Implémenter le drag & drop des objets
- [ ] Créer des catégories (tentes, sacs, vêtements, etc.)
- [ ] Ajouter des interactions au clic (modal de détails)
- [ ] Sauvegarder les positions personnalisées
- [ ] Export de la scène en image

## 📚 Support

Pour toute question ou problème, consultez :
- Documentation React Three Fiber : https://docs.pmnd.rs/react-three-fiber
- Documentation MiDaS : https://github.com/isl-org/MiDaS
- Documentation rembg : https://github.com/danielgatis/rembg
