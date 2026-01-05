export const PAYWALL_COPY = {
  title: "Débloquer pour ce projet",
  subtitle:
    "L’achat est lié à l’expédition que tu prépares (dates, groupe, configuration du sac).",
  projectLogic: [
    "✅ Accès illimité à l’analyse pour CE projet (tu peux modifier ton sac autant que tu veux).",
    "✅ Si tu changes d’aventure (autres dates, autre groupe, autre approche), tu clones le projet.",
    "✅ Ton historique reste intact : chaque projet garde ses décisions, exports et versions."
  ],
  osintLimitsTitle: "Limites & responsabilité",
  osintLimitsBody:
    "YETI agrège des sources publiques et t’aide à structurer ta préparation. Les informations terrain (eau, refuges, accès) peuvent changer : vérifie toujours les sources officielles et adapte-toi sur place. YETI n’est pas un guide certifié et ne remplace pas ton jugement."
} as const;

export type ProductKey = "sherpa_diagnostic" | "group_mode" | "full_pack";

export const PRODUCTS: Record<ProductKey, {
  key: ProductKey;
  name: string;
  priceEUR: number;
  bullets: string[];
  badge?: string;
}> = {
  sherpa_diagnostic: {
    key: "sherpa_diagnostic",
    name: "Diagnostic Sherpa",
    priceEUR: 7,
    bullets: [
      "Score de préparation + points critiques priorisés",
      "Optimisations de poids et cohérence (sac ↔ dates ↔ difficulté)",
      "Explications claires (pourquoi / impact)"
    ],
    badge: "le plus populaire"
  },
  group_mode: {
    key: "group_mode",
    name: "Mode Groupe",
    priceEUR: 12,
    bullets: [
      "Répartition auto du matériel partagé",
      "Exports par personne (liste + poids)",
      "Synchronisation simple (invitation par lien)"
    ]
  },
  full_pack: {
    key: "full_pack",
    name: "Dossier Complet",
    priceEUR: 15,
    bullets: [
      "Diagnostic Sherpa + Mode Groupe",
      "Export PDF “dossier de préparation” (non certifié)",
      "Mode hors-ligne (cache des pages du projet)"
    ]
  }
};
