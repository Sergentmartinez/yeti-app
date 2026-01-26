"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Package, Grid3x3, Layers, Search, Plus, Filter,
  Weight, Euro, Archive, TrendingUp, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GEAR_ITEMS, GEAR_CATEGORIES, getOwnedGear, calculateTotalWeight, formatWeight } from "@/lib/gear";
import { KnollingCanvas } from "@/components/garage/KnollingCanvas";
import { GearDetailModal } from "@/components/garage/GearDetailModal";
import { GearItemCard } from "@/components/garage/GearItemCard";
import type { GearItem } from "@/types";

export default function GearPage() {
  const [viewMode, setViewMode] = useState<'knolling' | 'grid'>('knolling');
  const [selectedItem, setSelectedItem] = useState<GearItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showOwnedOnly, setShowOwnedOnly] = useState<boolean>(false);

  // Filtrage des items
  const filteredItems = useMemo(() => {
    let items = GEAR_ITEMS;
    if (showOwnedOnly) items = getOwnedGear(items);
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (activeCategory) {
      items = items.filter(item => item.category === activeCategory);
    }
    return items;
  }, [searchTerm, activeCategory, showOwnedOnly]);

  // Statistiques
  const stats = useMemo(() => {
    const ownedItems = getOwnedGear(GEAR_ITEMS);
    const totalWeight = calculateTotalWeight(ownedItems);
    const totalPrice = ownedItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const wishlistItems = GEAR_ITEMS.filter(item => !item.owned);
    
    return {
      totalItems: GEAR_ITEMS.length,
      ownedItems: ownedItems.length,
      totalWeight,
      totalPrice,
      wishlistCount: wishlistItems.length,
    };
  }, []);

  return (
    <div className="h-screen bg-[#050505] overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-6 shrink-0 border-b border-white/[0.08]">
        <div className="flex items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#f21e2c] animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Inventaire</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">
              GARAGE
            </h1>
          </div>
          
          <div className="h-10 w-px bg-white/10 hidden md:block" />
          
          <div className="flex items-center gap-6 text-zinc-500 font-medium text-sm hidden md:flex">
            <span className="text-white font-bold">{stats.ownedItems} Items Possédés</span>
            <span><span className="text-[#f21e2c]">{formatWeight(stats.totalWeight)}</span></span>
            <span>{stats.totalPrice}€</span>
          </div>
        </div>

        {/* Contrôles de vue */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('knolling')}
            className={cn(
              "h-10 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              viewMode === 'knolling' 
                ? "bg-[#f21e2c] text-white shadow-lg shadow-[#f21e2c]/20" 
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-white/10"
            )}
          >
            <Layers size={14} />
            Knolling
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              "h-10 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              viewMode === 'grid' 
                ? "bg-[#f21e2c] text-white shadow-lg shadow-[#f21e2c]/20" 
                : "bg-zinc-900 text-zinc-500 hover:text-zinc-300 border border-white/10"
            )}
          >
            <Grid3x3 size={14} />
            Grille
          </button>
          <button className="h-10 px-4 bg-[#B21D3B] hover:bg-[#F9591F] text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg">
            <Plus size={14} strokeWidth={3} />
            Ajouter
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR GAUCHE */}
        <aside className="w-80 border-r border-white/[0.08] bg-[#0a0a0a] overflow-y-auto flex flex-col">
          
          {/* Stats KPIs */}
          <div className="p-6 space-y-4 border-b border-white/[0.08]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Statistiques</h3>
            
            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Archive size={14} className="text-[#f21e2c]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Total Items</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{stats.totalItems}</span>
                <span className="text-xs font-bold text-emerald-500">
                  +{stats.ownedItems} possédés
                </span>
              </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Weight size={14} className="text-[#f21e2c]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Poids Total</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{(stats.totalWeight / 1000).toFixed(1)}</span>
                <span className="text-sm font-bold text-zinc-500">kg</span>
              </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Euro size={14} className="text-[#f21e2c]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Valeur Totale</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{stats.totalPrice}</span>
                <span className="text-sm font-bold text-zinc-500">€</span>
              </div>
            </div>

            <div className="bg-[#111111] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} className="text-orange-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Wishlist</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-orange-500">{stats.wishlistCount}</span>
                <span className="text-sm font-bold text-zinc-500">items</span>
              </div>
            </div>
          </div>

          {/* Recherche */}
          <div className="p-6 border-b border-white/[0.08]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                placeholder="RECHERCHER..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-[10px] font-black tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#f21e2c]/50 transition-all"
              />
            </div>
          </div>

          {/* Filtres */}
          <div className="p-6 flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600">Catégories</h3>
              <button
                onClick={() => setShowOwnedOnly(!showOwnedOnly)}
                className={cn(
                  "text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-md transition-colors flex items-center gap-1",
                  showOwnedOnly ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-900 text-zinc-600 hover:text-zinc-400"
                )}
              >
                {showOwnedOnly ? <Eye size={10} /> : <EyeOff size={10} />}
                {showOwnedOnly ? 'Possédés' : 'Tous'}
              </button>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActiveCategory("")}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                  activeCategory === "" 
                    ? "bg-[#f21e2c] text-white shadow-lg" 
                    : "bg-[#111111] text-zinc-400 hover:bg-zinc-900 border border-white/5"
                )}
              >
                Toutes les catégories
                <span className="float-right text-[10px] font-black text-zinc-500">
                  {filteredItems.length}
                </span>
              </button>

              {GEAR_CATEGORIES.map(cat => {
                const count = filteredItems.filter(item => item.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                      activeCategory === cat.id 
                        ? "bg-[#f21e2c] text-white shadow-lg" 
                        : "bg-[#111111] text-zinc-400 hover:bg-zinc-900 border border-white/5"
                    )}
                  >
                    {cat.name}
                    <span className="float-right text-[10px] font-black text-zinc-500">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* CANVAS PRINCIPAL */}
        <main className="flex-1 p-6 overflow-hidden">
          {viewMode === 'knolling' ? (
            <KnollingCanvas
              items={filteredItems}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
            />
          ) : (
            <div className="h-full overflow-y-auto bg-[#0a0a0a] rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredItems.map(item => (
                  <GearItemCard 
                    key={item.id} 
                    item={item}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
              
              {filteredItems.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center">
                  <Package size={64} className="text-zinc-800 mb-4" />
                  <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">
                    Aucun Item Trouvé
                  </h3>
                  <p className="text-sm text-zinc-500 font-bold">
                    Ajustez vos filtres ou ajoutez un nouvel item
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODAL DE DÉTAILS */}
      <GearDetailModal 
        item={selectedItem} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
