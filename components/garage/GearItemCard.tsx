"use client";

import React from "react";
import { motion } from "framer-motion";
import { GearItem } from "@/types";
import { Weight, Euro, CheckCircle2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface GearItemCardProps {
  item: GearItem;
  onClick?: () => void;
}

export const GearItemCard: React.FC<GearItemCardProps> = ({ item, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative bg-[#111111] border rounded-xl overflow-hidden cursor-pointer group transition-all",
        item.owned 
          ? "border-white/10 hover:border-[#f21e2c]/50" 
          : "border-white/5 opacity-60 hover:opacity-100"
      )}
    >
      {/* Image */}
      <div 
        className="h-48 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden"
      >
        {item.image ? (
          <div
            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
            style={{ backgroundImage: `url(${item.image})` }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Weight size={48} className="text-zinc-800" />
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {item.essential && (
            <div className="bg-red-600/90 backdrop-blur text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-wide">
              Essential
            </div>
          )}
          {item.owned ? (
            <div className="bg-emerald-600/90 backdrop-blur text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1">
              <CheckCircle2 size={10} />
            </div>
          ) : (
            <div className="bg-orange-600/90 backdrop-blur text-white text-[8px] font-black px-2 py-1 rounded-full flex items-center gap-1">
              <Heart size={10} />
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-black text-white mb-1 truncate group-hover:text-[#f21e2c] transition-colors">
          {item.name}
        </h3>
        {item.brand && (
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-3">
            {item.brand}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <Weight size={12} className="text-zinc-600" />
            <span className="text-xs font-black text-zinc-400">
              {(item.weight / 1000).toFixed(1)}kg
            </span>
          </div>
          
          {item.price && (
            <div className="flex items-center gap-1">
              <Euro size={12} className="text-zinc-600" />
              <span className="text-xs font-black text-zinc-400">
                {item.price}€
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-[#f21e2c]/0 group-hover:bg-[#f21e2c]/5 transition-colors pointer-events-none" />
    </motion.div>
  );
};
