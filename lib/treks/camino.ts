import { Trek } from "@/types";

export const CAMINO: Trek = {
    id: "camino",
    slug: "camino",
    name: "CAMINO DE SANTIAGO",
    subtitle: "Le Chemin des Étoiles",
    description: "Plus qu'une randonnée, le Camino de Santiago est une immersion dans l'histoire européenne. Des Pyrénées à la Galice, vous traverserez des paysages variés : montagnes, vignobles, plateaux désertiques et forêts humides.",
    category: "pelerinage",
    location: "France / Espagne",
    heroImage: "https://static.nationalgeographic.fr/files/styles/image_3200/public/camino-prepped-1.webp?w=1600&h=900",
    theme: "spirit",
    
    // NOUVEAU : Détails Logistique (D)
    primaryAccess: "train",
    accessDetails: {
        primaryLocation: "Saint-Jean-Pied-de-Port",
        airportCode: "BIQ (Biarritz, France)",
        railwayStation: "Gare de Saint-Jean-Pied-de-Port (depuis Bayonne)",
        advice: "Accès facile par train régional depuis Bayonne. Le Chemin commence dès la sortie de la gare."
    },
    
    // NOUVEAU : Expert du parcours (E)
    expert: {
        name: "Maria González",
        title: "Pèlerine Confirmée & Hospitalière",
        photoUrl: "/images/experts/maria.jpg", 
    },

    stats: {
        dist: 780,
        dplus: 12000,
        dminus: 12000,
        days: 32,
        difficulty: 2.0,
        maxAltitude: 1430,
    },
    
    bestSeason: ["Avril", "Mai", "Septembre", "Octobre"],

    stages: [
        {
            id: 1,
            code: "S01",
            title: "Saint-Jean → Roncevaux",
            description: "Traversée mythique des Pyrénées. Étape la plus dure du Camino.",
            stats: { dist: 25, dplus: 1400, dminus: 600 },
            profile: [200, 600, 1000, 1430, 950],
            pois: [{ x: 75, label: "Col Lepoeder" }],
            tags: ["Montagne", "Départ", "Physique"]
        },
        // ... (étapes 2 à 7 inchangées)
        {
            id: 2,
            code: "S02",
            title: "Roncevaux → Pamplona",
            description: "Descente vers la Navarre. Forêts de hêtres, villages basques.",
            stats: { dist: 65, dplus: 800, dminus: 1200 },
            profile: [950, 800, 600, 500, 450],
            pois: [{ x: 100, label: "Pamplona" }],
            tags: ["Navarre", "Culture"]
        },
        {
            id: 3,
            code: "S03",
            title: "Pamplona → Logroño",
            description: "Alto del Perdón avec ses sculptures de pèlerins. Entrée dans la Rioja.",
            stats: { dist: 95, dplus: 1100, dminus: 1000 },
            profile: [450, 780, 500, 600, 400],
            pois: [{ x: 15, label: "Alto Perdón" }, { x: 100, label: "Logroño" }],
            tags: ["Vignobles", "Alto del Perdón"]
        },
        {
            id: 4,
            code: "S04",
            title: "Logroño → Burgos",
            description: "Traversée de la Rioja puis entrée en Castille.",
            stats: { dist: 120, dplus: 1500, dminus: 1300 },
            profile: [400, 600, 800, 900, 860],
            pois: [{ x: 100, label: "Burgos" }],
            tags: ["Castille", "Villes Impériales"]
        },
        {
            id: 5,
            code: "S05",
            title: "Burgos → León",
            description: "La Meseta : plateau infini de Castille. Solitude et introspection. Le défi mental.",
            stats: { dist: 180, dplus: 2000, dminus: 2000 },
            profile: [860, 900, 950, 900, 850],
            pois: [{ x: 50, label: "Meseta" }, { x: 100, label: "León" }],
            tags: ["Meseta", "Chaleur"]
        },
        {
            id: 6,
            code: "S06",
            title: "León → O Cebreiro",
            description: "Monts de León et entrée en Galice. Passage symbolique de la Cruz de Ferro.",
            stats: { dist: 150, dplus: 2500, dminus: 2200 },
            profile: [850, 700, 1500, 1000, 1300],
            pois: [{ x: 50, label: "Cruz de Ferro" }],
            tags: ["Cruz de Ferro", "Galice"]
        },
        {
            id: 7,
            code: "S07",
            title: "O Cebreiro → Santiago",
            description: "Dernière ligne droite en Galice. Arrivée triomphale sur la place de l'Obradoiro.",
            stats: { dist: 145, dplus: 2700, dminus: 3500 },
            profile: [1300, 800, 500, 400, 260],
            pois: [{ x: 100, label: "Santiago ★" }],
            tags: ["Final", "Arrivée"]
        },
    ],
};