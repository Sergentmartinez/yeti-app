🏔️ YETI_MASTER.md — SOURCE DE VÉRITÉ OFFICIELLE (vFinal 2025)

Architecture, Vision, Standards techniques et règles métier

📌 Cette version intègre les retours des 4 IA expertes : nomenclature unifiée, ajustements Basecamp, flexibilité UX contrôlée, prompts IA, structure scalable 5 ans.

0. 🔥 Pourquoi ce document existe

YETI n’est pas une application de randonnée.
C’est le système de préparation le plus fiable d’Europe pour expéditions :

GR20

TMB

Camino

Via Alpina

Grandes traversées premium

🎯 Objectif : réduire à zéro les erreurs de préparation qui compromettent une expédition.

Ce document est :

la constitution technique

la source de vérité

la référence pour toutes les IA et tous les futurs devs

Il doit évoluer :
✔️ via amendements versionnés
❌ jamais via improvisation

1. 🧭 PRINCIPES FONDATEURS
P1 — DATA FIRST

La donnée = réalité terrain.
L’IA = interprétation, jamais génération.

Sources acceptées :

GPX officiels

IGN

OpenTopo

Refuges, Offices, Topos fiables

🚫 L’IA ne fabrique jamais : altitudes, distances, profils, points d’eau.

P2 — ARCHITECTURE MODULAIRE (DDD light)

Domains :

/treks

/pack

/basecamp

/sherpa

/geo

/experts (V2)

/auth (V2)

Chaque domaine est :
✔️ isolé
✔️ testable
✔️ évolutif

P3 — SHERPA AI (Moteur Hybride)
Layer 1 — Règles déterministes (obligatoires)

Implémentées dans /lib/sherpa/rules.ts.

Exemples :

Poids max = 12 % du poids du randonneur

Eau min 2 L si > 10 km sans point d’eau

Sac confort 0°C si nuit < 5°C

Exposition col si vent > 50 km/h

Layer 2 — LLM

Implémenté dans /lib/sherpa/engine.ts.

Rôles :

expliquer

reformuler

suggérer

contextualiser météo

🚫 L’IA ne remplace pas les règles.
Si le LLM échoue → fallback = règles seules.

P4 — UX/UI “MISSION CONTROL”

L’identité YETI = sérieuse, précise, technique, premium.

Interdits :

🚫 émojis

🚫 style enfantin

🚫 couleur flashy

Obligatoires :

✔️ Layout 2 colonnes desktop (Récit / Analyse)

✔️ Mobile : onglets (Récit / Analyse / Carte)

✔️ Icônes lucide-react

✔️ Ton expert mais rassurant, jamais militaire

🔄 Flexibilité UX :
Les modifications design sont autorisées uniquement si basées sur données utilisateur (tests A/B).

P5 — ZERO REDONDANCE

une donnée = un fichier

une logique = un module

un composant = un usage

2. 🗺️ ARCHITECTURE TECHNIQUE (STRUCTURE FINALE)
/app
  layout.tsx
  globals.css

  /treks
    page.tsx
    /[slug]
      page.tsx
      client-tabs.tsx               ← navigation mobile

  /basecamp
    page.tsx
    /gear                          ← inventaire utilisateur
      page.tsx
    /packbuilder                   ← intégré au Basecamp
      page.tsx
    /packs                         ← packs sauvegardés
      page.tsx

  /auth (V2)
    login.tsx
    callback.tsx

/components
  /ui
  /trek
  /pack
  /charts

/lib
  /treks                          ← données statiques officielles
  /gear                           ← catalogue équipement
  /sherpa
    rules.ts
    engine.ts
  /geo
    elevation.ts
    gpx.ts
  utils.ts

/types
  trek.ts
  stage.ts
  gear.ts
  user.ts
  sherpa.ts

/public
  /maps
  /images
  sw.js                           ← PWA offline mode

3. 🧩 CONCEPTS PRODUIT
3.1 — Basecamp (l’espace personnel)

Tout ce qui appartient à l’utilisateur :

Inventaire

Packs

Packs sauvegardés

Historique

Préférences

Dernier trek préparé

3.2 — Pack Builder (outil scientifique)

Objectif : optimiser le sac comme un logisticien d’expédition.
Rôle :

poids dynamique

répétitions

alertes Sherpa

export PDF

optimisation IA (V3)

3.3 — Page Trek (signature YETI)
Colonne gauche — LE RÉCIT

étapes

distances

profils

points d’intérêt

Colonne droite — ANALYSE

intensité

risques

météo

recommandations Sherpa

4. 📐 NOMENCLATURE OFFICIELLE (corrections validées par les IA)
4.1 — Noms de fichiers / routes

/basecamp/gear ✔️
(et non /inventory)

4.2 — Types (format concis recommandé)

Claude & Perplexity recommandent de simplifier.

Stages → format court
{ dist: 12, dplus: 1500, dminus: 900 }

Trek → format officiel
stats: {
  dist: number;
  dplus: number;
  days: number;
  difficulty: number;
}

4.3 — Catégorie de trek (filtrage)

Ajouter dans trek.ts :

category: "sportif" | "modere" | "pelerinage"

5. 🧠 SHERPA ENGINE — CONTRAT FINAL
Entrée
(user, pack, trek, weather)

Sortie
interface SherpaReport {
  isSafe: boolean;
  warnings: SherpaWarning[];
  errors: SherpaError[];
  suggestions: string[];
}

Règles = source officielle

/lib/sherpa/rules.ts
Toujours couvert par tests unitaires.

IA = optionnelle

/lib/sherpa/engine.ts

6. ✨ PROMPTS OFFICIELS POUR LES IA

À mettre en tête de chaque conversation Claude/Cursor :

⚠️ Tu dois respecter YETI_MASTER.md.

N’invente jamais structure ou data non présentes.

Modifie /types si tu changes une donnée.

Le Pack Builder fait partie de Basecamp.

Le layout Trek = 2 colonnes desktop, onglets mobile.

Sherpa = règles avant IA.

Pas d’émojis, pas de styles enfantins.

7. 📅 ROADMAP VALIDÉE
V1 – Produit Fonctionnel (Q1 2025)

GR20 complet

Pack Builder

Sherpa (règles)

PWA

Export PDF

V2 – Comptes utilisateurs (Q2)

Auth

Inventaire personnalisé

Packs sauvegardés

V3 – IA Avancée (Q3)

Camino + TMB

Sherpa explicatif

Packs optimisés

V4 – Marketplace Experts (Q4)

Guides certifiés

Packs premium

Sessions payantes

8. 🦄 Vision 2030

YETI devient :
le référentiel technique de préparation outdoor en Europe.
Le Michelin des expéditions.
Sans bruit social.
Sans bullshit.
Juste : la vérité terrain + l’expertise + la rigueur.

🎉 Ce document est désormais la version PRO FINALE

Validé par :
✔️ Claude
✔️ Gemini
✔️ Perplexity
✔️ Grok
✔️ ChatGPT