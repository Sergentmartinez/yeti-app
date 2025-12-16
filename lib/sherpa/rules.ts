import { GearItem, Trek } from "@/types";

// --- TYPES SHERPA (Sortie du moteur) ---

export interface SherpaWarning {
  id: string;
  message: string;
  severity: "low" | "medium" | "high";
  category: "weight" | "safety" | "comfort";
}

export interface SherpaReport {
  isSafe: boolean; // False si une alerte "high" bloque le départ
  warnings: SherpaWarning[];
  score: number; // Note sur 100
}

// --- CONSTANTES & RÈGLES DE BASE ---

const ABSOLUTE_MAX_WEIGHT_KG = 15;
const OPTIMAL_WEIGHT_KG = 12;

/**
 * Analyse déterministe du pack utilisateur.
 * Applique les règles de sécurité et de poids strictes.
 * @param items Liste des GearItem dans le pack actuel.
 * @param trek Le Trek sélectionné (pour les règles spécifiques).
 * @returns Un rapport Sherpa (score, alertes et statut de sécurité).
 */
export function analyzePack(items: GearItem[], trek: Trek): SherpaReport {
  const warnings: SherpaWarning[] = [];
  let isSafe = true;
  
  // Calcul du poids total
  const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
  const totalWeightKg = totalWeight / 1000;

  // --- 1. Analyse du Poids (Règle Poids max) ---
  if (totalWeightKg > ABSOLUTE_MAX_WEIGHT_KG) {
    warnings.push({
      id: "weight-critical",
      message: `Critique ! Ton pack (${totalWeightKg.toFixed(1)} kg) dépasse la limite de sécurité absolue (15 kg).`,
      severity: "high",
      category: "weight"
    });
    isSafe = false;
  } else if (totalWeightKg > OPTIMAL_WEIGHT_KG) {
     warnings.push({
      id: "weight-heavy",
      message: `Ton pack (${totalWeightKg.toFixed(1)} kg) est lourd. Nous recommandons de viser sous les ${OPTIMAL_WEIGHT_KG} kg pour ce type de trek.`,
      severity: "medium",
      category: "weight"
    });
  }

  // --- 2. Vérifications de Sécurité (Règle Eau, Trousse) ---
  
  // Recherche d'une trousse de secours
  const hasFirstAid = items.some(i => i.category === "safety" && (i.name.toLowerCase().includes("secours") || i.name.toLowerCase().includes("trousse")));
  if (!hasFirstAid) {
      warnings.push({
          id: "missing-safety",
          message: "Aucune trousse de premiers secours détectée dans le pack. C'est un élément de sécurité critique.",
          severity: "high",
          category: "safety"
      });
      isSafe = false;
  }

  // Recherche d'un récipient pour l'eau
  const hasWaterContainer = items.some(i => i.category === "water" && (i.name.toLowerCase().includes("gourde") || i.name.toLowerCase().includes("poche")));
  if (!hasWaterContainer) {
      warnings.push({
          id: "missing-water",
          message: "Aucun récipient ou poche à eau détecté(e). Risque de déshydratation.",
          severity: "high",
          category: "safety"
      });
      isSafe = false;
  }

  // --- 3. Règles Spécifiques au Trek (Règle confort) ---
  
  // Règle spécifique au GR20 (haute altitude)
  if (trek.slug === "gr20-corse") {
      const hasWarmLayer = items.some(i => i.category === "clothing" && (i.name.toLowerCase().includes("polaire") || i.name.toLowerCase().includes("doudoune")));
      if (!hasWarmLayer) {
          warnings.push({
              id: "gr20-cold",
              message: "Le GR20 monte à 2600m. Prends une couche chaude (polaire/doudoune) même en été.",
              severity: "medium",
              category: "comfort"
          });
      }
  }

  // --- 4. Calcul du Score Sherpa ---
  let score = 100;
  score -= warnings.filter(w => w.severity === "high").length * 25;
  score -= warnings.filter(w => w.severity === "medium").length * 10;
  score -= warnings.filter(w => w.severity === "low").length * 5;
  
  return {
    isSafe,
    warnings,
    score: Math.max(0, score)
  };
}