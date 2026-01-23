"use client";

import React, { useState } from "react";
import { useYetiStore } from "@/lib/store/useYetiStore";
import { PackItem, GearItem } from "@/lib/types/pack";
import { 
  Trash2, Plus, Minus, Shirt, Utensils, Zap, ExternalLink, 
  MoreVertical, CheckSquare, Square, GripVertical 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function PackItemList() {
  const { 
    getActivePack, 
    gearLibrary, 
    updatePackItem, 
    removePackItem,
    activePackId
  } = useYetiStore();

  const pack = getActivePack();
  const [searchTerm, setSearchTerm] = useState("");

  if (!pack) return <div className="text-zinc-500 italic p-5">Aucun pack actif.</div>;

  // Merge pack items with library data + computing derived values
  const items = pack.items.map(pi => {
     const gear = gearLibrary.find(g => g.id === pi.gearId);
     return { ...pi, gear };
  }).filter(i => i.gear); // Filter out broken links

  // Group by category ? Or flat list ? Reference Dashboard mostly uses categorized views, 
  // but for editing a flat sortable list might be better. Let's do Category Grouping.
  
  const groupedItems: Record<string, typeof items> = {};
  items.forEach(item => {
     const cat = item.gear?.category || 'other';
     if (!groupedItems[cat]) groupedItems[cat] = [];
     groupedItems[cat].push(item);
  });
  
  // Custom Category Order
  const CAT_ORDER = ['shelter', 'sleep', 'kitchen', 'food', 'water', 'clothing', 'tech', 'hygiene', 'medikit', 'tools', 'documents', 'other'];

  return (
    <div className="space-y-6">
       
        {/* HEADER / TOOLBAR */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <div className="text-sm font-bold text-zinc-400">
               {items.length} items • {(items.reduce((sum, i) => sum + (i.gear?.weight||0)*i.quantity, 0)/1000).toFixed(2)} kg total
            </div>
            
            {/* Search Input */}
            <input 
                type="text" 
                placeholder="Filtrer..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500/50 transition-colors w-48"
            />
        </div>

        {/* LIST */}
        <div className="space-y-6">
            {CAT_ORDER.map(cat => {
                const catItems = groupedItems[cat];
                if (!catItems) return null;
                
                // Filter search
                const filtered = catItems.filter(i => 
                   i.gear?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   i.gear?.brand?.toLowerCase().includes(searchTerm.toLowerCase())
                );
                
                if (filtered.length === 0) return null;

                return (
                    <div key={cat} className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 pl-2">
                             <span>{cat}</span>
                             <span className="w-full h-px bg-zinc-800/50" />
                        </div>
                        
                        <div className="space-y-1">
                            {filtered.map(item => (
                                <ItemRow 
                                   key={item.id} 
                                   item={item} 
                                   onUpdate={(updates) => updatePackItem(activePackId, item.id, updates)}
                                   onRemove={() => removePackItem(activePackId, item.id)}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
            
            {items.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
                    <p className="text-zinc-500 text-sm mb-4">Votre sac est vide.</p>
                    <button className="text-orange-500 font-bold text-xs uppercase hover:underline">
                        Ouvrir la bibliothèque
                    </button>
                </div>
            )}
        </div>
    </div>
  );
}

function ItemRow({ 
  item, 
  onUpdate, 
  onRemove 
}: { 
  item: PackItem & { gear?: GearItem }, 
  onUpdate: (u: Partial<PackItem>) => void,
  onRemove: () => void
}) {
    if (!item.gear) return null;

    return (
        <motion.div 
            layout 
            className="group flex items-center gap-4 bg-zinc-900/30 hover:bg-zinc-900/60 border border-transparent hover:border-zinc-700/50 rounded-xl p-3 transition-all"
        >
            {/* Drag Handle (Visual) */}
            <GripVertical size={14} className="text-zinc-700 opacity-0 group-hover:opacity-100 cursor-grab" />
            
            {/* Main Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                    <h4 className="font-bold text-sm text-zinc-200 truncate">{item.gear.name}</h4>
                    {item.gear.brand && <span className="text-xs text-zinc-500 truncate">{item.gear.brand}</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-medium">
                      {item.gear.weight} g
                   </div>
                   {item.gear.price && (
                      <div className="text-[10px] text-zinc-600">
                         {item.gear.price} €
                      </div>
                   )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
                
                {/* Toggles */}
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => onUpdate({ isWorn: !item.isWorn })}
                        title="Porté sur soi (ne compte pas dans le poids de base)"
                        className={cn(
                           "p-1.5 rounded-lg transition-colors border border-transparent",
                           item.isWorn ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"
                        )}
                    >
                        <Shirt size={14} />
                    </button>
                    <button 
                        onClick={() => onUpdate({ isConsumable: !item.isConsumable })}
                        title="Consommable (ne compte pas dans le poids de base)"
                        className={cn(
                           "p-1.5 rounded-lg transition-colors border border-transparent",
                           item.isConsumable ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800"
                        )}
                    >
                        <Utensils size={14} />
                    </button>
                </div>

                {/* Qty */}
                <div className="flex items-center bg-zinc-950 rounded-lg border border-zinc-800">
                    <button 
                       className="p-1.5 text-zinc-500 hover:text-white"
                       onClick={() => onUpdate({ quantity: Math.max(1, item.quantity - 1) })}
                    >
                        <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-zinc-300">{item.quantity}</span>
                    <button 
                       className="p-1.5 text-zinc-500 hover:text-white"
                       onClick={() => onUpdate({ quantity: item.quantity + 1 })}
                    >
                        <Plus size={12} />
                    </button>
                </div>
                
                {/* Total Weight for row */}
                <div className="w-16 text-right font-bold text-zinc-300 text-sm">
                   {(item.gear.weight * item.quantity)} <span className="text-[10px] text-zinc-600 font-normal">g</span>
                </div>

                {/* Actions */}
                <button 
                    onClick={onRemove}
                    className="p-2 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Retirer du pack"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </motion.div>
    );
}
