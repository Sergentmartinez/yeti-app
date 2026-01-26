// lib/gear/knolling-database.ts
// Base de données "Physical Twin" pour Yeti - MISE À JOUR AUTOMATIQUE
// Conforme au Protocole GLM 4.7 : Dimensions métriques réelles & Assets locaux
// Généré le 2026-01-26 09:17:06

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface KnollingGearItem {
  id: string;
  name: string;
  brand: string;
  weight: number; // en grammes
  category: string;
  realSize: number; // Dimension la plus longue en MÈTRES (pour l'échelle 1:1 Three.js)
  owned: boolean;
  essential: boolean;
  price: number; // en Euros
  image: string; // Chemin local vers l'asset généré
  dimensions?: {
    height: number; // cm
    width: number; // cm
    depth: number; // cm
  };
  volume?: number; // litres
}

// ============================================================================
// CATÉGORIES
// ============================================================================

export const GEAR_CATEGORIES = [
  { id: "shelter", name: "Abri", emoji: "⛺" },
  { id: "sleep", name: "Couchage", emoji: "🛏️" },
  { id: "pack", name: "Portage", emoji: "🎒" },
  { id: "clothing", name: "Vêtements", emoji: "🧥" },
  { id: "footwear", name: "Chaussures", emoji: "👟" },
  { id: "cooking", name: "Cuisine", emoji: "🍳" },
  { id: "water", name: "Eau", emoji: "💧" },
  { id: "navigation", name: "Navigation", emoji: "🧭" },
  { id: "safety", name: "Sécurité", emoji: "⚕️" },
  { id: "electronics", name: "Électronique", emoji: "🔋" },
  { id: "hygiene", name: "Hygiène", emoji: "🧴" },
  { id: "misc", name: "Divers", emoji: "📦" },
] as const;

// ============================================================================
// BASE DE DONNÉES - JUMEAUX NUMÉRIQUES (Physically Accurate)
// Note: realSize est en MÈTRES. 1.0 = 1 mètre. 0.05 = 5 cm.
// ============================================================================

export const KNOLLING_GEAR_DATABASE: KnollingGearItem[] = [

  // =========== ELECTRONICS ===========
  {
    id: "anker-powerbank-10-000-mah-22-5w-noir-a1388g11",
    name: "powerbank 10 000 mah 22 5w noir a1388g11",
    brand: "ANKER",
    weight: 1388,
    category: "electronics",
    realSize: 0.12, // 12cm
    owned: true,
    essential: false,
    price: 30,
    image: "/assets/garage/color/anker_powerbank_10_000_mah_22_5w_noir_a1388g11.webp",
  },
  {
    id: "forclaz-panneau-solaire-slr-500-v2-10w",
    name: "_panneau_solaire_slr_500_v2-10w",
    brand: "Forclaz",
    weight: 300,
    category: "electronics",
    realSize: 0.25, // 25cm
    owned: true,
    essential: false,
    price: 500,
    image: "/assets/garage/color/forclaz_panneau_solaire_slr_500_v2_10w.webp",
  },
  {
    id: "nitecore-nu25-mct-ul-lampe-frontale-noir",
    name: "nu25 mct ul lampe frontale noir",
    brand: "Nitecore",
    weight: 90,
    category: "electronics",
    realSize: 0.06, // 6cm
    owned: true,
    essential: false,
    price: 25,
    image: "/assets/garage/color/nitecore_nu25_mct_ul_lampe_frontale_noir.webp",
  },

  // =========== CLOTHING ===========
  {
    id: "arc-teryx-beta-ar-jacket-stormhood-black",
    name: "Arc teryx_Beta_AR_Jacket_Stormhood_Black",
    brand: "Unknown",
    weight: 400,
    category: "clothing",
    realSize: 0.75, // 75cm
    owned: true,
    essential: false,
    price: 400,
    image: "/assets/garage/color/arc_teryx_beta_ar_jacket_stormhood_black.webp",
  },
  {
    id: "patagonia-classic-retro-x-vest-heren---dark-natural",
    name: "classic retro-x vest heren - dark natural",
    brand: "Patagonia",
    weight: 400,
    category: "clothing",
    realSize: 0.75, // 75cm
    owned: true,
    essential: false,
    price: 800,
    image: "/assets/garage/color/patagonia_classic_retro_x_vest_heren___dark_natural.webp",
  },
  {
    id: "patagonia-r1-daily-gloves-black",
    name: "_r1 daily gloves black",
    brand: "Patagonia",
    weight: 100,
    category: "clothing",
    realSize: 0.25, // 25cm
    owned: true,
    essential: false,
    price: 120,
    image: "/assets/garage/color/patagonia_r1_daily_gloves_black.webp",
  },
  {
    id: "patagonia-retro-pile-jkt-pelican",
    name: "_retro pile jkt pelican",
    brand: "Patagonia",
    weight: 500,
    category: "clothing",
    realSize: 0.20, // 20cm
    owned: true,
    essential: false,
    price: 100,
    image: "/assets/garage/color/patagonia_retro_pile_jkt_pelican.webp",
  },
  {
    id: "veste-orange-lowe-alpin",
    name: "veste_orange-lowe_alpin",
    brand: "Unknown",
    weight: 400,
    category: "clothing",
    realSize: 0.75, // 75cm
    owned: true,
    essential: false,
    price: 400,
    image: "/assets/garage/color/veste_orange_lowe_alpin.webp",
  },

  // =========== MISC ===========
  {
    id: "black-diamond-équipement---bâtons-de-randonnée-trail-back-bd1125526044all1",
    name: "équipement - bâtons de randonnée trail back bd1125526044all1",
    brand: "Black Diamond",
    weight: 300,
    category: "misc",
    realSize: 0.40, // 40cm
    owned: true,
    essential: false,
    price: 221,
    image: "/assets/garage/color/black_diamond_équipement___bâtons_de_randonnée_trail_back_bd1125526044all1.webp",
  },
  {
    id: "sunglasses",
    name: "sunglasses",
    brand: "Unknown",
    weight: 25,
    category: "misc",
    realSize: 0.05, // 5cm
    owned: true,
    essential: false,
    price: 80,
    image: "/assets/garage/color/sunglasses.webp",
  },
  {
    id: "treck-n-eatsemoule-au-lait-et-aux-fruits-si",
    name: "treck n eatsemoule-au-lait-et-aux-fruits-si",
    brand: "Unknown",
    weight: 500,
    category: "misc",
    realSize: 0.20, // 20cm
    owned: true,
    essential: false,
    price: 50,
    image: "/assets/garage/color/treck_n_eatsemoule_au_lait_et_aux_fruits_si.webp",
  },
  {
    id: "trekneat-nourriture-de-trekking-œufs",
    name: "trekneat_nourriture_de_trekking_œufs",
    brand: "Unknown",
    weight: 300,
    category: "misc",
    realSize: 0.40, // 40cm
    owned: true,
    essential: false,
    price: 170,
    image: "/assets/garage/color/trekneat_nourriture_de_trekking_œufs.webp",
  },

  // =========== NAVIGATION ===========
  {
    id: "carte-ign-chambery-aix-les-bains-3332ot-si",
    name: "carte_IGN_chambery-aix_les_bains_3332ot-si",
    brand: "Unknown",
    weight: 30,
    category: "navigation",
    realSize: 0.22, // 22cm
    owned: true,
    essential: false,
    price: 9,
    image: "/assets/garage/color/carte_ign_chambery_aix_les_bains_3332ot_si.webp",
  },
  {
    id: "silva-boussole-expedition-4",
    name: "_boussole_expedition 4",
    brand: "Silva",
    weight: 60,
    category: "navigation",
    realSize: 0.03, // 3cm
    owned: true,
    essential: false,
    price: 40,
    image: "/assets/garage/color/silva_boussole_expedition_4.webp",
  },
  {
    id: "watch-garmin-fenix-8-garmin-fenix-8-solar-gps-watch",
    name: "watch--fenix-8 garmin fenix 8 solar gps watch",
    brand: "Garmin",
    weight: 8,
    category: "navigation",
    realSize: 0.05, // 5cm
    owned: true,
    essential: false,
    price: 1530,
    image: "/assets/garage/color/watch_garmin_fenix_8_garmin_fenix_8_solar_gps_watch.webp",
  },

  // =========== COOKING ===========
  {
    id: "cartouche-jetpower-230gr-fuel-canister",
    name: "CARTOUCHE JETPOWER 230GR FUEL CANISTER",
    brand: "Unknown",
    weight: 230,
    category: "cooking",
    realSize: 0.11, // 11cm
    owned: true,
    essential: false,
    price: 230,
    image: "/assets/garage/color/cartouche_jetpower_230gr_fuel_canister.webp",
  },
  {
    id: "forclaz-repas-lyophilisé-pâtes-à-la-bolognaise-120g",
    name: "_repas_lyophilisé-pâtes_à_la_bolognaise-120g",
    brand: "Forclaz",
    weight: 120,
    category: "cooking",
    realSize: 0.15, // 15cm
    owned: true,
    essential: false,
    price: 120,
    image: "/assets/garage/color/forclaz_repas_lyophilisé_pâtes_à_la_bolognaise_120g.webp",
  },
  {
    id: "frontier-ultralight-cutlery-set---fork-spoon-knife",
    name: "ultralight cutlery set - fork spoon knife",
    brand: "Frontier",
    weight: 15,
    category: "cooking",
    realSize: 0.18, // 18cm
    owned: true,
    essential: false,
    price: 12,
    image: "/assets/garage/color/frontier_ultralight_cutlery_set___fork_spoon_knife.webp",
  },

  // =========== SAFETY ===========
  {
    id: "climbing-cord-rope",
    name: "climbing cord rope",
    brand: "Unknown",
    weight: 40,
    category: "safety",
    realSize: 0.01, // 1cm
    owned: true,
    essential: false,
    price: 1,
    image: "/assets/garage/color/climbing_cord_rope.webp",
  },
  {
    id: "gridlock-screwgate-mousqueton",
    name: "screwgate mousqueton",
    brand: "Gridlock",
    weight: 60,
    category: "safety",
    realSize: 0.10, // 10cm
    owned: true,
    essential: false,
    price: 12,
    image: "/assets/garage/color/gridlock_screwgate_mousqueton.webp",
  },
  {
    id: "opinel-n-7",
    name: "n 7",
    brand: "Opinel",
    weight: 500,
    category: "safety",
    realSize: 0.20, // 20cm
    owned: true,
    essential: false,
    price: 50,
    image: "/assets/garage/color/opinel_n_7.webp",
  },

  // =========== WATER ===========
  {
    id: "hydro-flask-food-jar-28oz-828-ml-insulated",
    name: "hydro_flask_food_Jar_28Oz_828 ml_Insulated",
    brand: "Unknown",
    weight: 500,
    category: "water",
    realSize: 0.20, // 20cm
    owned: true,
    essential: false,
    price: 28,
    image: "/assets/garage/color/hydro_flask_food_jar_28oz_828_ml_insulated.webp",
  },
  {
    id: "msr-guardian-purifier-profile-1",
    name: "_guardian_purifier_profile_1",
    brand: "MSR",
    weight: 90,
    category: "water",
    realSize: 0.15, // 15cm
    owned: true,
    essential: false,
    price: 52,
    image: "/assets/garage/color/msr_guardian_purifier_profile_1.webp",
  },
  {
    id: "nalgene-wh-sustain-gourde-transparente-1-l",
    name: "wh sustain gourde transparente 1 l",
    brand: "Nalgene",
    weight: 180,
    category: "water",
    realSize: 0.25, // 25cm
    owned: true,
    essential: false,
    price: 12,
    image: "/assets/garage/color/nalgene_wh_sustain_gourde_transparente_1_l.webp",
  },

  // =========== SHELTER ===========
  {
    id: "msr-hubba-hubba-nx-green",
    name: "_hubba_hubba_nx green",
    brand: "MSR",
    weight: 1500,
    category: "shelter",
    realSize: 1.00, // 100cm
    owned: true,
    essential: false,
    price: 675,
    image: "/assets/garage/color/msr_hubba_hubba_nx_green.webp",
  },

  // =========== PACK ===========
  {
    id: "osprey-exos-58",
    name: "_exos_58",
    brand: "Osprey",
    weight: 1200,
    category: "pack",
    realSize: 0.70, // 70cm
    owned: true,
    essential: false,
    price: 69,
    image: "/assets/garage/color/osprey_exos_58.webp",
  },

  // =========== FOOTWEAR ===========
  {
    id: "salomon-x-ultra-pioneer-gore-tex-chaussures-de-randonnée",
    name: "x ultra pioneer gore-tex chaussures de randonnée",
    brand: "Salomon",
    weight: 800,
    category: "footwear",
    realSize: 0.30, // 30cm
    owned: true,
    essential: false,
    price: 150,
    image: "/assets/garage/color/salomon_x_ultra_pioneer_gore_tex_chaussures_de_randonnée.webp",
  },
  {
    id: "salomon-soft-flask-insulate-400ml---13oz-42-clear-blue",
    name: "_soft flask insulate 400ml - 13oz 42 clear blue",
    brand: "Salomon",
    weight: 800,
    category: "footwear",
    realSize: 0.30, // 30cm
    owned: true,
    essential: false,
    price: 400,
    image: "/assets/garage/color/salomon_soft_flask_insulate_400ml___13oz_42_clear_blue.webp",
  },

  // =========== SLEEP ===========
  {
    id: "sea-to-summit-almohada---aeros-ultralight-pillow-r-color-sea-foam",
    name: "almohada - aeros ultralight pillow r color sea foam",
    brand: "Sea to Summit",
    weight: 80,
    category: "sleep",
    realSize: 0.10, // 10cm
    owned: true,
    essential: false,
    price: 65,
    image: "/assets/garage/color/sea_to_summit_almohada___aeros_ultralight_pillow_r_color_sea_foam.webp",
  },
  {
    id: "seatosummit-etherlightxrinsulatedascmat-s",
    name: "seatosummit_EtherLightXRInsulatedASCMat-S",
    brand: "Unknown",
    weight: 600,
    category: "sleep",
    realSize: 1.80, // 180cm
    owned: true,
    essential: false,
    price: 250,
    image: "/assets/garage/color/seatosummit_etherlightxrinsulatedascmat_s.webp",
  },
  {
    id: "seatosummit-sparkdown-sleeping-bag",
    name: "seatosummit_SparkDown_Sleeping_Bag",
    brand: "Sea to Summit",
    weight: 800,
    category: "sleep",
    realSize: 1.80, // 180cm
    owned: false,
    essential: false,
    price: 300,
    image: "/assets/garage/color/seatosummit_sparkdown_sleeping_bag.webp",
  },
  {
    id: "seatosummit-sparkdown-sleeping-bag-packed",
    name: "seatosummit_SparkDown_Sleeping_Bag_packed",
    brand: "Unknown",
    weight: 800,
    category: "sleep",
    realSize: 1.80, // 180cm
    owned: true,
    essential: false,
    price: 300,
    image: "/assets/garage/color/seatosummit_sparkdown_sleeping_bag_packed.webp",
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getGearByCategory = (category: string): KnollingGearItem[] => {
  return KNOLLING_GEAR_DATABASE.filter((item) => item.category === category);
};

export const getOwnedGear = (): KnollingGearItem[] => {
  return KNOLLING_GEAR_DATABASE.filter((item) => item.owned);
};

export const getWishlistGear = (): KnollingGearItem[] => {
  return KNOLLING_GEAR_DATABASE.filter((item) => !item.owned);
};

export const getEssentialGear = (): KnollingGearItem[] => {
  return KNOLLING_GEAR_DATABASE.filter((item) => item.essential && item.owned);
};

export const getTotalWeight = (items: KnollingGearItem[]): number => {
  return items.reduce((sum, item) => sum + item.weight, 0);
};

export const getTotalPrice = (items: KnollingGearItem[]): number => {
  return items.reduce((sum, item) => sum + (item.price || 0), 0);
};

export const formatWeight = (grams: number): string => {
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)}kg`;
  }
  return `${grams}g`;
};
