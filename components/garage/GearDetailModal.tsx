"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GearItem } from "@/types";
import { X, Package, Weight, Euro, ShoppingCart, Heart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface GearDetailModalProps {
  item: GearItem | null;
  onClose: () => void;
}

export const GearDetailModal: React.FC<GearDetailModalProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-4xl mx-4 bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header avec image */}
          <div className="relative h-64 bg-gradient-to-br from-zinc-900 to-black overflow-hidden">
            {item.image && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{ backgroundImage: `url(${item.image})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
            
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/60 backdrop-blur border border-white/10 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center group"
            >
              <X size={20} className="text-white group-hover:rotate-90 transition-transform" />
            </button>

            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {item.essential && (
                <div className="bg-red-600/90 backdrop-blur text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide">
                  Essential
                </div>
              )}
              {item.owned ? (
                <div className="bg-emerald-600/90 backdrop-blur text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 size={12} /> Possédé
                </div>
              ) : (
                <div className="bg-orange-600/90 backdrop-blur text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                  <Heart size={12} /> Wishlist
                </div>
              )}
            </div>

            {/* Titre */}
            <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-4xl font-black text-white tracking-tight mb-2">
                {item.name}
              </h2>
              {item.brand && (
                <p className="text-zinc-400 text-sm font-bold uppercase tracking-widest">
                  {item.brand}
                </p>
              )}
            </div>
          </div>

          {/* Corps du modal */}
          <div className="p-6 space-y-6">
            
            {/* Stats rapides */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Weight size={16} className="text-[#f21e2c]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Poids</span>
                </div>
                <span className="text-2xl font-black text-white">
                  {(item.weight / 1000).toFixed(1)}
                  <span className="text-sm text-zinc-500 ml-1">kg</span>
                </span>
              </div>

              {item.price && (
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Euro size={16} className="text-[#f21e2c]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prix</span>
                  </div>
                  <span className="text-2xl font-black text-white">
                    {item.price}
                    <span className="text-sm text-zinc-500 ml-1">€</span>
                  </span>
                </div>
              )}

              {item.volume && (
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={16} className="text-[#f21e2c]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Volume</span>
                  </div>
                  <span className="text-2xl font-black text-white">
                    {item.volume}
                    <span className="text-sm text-zinc-500 ml-1">L</span>
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                  Description
                </h3>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Caractéristiques techniques */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">
                Caractéristiques
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-zinc-400">Catégorie</span>
                  <span className="text-xs font-black text-white uppercase">{item.category}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-zinc-400">ID Produit</span>
                  <span className="text-xs font-mono text-zinc-500">{item.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-zinc-400">Poids/Volume</span>
                  <span className="text-xs font-black text-white">
                    {item.volume ? `${(item.weight / item.volume).toFixed(1)} g/L` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-zinc-400">Statut</span>
                  <span className={cn(
                    "text-xs font-black uppercase",
                    item.owned ? "text-emerald-500" : "text-orange-500"
                  )}>
                    {item.owned ? "Disponible" : "À acheter"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {!item.owned && (
                <button className="flex-1 h-12 bg-[#f21e2c] hover:bg-[#d01828] text-white rounded-xl text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={16} />
                  Acheter
                </button>
              )}
              <button className="flex-1 h-12 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <Package size={16} />
                Ajouter au Pack
              </button>
              <button 
                className={cn(
                  "h-12 w-12 rounded-xl text-white transition-colors flex items-center justify-center",
                  item.owned 
                    ? "bg-emerald-600 hover:bg-emerald-700" 
                    : "bg-zinc-800 hover:bg-zinc-700"
                )}
              >
                <Heart size={18} fill={item.owned ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
