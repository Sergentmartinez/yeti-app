export type PackCategory = 'shelter' | 'sleep' | 'kitchen' | 'clothing' | 'food' | 'water' | 'tech' | 'hygiene' | 'medikit' | 'tools' | 'documents' | 'other';

export interface GearItem {
  id: string;
  name: string;
  category: PackCategory;
  subcategory?: string;
  weight: number; // in grams
  price?: number; // in EUR
  brand?: string;
  notes?: string;
  url?: string;
  image?: string;
  isConsumable: boolean;
  isWorn: boolean; // default "worn" status (e.g. jacket)
  createdAt: number;
}

export interface PackItem {
  id: string; // unique instance ID in the pack
  gearId: string;
  quantity: number;
  isWorn: boolean; // override per instance
  isConsumable: boolean; // override per instance
  notes?: string;
}

export interface Pack {
  id: string;
  name: string;
  description?: string;
  trekId?: string; // link to a specific trek project
  items: PackItem[];
  createdAt: number;
  updatedAt: number;
}

export interface PackStats {
  totalWeight: number; // grams
  baseWeight: number; // grams
  wornWeight: number; // grams
  consumableWeight: number; // grams
  totalPrice: number; // EUR
  itemCount: number;
}
