# YETI V3.2 — Outdoor Trek Platform

## Nouveautés V3.2

- ✅ **Pas de sidebar** sur Home et Treks (navbar only)
- ✅ **Sidebar** uniquement dans Basecamp
- ✅ **Icônes Lucide professionnelles** (pas d'emojis)
- ✅ **Filtres fonctionnels** : Tous, Sportif, Modéré, Pèlerinage
- ✅ **Thème bleu** pour Camino (pèlerinage)
- ✅ **Séparation claire** Basecamp vs Pack Builder
- ✅ **0 erreurs TypeScript**

## Installation

```powershell
cd C:\Users\mafum\Desktop\Sac_a_dos
Remove-Item -Recurse -Force yeti -ErrorAction SilentlyContinue
Expand-Archive -Path "$HOME\Downloads\YETI_V3.2_FINAL.zip" -DestinationPath "."
cd yeti
npm install --legacy-peer-deps
npm run dev
```

Ouvrir http://localhost:3000

## Structure

### Pages SANS sidebar (Navbar uniquement)
- `/` — Landing page
- `/treks` — Catalogue avec filtres
- `/treks/[slug]` — Détail trek (GR20, TMB, Camino)

### Pages AVEC sidebar (Basecamp)
- `/basecamp` — Dashboard personnel
- `/basecamp/gear` — Inventaire matériel
- `/basecamp/packs` — Packs sauvegardés
- `/basecamp/routes` — Routes planifiées
- `/basecamp/packbuilder` — Outil de création de pack

## Catégories

| Trek | Catégorie | Thème |
|------|-----------|-------|
| GR20 | Sportif | Orange |
| TMB | Modéré | Orange |
| Camino | Pèlerinage | Bleu |

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- Lucide Icons
- TypeScript

## Philosophie

**Basecamp** = Ton espace personnel (inventaire, packs, historique)
**Pack Builder** = L'outil de création (optimisation pour un trek)
