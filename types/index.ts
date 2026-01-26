export type TrekTheme = 'sport' | 'spirit';
export type PrimaryAccess = 'plane' | 'bus' | 'train';

// === GEAR TYPES ===

export interface GearItem {
  id: string;
  name: string;
  weight: number; // en grammes
  category: string;
  brand?: string;
  volume?: number;
  price?: number;
  essential?: boolean;
  owned?: boolean;
  // Nouveaux champs pour le Knolling
  image?: string; // URL de l'image détourée
  description?: string; // Description détaillée
  dimensions?: { width: number; height: number }; // Ratio pour le positionnement
  position?: { x: number; y: number }; // Position par défaut sur le canvas
  color?: string; // Couleur dominante (optionnel)
}

export interface GearCategory {
  id: string;
  name: string;
  icon: string;
}

// ✅ AJOUTÉ : La définition manquante
export interface GPSPoint {
  lat: number;
  lon: number;
  ele: number;
}

export interface POI {
  x: number;
  label: string;
  type?: 'danger' | 'refuge' | 'eau' | 'col';
  alt?: number; // ✅ AJOUTÉ : Pour éviter l'erreur sur .alt
}

export interface StageStats {
  dist: number;
  dplus: number;
  dminus: number;
  duration?: string;
  difficulty?: number;
}

export interface Stage {
  id: number;
  code: string;
  title: string;
  description: string;
  stats: StageStats;
  track?: GPSPoint[]; // ✅ AJOUTÉ : Pour éviter l'erreur sur .track
  profile?: number[];
  pois?: POI[];
  tags?: string[];
}

export interface Trek {
  id: string;
  slug: string;
  name: string;
  subtitle?: string;
  description: string;
  category: string;
  theme: TrekTheme;
  location: string;
  country: string[];
  heroImage: string;
  statusBadge?: string;
  primaryAccess?: PrimaryAccess;
  accessDetails?: {
    primaryLocation: string;
    airportCode?: string;
    advice?: string;
    railwayStation?: string;
  };
  stats: {
    dist: number;
    dplus: number;
    dminus: number;
    days: number;
    difficulty: number;
    maxAltitude: number;
  };
  bestSeason: string[];
  stages: Stage[];
  expert?: {
    name: string;
    title: string;
    photoUrl?: string;
  };
}