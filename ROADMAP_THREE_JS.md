# 🎨 ROADMAP: UPGRADE TO THREE.JS 2.5D RENDERING

## 📋 STATUS: PHASE 1 COMPLETE

---

## ✅ PHASE 1: ASSET GENERATION (COMPLETED)

### Scripts créés:
1. **`scripts/generate_depth_maps.py`** - Génère les depth maps à partir des images couleur
   - Utilise le modèle IA "Depth Anything" (Hugging Face)
   - Préserve la transparence des PNG
   - Output: `/public/assets/garage/depth/`

2. **`scripts/generate_normals.py`** - Génère les normal maps à partir des depth maps
   - Utilise l'algorithme Sobel pour extraire les gradients
   - Préserve la transparence
   - Output: `/public/assets/garage/normal/`

### Pour exécuter:
```bash
# 1. Générer les depth maps (si pas déjà fait)
python scripts/generate_depth_maps.py

# 2. Générer les normal maps
python scripts/generate_normals.py
```

---

## 🚧 PHASE 2: INSTALLATION & SETUP (À FAIRE)

### Commandes d'installation:
```bash
npm install three @types/three @react-three/fiber @react-three/drei
```

### Dépendances à ajouter:
- `three` - Moteur 3D WebGL
- `@types/three` - Types TypeScript pour Three.js
- `@react-three/fiber` - Wrapper React pour Three.js
- `@react-three/drei` - Helpers et composants utilitaires

---

## 🎯 PHASE 3: IMPLEMENTATION (À FAIRE)

### Architecture proposée:

```
components/garage/
├── KnollingFloor.tsx (existant - wrapper principal)
├── Knolling3DCanvas.tsx (NOUVEAU - Canvas Three.js)
├── GearItem3D.tsx (NOUVEAU - Item 3D avec textures)
└── KnollingLights.tsx (NOUVEAU - Setup d'éclairage)
```

### 3.1 Créer `components/garage/GearItem3D.tsx`

**Responsabilités:**
- Charger les 3 textures (Color, Normal, Depth)
- Créer un PlaneGeometry
- Appliquer un MeshStandardMaterial
- Gérer le displacement scale basé sur la taille de l'objet

**Props nécessaires:**
```typescript
interface GearItem3DProps {
  item: KnollingGearItem;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}
```

**Logique de displacement:**
```typescript
const getDisplacementScale = (realSizeCm: number) => {
  if (realSizeCm <= 10) return 2;    // Objets plats
  if (realSizeCm <= 50) return 10;   // Objets moyens
  return 25;                          // Grands objets
};
```

**Textures à charger:**
```typescript
const colorMap = useTexture(`/assets/garage/color/${item.image}`);
const normalMap = useTexture(`/assets/garage/normal/${item.image}`);
const depthMap = useTexture(`/assets/garage/depth/${item.image}`);
```

**Material configuration:**
```typescript
<meshStandardMaterial
  map={colorMap}
  normalMap={normalMap}
  displacementMap={depthMap}
  displacementScale={getDisplacementScale(realSizeCm)}
  transparent={true}
  alphaTest={0.1}
  side={THREE.DoubleSide}
/>
```

---

### 3.2 Créer `components/garage/KnollingLights.tsx`

**Setup d'éclairage (comme demandé):**

```tsx
export const KnollingLights = () => {
  return (
    <>
      {/* Lumière ambiante - visibilité de base */}
      <ambientLight intensity={0.4} />
      
      {/* Lumière directionnelle - Top-Left (45°) */}
      <directionalLight
        position={[-5, 5, 5]}
        intensity={2.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
    </>
  );
};
```

---

### 3.3 Créer `components/garage/Knolling3DCanvas.tsx`

**Canvas React Three Fiber:**

```tsx
'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { KnollingLights } from './KnollingLights';
import { GearItem3D } from './GearItem3D';

export const Knolling3DCanvas = ({ items, selectedItem, onSelectItem }) => {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 10], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Éclairage */}
      <KnollingLights />
      
      {/* Fond de scène */}
      <color attach="background" args={['#7a8b7a']} />
      
      {/* Items 3D */}
      {items.map((item, index) => (
        <GearItem3D
          key={item.id}
          item={item}
          position={[index * 2, 0, 0]} // Position temporaire
          isSelected={selectedItem?.id === item.id}
          onSelect={() => onSelectItem(item)}
        />
      ))}
      
      {/* Contrôles de caméra */}
      <OrbitControls enableZoom enablePan enableRotate />
    </Canvas>
  );
};
```

---

### 3.4 Intégrer dans `KnollingFloor.tsx`

**Modification du wrapper principal:**

```tsx
export const KnollingFloor = ({ items, ... }) => {
  const [render3D, setRender3D] = useState(false); // Toggle 3D mode
  
  return (
    <div className="relative w-full h-full overflow-hidden">
      
      {/* Bouton pour activer le mode 3D */}
      <button onClick={() => setRender3D(!render3D)}>
        {render3D ? "Mode 2D" : "Mode 3D"}
      </button>
      
      {/* Rendu conditionnel */}
      {render3D ? (
        <Knolling3DCanvas 
          items={items}
          selectedItem={selectedItem}
          onSelectItem={onSelectItem}
        />
      ) : (
        /* Le rendu 2D existant (CSS drop-shadow) */
        <div>...</div>
      )}
    </div>
  );
};
```

---

## 🎯 RÉSULTAT ATTENDU

### Visuellement:
- **Relief volumétrique** : Les objets ont de l'épaisseur grâce au displacement map
- **Highlights réalistes** : Les bords et surfaces réagissent à la lumière grâce aux normal maps
- **Ombres physiques** : Ombres portées calculées en temps réel par le moteur WebGL
- **Interaction** : Rotation de la caméra, zoom, pan avec OrbitControls

### Performance:
- GPU-accelerated via WebGL
- Optimisation possible avec `useTexture` (preload + cache)
- Frame rate ciblé: 60 FPS

---

## 📊 COMPARAISON: CSS vs THREE.JS

| Aspect | CSS (Actuel) | Three.js (Futur) |
|--------|--------------|-------------------|
| **Ombres** | drop-shadow 2D | Ombres volumétriques réelles |
| **Relief** | Plat | Displacement 3D |
| **Lumière** | Statique | Éclairage dynamique |
| **Performance** | Léger | GPU-accelerated |
| **Complexité** | Simple | Avancée |
| **Réalisme** | 6/10 | 10/10 |

---

## 🔄 MIGRATION PROGRESSIVE

**Recommandation:** Garder les 2 modes

1. **Mode 2D (CSS)** - Actuel
   - Rapide, léger
   - Bon pour le mode "1:1" (inventaire uniforme)
   - Fonctionne sur tous les appareils

2. **Mode 3D (Three.js)** - Nouveau
   - Photoréaliste
   - Bon pour le mode "Échelle Réelle"
   - Nécessite GPU moderne

**Toggle:** Un bouton "2D / 3D" dans l'interface

---

## 📝 NOTES TECHNIQUES

### Gestion des textures:
```typescript
// Optimisation du chargement
const textureLoader = new THREE.TextureLoader();
textureLoader.setWithCredentials(false);

// Cache des textures déjà chargées
const textureCache = new Map();
```

### Conversion des positions:
```typescript
// Conversion des positions 2D (pixels) vers 3D (unités Three.js)
const position3D = [
  (pos2D.x - canvasWidth/2) / 100,
  -(pos2D.y - canvasHeight/2) / 100,
  0
];
```

### Aspect ratio des planes:
```typescript
// Maintenir les proportions de l'image
const aspectRatio = texture.image.width / texture.image.height;
const width = realSizeCm / 100;
const height = width / aspectRatio;
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

- [x] Script `generate_depth_maps.py` créé
- [x] Script `generate_normals.py` créé
- [ ] Exécuter les scripts Python
- [ ] Installer les dépendances NPM
- [ ] Créer `GearItem3D.tsx`
- [ ] Créer `KnollingLights.tsx`
- [ ] Créer `Knolling3DCanvas.tsx`
- [ ] Intégrer le toggle 2D/3D
- [ ] Tester les performances
- [ ] Optimiser le chargement des textures
- [ ] Documenter l'utilisation

---

**Date de création:** 27 janvier 2026
**Status:** PHASE 1 complète, PHASE 2-3 en attente d'implémentation
