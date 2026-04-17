# 🚧 CURRENT_TASK.md
**Dernière mise à jour : 18 avril 2026 — Session Antigravity**

---

## 🎯 Session actuelle : Refonte pages Basecamp (Identité / Profil / Settings)

### ✅ LIVRABLES DE LA SESSION (17-18 avril 2026)

#### 1. `/basecamp/profile` — Essayage virtuel avec avatar SVG
- **Concept** : L'utilisateur saisit ses mensurations (torse C7→crête, hanches, épaules, pointure, taille, poids) et visualise en direct son sac sur un avatar SVG humain.
- **Avatar SVG** réaliste (tête, cheveux, torse, bras, jambes, chaussures) qui se met à l'échelle selon la taille réelle (178→190 = plus grand).
- **Sac plaqué sur le dos** avec bretelles, ceinture abdominale, poches, logo — **couleur change dynamiquement** selon le modèle sélectionné (rouge Renn / vert Talon / bleu Artisanal).
- **Règle graduée 140-200cm** avec marqueur cyan sur la taille réelle.
- **4 labels flottants** connectés par des lignes lumineuses (Torse · Épaules · Hanches · Sac).
- **Halo au sol** qui prend la couleur du sac choisi.
- **Recommandation auto** : calcule la taille de sac (XS/S/M/L/XL) selon le torse.
- **Analyse de charge** : Sac vide + Contenu + Total porté + rappel Decathlon 20-25% du poids corporel.
- Persistance `localStorage` ("yeti-profile").

#### 2. `/basecamp/settings` — Console de préférences OSINT
- **Navigation latérale sticky** (6 sections : Apparence / Notifications / Unités / Données / Confidentialité / Compte) avec badges colorés ("4" cyan, "PRO" rouge).
- **Section Apparence** : 3 cartes thème (Sombre/Clair/Auto) + 6 pastilles couleur d'accent + densité + animations + a11y reduced-motion.
- **Notifications** : 5 toggles animés (push, email hebdo, alertes météo, rappels deadlines, sons).
- **Unités** : Segmented controls (g↔oz, km↔mi, °C↔°F) + dropdowns devise/langue.
- **Données** : Carte Supabase EU-West "Synchronisé", barre de stockage 15,6%, export/import JSON, auto-backup PRO.
- **Confidentialité** : Biométrie, analytics, crash reports, sessions, mot de passe.
- **Compte** : Carte identité Marco N. + déconnexion + Zone dangereuse rouge.
- **Auto-save `localStorage`** ("yeti-settings") + indicateur live "Sauvegardé à l'instant".
- Composants réutilisables : `<Toggle>`, `<SegmentedControl>`, `<SelectField>`, `<ThemeOption>`, `<NavItem>`, `<Setting>`, `<Section>`.

#### 3. Autres refontes Basecamp (sessions précédentes de la semaine)
- ✅ `/basecamp` Mission Control
- ✅ `/basecamp/projects` Gestion projets
- ✅ `/basecamp/routes` Cartographie routes (Route3DView)
- ✅ `/basecamp/packbuilder` Pack Builder + Sherpa AI
- ✅ `/basecamp/sherpa` Interface Sherpa dédiée
- ✅ `/basecamp/timeline` Timeline tâches
- ✅ `/basecamp/weather` Prévisions météo
- ✅ `/basecamp/layout.tsx` + `BasecampSidebar.tsx` + `ContextBlock.tsx`

---

## 🏗 ARCHITECTURE STABILISÉE

### Pages Basecamp
| Route | Statut | Notes |
|---|---|---|
| `/basecamp` | ✅ | Mission Control / hub |
| `/basecamp/dashboard` | ✅ | Dashboard détaillé |
| `/basecamp/profile` | ✅ **NOUVEAU** | Avatar SVG + essayage virtuel |
| `/basecamp/settings` | ✅ **NOUVEAU** | Console 6 sections + auto-save |
| `/basecamp/projects` | ✅ | Liste projets |
| `/basecamp/routes` | ✅ | Route3DView |
| `/basecamp/timeline` | ✅ | Tâches + phases |
| `/basecamp/packbuilder` | ✅ | Pack + Sherpa AI |
| `/basecamp/sherpa` | ✅ | Interface Sherpa |
| `/basecamp/weather` | ✅ | Météo |
| `/basecamp/garage` | ✅ | Knolling 3D |
| `/basecamp/gear` | ✅ | Inventaire |

### Sherpa AI
- ✅ `/lib/sherpa/rules.ts` — Règles Decathlon/Globe Trotting
- ✅ `/lib/sherpa/engine.ts` — Analyse LLM simulée

### Treks
- ✅ GR20, TMB, Camino (avec GPX) — chargement dynamique via `lib/treks/index.ts`

---

## 📌 PROCHAINES ÉTAPES

### Priorité 1 — Intégration & cohérence
1. **Synchroniser le profil utilisateur** : connecter `yeti-profile` (mensurations) au Pack Builder pour afficher automatiquement la taille de sac recommandée.
2. **Appliquer `yeti-settings`** : utiliser la couleur d'accent choisie + unités (g/oz, km/mi) dans toutes les pages.
3. **Persistance Supabase** : migrer le localStorage vers la BDD (tables `user_profile` + `user_settings`).

### Priorité 2 — 3D / Garage
1. Finaliser les textures KTX2/WebP du Knolling 3D
2. Depth maps MiDaS pour tous les gear (`public/assets/garage/depth/`)
3. Shaders custom MeshStandardMaterial

### Priorité 3 — Build
1. Corriger le build webpack production (erreur Next.js connue)
2. Tests E2E Playwright sur tous les parcours

---

## 🎯 Livrable
Version stable de YETI avec :
- ✅ 12 pages Basecamp fonctionnelles
- ✅ Profile avec essayage virtuel SVG
- ✅ Settings console 6 sections
- ✅ GR20 / TMB / Camino consultables
- ✅ Pack Builder + Sherpa AI opérationnels
- ✅ Design system cohérent (rouge #f21e2c · cyan · emerald · violet)
