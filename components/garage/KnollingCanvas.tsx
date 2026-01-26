"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GearItem } from "@/types";
import { KnollingItem } from "./KnollingItem";

interface KnollingCanvasProps {
  items: GearItem[];
  selectedItem: GearItem | null;
  onSelectItem: (item: GearItem | null) => void;
}

export const KnollingCanvas: React.FC<KnollingCanvasProps> = ({
  items,
  selectedItem,
  onSelectItem,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });

  // Gérer le zoom avec la molette (sans Ctrl nécessaire)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      setScale((prevScale) => {
        const newScale = prevScale + delta;
        return Math.min(Math.max(newScale, 0.5), 3); // Limite entre 0.5x et 3x
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false });
      return () => container.removeEventListener("wheel", handleWheel);
    }
  }, []);

  // Auto-zoom au chargement pour tout voir
  useEffect(() => {
    if (items.length > 0 && containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Trouver les bornes des items
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      items.forEach(item => {
        const x = item.position?.x || 0;
        const y = item.position?.y || 0;
        const w = item.dimensions?.width || 100;
        const h = item.dimensions?.height || 100;
        
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + w);
        maxY = Math.max(maxY, y + h);
      });
      
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      
      // Calculer le scale pour tout voir avec marge
      const scaleX = (containerWidth * 0.9) / contentWidth;
      const scaleY = (containerHeight * 0.9) / contentHeight;
      const autoScale = Math.min(scaleX, scaleY, 1.5); // Max 1.5x
      
      // Centrer
      const centerX = (containerWidth - contentWidth * autoScale) / 2 - minX * autoScale;
      const centerY = (containerHeight - contentHeight * autoScale) / 2 - minY * autoScale;
      
      setScale(autoScale);
      setPan({ x: centerX, y: centerY });
    }
  }, [items]);

  // Gérer le pan avec la souris (clic droit ou molette)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || e.button === 2) {
      // Clic molette ou clic droit
      e.preventDefault();
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.button === 0) {
      // Clic gauche sur le canvas (pas sur un item) = déselectionner
      if (e.target === e.currentTarget) {
        onSelectItem(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher le menu contextuel
  };

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Echap pour déselectionner
      if (e.key === "Escape") {
        onSelectItem(null);
      }
      // Reset vue (R)
      if (e.key === "r" || e.key === "R") {
        setScale(1);
        setPan({ x: 0, y: 0 });
      }
      // Zoom +/-
      if (e.key === "+" || e.key === "=") {
        setScale((prev) => Math.min(prev + 0.1, 3));
      }
      if (e.key === "-" || e.key === "_") {
        setScale((prev) => Math.max(prev - 0.1, 0.5));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelectItem]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#2C3139] rounded-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
      style={{ cursor: isPanning ? "grabbing" : "default" }}
    >
      {/* Grille de fond */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: `${40 * scale}px ${40 * scale}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Canvas avec transformation */}
      <motion.div
        className="absolute"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: "2000px",
          height: "1500px",
        }}
        animate={{ scale, x: pan.x, y: pan.y }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Render tous les items */}
        {items.map((item) => (
          <KnollingItem
            key={item.id}
            item={item}
            scale={scale}
            onSelect={onSelectItem}
            isSelected={selectedItem?.id === item.id}
          />
        ))}
      </motion.div>

      {/* Instructions flottantes */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur border border-white/10 rounded-lg px-4 py-2 text-[10px] font-bold text-zinc-400 space-y-1">
        <div>🖱️ <span className="text-white">Clic molette/droit</span> = Pan</div>
        <div>🔍 <span className="text-white">Molette</span> = Zoom</div>
        <div>⌨️ <span className="text-white">R</span> = Reset • <span className="text-white">Esc</span> = Déselectionner</div>
      </div>

      {/* Indicateur de zoom */}
      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black text-white uppercase tracking-widest">
        {(scale * 100).toFixed(0)}%
      </div>

      {/* Contrôles de zoom */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2">
        <button
          onClick={() => setScale((prev) => Math.max(prev - 0.2, 0.5))}
          className="w-8 h-8 bg-black/80 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white font-bold"
        >
          −
        </button>
        <button
          onClick={() => {
            setScale(1);
            setPan({ x: 0, y: 0 });
          }}
          className="h-8 px-3 bg-black/80 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white text-[10px] font-black uppercase tracking-wider"
        >
          Reset
        </button>
        <button
          onClick={() => setScale((prev) => Math.min(prev + 0.2, 3))}
          className="w-8 h-8 bg-black/80 backdrop-blur border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-white font-bold"
        >
          +
        </button>
      </div>
    </div>
  );
};
