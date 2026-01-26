// lib/gear.ts - Données enrichies pour le Garage Knolling
// 🔗 CONNECTÉ À LA VRAIE BASE DE DONNÉES

import { GearItem, GearCategory } from "@/types";
import { 
  KNOLLING_GEAR_DATABASE, 
  GEAR_CATEGORIES as KNOLLING_CATEGORIES, 
  type KnollingGearItem 
} from "@/lib/gear/knolling-database";

// --- DÉFINITIONS DE CATÉGORIES ---
export const GEAR_CATEGORIES: GearCategory[] = KNOLLING_CATEGORIES.map(cat => ({
    id: cat.id,
    name: cat.name,
    icon: "CatMisc" // Icône par défaut
}));

// --- CONVERSION DE LA BASE DE DONNÉES ---
const convertToGearItem = (item: KnollingGearItem, index: number): GearItem => {
    const col = index % 6;
    const row = Math.floor(index / 6);
    
    return {
        id: item.id,
        name: item.name,
        weight: item.weight,
        category: item.category,
        brand: item.brand || "Unknown",
        price: item.price,
        essential: item.essential,
        owned: item.owned,
        description: `${item.brand} - ${item.name}`,
        image: item.image,
        dimensions: { 
            width: Math.round(item.realSize * 100),
            height: Math.round(item.realSize * 100) 
        },
        position: { 
            x: 100 + (col * 150), 
            y: 80 + (row * 160) 
        },
        color: getCategoryColor(item.category)
    };
};

const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
        shelter: "#FF6B35",
        sleep: "#F72C25",
        pack: "#2C3E50",
        clothing: "#E74C3C",
        footwear: "#8B4513",
        cooking: "#FF6B6B",
        water: "#3498DB",
        navigation: "#2C3E50",
        safety: "#E74C3C",
        electronics: "#34495E",
        hygiene: "#3498DB",
        misc: "#95A5A6"
    };
    return colors[category] || "#95A5A6";
};

// 🔥 VRAIES DONNÉES - Conversion de KNOLLING_GEAR_DATABASE
export const GEAR_ITEMS: GearItem[] = KNOLLING_GEAR_DATABASE.map(convertToGearItem);

// --- UTILITAIRES ---

export const WEIGHT_THRESHOLDS = {
    OPTIMAL: 12000,
    MAX_SAFE: 15000,
};

export const getOwnedGear = (items: GearItem[]): GearItem[] => {
    return items.filter(item => item.owned);
};

export const calculateTotalWeight = (items: GearItem[]): number => {
    return items.reduce((sum, item) => sum + item.weight, 0);
};

export const formatWeight = (weightInGrams: number): string => {
    return `${(weightInGrams / 1000).toFixed(1)} kg`;
};

export const formatDistance = (distance: number): string => {
    return `${distance} km`;
};

export const formatElevation = (elevation: number): string => {
    if (elevation >= 1000) {
        return `${(elevation / 1000).toFixed(1)} km`; 
    }
    return `${elevation} m`;
};

export const getWeightStatus = (weightInGrams: number) => {
    if (weightInGrams > WEIGHT_THRESHOLDS.MAX_SAFE) {
        return "high-risk";
    }
    if (weightInGrams > WEIGHT_THRESHOLDS.OPTIMAL) {
        return "medium-risk";
    }
    return "optimal";
};

export const getItemsByCategory = (items: GearItem[], categoryId: string): GearItem[] => {
    return items.filter(item => item.category === categoryId);
};

export const getCategoryStats = (items: GearItem[], categoryId: string) => {
    const categoryItems = getItemsByCategory(items, categoryId);
    const ownedItems = categoryItems.filter(item => item.owned);
    return {
        total: categoryItems.length,
        owned: ownedItems.length,
        weight: calculateTotalWeight(ownedItems),
    };
};