'use client';

import { 
  Map, 
  Backpack, 
  Flame, 
  Rocket, 
  ListTodo,
  ClipboardList,
  ShoppingCart,
  FileText,
  Settings,
  Calendar,
  CheckSquare,
  Package,
  Utensils,
  Mountain,
  Compass,
  LucideIcon
} from 'lucide-react';

// Map d'icônes par identifiant
const PHASE_ICONS: Record<string, LucideIcon> = {
  // Phases par défaut
  'planning': Map,
  'equipment': Backpack,
  'supplies': Flame,
  'final': Rocket,
  
  // Icônes alternatives
  'map': Map,
  'backpack': Backpack,
  'fire': Flame,
  'rocket': Rocket,
  'list': ListTodo,
  'clipboard': ClipboardList,
  'cart': ShoppingCart,
  'shopping': ShoppingCart,
  'document': FileText,
  'file': FileText,
  'settings': Settings,
  'calendar': Calendar,
  'tasks': CheckSquare,
  'package': Package,
  'food': Utensils,
  'mountain': Mountain,
  'compass': Compass,
};

// Emojis vers icônes (fallback)
const EMOJI_TO_ICON: Record<string, LucideIcon> = {
  '🗺️': Map,
  '🎒': Backpack,
  '🔥': Flame,
  '🚀': Rocket,
  '📋': ListTodo,
  '📝': ClipboardList,
  '🛒': ShoppingCart,
  '📄': FileText,
  '⚙️': Settings,
  '📅': Calendar,
  '✅': CheckSquare,
  '📦': Package,
  '🍽️': Utensils,
  '⛰️': Mountain,
  '🧭': Compass,
};

interface PhaseIconProps {
  icon: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function PhaseIcon({ icon, size = 20, className = '', style }: PhaseIconProps) {
  // Essayer de trouver l'icône par identifiant
  let IconComponent = PHASE_ICONS[icon.toLowerCase()];
  
  // Si pas trouvé, essayer par emoji
  if (!IconComponent) {
    IconComponent = EMOJI_TO_ICON[icon];
  }
  
  // Fallback sur ListTodo
  if (!IconComponent) {
    IconComponent = ListTodo;
  }
  
  return <IconComponent size={size} className={className} style={style} />;
}

// Export de la liste des icônes disponibles pour les selectors
export const AVAILABLE_ICONS = Object.keys(PHASE_ICONS);
