import { GearItem } from "@/types";
import { formatWeight } from "@/lib/gear";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface GearItemCardProps { 
  item: GearItem; 
  // Remplacement de 'selected' et 'onClick' par les nouveaux noms pour le PackBuilder :
  isInPack?: boolean; 
  onToggle?: () => void;
  quantity?: number; 
}

export function GearItemCard({ item, isInPack = false, quantity, onToggle }: GearItemCardProps) {
  return (
    <div 
      className={cn(
        "bg-white p-4 rounded-xl border transition-all cursor-pointer", 
        isInPack // Utilisation de isInPack pour le style
          ? "border-orange-500 bg-orange-50 shadow-md" 
          : "border-stone-200 hover:border-orange-300 hover:shadow-md"
      )} 
      onClick={onToggle} // Utilisation de onToggle pour l'action
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-stone-900 truncate">{item.name}</span>
            {item.owned && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-[9px] font-semibold rounded">
                <Icons.Check className="w-2.5 h-2.5" />
                Possédé
              </span>
            )}
            {item.essential && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-100 text-orange-700 text-[9px] font-semibold rounded">
                <Icons.Star className="w-2.5 h-2.5" />
                Essentiel
              </span>
            )}
          </div>
          <div className="text-sm text-stone-500 mt-1">
            {item.brand && <span className="font-medium">{item.brand} • </span>}
            {item.categoryName}
          </div>
        </div>
        <div className="text-right ml-3">
          <div className="font-mono font-semibold text-stone-900">{formatWeight(item.weight)}</div>
          {quantity && quantity > 0 && (
            <div className="text-xs text-orange-600 font-semibold">×{quantity}</div>
          )}
        </div>
      </div>
    </div>
  );
}