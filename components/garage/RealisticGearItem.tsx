"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export interface KnollingGearItem {
  id: string;
  name: string;
  brand?: string;
  weight: number; // grammes
  category: string;
  image: string; // URL de l'image (sera détourée automatiquement)
  scale?: number; // facteur d'échelle relatif (1 = 100px)
  owned?: boolean;
  essential?: boolean;
  price?: number;
}

interface RealisticGearItemProps {
  item: KnollingGearItem;
  position: { x: number; y: number };
  rotation?: number;
  onPositionChange?: (id: string, pos: { x: number; y: number }) => void;
  onSelect?: (item: KnollingGearItem) => void;
  isSelected?: boolean;
  canvasScale?: number;
}

// ============================================================================
// REALISTIC GEAR ITEM - Effet Knolling 2.5D
// ============================================================================

export const RealisticGearItem: React.FC<RealisticGearItemProps> = ({
  item,
  position,
  rotation = 0,
  onPositionChange,
  onSelect,
  isSelected,
  canvasScale = 1,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Taille de base en fonction du scale de l'item
  const baseSize = (item.scale || 1) * 100;
  
  // Motion values pour les effets
  const x = useMotionValue(position.x);
  const y = useMotionValue(position.y);
  
  // Smooth spring pour les mouvements
  const springConfig = { stiffness: 500, damping: 30 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  
  // Effet de lift au hover/drag
  const lift = useMotionValue(0);
  const smoothLift = useSpring(lift, { stiffness: 400, damping: 25 });
  
  // Ombre dynamique basée sur le lift
  const shadowBlur = useTransform(smoothLift, [0, 15], [8, 25]);
  const shadowY = useTransform(smoothLift, [0, 15], [4, 12]);
  const shadowOpacity = useTransform(smoothLift, [0, 15], [0.4, 0.6]);

  // Handlers
  const handleDragStart = () => {
    setIsDragging(true);
    lift.set(15);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    lift.set(0);
    if (onPositionChange) {
      onPositionChange(item.id, { x: x.get(), y: y.get() });
    }
  };

  const handleClick = () => {
    if (!isDragging && onSelect) {
      onSelect(item);
    }
  };

  const handleHoverStart = () => {
    setIsHovered(true);
    if (!isDragging) lift.set(6);
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    if (!isDragging) lift.set(0);
  };

  return (
    <motion.div
      className={cn(
        "absolute cursor-grab active:cursor-grabbing select-none",
        isSelected && "z-50"
      )}
      style={{
        x: smoothX,
        y: smoothY,
        width: baseSize,
        height: baseSize,
        rotate: rotation,
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
      whileDrag={{ scale: 1.05, zIndex: 100 }}
    >
      {/* === LAYER 1: CONTACT SHADOW (très proche, nette) === */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          filter: "blur(3px)",
          opacity: 0.5,
          transform: "translateY(3px) scale(0.98)",
        }}
      >
        <div
          className="w-full h-full bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: !imageError ? `url(${item.image})` : 'none',
            filter: "brightness(0)",
          }}
        />
      </motion.div>

      {/* === LAYER 2: AMBIENT SHADOW (plus large, floue) === */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          filter: useTransform(shadowBlur, (v) => `blur(${v}px)`),
          opacity: shadowOpacity,
          y: shadowY,
          scale: 0.92,
        }}
      >
        <div
          className="w-full h-full bg-contain bg-center bg-no-repeat"
          style={{
            backgroundImage: !imageError ? `url(${item.image})` : 'none',
            filter: "brightness(0)",
          }}
        />
      </motion.div>

      {/* === LAYER 3: L'OBJET PRINCIPAL === */}
      <motion.div
        className={cn(
          "relative w-full h-full rounded-lg transition-all duration-200",
          isSelected && "ring-2 ring-[#dc2626] ring-offset-2 ring-offset-[#0a0a0a]"
        )}
        style={{
          y: useTransform(smoothLift, (v) => -v),
        }}
      >
        {/* Image de l'objet avec effet de détourage CSS */}
        <div
          className={cn(
            "w-full h-full bg-contain bg-center bg-no-repeat transition-opacity duration-300",
            !imageLoaded && "opacity-0",
            imageLoaded && "opacity-100"
          )}
          style={{
            backgroundImage: !imageError ? `url(${item.image})` : 'none',
            // Mix-blend-mode pour améliorer le rendu sur fond sombre
            mixBlendMode: "normal",
          }}
        />
        
        {/* Image cachée pour détecter le chargement */}
        <img
          src={item.image}
          alt=""
          className="hidden"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Fallback si pas d'image */}
        {(imageError || !item.image) && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/50 rounded-lg border border-zinc-700">
            <span className="text-[10px] font-bold text-zinc-500 text-center px-2">
              {item.name}
            </span>
          </div>
        )}

        {/* Badge "Non possédé" */}
        {!item.owned && (
          <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
            Wish
          </div>
        )}

        {/* Badge "Essential" */}
        {item.essential && item.owned && (
          <div className="absolute -top-1 -left-1 bg-[#dc2626] text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg">
            ★
          </div>
        )}

        {/* Tooltip au hover */}
        <motion.div
          className={cn(
            "absolute -bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-50",
            "bg-black/90 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1",
            "whitespace-nowrap transition-opacity duration-200",
            (isHovered || isDragging) ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="text-[9px] font-bold text-white block">{item.name}</span>
          <span className="text-[8px] text-zinc-400">
            {(item.weight / 1000).toFixed(2)}kg
            {item.brand && ` • ${item.brand}`}
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default RealisticGearItem;
