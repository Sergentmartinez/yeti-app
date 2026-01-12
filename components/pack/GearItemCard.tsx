// components/pack/GearItemCard.tsx
import { GearItem } from "@/types";
import { formatWeight } from "@/lib/gear";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface GearItemCardProps { 
  item: GearItem; 
  isInPack?: boolean; 
  onToggle?: () => void;
  quantity?: number; 
}

export function GearItemCard({ item, isInPack = false, quantity, onToggle }: GearItemCardProps) {
  return (
    <div 
      className={cn(
        "premium-card p-4 rounded-2xl group transition-all duration-300 cursor-pointer overflow-hidden", 
        isInPack 
          ? "ring-2 ring-cyan-vibrant/50 bg-cyan-vibrant/5 shadow-lg shadow-cyan-vibrant/10" 
          : "hover:ring-1 hover:ring-border-default hover:translate-y-[-2px] hover:shadow-xl"
      )} 
      onClick={onToggle}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-black text-text-primary tracking-tight truncate group-hover:text-cyan-vibrant transition-colors">
              {item.name}
            </span>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap mb-3">
             <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              {item.brand || "Générique"}
            </span>
            <div className="w-1 h-1 rounded-full bg-border-subtle" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              {item.categoryName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {item.owned ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-vibrant/10 text-emerald-vibrant text-[9px] font-black uppercase tracking-wider rounded-md">
                <Icons.Check className="w-2.5 h-2.5" />
                POSSÉDÉ
              </span>
            ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-vibrant/10 text-orange-vibrant text-[9px] font-black uppercase tracking-wider rounded-md">
                WISHLIST
              </span>
            )}
            {item.essential && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-vibrant/10 text-cyan-vibrant text-[9px] font-black uppercase tracking-wider rounded-md">
                <Icons.Star className="w-2.5 h-2.5" />
                CRITIQUE
              </span>
            )}
          </div>
        </div>

        <div className="text-right ml-3 flex flex-col items-end">
          <div className="text-sm font-black font-mono text-text-primary group-hover:text-orange-vibrant transition-colors">
            {formatWeight(item.weight)}
          </div>
          {quantity && quantity > 1 && (
            <div className="text-[10px] font-black text-cyan-vibrant mt-0.5">
              ×{quantity}
            </div>
          )}
        </div>
      </div>
      
      {/* Interaction Indication */}
      <div className="absolute bottom-0 right-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 duration-300">
         <div className="bg-cyan-vibrant text-white rounded-tl-xl p-1.5 shadow-lg">
            <Icons.Plus className="w-4 h-4" />
         </div>
      </div>
    </div>
  );
}