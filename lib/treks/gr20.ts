import { Trek } from "@/types";

export const GR20: Trek = {
  id: "gr20",
  slug: "gr20-corse",
  name: "GR20 CORSE",
  subtitle: "Le Sentier Mythique",
  description: "Considéré comme le trek le plus difficile d'Europe, le GR20 traverse la Corse en diagonale du Nord au Sud. C'est un terrain alpin, minéral, technique, où l'on 'met les mains' souvent. Une aventure brute et sauvage.",
  
  category: "Aventure",
  theme: "sport", // Donne le thème Orange/Sportif
  location: "Corse, France",
  country: ["France"],

  // ✅ CORRECTION ICI : Chemin web absolu depuis le dossier public
  heroImage: "/images/corse_GR20.png",
  
  statusBadge: "Ouvert",
  primaryAccess: "plane",

  accessDetails: {
    primaryLocation: "Calenzana (Nord)",
    airportCode: "CLY (Calvi)",
    advice: "Prendre un taxi ou la navette depuis l'aéroport de Calvi jusqu'au gîte d'étape de Calenzana.",
    railwayStation: "Gare de Calvi"
  },

  stats: {
    dist: 180,
    dplus: 11000,
    dminus: 11000,
    days: 16,
    difficulty: 5,
    maxAltitude: 2607,
  },

  bestSeason: ["Juin", "Juillet", "Août", "Septembre"],

  stages: [
    {
      id: 1,
      code: "J01",
      title: "Calenzana → Ortu di u Piobbu",
      description: "Entrée directe dans le vif du sujet. 1300m de D+ pour commencer sous la chaleur. Vue mer inoubliable.",
      stats: { dist: 11, dplus: 1295, dminus: 50, duration: "6h30" },
      profile: [275, 800, 1200, 1500, 1520],
      pois: [{ x: 100, label: "Refuge Ortu" }],
      tags: ["Départ", "Vue Mer"]
    },
    {
      id: 2,
      code: "J02",
      title: "Ortu di u Piobbu → Carrozzu",
      description: "Passage de bocca (cols) techniques. Terrain très rocailleux et descente abrupte vers Carrozzu.",
      stats: { dist: 8, dplus: 700, dminus: 900, duration: "7h" },
      profile: [1520, 1800, 2000, 1500, 1270],
      pois: [{ x: 100, label: "Refuge Carrozzu" }],
      tags: ["Technique", "Rocailleux"]
    },
    {
      id: 3,
      code: "J03",
      title: "Carrozzu → Asco Stagnu",
      description: "La célèbre passerelle de Spasimata (suspendue) puis longue montée vers le lac de la Muvrella. Arrivée à la station d'Asco.",
      stats: { dist: 6, dplus: 800, dminus: 650, duration: "6h" },
      profile: [1270, 1500, 2000, 1422],
      pois: [{ x: 20, label: "Passerelle" }, { x: 100, label: "Asco (Haut-Lieu)" }],
      tags: ["Passerelle", "Lac"]
    },
    {
      id: 4,
      code: "J04",
      title: "Asco Stagnu → Tighjettu",
      description: "L'étape reine (anciennement Cirque de la Solitude, maintenant par le Monte Cinto). Passage à 2607m. Ambiance haute montagne austère.",
      stats: { dist: 8, dplus: 1200, dminus: 1000, duration: "8h" },
      profile: [1422, 2000, 2607, 2000, 1683],
      pois: [{ x: 50, label: "Pte Eboulis (2607m)" }],
      tags: ["Sommet", "Difficile"]
    },
    {
      id: 5,
      code: "J05",
      title: "Tighjettu → Ciottulu di i Mori",
      description: "Étape plus courte mais scénique. Passage au pied de la Paglia Orba, le 'Cervin Corse'.",
      stats: { dist: 7, dplus: 600, dminus: 300, duration: "4h" },
      profile: [1683, 1800, 1900, 1991],
      pois: [{ x: 100, label: "Refuge Ciottulu" }],
      tags: ["Paglia Orba"]
    },
    {
      id: 6,
      code: "J06",
      title: "Ciottulu → Manganu",
      description: "Longue traversée, passage par le célèbre Lac de Nino et ses pozzines (pelouses humides). Chevaux sauvages fréquents.",
      stats: { dist: 23, dplus: 650, dminus: 1050, duration: "8h" },
      profile: [1991, 1400, 1700, 1600],
      pois: [{ x: 40, label: "Lac de Nino" }],
      tags: ["Lac de Nino", "Pozzines"]
    },
    {
      id: 7,
      code: "J07",
      title: "Manganu → Petra Piana",
      description: "Passage par la brèche de Capitello. Très aérien, chaînes, neige tardive possible. Vue sur les lacs de Melo et Capitello.",
      stats: { dist: 10, dplus: 850, dminus: 600, duration: "6h30" },
      profile: [1600, 2000, 2225, 1842],
      pois: [{ x: 50, label: "Brèche Capitello" }],
      tags: ["Aérien", "Brèche"]
    },
    {
      id: 8,
      code: "J08",
      title: "Petra Piana → L'Onda",
      description: "Descente vers la vallée ou variante alpine par les crêtes (recommandée par beau temps pour la vue).",
      stats: { dist: 10, dplus: 400, dminus: 800, duration: "4h30" },
      profile: [1842, 1400, 1430],
      pois: [{ x: 100, label: "Refuge L'Onda" }],
      tags: ["Crêtes", "Variante"]
    },
    {
      id: 9,
      code: "J09",
      title: "L'Onda → Vizzavona",
      description: "Fin de la partie Nord. Cascades des Anglais avant l'arrivée à la gare de Vizzavona. Ravitaillement possible.",
      stats: { dist: 10, dplus: 700, dminus: 1200, duration: "6h" },
      profile: [1430, 2100, 900],
      pois: [{ x: 40, label: "Pte Muratello" }, { x: 100, label: "Vizzavona" }],
      tags: ["Final Nord", "Cascade"]
    },
    {
      id: 10,
      code: "J10",
      title: "Vizzavona → Capannelle",
      description: "Reprise en douceur dans la forêt. Sentier plus roulant, moins technique que le Nord.",
      stats: { dist: 15, dplus: 900, dminus: 200, duration: "5h30" },
      profile: [900, 1200, 1586],
      pois: [{ x: 100, label: "Bergerie Capannelle" }],
      tags: ["Forêt", "Roulant"]
    },
    {
      id: 11,
      code: "J11",
      title: "Capannelle → Prati",
      description: "Montée vers le col de Verde puis Prati. Vue spectaculaire sur la mer Tyrrhénienne.",
      stats: { dist: 17, dplus: 900, dminus: 650, duration: "6h" },
      profile: [1586, 1800, 1820],
      pois: [{ x: 100, label: "Refuge Prati" }],
      tags: ["Vue Mer", "Plateau"]
    },
    {
      id: 12,
      code: "J12",
      title: "Prati → Usciolu",
      description: "La fameuse étape des crêtes du Sud. Montagnes russes, vent fréquent, vues sublimes des deux côtés de l'île.",
      stats: { dist: 11, dplus: 700, dminus: 750, duration: "6h" },
      profile: [1820, 2000, 1500, 1750],
      pois: [{ x: 50, label: "Les Crêtes" }],
      tags: ["Crêtes", "Vent"]
    },
    {
      id: 13,
      code: "J13",
      title: "Usciolu → Matalza",
      description: "Traversée du plateau du Cuscione. Paysage très différent, vert, ruisseaux et chevaux sauvages.",
      stats: { dist: 11, dplus: 400, dminus: 600, duration: "4h30" },
      profile: [1750, 1500, 1400],
      pois: [{ x: 50, label: "Plateau Cuscione" }],
      tags: ["Cheval Sauvage"]
    },
    {
      id: 14,
      code: "J14",
      title: "Matalza → Asinau",
      description: "Montée vers le Monte Incudine (2134m), point culminant du Sud. Vue panoramique incroyable.",
      stats: { dist: 10, dplus: 650, dminus: 550, duration: "4h" },
      profile: [1400, 2134, 1530],
      pois: [{ x: 50, label: "Incudine" }],
      tags: ["Sommet Sud"]
    },
    {
      id: 15,
      code: "J15",
      title: "Asinau → Paliri",
      description: "Traversée des Aiguilles de Bavella (variante alpine recommandée). Décors grandioses de tours granitiques.",
      stats: { dist: 15, dplus: 450, dminus: 900, duration: "7h" },
      profile: [1530, 1200, 1055],
      pois: [{ x: 40, label: "Bavella" }],
      tags: ["Aiguilles", "Grandioses"]
    },
    {
      id: 16,
      code: "J16",
      title: "Paliri → Conca",
      description: "Dernière descente vers la chaleur, le maquis et l'arrivée mythique au panneau de Conca.",
      stats: { dist: 12, dplus: 160, dminus: 900, duration: "5h" },
      profile: [1055, 800, 250],
      pois: [{ x: 100, label: "Conca (Arrivée)" }],
      tags: ["Arrivée", "Final"]
    },
  ],
};