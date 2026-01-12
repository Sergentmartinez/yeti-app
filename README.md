# YETI — Your European Trek Intelligence

YETI is a premium preparation platform for long-distance treks and pilgrimages in Europe.

YETI is NOT:
- a GPS navigation app
- a GPX mapping tool
- a real-time tracking platform

YETI focuses exclusively on the phase BEFORE departure.

## Core Problem
Long-distance hikers and pilgrims experience strong preparation anxiety:
- What gear to bring
- How much weight is acceptable
- What to remove or replace
- Whether the setup matches terrain, season, weather, and personal limits

This anxiety is currently fragmented across forums, spreadsheets, blogs, and contradictory advice.

## What YETI Does
YETI helps users prepare with confidence by:
- Analyzing equipment lists (weight, redundancy, gaps)
- Adapting gear to specific treks, seasons, and profiles
- Providing structured, validated preparation guidance
- Reducing uncertainty before departure

YETI positions itself as:
"The European Outdoor Copilot — before you leave."

## What Makes YETI Different
- Focus on preparation, not navigation
- Structured gear intelligence instead of generic checklists
- European-specific treks, regulations, and practices
- Designed for serious hikers and pilgrims, not casual walks

## Target Users
- Serious hikers (35–55) preparing multi-day or multi-week treks
- Pilgrims (Camino, Via Francigena) with preparation anxiety
- Guides and agencies needing structured preparation tools

## Strategic Constraint
YETI assumes that navigation platforms (Komoot, AllTrails, Strava) already dominate GPS and mapping.
YETI does not attempt to compete on navigation.

YETI must therefore build defensible value in preparation intelligence, not maps.




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
