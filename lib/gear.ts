// lib/gear.ts (CODE INTÉGRAL, CORRIGÉ POUR LES ICÔNES)

import { GearItem, GearCategory } from "@/types";

// --- DÉFINITIONS MOCK ---

export const GEAR_CATEGORIES: GearCategory[] = [
    // La clé 'icon' doit correspondre aux exports de components/icons.ts
    { id: "shelter", name: "Abri", icon: "CatShelter" }, 
    { id: "sleep", name: "Sommeil", icon: "CatSleep" }, 
    { id: "pack", name: "Sac à Dos", icon: "NavPack" },
    { id: "clothing", name: "Vêtements", icon: "CatWear" }, 
    { id: "footwear", name: "Chaussures", icon: "Modere" }, // Modere utilise Footprints (OK)
    { id: "cooking", name: "Cuisine", icon: "CatCook" }, 
    { id: "water", name: "Hydratation", icon: "CatWater" }, 
    { id: "navigation", name: "Navigation", icon: "CatNav" }, 
    { id: "safety", name: "Sécurité", icon: "Warning" }, 
    { id: "hygiene", name: "Hygiène", icon: "CatMisc" }, // Utilise CatMisc comme icône générique
    { id: "electronics", name: "Électronique", icon: "CatTech" }, 
    { id: "misc", name: "Divers", icon: "CatMisc" }, 
];

export const GEAR_ITEMS: GearItem[] = [
    // Shelter
    { id: "tente-ultralight", name: "Tente 2P Ultralight", weight: 1300, category: "shelter", essential: true, owned: true },
    { id: "tarp", name: "Tarp 3x3", weight: 450, category: "shelter", essential: false, owned: true },
    // Sleep
    { id: "s-bag-700", name: "Sac de Couchage -5°C", weight: 1100, brand: "Millet", category: "sleep", essential: true, owned: true },
    { id: "matelas-gonflable", name: "Matelas R-Value 4.0", weight: 550, brand: "Thermarest", category: "sleep", essential: true, owned: true },
    // Pack
    { id: "sac-60l", name: "Sac à dos 60L", weight: 1800, brand: "Osprey", category: "pack", essential: true, owned: true },
    // Safety
    { id: "trousse-secours", name: "Trousse de premiers secours", weight: 350, category: "safety", essential: true, owned: true },
    // Water
    { id: "gourde-1l", name: "Gourde 1L Nalgene", weight: 120, category: "water", essential: true, owned: true },
    // Clothing (Ajout d'un item non possédé pour le test)
    { id: "veste-pluie", name: "Veste de Pluie G-Tex", weight: 300, category: "clothing", essential: true, owned: true },
    { id: "pantalon-randonnee", name: "Pantalon Randonnée Léger", weight: 400, category: "clothing", essential: true, owned: false }, // owned: false
    // Misc
    { id: "lampe-frontale", name: "Lampe Frontale", weight: 80, category: "misc", essential: true, owned: true },
];

// --- UTILITAIRES DE POIDS ET MESURE ---

// NOUVEAU : Seuils de poids pour la jauge (en grammes)
export const WEIGHT_THRESHOLDS = {
    OPTIMAL: 12000, // 12.0 kg
    MAX_SAFE: 15000, // 15.0 kg
};

/**
 * Filtre les articles que l'utilisateur possède.
 */
export const getOwnedGear = (items: GearItem[]): GearItem[] => {
    return items.filter(item => item.owned);
};

/** Calcule le poids total en grammes. */
export const calculateTotalWeight = (items: GearItem[]): number => {
    return items.reduce((sum, item) => sum + item.weight, 0);
};

/** Formatte le poids en kg avec une décimale. */
export const formatWeight = (weightInGrams: number): string => {
    return `${(weightInGrams / 1000).toFixed(1)} kg`;
};

/** Formatte la distance en km. */
export const formatDistance = (distance: number): string => {
    return `${distance} km`;
};

/** Formatte le dénivelé en mètres (ajoute un +). */
export const formatElevation = (elevation: number): string => {
    if (elevation >= 1000) {
        return `${(elevation / 1000).toFixed(1)} km`; 
    }
    return `${elevation} m`;
};

/** Détermine la couleur de la jauge en fonction des seuils. */
export const getWeightStatus = (weightInGrams: number) => {
    if (weightInGrams > WEIGHT_THRESHOLDS.MAX_SAFE) {
        return "high-risk"; // Red
    }
    if (weightInGrams > WEIGHT_THRESHOLDS.OPTIMAL) {
        return "medium-risk"; // Amber/Orange
    }
    return "optimal"; // Green
};