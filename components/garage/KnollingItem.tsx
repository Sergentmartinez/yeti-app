"use client";

import React from "react";
import { motion } from "framer-motion";
import { GearItem } from "@/types";
import { cn } from "@/lib/utils";

interface KnollingItemProps {
  item: GearItem;
  scale: number;
  onSelect: (item: GearItem) => void;
  isSelected: boolean;
}

export const KnollingItem: React.FC<KnollingItemProps> = ({ 
  item, 
  scale, 
  onSelect,
  isSelected 
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  
  const handleDragStart = () => {
    setIsDragging(true);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation();
      onSelect(item);
    }
  };

  // Opacité réduite pour les items non possédés
  const opacity = item.owned ? 1 : 0.4;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      initial={{ 
        x: item.position?.x || 0, 
        y: item.position?.y || 0 
      }}
      style={{
        position: "absolute",
        width: item.dimensions?.width || 100,
        height: item.dimensions?.height || 100,
        cursor: isDragging ? "grabbing" : "grab",
        opacity,
      }}
      whileHover={{ 
        scale: 1.05,
        zIndex: 100,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group transition-all duration-200",
        isSelected && "ring-2 ring-[#f21e2c] ring-offset-2 ring-offset-[#050505]"
      )}
    >
      {/* Container avec ombre réaliste */}
      <div className="relative w-full h-full">
        {/* Ombre portée (Knolling effect) */}
        <div 
          className="absolute inset-0 blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
          style={{
            background: `radial-gradient(ellipse at center, ${item.color || '#000'}, transparent 70%)`,
            transform: 'translate(8px, 8px)',
          }}
        />
        
        {/* Image de l'objet */}
        <div 
          className="relative w-full h-full bg-contain bg-center bg-no-repeat rounded-lg transition-transform group-hover:translate-y-[-4px]"
          style={{
            backgroundImage: item.image ? `url(${item.image})` : 'none',
            backgroundColor: item.image ? 'transparent' : '#1a1a1a',
          }}
        >
          {/* Badge "Non possédé" */}
          {!item.owned && (
            <div className="absolute -top-2 -right-2 bg-orange-500/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-lg">
              Wishlist
            </div>
          )}
          
          {/* Badge Essential */}
          {item.essential && item.owned && (
            <div className="absolute -top-2 -left-2 bg-red-600/90 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-lg">
              Essential
            </div>
          )}
          
          {/* Info overlay au hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-2">
            <span className="text-white text-[10px] font-black uppercase tracking-wide truncate">
              {item.name}
            </span>
            <span className="text-zinc-300 text-[8px] font-bold">
              {(item.weight / 1000).toFixed(1)}kg
              {item.brand && ` • ${item.brand}`}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
