export type GearStatus = 'owned' | 'wishlist' | 'ordered' | 'borrowed' | 'archived';
export type GearCategory = 'sleep' | 'shelter' | 'kitchen' | 'wear' | 'tech' | 'hygiene' | 'other';

export interface GearItem {
  id: string;
  user_id: string;
  name: string;
  weight_g: number;
  category: GearCategory;
  status: GearStatus;
  notes?: string;
  brand?: string;
  price_paid_cents?: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  slug?: string;
  start_date: string; // ISO Date string
  end_date: string;   // ISO Date string
  is_template: boolean;
  base_weight_goal?: number;
  created_at: string;
}

export interface Pack {
  id: string;
  project_id: string; // FK -> Project
  user_id: string;
  name: string;
  created_at: string;
}

export interface PackItem {
  id: string;
  pack_id: string; // FK -> Pack
  gear_item_id?: string; // FK -> GearItem (nullable if ghost)
  quantity: number;
  is_worn: boolean;
  sort_order: number;
  is_ghost: boolean;
  ghost_label?: string;
  created_at: string;
}

// RPC Return Type
export interface GearConflict {
  project_name: string;
  start_date: string;
  end_date: string;
}
