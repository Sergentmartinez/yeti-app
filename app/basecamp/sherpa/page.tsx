// app/basecamp/sherpa/page.tsx
"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mountain, Backpack, Stethoscope, Utensils, Map, Wrench, Flame,
  Search, X, BookOpen, Clock, ChevronRight, Sparkles, AlertTriangle,
  Lightbulb, Target, Thermometer, Droplets, Footprints, Heart,
  Compass, Star, ChevronLeft, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// DESIGN TOKENS
// ============================================================================
const THEME = {
  red: "#f21e2c",
  orange: "#F9591F",
  yellow: "#FEC631",
  emerald: "#10b981",
  cyan: "#06b6d4",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  pink: "#ec4899",
};

type IconType = React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; strokeWidth?: number }>;

// ============================================================================
// BASE DE CONNAISSANCES
// Sourcé depuis : docs_references (Decathlon, Deuter, Gloptroteur, etc.)
// ============================================================================
type Article = {
  id: string;
  categoryId: string;
  title: string;
  summary: string;
  readTime: number; // min
  priority: "essential" | "recommended" | "advanced";
  tags: string[];
  content: { heading?: string; text?: string; bullets?: string[]; warning?: string; tip?: string }[];
};

type Category = {
  id: string;
  name: string;
  description: string;
  icon: IconType;
  color: string;
};

const CATEGORIES: Category[] = [
  { id: "backpack-setup", name: "Réglage du sac", description: "Ajuster son sac à sa morphologie", icon: Backpack, color: THEME.red },
  { id: "backpack-fill", name: "Remplir son sac", description: "Organisation du chargement", icon: Target, color: THEME.orange },
  { id: "packlist", name: "Listes & check-lists", description: "Que prendre selon le trek", icon: BookOpen, color: THEME.violet },
  { id: "health", name: "Santé & pharmacie", description: "Trousse de secours, bobos", icon: Stethoscope, color: "#ef4444" },
  { id: "nutrition", name: "Alimentation", description: "Calories, hydratation, lyophilisés", icon: Utensils, color: THEME.emerald },
  { id: "navigation", name: "Navigation & GPX", description: "Cartes, boussole, traces", icon: Map, color: THEME.cyan },
  { id: "maintenance", name: "Entretien matériel", description: "Prendre soin de son équipement", icon: Wrench, color: "#64748b" },
  { id: "safety", name: "Sécurité en montagne", description: "Météo, orage, hypothermie", icon: AlertTriangle, color: THEME.yellow },
];

const ARTICLES: Article[] = [
  // --- BACKPACK SETUP ---
  {
    id: "reglage-ceinture",
    categoryId: "backpack-setup",
    title: "Régler sa ceinture ventrale",
    summary: "80% du poids doit reposer sur vos hanches, pas sur vos épaules.",
    readTime: 3,
    priority: "essential",
    tags: ["hanches", "confort", "douleur"],
    content: [
      { heading: "Pourquoi c'est critique" },
      {
        text: "La ceinture ventrale transfère le poids du sac sur les hanches. Un réglage correct évite les douleurs d'épaules, de dos et de nuque sur le long terme.",
      },
      { heading: "La bonne méthode" },
      {
        bullets: [
          "Placez la ceinture directement sur la crête iliaque (os en haut des hanches)",
          "Serrez progressivement sans couper la respiration",
          "Le milieu de la boucle doit être aligné avec votre nombril",
          "Détendez TOTALEMENT les bretelles avant de régler la ceinture",
        ],
      },
      {
        tip: "Vérifiez qu'en sautillant sur place, le sac ne rebondit pas : c'est signe que la ceinture est bien serrée.",
      },
    ],
  },
  {
    id: "reglage-bretelles",
    categoryId: "backpack-setup",
    title: "Ordre de réglage : ceinture → bretelles → rappels",
    summary: "L'ordre de serrage conditionne 100% du confort.",
    readTime: 4,
    priority: "essential",
    tags: ["réglage", "bretelles", "ordre"],
    content: [
      { heading: "La séquence Decathlon/Deuter" },
      {
        bullets: [
          "1. Détendez TOUT avant de mettre le sac",
          "2. Serrez la ceinture ventrale sur les hanches",
          "3. Serrez les bretelles (le sac doit épouser votre dos)",
          "4. Tendez les rappels de charge (sangles hautes) pour coller le sac",
          "5. Clipser et régler le sternum (pectoraux)",
        ],
      },
      {
        warning: "Ne serrez JAMAIS les bretelles avant la ceinture : tout le poids retomberait sur vos épaules.",
      },
    ],
  },
  // --- BACKPACK FILL ---
  {
    id: "zones-sac",
    categoryId: "backpack-fill",
    title: "Les 3 zones de chargement",
    summary: "Lourd au centre-dos, léger en bas, moyen au-dessus et autour.",
    readTime: 5,
    priority: "essential",
    tags: ["organisation", "poids", "centre-gravité"],
    content: [
      { heading: "Schéma classique (ref. Deuter)" },
      {
        bullets: [
          "🔻 ZONE BASSE : duvet, vêtements légers (colchon/matelas/sacs de couchage)",
          "🎯 ZONE CENTRALE près du dos : tente, réchaud, nourriture, eau (le plus lourd)",
          "🔺 ZONE HAUTE : veste de pluie, frontale, petits accessoires",
          "👉 POCHES LATÉRALES : gourde, cartes, bâtons",
          "🧢 POCHE SUPÉRIEURE : snacks, crème solaire, téléphone",
        ],
      },
      {
        tip: "Plus le poids lourd est proche de votre colonne vertébrale, moins votre sac aura tendance à vous tirer en arrière.",
      },
    ],
  },
  {
    id: "separateurs",
    categoryId: "backpack-fill",
    title: "Sacs de compression et séparateurs",
    summary: "Gagnez 30% de place et retrouvez tout en 10 secondes.",
    readTime: 3,
    priority: "recommended",
    tags: ["compression", "organisation", "stuff-sack"],
    content: [
      { heading: "Le système Gloptroteur" },
      {
        bullets: [
          "1 sac étanche pour le duvet (imperméabilité vitale)",
          "1 sac pour les vêtements propres, 1 pour le sale",
          "1 trousse de toilette étanche type Ziploc",
          "1 pochette pharmacie identifiable (rouge de préférence)",
          "1 poche pour les papiers (passeport, permis, cash)",
        ],
      },
    ],
  },
  // --- PACKLIST ---
  {
    id: "daytour",
    categoryId: "packlist",
    title: "Checklist : randonnée à la journée",
    summary: "Le kit minimal pour une sortie de 6-8h en moyenne montagne.",
    readTime: 4,
    priority: "essential",
    tags: ["journée", "débutant", "minimal"],
    content: [
      { heading: "Les 10 essentiels (ref. Ortovox/Decathlon)" },
      {
        bullets: [
          "💧 1,5 à 2L d'eau (ou filtre + 1L)",
          "🍫 Barres, fruits secs, sandwich (~500 kcal)",
          "🧥 Veste imperméable ou coupe-vent",
          "🔦 Frontale + piles de rechange",
          "🗺 Carte + boussole (ou tel. chargé avec GPX offline)",
          "🎒 Couteau, briquet, sifflet",
          "💊 Mini-pharmacie (voir article dédié)",
          "🕶 Lunettes, crème solaire, casquette",
          "📱 Téléphone chargé à 100%",
          "📝 Laisser son itinéraire à quelqu'un",
        ],
      },
    ],
  },
  {
    id: "multiday",
    categoryId: "packlist",
    title: "Checklist : trek autonome 3-7 jours",
    summary: "GR20, TMB, Laugavegur... le matos pour dormir et cuisiner.",
    readTime: 6,
    priority: "essential",
    tags: ["trek", "bivouac", "autonomie"],
    content: [
      { heading: "En plus du kit journée" },
      {
        bullets: [
          "⛺ Tente ou tarp + piquets",
          "🛏 Duvet adapté à la température mini − 5°C",
          "🪵 Matelas autogonflant (R-value 3+)",
          "🔥 Réchaud + cartouche (prévoir 100g/jour/personne)",
          "🍳 Popote légère + fourchette-spork",
          "🧴 Gel douche biodégradable + serviette microfibre",
          "🩲 Change minimum (2 paires de chaussettes, 2 t-shirts techniques)",
          "📚 Guide topo + pages déchirables de la carte IGN",
          "🔋 Batterie externe 10000 mAh + câbles",
        ],
      },
      {
        warning: "Poids cible : 20% de votre poids corporel maximum, pack au complet.",
      },
    ],
  },
  // --- HEALTH ---
  {
    id: "trousse-base",
    categoryId: "health",
    title: "Trousse de secours essentielle",
    summary: "15 items légers qui peuvent sauver votre trek (ou votre vie).",
    readTime: 5,
    priority: "essential",
    tags: ["pharmacie", "secours", "premiers-soins"],
    content: [
      { heading: "Le must-have (ref. Croix-Rouge + Gloptroteur)" },
      {
        bullets: [
          "🩹 Pansements hydrocolloïdes pour ampoules (Compeed x10)",
          "🩹 Strips/stéristrips pour petites coupures",
          "🧻 Compresses stériles + bande auto-adhésive",
          "💊 Paracétamol + Ibuprofène (douleur, fièvre)",
          "💊 Immodium (tourista)",
          "💊 Antihistaminiques (piqûres, allergies)",
          "🧪 Désinfectant (Chlorhexidine en unidose)",
          "✂️ Pince à tiques + ciseaux multitools",
          "🦷 Fil dentaire = coud tout, répare les sangles",
          "🧂 Électrolytes en poudre (Aptonia, SIS)",
          "🧴 Crème solaire SPF 50 + stick lèvres",
          "🦟 Répulsif moustiques/tiques (DEET 30%)",
          "📜 Survie : couverture de survie 100g",
          "🧤 Gants jetables (manipulation blessures)",
          "📞 N° urgences locaux notés PAPIER",
        ],
      },
    ],
  },
  {
    id: "ampoules",
    categoryId: "health",
    title: "Prévenir et soigner les ampoules",
    summary: "80% des abandons en randonnée sont dus aux pieds.",
    readTime: 4,
    priority: "essential",
    tags: ["pieds", "chaussures", "ampoules"],
    content: [
      { heading: "Prévention" },
      {
        bullets: [
          "Chaussettes techniques anti-frottement (laine mérinos)",
          "Rodez vos chaussures avant le trek (min. 50 km)",
          "Doubler avec des chaussettes fines en soie",
          "Tape préventif sur les zones sensibles (talons, orteils)",
        ],
      },
      { heading: "Si ampoule formée" },
      {
        bullets: [
          "NE PAS percer si elle n'est pas ouverte (peau = barrière)",
          "Désinfecter autour, poser un Compeed qui RESTE plusieurs jours",
          "Si percée : désinfecter, pansement stérile aéré",
        ],
      },
      {
        warning: "Douleur forte + rougeur qui s'étend = redescendre, risque d'infection.",
      },
    ],
  },
  // --- NUTRITION ---
  {
    id: "calories-trek",
    categoryId: "nutrition",
    title: "Combien de calories pour un trek ?",
    summary: "3000-5000 kcal/jour selon le dénivelé et la température.",
    readTime: 4,
    priority: "recommended",
    tags: ["calories", "effort", "énergie"],
    content: [
      { heading: "Besoins énergétiques" },
      {
        bullets: [
          "Randonnée modérée : 2500-3500 kcal/jour",
          "Trek exigeant (D+ 1500m) : 3500-4500 kcal/jour",
          "Haute altitude + froid : jusqu'à 5500 kcal/jour",
        ],
      },
      { heading: "Répartition idéale" },
      {
        bullets: [
          "🍞 Glucides : 55-60% (pâtes, riz, barres)",
          "🥑 Lipides : 25-30% (noix, fromage, chocolat)",
          "🥩 Protéines : 15-20% (lyophilisés, jerky, thon)",
        ],
      },
      {
        tip: "Le chocolat noir 70% + amandes = LA combinaison rapport poids/énergie imbattable (550 kcal/100g).",
      },
    ],
  },
  {
    id: "hydratation",
    categoryId: "nutrition",
    title: "Hydratation en trek : les règles",
    summary: "3 à 5 litres par jour, électrolytes obligatoires au-delà de 2h d'effort.",
    readTime: 3,
    priority: "essential",
    tags: ["eau", "hydratation", "électrolytes"],
    content: [
      { heading: "Quantités" },
      {
        bullets: [
          "Base : 2,5L/jour minimum",
          "Effort soutenu : +500ml/heure de marche",
          "Chaleur : doubler les quantités",
          "Altitude : l'air sec augmente les pertes (+30%)",
        ],
      },
      { heading: "Sources d'eau en trek" },
      {
        bullets: [
          "🚰 Fontaines/refuges : boire direct (sauf doute)",
          "🏞 Rivière/lac : filtrer OU bouillir 1 min OU pastilles",
          "❄️ Neige : toujours faire fondre, jamais manger directe",
        ],
      },
      {
        warning: "Eau stagnante = NEVER. Privilégier l'eau courante et claire, en amont des pâturages.",
      },
    ],
  },
  // --- NAVIGATION ---
  {
    id: "cartes-ign",
    categoryId: "navigation",
    title: "Lire une carte IGN 1:25000",
    summary: "Le B.A.-BA de la cartographie randonnée.",
    readTime: 6,
    priority: "recommended",
    tags: ["carte", "IGN", "topographie"],
    content: [
      { heading: "Les essentiels" },
      {
        bullets: [
          "📐 Échelle 1:25000 = 1cm sur carte = 250m réels",
          "〰️ Courbes de niveau : tous les 10m (verticales)",
          "🟢 Traits rouges/bleus : GR, PR, sentiers balisés",
          "🏠 Pictogrammes : refuges, gîtes, sources d'eau",
          "🧭 Rose des vents : Nord GEOGRAPHIQUE (pas magnétique)",
        ],
      },
      { heading: "Calculer une durée" },
      {
        bullets: [
          "Plat : 4 km/h (15min/km)",
          "Montée : +1h par 300m de D+",
          "Descente technique : compter comme une montée",
        ],
      },
    ],
  },
  {
    id: "gpx-offline",
    categoryId: "navigation",
    title: "GPX offline : Gaia, Komoot, OSM",
    summary: "Jamais dépendant du réseau en montagne.",
    readTime: 4,
    priority: "essential",
    tags: ["GPX", "téléphone", "offline"],
    content: [
      { heading: "Applications fiables" },
      {
        bullets: [
          "🥇 Gaia GPS : référence pro, couches IGN payantes",
          "🥈 Komoot : planification facile, export GPX",
          "🥉 OsmAnd : 100% gratuit, OpenStreetMap",
          "🎯 iPhiGéNie : officiel IGN France, 3€/mois",
        ],
      },
      { heading: "Avant de partir" },
      {
        bullets: [
          "Télécharger la zone en mode offline (x3 de marge)",
          "Importer votre GPX dans l'app",
          "Tester EN VOITURE ou chez soi que ça marche en mode avion",
          "Batterie externe indispensable (GPS = 10%/heure)",
        ],
      },
      {
        tip: "Activez le mode avion + localisation : le GPS fonctionne sans réseau et économise 50% de batterie.",
      },
    ],
  },
  // --- SAFETY ---
  {
    id: "orage",
    categoryId: "safety",
    title: "Que faire en cas d'orage ?",
    summary: "Priorité : descendre immédiatement, abandonner tout objet métallique.",
    readTime: 4,
    priority: "essential",
    tags: ["orage", "foudre", "danger"],
    content: [
      { heading: "Détection" },
      {
        bullets: [
          "⚡ Règle 30/30 : si éclair→tonnerre < 30s = orage à 10km",
          "☁️ Nuages cumulonimbus : verticale > 10km, enclume au sommet",
          "🌬 Changement brutal de température + vent soudain",
        ],
      },
      { heading: "Réflexes vitaux" },
      {
        bullets: [
          "🏃 DESCENDRE IMMÉDIATEMENT sous 2500m",
          "🔌 Abandonner : bâtons métalliques, piolets, sacs à armature",
          "🚫 ÉVITER : crêtes, sommets, arbres isolés, cavités peu profondes",
          "✅ PRIVILÉGIER : vallée, forêt dense, blocs rocheux (à 5m)",
          "🧘 Position de foudroyé : accroupi, pieds joints, sac ISOLANT sous les fesses",
        ],
      },
      {
        warning: "Ne JAMAIS s'abriter sous un arbre isolé : c'est le pire endroit.",
      },
    ],
  },
  {
    id: "hypothermie",
    categoryId: "safety",
    title: "Reconnaître et traiter l'hypothermie",
    summary: "Ça tue en 2h, même à 10°C si vous êtes mouillé et fatigué.",
    readTime: 5,
    priority: "essential",
    tags: ["froid", "hypothermie", "urgence"],
    content: [
      { heading: "Les 4 stades" },
      {
        bullets: [
          "😰 LÉGÈRE (35-32°C) : frissons, peau froide, confusion",
          "😨 MODÉRÉE (32-28°C) : frissons STOPPENT, léthargie, raideur",
          "💀 SÉVÈRE (<28°C) : perte de conscience, pouls lent",
          "⚠️ Le pire signe : la personne ne frissonne PLUS",
        ],
      },
      { heading: "Action immédiate" },
      {
        bullets: [
          "Abriter du vent et de la pluie ABSOLUMENT",
          "Retirer vêtements mouillés, remplacer par du sec + couverture",
          "Boissons chaudes sucrées (JAMAIS d'alcool)",
          "Réchauffer le TRONC (pas les membres), contact corps-à-corps",
          "Si inconscient : position latérale + alerter 112 (18 montagne)",
        ],
      },
    ],
  },
];

// ============================================================================
// TIPS DU JOUR (rotation)
// ============================================================================
const DAILY_TIPS: { icon: IconType; color: string; title: string; text: string }[] = [
  { icon: Footprints, color: THEME.red, title: "Règle du 50/50", text: "50% du poids sur les hanches, 50 pas de test avant de partir. Si ça tire, on ajuste." },
  { icon: Droplets, color: THEME.cyan, title: "Boire avant d'avoir soif", text: "La soif apparaît déjà à 2% de déshydratation. Buvez 250ml toutes les 30 min." },
  { icon: Thermometer, color: THEME.violet, title: "Système 3 couches", text: "Base technique + isolation (polaire) + coupe-vent/pluie. Adaptable à 90% des situations." },
  { icon: Compass, color: THEME.emerald, title: "Le pouce du Sud", text: "Entre 11h et 13h au soleil, votre pouce droit pointe vers le Sud si bras tendu vers l'astre." },
  { icon: Heart, color: THEME.pink, title: "Zone 2 cardio", text: "Marchez à 70% de votre FC max : c'est le rythme qui vous permettra de tenir 8h sans épuisement." },
];

// ============================================================================
// GLOSSAIRE TREK
// ============================================================================
const GLOSSARY: { term: string; def: string }[] = [
  { term: "D+", def: "Dénivelé positif cumulé en mètres. 1000m D+ = 3-4h d'effort pour un randonneur moyen." },
  { term: "GR", def: "Grande Randonnée. Sentiers balisés blanc/rouge en France, sur plusieurs jours." },
  { term: "PR", def: "Promenade et Randonnée. Balisages jaune, en boucle, sur la journée." },
  { term: "Bivouac", def: "Nuit en tente dans la nature. Autorisé la nuit seulement dans les parcs nationaux (19h-9h)." },
  { term: "Refuge", def: "Structure gardée ou non en montagne. En gardé, demi-pension ~55€/nuit, résa obligatoire." },
  { term: "Pack Base Weight", def: "Poids du sac SANS nourriture/eau/carburant. Objectif UL : <5kg. Standard : 7-10kg." },
  { term: "R-value", def: "Indice d'isolation d'un matelas. R3 = 3 saisons, R5+ = hiver." },
  { term: "Dog-tags", def: "Plaque d'identification portée au cou : nom, téléphone, allergies, groupe sanguin." },
];

// ============================================================================
// PAGE
// ============================================================================
export default function SherpaPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  const filteredArticles = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ARTICLES.filter((a) => {
      if (activeCategory && a.categoryId !== activeCategory) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.tags.some((t) => t.includes(q))
      );
    });
  }, [query, activeCategory]);

  const essentialArticles = ARTICLES.filter((a) => a.priority === "essential");
  const currentTip = DAILY_TIPS[tipIndex];

  return (
    <div className="min-h-screen bg-[#050505] font-sans pb-16 selection:bg-red-600/30">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6">

        {/* ============ HEADER ============ */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">
              Centre de connaissances
            </span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 flex items-center gap-3">
                <Mountain className="text-[#f21e2c]" size={42} strokeWidth={1.5} />
                Le Sherpa
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl">
                Tous les conseils éprouvés du terrain : régler son sac, préparer ses pieds, gérer
                un orage, calculer ses rations. Fait par des randonneurs, pour des randonneurs.
              </p>
            </div>

            {/* Stats globales */}
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Articles" value={ARTICLES.length} color={THEME.red} />
              <MiniStat label="Catégories" value={CATEGORIES.length} color={THEME.orange} />
              <MiniStat
                label="Essentiels"
                value={essentialArticles.length}
                color={THEME.emerald}
              />
            </div>
          </div>
        </header>

        {/* ============ SEARCH ============ */}
        <div className="relative mb-8">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher : ampoule, orage, GPX, lyophilisé…"
            className="w-full h-14 pl-12 pr-12 rounded-2xl bg-[#111] border border-white/[0.08] text-white placeholder:text-zinc-500 focus:outline-none focus:border-red-600/50 text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 flex items-center justify-center"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* ============ CATEGORIES ============ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <CategoryChip
            active={activeCategory === null}
            onClick={() => setActiveCategory(null)}
            name="Tous les sujets"
            description="Tout afficher"
            icon={Sparkles}
            color="#ffffff"
            count={ARTICLES.length}
          />
          {CATEGORIES.map((cat) => {
            const count = ARTICLES.filter((a) => a.categoryId === cat.id).length;
            return (
              <CategoryChip
                key={cat.id}
                active={activeCategory === cat.id}
                onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
                name={cat.name}
                description={cat.description}
                icon={cat.icon}
                color={cat.color}
                count={count}
              />
            );
          })}
        </div>

        {/* ============ MAIN GRID ============ */}
        <div className="grid grid-cols-12 gap-6">
          {/* ARTICLES */}
          <div className="col-span-12 lg:col-span-8">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {activeCategory
                    ? CATEGORIES.find((c) => c.id === activeCategory)?.name
                    : "Articles du Sherpa"}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {filteredArticles.length} article{filteredArticles.length > 1 ? "s" : ""}
                  {query && ` pour "${query}"`}
                </p>
              </div>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#111] py-16 text-center">
                <Search size={24} className="text-zinc-600 mx-auto mb-3" />
                <div className="text-sm font-bold text-white">Aucun article trouvé</div>
                <div className="text-xs text-zinc-500 mt-1">
                  Essayez un autre mot-clé ou changez de catégorie
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onOpen={() => setOpenArticle(article)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <aside className="col-span-12 lg:col-span-4 space-y-4">
            {/* Tip du jour */}
            <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#111] to-[#0a0a0a] p-5 relative overflow-hidden">
              <div
                className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: currentTip.color }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={14} className="text-yellow-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                      Tip du jour
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 tabular-nums">
                    {tipIndex + 1}/{DAILY_TIPS.length}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${currentTip.color}20` }}
                  >
                    <currentTip.icon size={18} style={{ color: currentTip.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white mb-1">{currentTip.title}</div>
                    <div className="text-xs text-zinc-400 leading-relaxed">{currentTip.text}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() =>
                      setTipIndex((i) => (i - 1 + DAILY_TIPS.length) % DAILY_TIPS.length)
                    }
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <div className="flex gap-1">
                    {DAILY_TIPS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setTipIndex(i)}
                        className={cn(
                          "h-1 rounded-full transition-all",
                          i === tipIndex ? "w-6 bg-white" : "w-1.5 bg-white/20"
                        )}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setTipIndex((i) => (i + 1) % DAILY_TIPS.length)}
                    className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Glossaire */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#111] p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={14} className="text-[#f21e2c]" />
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Glossaire du trek
                </span>
              </div>
              <div className="space-y-2.5">
                {GLOSSARY.slice(0, 6).map((item) => (
                  <div key={item.term} className="group">
                    <div className="text-xs font-bold text-white mb-0.5">{item.term}</div>
                    <div className="text-[11px] text-zinc-500 leading-relaxed">{item.def}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to action */}
            <div className="rounded-2xl border border-red-600/20 bg-gradient-to-br from-red-600/10 to-orange-500/5 p-5">
              <div className="flex items-start gap-3">
                <Flame size={24} className="text-[#f21e2c] shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-black text-white mb-1">Prêt pour la montagne ?</div>
                  <div className="text-xs text-zinc-400 leading-relaxed mb-3">
                    Charger ces conseils dans votre timeline de préparation.
                  </div>
                  <button className="inline-flex items-center gap-2 text-xs font-bold text-[#f21e2c] hover:text-red-400 transition-colors">
                    Voir ma timeline <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* ============ ARTICLE DETAIL MODAL ============ */}
      <AnimatePresence>
        {openArticle && (
          <ArticleModal article={openArticle} onClose={() => setOpenArticle(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

const MiniStat = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="rounded-xl border border-white/[0.08] bg-[#111] px-4 py-3 min-w-[90px]">
    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</div>
    <div className="text-2xl font-black tabular-nums mt-0.5" style={{ color }}>
      {value}
    </div>
  </div>
);

const CategoryChip = ({
  active,
  onClick,
  name,
  description,
  icon: Icon,
  color,
  count,
}: {
  active: boolean;
  onClick: () => void;
  name: string;
  description: string;
  icon: IconType;
  color: string;
  count: number;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "group flex items-start gap-3 p-4 rounded-2xl border text-left transition-all",
      active
        ? "bg-white/10 border-white/30"
        : "bg-[#111] border-white/[0.08] hover:bg-[#161616] hover:border-white/20"
    )}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon size={18} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-white truncate">{name}</span>
        <span className="text-[10px] font-bold text-zinc-500 tabular-nums">{count}</span>
      </div>
      <div className="text-[11px] text-zinc-500 truncate mt-0.5">{description}</div>
    </div>
  </button>
);

const PRIORITY_CFG = {
  essential: { label: "Essentiel", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  recommended: { label: "Recommandé", color: "#eab308", bg: "rgba(234,179,8,0.12)" },
  advanced: { label: "Avancé", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
};

const ArticleCard = ({ article, onOpen }: { article: Article; onOpen: () => void }) => {
  const cat = CATEGORIES.find((c) => c.id === article.categoryId);
  const prio = PRIORITY_CFG[article.priority];
  const Icon = cat?.icon || BookOpen;

  return (
    <button
      onClick={onOpen}
      className="w-full group flex items-start gap-4 p-5 rounded-2xl border border-white/[0.08] bg-[#111] hover:bg-[#161616] hover:border-white/20 transition-all text-left"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${cat?.color}20` }}
      >
        <Icon size={20} style={{ color: cat?.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-1">
          <span className="text-base font-bold text-white">{article.title}</span>
          <ChevronRight
            size={16}
            className="text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0 mt-1"
          />
        </div>
        <div className="text-xs text-zinc-400 leading-relaxed mb-3">{article.summary}</div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
            style={{ backgroundColor: prio.bg, color: prio.color }}
          >
            {prio.label}
          </span>
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Clock size={10} /> {article.readTime} min
          </span>
          {article.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400"
            >
              #{t}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
};

const ArticleModal = ({ article, onClose }: { article: Article; onClose: () => void }) => {
  const cat = CATEGORIES.find((c) => c.id === article.categoryId);
  const prio = PRIORITY_CFG[article.priority];
  const Icon = cat?.icon || BookOpen;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border border-white/10 bg-[#0d0d0d] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${cat?.color}20` }}
          >
            <Icon size={22} style={{ color: cat?.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                style={{ backgroundColor: prio.bg, color: prio.color }}
              >
                {prio.label}
              </span>
              <span className="text-[11px] text-zinc-500">{cat?.name}</span>
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Clock size={10} /> {article.readTime} min
              </span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight">{article.title}</h2>
            <p className="text-sm text-zinc-400 mt-1">{article.summary}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {article.content.map((block, i) => (
            <div key={i}>
              {block.heading && (
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-[#f21e2c]" />
                  {block.heading}
                </h3>
              )}
              {block.text && (
                <p className="text-sm text-zinc-300 leading-relaxed">{block.text}</p>
              )}
              {block.bullets && (
                <ul className="space-y-2">
                  {block.bullets.map((b, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-zinc-300">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f21e2c] shrink-0" />
                      <span className="leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              )}
              {block.warning && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-white leading-relaxed">
                    <span className="font-bold text-red-400">Attention : </span>
                    {block.warning}
                  </div>
                </div>
              )}
              {block.tip && (
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-start gap-3">
                  <Lightbulb size={18} className="text-yellow-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-white leading-relaxed">
                    <span className="font-bold text-yellow-400">Astuce : </span>
                    {block.tip}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Tags */}
          <div className="pt-4 border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mr-1">
              Mots-clés :
            </span>
            {article.tags.map((t) => (
              <span
                key={t}
                className="text-[11px] px-2 py-1 rounded-lg bg-white/5 text-zinc-300"
              >
                #{t}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Source : randonneurs · terrain · Decathlon, Deuter, Croix-Rouge
          </span>
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-[#f21e2c] hover:bg-[#B21D3B] text-white text-xs font-bold transition-colors"
          >
            Compris, merci Sherpa
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
