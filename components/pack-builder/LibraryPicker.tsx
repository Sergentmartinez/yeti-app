"use client";

import React, { useState } from "react";
import { useYetiStore } from "@/lib/store/useYetiStore";
import { X, Search, Plus, PackageOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { PackItem } from "@/lib/types/pack";

interface LibraryPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LibraryPicker({ isOpen, onClose }: LibraryPickerProps) {
  const { gearLibrary, addItemToPack } = useYetiStore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter items - gearLibrary contains PackItems
  const filteredItems = (gearLibrary as any).filter((item: any) => {
     const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                           item.brand?.toLowerCase().includes(search.toLowerCase());
     const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
     return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set((gearLibrary as any).map((i: any) => i.category)));

  const handleAdd = (item: any) => {
      addItemToPack(item);
      // Optional: Show toast or feedback
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
       
       <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
       >
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PackageOpen className="text-orange-500" />
                Bibliothèque Matériel
             </h2>
             <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <X size={20} className="text-zinc-500" />
             </button>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b border-zinc-800 space-y-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                   type="text" 
                   placeholder="Rechercher un item (nom, marque...)" 
                   className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50"
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   autoFocus
                />
             </div>
             
             <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button 
                    onClick={() => setSelectedCategory(null)}
                    className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors",
                        selectedCategory === null ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:text-white"
                    )}
                >
                    Tout
                </button>
                {categories.map((cat: any) => (
                    <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat as string)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors capitalize",
                            selectedCategory === cat ? "bg-white text-black" : "bg-zinc-800 text-zinc-400 hover:text-white"
                        )}
                    >
                        {cat as string}
                    </button>
                ))}
             </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-2">
             <div className="grid grid-cols-1 gap-1">
                {filteredItems.map((item: any) => (
                    <div key={item.id} className="group flex items-center justify-between p-3 hover:bg-zinc-800/50 rounded-xl transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                                {/* Emoji logic or category icon could go here */}
                                📦
                            </div>
                            <div>
                                <div className="font-bold text-sm text-zinc-200">{item.name}</div>
                                <div className="text-xs text-zinc-500">{item.brand} • {item.weight}g</div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                             <div className="text-right">
                                <div className="font-bold text-sm text-zinc-300">{item.price ? `${item.price}€` : '-'}</div>
                             </div>
                             <button 
                                onClick={() => handleAdd(item)}
                                className="p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg shadow-lg shadow-orange-600/20 transition-all font-bold text-xs flex items-center gap-2"
                             >
                                <Plus size={14} />
                                Ajouter
                             </button>
                        </div>
                    </div>
                ))}

                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-zinc-500">
                        Aucun item trouvé.
                    </div>
                )}
             </div>
          </div>
          
          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 text-center">
             <span className="text-xs text-zinc-500">
                Vous ne trouvez pas votre item ? <button className="text-orange-500 hover:underline">Créer un nouvel item</button>
             </span>
          </div>
       </motion.div>
    </div>
  );
}
