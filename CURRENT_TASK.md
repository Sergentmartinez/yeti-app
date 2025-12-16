# 🚧 CURRENT_TASK.md  
Tâche en cours — Jan 2025

## 🎯 Objectif actuel
Stabiliser l’architecture YETI et préparer la base solide pour que Claude (ou Cursor + Claude) puisse coder tout le projet proprement.

## 🧩 Tâches
1. **Simplifier l’arborescence Next.js**
   - Fusionner packbuilder et inventory dans /basecamp
   - Nettoyer /treks/[slug] (garder uniquement page.tsx)

2. **Créer les pages manquantes**
   - /basecamp/page.tsx
   - /basecamp/packbuilder/page.tsx
   - /basecamp/inventory/page.tsx

3. **Rendre le site fonctionnel**
   - Corriger les imports cassés
   - Uniformiser les chemins d’accès aux treks
   - Vérifier que chaque trek slug charge correctement

4. **Préparer SherpaAI (Rule-first)**
   - Créer `/lib/sherpa/rules.ts`
   - Créer `/lib/sherpa/engine.ts`

5. **Mettre à jour YETI_MASTER.md**  
   - Ajouter architecture validée par le Conseil des Sages (ChatGPT + Claude + Gemini + Grok + Perplexity)

## 📌 Livrable final
Une version stable du site YETI en LOCALLY avec :  
- GR20 / TMB / Camino consultables  
- Basecamp fonctionnel  
- Inventaire lisible  
- Pack Builder affiché  
- Architecture validée pour 5 ans  

