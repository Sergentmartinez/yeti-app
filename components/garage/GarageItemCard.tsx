import React from 'react';
import { GearItem } from '@/types/database';
import { AlertCircle, Lock, Package } from 'lucide-react';

interface GarageItemCardProps {
    item: GearItem;
    isConflict?: boolean;
    onSelect?: (item: GearItem) => void;
}

export const GarageItemCard: React.FC<GarageItemCardProps> = ({ item, isConflict = false, onSelect }) => {
    return (
        <div 
            className={`
                relative p-4 rounded-2xl border transition-all cursor-pointer group
                ${isConflict 
                    ? 'bg-zinc-900/50 border-red-900/50 grayscale opacity-80 hover:opacity-100 hover:grayscale-0' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-orange-500/50 hover:bg-zinc-800'
                }
            `}
            onClick={() => onSelect?.(item)}
        >
            {/* Conflict Overlay */}
            {isConflict && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-red-900/80 text-red-200 text-xs font-bold border border-red-700/50">
                    <Lock className="w-3 h-3" />
                    <span>Occupé</span>
                </div>
            )}

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-bold truncate ${isConflict ? 'text-zinc-400' : 'text-zinc-100'}`}>
                            {item.name}
                        </h3>
                        {item.brand && (
                            <span className="text-xs text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700">
                                {item.brand}
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Package className="w-3.5 h-3.5" />
                            {item.weight_g}g
                        </span>
                        <span>•</span>
                        <span className="capitalize">{item.category}</span>
                    </div>
                </div>
            </div>

            {/* Warn on hover if conflict */}
            {isConflict && (
                <div className="hidden group-hover:flex absolute inset-0 bg-zinc-950/80 items-center justify-center rounded-2xl backdrop-blur-[1px] transition-all">
                    <div className="text-center px-4">
                        <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                        <p className="text-xs text-red-200 font-semibold leading-tight">
                            Cet item est déjà utilisé sur ces dates.
                            <br/>
                            <span className="text-red-400">Cliquer pour forcer.</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
