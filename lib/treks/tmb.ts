import { Trek } from "@/types";

export const TMB: Trek = {
  id: "tmb",
  slug: "tour-mont-blanc",
  name: "TOUR DU MONT BLANC",
  subtitle: "Boucle Intégrale",
  description: "Le Tour du Mont-Blanc est une boucle grandiose autour du toit de l'Europe. YETI a préparé le découpage classique en 9 étapes, optimisé pour profiter des refuges confortables et des panoramas glaciaires.",
  
  category: "Haute Montagne",
  theme: "sport",
  location: "France / Italie / Suisse",
  country: ["France", "Italie", "Suisse"],
  
  heroImage: "https://www.annecy-ville.fr/wp-content/uploads/2024/01/view-of-mont-blanc-summit-from-mont-saleve-haute-2023-11-27-04-53-45-utc.jpg",
  
  statusBadge: "Refuges Ouverts",
  primaryAccess: "train",

  accessDetails: {
    primaryLocation: "Les Houches (Chamonix)",
    airportCode: "GVA (Genève)",
    advice: "Train Léman Express jusqu'à Saint-Gervais puis Mont-Blanc Express.",
    railwayStation: "Gare des Houches"
  },

  stats: {
    dist: 163,
    dplus: 10000,
    dminus: 10000,
    days: 9,
    difficulty: 3.5,
    maxAltitude: 2665,
  },

  bestSeason: ["Juin", "Juillet", "Août", "Septembre"],

  stages: [
    {
      id: 1,
      code: "J01",
      title: "Les Houches → Les Contamines",
      description: "Départ classique depuis les Houches. Montée au Col de Voza.",
      stats: { dist: 17, dplus: 950, dminus: 600, duration: "5h30" },
      profile: [1000, 1200, 1653, 1400, 1164],
      pois: [{ x: 40, label: "Col de Voza" }, { x: 100, label: "Contamines" }],
      tags: ["Départ", "Mise en jambes"]
    },
    {
      id: 2,
      code: "J02",
      title: "Les Contamines → Les Chapieux",
      description: "Montée progressive vers le Col du Bonhomme.",
      stats: { dist: 18, dplus: 1200, dminus: 900, duration: "7h" },
      profile: [1164, 1800, 2329, 2433, 1549],
      pois: [{ x: 50, label: "Col Bonhomme" }],
      tags: ["2 Cols", "Panoramas"]
    },
    {
      id: 3,
      code: "J03",
      title: "Les Chapieux → Courmayeur",
      description: "Passage de la frontière italienne au Col de la Seigne.",
      stats: { dist: 20, dplus: 850, dminus: 1300, duration: "6h30" },
      profile: [1549, 2000, 2516, 1800, 1224],
      pois: [{ x: 45, label: "Col Seigne (IT)" }],
      tags: ["Italie", "Col de la Seigne"]
    },
    {
      id: 4,
      code: "J04",
      title: "Courmayeur → Refuge Bonatti",
      description: "Balcon du Val Ferret face aux Grandes Jorasses.",
      stats: { dist: 14, dplus: 1100, dminus: 500, duration: "5h" },
      profile: [1224, 1600, 2000, 2025],
      pois: [{ x: 100, label: "Bonatti" }],
      tags: ["Grandes Jorasses"]
    },
    {
      id: 5,
      code: "J05",
      title: "Refuge Bonatti → La Fouly",
      description: "Passage en Suisse par le Grand Col Ferret.",
      stats: { dist: 18, dplus: 750, dminus: 1200, duration: "6h" },
      profile: [2025, 2300, 2537, 2000, 1593],
      pois: [{ x: 40, label: "Gd Col Ferret (CH)" }],
      tags: ["Suisse", "Frontière"]
    },
    {
      id: 6,
      code: "J06",
      title: "La Fouly → Champex",
      description: "Étape de transition bucolique vers le lac de Champex.",
      stats: { dist: 15, dplus: 600, dminus: 700, duration: "4h30" },
      profile: [1593, 1400, 1500, 1466],
      pois: [{ x: 100, label: "Lac Champex" }],
      tags: ["Lac", "Repos"]
    },
    {
      id: 7,
      code: "J07",
      title: "Champex → Trient",
      description: "La terrible Fenêtre d'Arpette, point culminant du tour.",
      stats: { dist: 16, dplus: 1050, dminus: 1200, duration: "7h" },
      profile: [1466, 2000, 2665, 1800, 1297],
      pois: [{ x: 55, label: "Fenêtre Arpette" }],
      tags: ["Point Culminant", "Technique"]
    },
    {
      id: 8,
      code: "J08",
      title: "Trient → Argentière",
      description: "Retour en France par le Col de Balme. Vue Mont-Blanc.",
      stats: { dist: 16, dplus: 900, dminus: 950, duration: "5h30" },
      profile: [1297, 1800, 2191, 1700, 1252],
      pois: [{ x: 50, label: "Col de Balme (FR)" }],
      tags: ["France", "Vue"]
    },
    {
      id: 9,
      code: "J09",
      title: "Argentière → Les Houches",
      description: "Le balcon sud des Aiguilles Rouges face au Mont-Blanc.",
      stats: { dist: 19, dplus: 600, dminus: 850, duration: "6h" },
      profile: [1252, 1600, 1877, 1400, 1000],
      pois: [{ x: 40, label: "La Flégère" }, { x: 100, label: "Les Houches" }],
      tags: ["Final", "Panoramas"]
    },
  ],
};