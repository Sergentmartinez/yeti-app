"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, RotateCcw, Grid3X3, Shuffle } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

export interface KnollingGearItem {
  id: string;
  name: string;
  brand?: string;
  weight: number;
  category: string;
  image: string;
  scale?: number;
  owned?: boolean;
  essential?: boolean;
  price?: number;
}

interface ItemPosition {
  id: string;
  x: number;
  y: number;
}

interface KnollingFloorProps {
  items: KnollingGearItem[];
  selectedItem: KnollingGearItem | null;
  onSelectItem: (item: KnollingGearItem | null) => void;
  floorStyle?: "concrete" | "sage" | "dark";
  className?: string;
}

// ============================================================================
// SIMPLE DRAGGABLE ITEM - Sans effet physique
// ============================================================================

const DraggableItem = ({
  item,
  position,
  isSelected,
  onSelect,
  onPositionChange,
}: {
  item: KnollingGearItem;
  position: { x: number; y: number };
  isSelected: boolean;
  onSelect: (item: KnollingGearItem) => void;
  onPositionChange: (id: string, pos: { x: number; y: number }) => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState(position);
  const itemRef = useRef<HTMLDivElement>(null);

  // Taille basée sur le scale
  const size = (item.scale || 1) * 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setCurrentPos({ x: newX, y: newY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(item.id, currentPos);
    }
  }, [isDragging, item.id, currentPos, onPositionChange]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Sync position from parent
  useEffect(() => {
    if (!isDragging) {
      setCurrentPos(position);
    }
  }, [position, isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      e.stopPropagation();
      onSelect(item);
    }
  };

  return (
    <div
      ref={itemRef}
      className={cn(
        "absolute select-none",
        isDragging ? "cursor-grabbing z-50" : "cursor-grab",
        isSelected && "z-40"
      )}
      style={{
        left: currentPos.x,
        top: currentPos.y,
        width: size,
        height: size,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Ombre portée simple */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)`,
          transform: "translateY(8px) scale(0.9)",
          filter: "blur(8px)",
        }}
      />

      {/* Image de l'objet */}
      <div
        className={cn(
          "relative w-full h-full bg-contain bg-center bg-no-repeat rounded-lg transition-transform duration-150",
          isDragging && "scale-105",
          isSelected && "ring-2 ring-[#dc2626] ring-offset-2 ring-offset-transparent"
        )}
        style={{
          backgroundImage: `url(${item.image})`,
          filter: isDragging ? "drop-shadow(0 8px 16px rgba(0,0,0,0.3))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
        }}
      />

      {/* Badge Essential */}
      {item.essential && (
        <div className="absolute -top-2 -left-2 px-2 py-0.5 bg-[#dc2626] text-white text-[8px] font-black uppercase tracking-wider rounded shadow-lg">
          Essential
        </div>
      )}

      {/* Badge Wishlist */}
      {!item.owned && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-amber-500 text-black text-[8px] font-black uppercase tracking-wider rounded shadow-lg">
          Wishlist
        </div>
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/90 backdrop-blur-sm rounded-lg whitespace-nowrap pointer-events-none transition-opacity duration-200",
          (isDragging || isSelected) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      >
        <span className="text-[10px] font-bold text-white block">{item.name}</span>
        <span className="text-[9px] text-zinc-400">
          {(item.weight / 1000).toFixed(2)}kg
          {item.brand && ` • ${item.brand}`}
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// KNOLLING FLOOR - Main Component
// ============================================================================

export const KnollingFloor: React.FC<KnollingFloorProps> = ({
  items,
  selectedItem,
  onSelectItem,
  floorStyle = "sage",
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Positions des items
  const [positions, setPositions] = useState<ItemPosition[]>(() => {
    const cols = 6;
    const spacing = 140;
    return items.map((item, index) => ({
      id: item.id,
      x: (index % cols) * spacing + 100,
      y: Math.floor(index / cols) * spacing + 100,
    }));
  });

  // Floor backgrounds
  const floorBackgrounds = {
    sage: {
      bg: "#7a8b7a", // Vert sauge comme la photo knolling
      texture: "url('/images/floor-texture.jpg')", // Tu peux ajouter ta texture
      overlay: "linear-gradient(135deg, rgba(122,139,122,0.9) 0%, rgba(100,115,100,0.95) 100%)",
    },
    concrete: {
      bg: "#a0a0a0",
      texture: "none",
      overlay: `
        radial-gradient(ellipse at 30% 20%, rgba(180,180,180,0.3) 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, rgba(120,120,120,0.2) 0%, transparent 50%),
        linear-gradient(135deg, #a8a8a8 0%, #909090 50%, #a0a0a0 100%)
      `,
    },
    dark: {
      bg: "#1a1a1a",
      texture: "none",
      overlay: `
        radial-gradient(ellipse at 50% 50%, rgba(40,40,40,0.5) 0%, transparent 70%),
        linear-gradient(135deg, #1f1f1f 0%, #0a0a0a 100%)
      `,
    },
  };

  const currentFloor = floorBackgrounds[floorStyle];

  // Zoom avec molette (Ctrl + molette)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.002;
        setScale((prev) => Math.min(Math.max(prev + delta, 0.3), 2));
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // Pan avec souris (clic molette ou Shift + clic)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    } else if (e.button === 0 && e.target === e.currentTarget) {
      onSelectItem(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsPanning(false);
  const handleContextMenu = (e: React.MouseEvent) => e.preventDefault();

  // Update position
  const handlePositionChange = useCallback((id: string, pos: { x: number; y: number }) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...pos } : p))
    );
  }, []);

  // Auto-arrange (Knolling parfait)
  const autoArrange = useCallback(() => {
    const cols = Math.ceil(Math.sqrt(items.length * 1.3));
    const spacing = 130;
    setPositions(
      items.map((item, index) => ({
        id: item.id,
        x: (index % cols) * spacing + 80,
        y: Math.floor(index / cols) * spacing + 80,
      }))
    );
  }, [items]);

  // Scatter (désordre)
  const scatter = useCallback(() => {
    setPositions(
      items.map((item) => ({
        id: item.id,
        x: Math.random() * 700 + 100,
        y: Math.random() * 500 + 100,
      }))
    );
  }, [items]);

  // Reset view
  const resetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSelectItem(null);
      if (e.key === "r" || e.key === "R") resetView();
      if (e.key === "+" || e.key === "=") setScale((p) => Math.min(p + 0.1, 2));
      if (e.key === "-") setScale((p) => Math.max(p - 0.1, 0.3));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelectItem, resetView]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden rounded-2xl",
        isPanning ? "cursor-grabbing" : "cursor-default",
        className
      )}
      style={{ backgroundColor: currentFloor.bg }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onContextMenu={handleContextMenu}
    >
      {/* Floor texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: currentFloor.overlay }}
      />

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.3) 100%)",
        }}
      />

      {/* Canvas transformable */}
      <div
        className="absolute origin-top-left"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          width: "2500px",
          height: "2000px",
        }}
      >
        {items.map((item) => {
          const pos = positions.find((p) => p.id === item.id);
          if (!pos) return null;

          return (
            <DraggableItem
              key={item.id}
              item={item}
              position={{ x: pos.x, y: pos.y }}
              isSelected={selectedItem?.id === item.id}
              onSelect={onSelectItem}
              onPositionChange={handlePositionChange}
            />
          );
        })}
      </div>

      {/* === CONTROLS UI === */}

      {/* Zoom controls - Top Right */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-xl p-2">
        <button
          onClick={() => setScale((p) => Math.max(p - 0.2, 0.3))}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ZoomOut className="w-4 h-4 text-white" />
        </button>
        <span className="text-xs font-bold text-white min-w-[50px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => setScale((p) => Math.min(p + 0.2, 2))}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        >
          <ZoomIn className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Action buttons - Top Left */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={autoArrange}
          className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-xl text-xs font-bold text-white hover:bg-black/80 transition-colors"
        >
          <Grid3X3 className="w-4 h-4" />
          Knolling
        </button>
        <button
          onClick={scatter}
          className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-xl text-xs font-bold text-white hover:bg-black/80 transition-colors"
        >
          <Shuffle className="w-4 h-4" />
          Scatter
        </button>
        <button
          onClick={resetView}
          className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-xl text-xs font-bold text-white hover:bg-black/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
      </div>

      {/* Help - Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-[10px] text-zinc-300 space-y-1">
        <div><span className="text-white font-semibold">Shift + Drag</span> = Pan</div>
        <div><span className="text-white font-semibold">Ctrl + Scroll</span> = Zoom</div>
        <div><span className="text-white font-semibold">R</span> = Reset</div>
      </div>

      {/* Stats - Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-3">
        <span className="text-xs font-black text-[#dc2626]">{items.length}</span>
        <span className="text-xs text-zinc-400">items</span>
        <span className="text-xs text-zinc-500">•</span>
        <span className="text-xs font-bold text-white">
          {(items.reduce((s, i) => s + i.weight, 0) / 1000).toFixed(2)}kg
        </span>
      </div>
    </div>
  );
};

export default KnollingFloor;
