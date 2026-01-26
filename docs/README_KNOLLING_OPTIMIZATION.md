# Optimisation & PBR pour le Ground (Yeti App)

Ce document décrit le pipeline d'assets pour le sol ultra-réaliste optimisé (`components/knolling/Ground.tsx`).

## 1. Pipeline KTX2 & ORM

Pour garantir une qualité visuelle premium avec un impact minimal sur la VRAM et le temps de chargement, nous utilisons le format **KTX2** (Basis Universal) et le packing **ORM**.

### Pourquoi KTX2 ?
- **VRAM réduite** : Les textures restent compressées en mémoire GPU (contrairement au JPEG/PNG qui sont décompressés en RGBA complet).
- **Chargement rapide** : Fichiers plus légers qu'un PNG non compressé, et pas de coût de décodage JPEG sur le CPU.

### Packing ORM
Pour réduire le nombre de requêtes HTTP et de texture fetches dans le shader, nous combinons 3 maps en une seule texture RGB :
- **R** (Red) : Ambient Occlusion (AO)
- **G** (Green) : Roughness
- **B** (Blue) : Metalness

Pour le béton (diélectrique), le canal Blue (Metalness) sera noir (0.0).

### Comment générer les assets (.ktx2)

Outil recommandé : **KTX-Software** (CLI `toktx`) ou **glTF-Transform**.

#### Méthode CLI (toktx)

1. **Préparer les sources** (PNG/JPG linéaire) :
   - `basecolor.png` (sRGB)
   - `normal.png` (Linear)
   - `orm.png` (Linear, R=AO, G=Rough, B=Metal)

2. **Encoder BaseColor** (ETC1S pour la couleur, plus lent à encoder mais très compact) :
   ```bash
   toktx --t2 --target_type RGB --genmipmap basecolor.ktx2 basecolor.png
   ```

3. **Encoder Normal Map** (UASTC pour la qualité des vecteurs, éviter les artefacts) :
   ```bash
   toktx --t2 --target_type RGB --genmipmap --uastc 3 normal.ktx2 normal.png
   ```
   *Note : UASTC est plus lourd que ETC1S mais indispensable pour les normales.*

4. **Encoder ORM** (ETC1S est suffisant généralement) :
   ```bash
   toktx --t2 --target_type RGB --genmipmap orm.ktx2 orm.png
   ```

#### Créer l'ORM (Photoshop / GIMP / Nodes)
- Ouvrir un document RGB.
- Coller l'AO dans le canal Rouge.
- Coller la Roughness dans le canal Vert.
- Coller la Metalness dans le canal Bleu (ou remplir de noir).
- Sauvegarder en PNG (sans compression) avant conversion KTX2.

## 2. Perf Budget & Recommandations

Pour maintenir 60 FPS sur mobile/laptop moyen avec un sol "Premium" :

### Budget Texture Sol (Total)
- **Cible VRAM** : < 50 MB décompressé (impossible avec JPG/PNG 4K, possible avec KTX2).
- **Cible Poids** : < 5 MB total téléchargé.

**Configuration recommandée :**
- `BaseColor` : 4K (KTX2 ETC1S) ~2MB
- `Normal` : 4K (KTX2 UASTC) ~4-6MB (ou 2K si trop lourd)
- `ORM` : 2K (KTX2 ETC1S) ~500KB
- `Macro Variation` (optionnel) : 1K (KTX2 ETC1S) ~100KB
- `Detail Normal` (optionnel) : 1K (KTX2 UASTC) ~300KB

### Anti-tiling
Le shader custom (`patchShaders` dans `Ground.tsx`) utilise une modulation procédurale ou texturée pour casser la répétition sur les grandes surfaces.
- **Coût** : Faible (quelques instructions ALU + 1-2 texture fetches supp).
- **Gain** : Permet d'utiliser une texture de base plus petite (2K/4K) répétée 10-20 fois sans effet "mosaïque" visible.

## 3. Sol Infini vs World-Locked UV

Le composant `Ground` propose deux modes. Voici les compromis :

### Mode `fixed` (10m x 5m)
- **Avantages** : Simple, ombres portées parfaites (taille finie), pas de scintillement.
- **Inconvénients** : On voit le bord du monde si on dézoome trop.
- **Usage** : Scènes d'intérieur, Garage, Showroom défini.

### Mode `infinite` (40m x 40m repositionnable)
- **Fonctionnement** : Un plan large qui se téléporte sous la caméra par pas discrets (taille d'une tuile de texture).
- **Avantages** : Illusion d'un sol infini à l'horizon.
- **Inconvénients** : 
  - **Z-fighting** possible si trop proche de 0 (fixé par `position.y = -0.05`).
  - **UV Sliding** : Si on ne snap pas la position sur la grille de texture, le sol semble "glisser" sous les pieds quand on bouge (effet tapis roulant). Notre implémentation fixe cela via `snapX/snapZ`.
  - **Ombres** : Les ombres portées peuvent être coupées si l'objet est loin du centre du plan "infini" (car le plan a quand même une limite physique de 40m).

### Recommandation Yeti
Utiliser le mode `infinite` avec un `TILE_SIZE` de 4m (standard dalle béton) et des textures KTX2 pour une expérience fluide et immersive.
