import type { Trek } from "@/types";

/**
 * Normalise un Trek pour s'assurer que toutes les propriétés requises sont présentes.
 * Cette fonction est un passthrough pour la compatibilité avec l'ancien système.
 */
export function normalizeTrek(t: Trek): Trek {
  // Le Trek dans @/types utilise stats.difficulty au lieu de metrics
  // Cette fonction assure la compatibilité
  return {
    ...t,
    stats: {
      dist: t.stats?.dist ?? 0,
      dplus: t.stats?.dplus ?? 0,
      dminus: t.stats?.dminus ?? 0,
      days: t.stats?.days ?? 1,
      difficulty: t.stats?.difficulty ?? 0,
      maxAltitude: t.stats?.maxAltitude ?? 0,
    },
    stages: t.stages ?? [],
  };
}
