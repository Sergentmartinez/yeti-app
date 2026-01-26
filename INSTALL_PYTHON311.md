# 🔧 Installation avec Python 3.11 (Solution au problème ONNX Runtime)

## Problème Identifié
Python 3.14 est trop récent pour `onnxruntime` (nécessaire pour rembg). La solution est d'utiliser Python 3.11 ou 3.12.

## Solution Étape par Étape

### 1. Téléchargez Python 3.11
Si ce n'est pas déjà fait :
- Allez sur https://www.python.org/downloads/
- Téléchargez Python 3.11.x (dernière version stable)
- Installez-le (cochez "Add to PATH")

### 2. Nettoyage et Installation

Ouvrez un terminal PowerShell dans VS Code et exécutez ces commandes **une par une** :

```powershell
# 1. Désactiver l'environnement actuel (si actif)
deactivate

# 2. Supprimer l'ancien environnement virtuel
Remove-Item -Recurse -Force venv

# 3. Créer un nouvel environnement avec Python 3.11
py -3.11 -m venv venv

# 4. Activer le nouvel environnement
.\venv\Scripts\activate

# 5. Mettre à jour pip
python -m pip install --upgrade pip

# 6. Installer les dépendances
pip install rembg[cpu] opencv-python-headless numpy pillow torch torchvision timm tqdm
```

### 3. Lancer le Script

Une fois l'installation terminée :

```powershell
python scripts/generate_assets.py
```

### 4. Ce qui va se passer

Le script va :
1. **Télécharger le modèle u2net** (~176 MB) - une seule fois
2. **Traiter chaque image** dans `raw_gear/` :
   - Détourage automatique (suppression du fond)
   - Génération de la depth map (MiDaS)
   - Création de la normal map (effet 3D)
3. **Sauvegarder les résultats** :
   - `public/gear/color/` - Images détourées
   - `public/gear/normal/` - Normal maps
   - `lib/gear-database.json` - Base de données

### 5. Vérification

Si tout fonctionne, vous verrez :

```
⚙️  Chargement des modèles IA...
✅ Modèles chargés sur cpu
🚀 Traitement de 3 images...

[1/3]
Traitement de 153030-a543_04.jpg...
✓ 153030-a543_04.jpg traité avec succès

[2/3]
Traitement de Hubba_Hubba_NX_21.webp...
✓ Hubba_Hubba_NX_21.webp traité avec succès

[3/3]
...

✨ Terminé ! 3 items générés dans lib/gear-database.json
```

### 6. Affichage dans l'App

1. Rechargez votre page : http://localhost:3000/basecamp/garage
2. Les objets devraient s'afficher automatiquement en 2.5D
3. Déplacez votre souris pour voir l'effet Relighting !

---

## Dépannage

### Si "py -3.11" ne fonctionne pas :

```powershell
# Vérifiez les versions installées
py --list

# Ou utilisez le chemin complet
"C:\Users\[VotreNom]\AppData\Local\Programs\Python\Python311\python.exe" -m venv venv
```

### Si l'installation est lente :

C'est normal ! Les packages comme `torch` sont volumineux (~100 MB). Attendez la fin.

### Si le téléchargement du modèle échoue :

Le modèle u2net sera téléchargé automatiquement depuis GitHub. Si vous avez des problèmes de réseau, réessayez simplement.

---

## Alternative : Utiliser un environnement existant

Si vous avez déjà un environnement Python 3.11 ailleurs :

```powershell
# Activez votre environnement
source /chemin/vers/votre/env/bin/activate  # Linux/Mac
# ou
.\chemin\vers\votre\env\Scripts\activate   # Windows

# Installez les dépendances
pip install -r scripts/requirements.txt
pip install rembg[cpu]
```

Bonne chance ! 🚀
