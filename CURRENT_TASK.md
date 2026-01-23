# 🚧 CURRENT_TASK.md  
Tâche en cours — Jan 2025

## 🎯 Objectif actuel
Stabiliser l'architecture YETI et préparer la base solide pour que Claude (ou Cursor + Claude) puisse coder tout le projet proprement.

## ✅ ÉTAT ACTUEL (23 Jan 2026)

### Architecture Stabilisée
- ✅ `/app/basecamp/page.tsx` - Mission Control (Dashboard principal)
- ✅ `/app/basecamp/packbuilder/page.tsx` - Pack Builder complet avec Sherpa AI intégré
- ✅ `/app/basecamp/dashboard/page.tsx` - Dashboard détaillé
- ✅ `/app/basecamp/timeline/page.tsx` - Timeline des tâches
- ✅ `/app/basecamp/routes/page.tsx` - Gestion des routes
- ✅ Duplication `pack-builder` supprimée (gardé `packbuilder`)

### Sherpa AI - Système Expert
- ✅ `/lib/sherpa/rules.ts` - Moteur de règles basé sur les PDFs Decathlon/Globe Trotting
  - Règles de chargement et équilibre du sac
  - Items de sécurité obligatoires
  - Vérification du poids
  - Règles spécifiques par trek (GR20, TMB, Camino)
- ✅ `/lib/sherpa/engine.ts` - Analyse LLM simulée

### Treks Configurés
- ✅ GR20 (avec tracks GPX intégrés)
- ✅ TMB (Tour du Mont-Blanc)
- ✅ Camino (Chemin de Compostelle)
- ✅ Système de chargement dynamique via `lib/treks/index.ts`

### Statut Technique
- ✅ Mode développement fonctionnel (port 3002)
- ⚠️ Build webpack échoue (erreur connue Next.js 15.5.9 - non bloquant)
- ✅ Toutes les routes compilent sans erreur en dev
- ✅ Intégration Tailwind + Design System

## 📌 Prochaines Étapes Recommandées

1. **Corriger le build production**
   - Mettre à jour Next.js ou contourner l'erreur webpack

2. **Compléter les pages Basecamp**
   - `/basecamp/gear/` - Inventaire matériel
   - `/basecamp/weather/` - Prévisions météo
   - `/basecamp/sherpa/` - Interface Sherpa AI dédiée

3. **Améliorer l'intégration Mapbox**
   - Visualisation 3D des treks
   - Profil d'élévation interactif

4. **Tests E2E**
   - Vérifier tous les parcours utilisateur
   - Tester le Pack Builder avec différents treks

## 🎯 Livrable
Version stable du site YETI avec :  
- ✅ GR20 / TMB / Camino consultables  
- ✅ Basecamp fonctionnel (Mission Control, Dashboard, Timeline)
- ✅ Pack Builder avec Sherpa AI opérationnel
- ✅ Architecture propre et maintenable

