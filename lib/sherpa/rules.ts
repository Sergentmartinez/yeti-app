// lib/sherpa/rules.ts
// Moteur de règles Sherpa AI - Basé sur les PDFs techniques (Decathlon, Vaude, Globe Trotting)

import { GearItem, Trek } from "@/types";
import { PackedItem, Compartment } from "@/lib/store/useYetiStore";

// === TYPES SHERPA ===

export type AlertSeverity = "low" | "medium" | "high";
export type AlertCategory = "weight" | "safety" | "comfort" | "balance";

export interface SherpaWarning {
  id: string;
  message: string;
  severity: AlertSeverity;
  category: AlertCategory;
  solution?: string;
  itemId?: string;
}

export interface SherpaReport {
  isSafe: boolean;
  warnings: SherpaWarning[];
  score: number;
  breakdown: {
    equipment: number;
    weight: number;
    weather: number;
    logistics: number;
  };
}

// === CONSTANTES (Sources: PDFs Decathlon/Globe Trotting) ===

const ABSOLUTE_MAX_WEIGHT_KG = 15;
const OPTIMAL_WEIGHT_KG = 12;
const HEAVY_ITEM_THRESHOLD_G = 1500; // 1.5kg - Items considérés "lourds"

// Items de sécurité obligatoires (Source: Globe Trotting)
const MANDATORY_SAFETY_ITEMS = [
  { id: "trousse-secours", name: "Trousse de premiers secours", keywords: ["secours", "trousse", "first aid"] },
  { id: "sifflet", name: "Sifflet d'urgence", keywords: ["sifflet", "whistle"] },
  { id: "couverture-survie", name: "Couverture de survie", keywords: ["couverture", "survie", "survival blanket"] },
];

// Règles de placement par compartiment (Source: Decathlon/Deuter)
const COMPARTMENT_RULES = {
  top: {
    maxWeight: 800, // Max 800g pour le haut
    forbiddenCategories: ["couchage"], // Pas de duvet en haut
    description: "Accessibles rapidement: snacks, carte, téléphone"
  },
  main: {
    idealWeightZone: "center-back", // Zone idéale pour les lourds
    description: "Items lourds au centre/dos, légers aux extrémités"
  },
  bottom: {
    idealCategories: ["couchage"], // Duvet en bas
    description: "Duvet et items légers volumineux"
  },
  pockets: {
    maxWeight: 500,
    description: "Petits accessoires fréquemment utilisés"
  }
};

// Étapes du Wizard de réglage sac (Source: Decathlon/Globe Trotting)
export const ADJUSTMENT_WIZARD_STEPS = [
  {
    step: 1,
    title: "Desserrer toutes les sangles",
    description: "Avant de mettre le sac, desserrez complètement toutes les sangles pour partir d'une base neutre.",
    icon: "🔓",
    duration: "30s"
  },
  {
    step: 2,
    title: "Ajuster la ceinture ventrale",
    description: "Placez la ceinture sur les hanches (os iliaques), pas sur la taille. 70% du poids doit reposer ici.",
    icon: "🦴",
    duration: "1min"
  },
  {
    step: 3,
    title: "Régler les bretelles",
    description: "Serrez les bretelles pour que le sac épouse le dos. Laissez 2 doigts de marge sous les aisselles.",
    icon: "🎒",
    duration: "1min"
  },
  {
    step: 4,
    title: "Serrer les rappels de charge",
    description: "Tirez les sangles de rappel (au niveau des épaules) à 45° pour rapprocher le sac du corps.",
    icon: "⚡",
    duration: "30s"
  },
  {
    step: 5,
    title: "Boucler la sangle de poitrine",
    description: "Ajustez à hauteur des pectoraux. Elle stabilise les bretelles sans gêner la respiration.",
    icon: "🔒",
    duration: "30s"
  },
  {
    step: 6,
    title: "Test final",
    description: "Marchez quelques pas, sautillez légèrement. Le sac ne doit pas balloter.",
    icon: "✅",
    duration: "1min"
  }
];

// === FONCTIONS D'ANALYSE ===

/**
 * Règle 1: Vérification du chargement (Source: Decathlon/Deuter)
 * - Items > 1.5kg en haut du sac = Alerte rouge "Déséquilibre"
 * - Duvet pas en bas = Conseil "Placer au fond"
 */
function checkLoadBalance(items: PackedItem[]): SherpaWarning[] {
  const warnings: SherpaWarning[] = [];

  // Vérifier les items lourds en haut
  const heavyItemsInTop = items.filter(
    item => item.compartment === 'top' && item.weight > HEAVY_ITEM_THRESHOLD_G
  );

  heavyItemsInTop.forEach(item => {
    warnings.push({
      id: `balance-heavy-top-${item.id}`,
      message: `"${item.name}" (${(item.weight / 1000).toFixed(1)}kg) est trop lourd pour le haut du sac.`,
      severity: "high",
      category: "balance",
      solution: "Déplacez cet item dans le compartiment principal, au centre près du dos.",
      itemId: item.id
    });
  });

  // Vérifier que le duvet est en bas
  const sleepingBag = items.find(
    item => item.category === 'couchage' &&
      (item.name.toLowerCase().includes('duvet') || item.name.toLowerCase().includes('sac de couchage'))
  );

  if (sleepingBag && sleepingBag.compartment !== 'bottom') {
    warnings.push({
      id: 'balance-sleeping-bag',
      message: `Le sac de couchage devrait être placé au fond du sac.`,
      severity: "medium",
      category: "balance",
      solution: "Placez le duvet dans le compartiment inférieur pour optimiser le centre de gravité.",
      itemId: sleepingBag.id
    });
  }

  return warnings;
}

/**
 * Règle 2: Vérification de sécurité (Source: Globe Trotting/Vaude)
 * - Vérifie la présence stricte de: Trousse secours, Sifflet, Couverture survie
 */
function checkSafetyItems(items: PackedItem[]): SherpaWarning[] {
  const warnings: SherpaWarning[] = [];

  MANDATORY_SAFETY_ITEMS.forEach(mandatory => {
    const found = items.some(item =>
      mandatory.keywords.some(keyword =>
        item.name.toLowerCase().includes(keyword) ||
        item.id.toLowerCase().includes(keyword)
      )
    );

    if (!found) {
      warnings.push({
        id: `missing-safety-${mandatory.id}`,
        message: `${mandatory.name} manquant(e) dans le pack.`,
        severity: "high",
        category: "safety",
        solution: `Ajoutez une ${mandatory.name.toLowerCase()} - élément de sécurité critique.`
      });
    }
  });

  return warnings;
}

/**
 * Règle 3: Vérification du poids
 */
function checkWeight(items: PackedItem[], packWeight: number): SherpaWarning[] {
  const warnings: SherpaWarning[] = [];

  const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
  const totalWeightKg = (totalWeight + packWeight) / 1000;

  if (totalWeightKg > ABSOLUTE_MAX_WEIGHT_KG) {
    warnings.push({
      id: "weight-critical",
      message: `Pack critique ! ${totalWeightKg.toFixed(1)}kg dépasse la limite de sécurité (15kg).`,
      severity: "high",
      category: "weight",
      solution: "Réduisez le poids en retirant des items non essentiels ou en optant pour des alternatives plus légères."
    });
  } else if (totalWeightKg > OPTIMAL_WEIGHT_KG) {
    warnings.push({
      id: "weight-heavy",
      message: `Pack lourd (${totalWeightKg.toFixed(1)}kg). Objectif recommandé: ${OPTIMAL_WEIGHT_KG}kg.`,
      severity: "medium",
      category: "weight",
      solution: "Optimisez les items les plus lourds. Chaque gramme compte en montagne."
    });
  }

  return warnings;
}

/**
 * Règle 4: Vérification eau (hydratation)
 */
function checkHydration(items: PackedItem[]): SherpaWarning[] {
  const warnings: SherpaWarning[] = [];

  const hasWaterContainer = items.some(item =>
    item.category === 'hydratation' &&
    (item.name.toLowerCase().includes('gourde') ||
      item.name.toLowerCase().includes('poche') ||
      item.name.toLowerCase().includes('bouteille'))
  );

  if (!hasWaterContainer) {
    warnings.push({
      id: "missing-water",
      message: "Aucun récipient à eau détecté. Risque de déshydratation.",
      severity: "high",
      category: "safety",
      solution: "Ajoutez au minimum une gourde 1L ou une poche à eau."
    });
  }

  // Vérifier la capacité totale d'eau
  const waterItems = items.filter(item => item.category === 'hydratation');
  const hasFilter = waterItems.some(item =>
    item.name.toLowerCase().includes('filtre') ||
    item.name.toLowerCase().includes('purifi')
  );

  if (!hasFilter && waterItems.length > 0) {
    warnings.push({
      id: "no-water-filter",
      message: "Aucun système de filtration d'eau détecté.",
      severity: "medium",
      category: "safety",
      solution: "Un filtre type Katadyn BeFree ou Sawyer permet de se ravitailler aux sources."
    });
  }

  return warnings;
}

/**
 * Règle 5: Règles spécifiques au trek
 */
function checkTrekSpecific(items: PackedItem[], trekSlug: string): SherpaWarning[] {
  const warnings: SherpaWarning[] = [];

  // GR20 - Altitude et froid
  if (trekSlug === 'gr20-corse') {
    const hasWarmLayer = items.some(item =>
      item.category === 'vetements' &&
      (item.name.toLowerCase().includes('polaire') ||
        item.name.toLowerCase().includes('doudoune') ||
        item.name.toLowerCase().includes('down'))
    );

    if (!hasWarmLayer) {
      warnings.push({
        id: "gr20-cold",
        message: "Le GR20 monte à 2600m. Couche chaude requise même en été.",
        severity: "medium",
        category: "comfort",
        solution: "Ajoutez une doudoune légère ou une polaire technique."
      });
    }

    // Vérifier le duvet pour les nuits froides
    const sleepingBag = items.find(item =>
      item.category === 'couchage' &&
      item.name.toLowerCase().includes('couchage')
    );

    if (sleepingBag && !sleepingBag.name.includes('-5') && !sleepingBag.name.includes('-10')) {
      warnings.push({
        id: "gr20-sleeping-bag",
        message: "En juin, les nuits peuvent descendre sous 0°C au refuge.",
        severity: "medium",
        category: "comfort",
        solution: "Vérifiez que votre duvet est confort jusqu'à -5°C minimum."
      });
    }
  }

  // TMB - Multi-pays
  if (trekSlug === 'tour-mont-blanc') {
    // Pas d'alertes spécifiques pour l'instant
  }

  // Camino - Longue distance, peu technique
  if (trekSlug === 'camino') {
    // Vérifier les chaussures (implicite via catégorie)
  }

  return warnings;
}

/**
 * Calcul du score global
 */
function calculateScore(warnings: SherpaWarning[]): number {
  let score = 100;

  warnings.forEach(warning => {
    switch (warning.severity) {
      case 'high':
        score -= 25;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'low':
        score -= 5;
        break;
    }
  });

  return Math.max(0, score);
}

/**
 * Calcul du breakdown par catégorie
 */
function calculateBreakdown(warnings: SherpaWarning[]): SherpaReport['breakdown'] {
  const breakdown = {
    equipment: 100,
    weight: 100,
    weather: 100,
    logistics: 85, // Valeur par défaut (refuges etc)
  };

  warnings.forEach(warning => {
    const penalty = warning.severity === 'high' ? 20 : warning.severity === 'medium' ? 10 : 5;

    if (warning.category === 'safety' || warning.category === 'balance') {
      breakdown.equipment -= penalty;
    }
    if (warning.category === 'weight') {
      breakdown.weight -= penalty;
    }
    if (warning.category === 'comfort') {
      breakdown.weather -= penalty / 2;
    }
  });

  // Clamp values
  breakdown.equipment = Math.max(0, breakdown.equipment);
  breakdown.weight = Math.max(0, breakdown.weight);
  breakdown.weather = Math.max(0, breakdown.weather);
  breakdown.logistics = Math.max(0, breakdown.logistics);

  return breakdown;
}

// === FONCTION PRINCIPALE ===

/**
 * Analyse complète du pack utilisateur.
 * Applique toutes les règles de sécurité, équilibre, et poids.
 */
export function analyzePack(
  items: PackedItem[],
  trekSlug: string = '',
  packWeight: number = 1300 // Poids du sac vide en grammes
): SherpaReport {
  const warnings: SherpaWarning[] = [];

  // 1. Règles de chargement/équilibre
  warnings.push(...checkLoadBalance(items));

  // 2. Items de sécurité obligatoires
  warnings.push(...checkSafetyItems(items));

  // 3. Vérification du poids
  warnings.push(...checkWeight(items, packWeight));

  // 4. Vérification hydratation
  warnings.push(...checkHydration(items));

  // 5. Règles spécifiques au trek
  if (trekSlug) {
    warnings.push(...checkTrekSpecific(items, trekSlug));
  }

  // Calculs finaux
  const score = calculateScore(warnings);
  const breakdown = calculateBreakdown(warnings);
  const isSafe = !warnings.some(w => w.severity === 'high');

  return {
    isSafe,
    warnings,
    score,
    breakdown
  };
}

/**
 * Analyse legacy pour compatibilité avec l'ancien système
 */
export function analyzePackLegacy(items: GearItem[], trek: Trek): SherpaReport {
  // Convertir les GearItem en PackedItem
  const packedItems: PackedItem[] = items.map(item => ({
    id: item.id,
    name: item.name,
    weight: item.weight,
    volume: 1, // Valeur par défaut
    price: 0,
    category: item.category,
    emoji: '📦',
    compartment: 'main' as Compartment,
    brand: item.brand
  }));

  return analyzePack(packedItems, trek.slug);
}