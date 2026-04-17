"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ZoomIn, ZoomOut, RotateCcw, Grid3X3, Box } from "lucide-react";
import { Knolling3DCanvas } from "./Knolling3DCanvas";

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
  realSize?: number; // Dimension physique en mètres
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
// CONSTANTES POUR LE RENDU
// ============================================================================

// Conversion des dimensions physiques (mètres) en pixels
const PIXELS_PER_CM = 2.5; // 1cm = 2.5px à l'écran (échelle réduite pour éviter les débordements)
const UNIFORM_SIZE = 120; // Taille fixe en mode 1:1 (pixels)
const MAX_REAL_SIZE = 400; // Taille maximale en mode échelle réelle (pixels)

// ============================================================================
// SIMPLE DRAGGABLE ITEM - Sans effet physique
// ============================================================================

const DraggableItem = ({
  item,
  position,
  isSelected,
  onSelect,
  onPositionChange,
  uniformMode = false,
}: {
  item: KnollingGearItem;
  position: { x: number; y: number };
  isSelected: boolean;
  onSelect: (item: KnollingGearItem) => void;
  onPositionChange: (id: string, pos: { x: number; y: number }) => void;
  uniformMode?: boolean;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mouseStart, setMouseStart] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState(position);
  const itemRef = useRef<HTMLDivElement>(null);

  // Calcul de la taille basée sur le mode
  const size = uniformMode 
    ? UNIFORM_SIZE 
    : Math.min(
        Math.round((item.realSize || item.scale || 0.5) * 100 * PIXELS_PER_CM), // realSize (mètres) -> cm -> pixels
        MAX_REAL_SIZE // Limite de sécurité
      );

  // Calcul de l'ombre basée sur la hauteur de l'objet (effet 2.5D)
  // Source lumineuse: Top-Left (45°) → Ombre projetée Bottom-Right
  const getDropShadow = () => {
    if (uniformMode) {
      // En mode uniforme, ombres légères et uniformes
      return isDragging 
        ? "drop-shadow(3px 3px 4px rgba(0,0,0,0.35)) drop-shadow(8px 8px 12px rgba(0,0,0,0.25))"
        : "drop-shadow(2px 2px 3px rgba(0,0,0,0.3)) drop-shadow(5px 5px 8px rgba(0,0,0,0.2))";
    }

    // En mode échelle réelle, ombres basées sur la taille physique
    // Technique: Double Layer (Contact Shadow + Directional Shadow)
    const realSizeCm = (item.realSize || item.scale || 0.5) * 100;
    
    let shadow = "";
    if (realSizeCm <= 10) {
      // LOW PROFILE: Objets plats (cartes, compas, lunettes, téléphone)
      // Physics: Proche du sol, ombre dure et serrée
      shadow = isDragging
        ? "drop-shadow(3px 3px 3px rgba(0,0,0,0.45)) drop-shadow(6px 6px 8px rgba(0,0,0,0.35))"
        : "drop-shadow(2px 2px 2px rgba(0,0,0,0.4)) drop-shadow(4px 4px 6px rgba(0,0,0,0.3))";
    } else if (realSizeCm <= 50) {
      // MEDIUM PROFILE: Objets standards (couteau, bouteille, chaussures)
      // Physics: Hauteur normale, ombre distincte avec projection diagonale
      shadow = isDragging
        ? "drop-shadow(5px 5px 5px rgba(0,0,0,0.4)) drop-shadow(16px 16px 20px rgba(0,0,0,0.3))"
        : "drop-shadow(4px 4px 4px rgba(0,0,0,0.35)) drop-shadow(12px 12px 15px rgba(0,0,0,0.25))";
    } else {
      // HIGH PROFILE: Grands objets (sacs, tentes, matelas, vestes)
      // Physics: Objet haut, ombre longue et diffuse
      shadow = isDragging
        ? "drop-shadow(6px 6px 6px rgba(0,0,0,0.35)) drop-shadow(30px 30px 35px rgba(0,0,0,0.25))"
        : "drop-shadow(5px 5px 5px rgba(0,0,0,0.3)) drop-shadow(25px 25px 30px rgba(0,0,0,0.2))";
    }
    
    return shadow;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    
    setDragDistance(0);
    setIsDragging(true);
    setMouseStart({ x: e.clientX, y: e.clientY });
    setDragStart({
      x: e.clientX - currentPos.x,
      y: e.clientY - currentPos.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Calculer la distance de drag
    const distance = Math.sqrt(
      Math.pow(e.clientX - mouseStart.x, 2) +
      Math.pow(e.clientY - mouseStart.y, 2)
    );
    setDragDistance(distance);
    
    setCurrentPos({ x: newX, y: newY });
  }, [isDragging, dragStart, mouseStart]);

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
    // Ne ouvrir le modal que si c'est un vrai clic (pas de drag)
    if (dragDistance < 5) {
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
        left: `${currentPos.x}px`,
        top: `${currentPos.y}px`,
        width: `${size}px`,
        height: `${size}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {/* Image de l'objet avec ombre shape-aware */}
      <div
        className={cn(
          "relative w-full h-full transition-transform duration-150 flex items-center justify-center",
          isDragging && "scale-105",
          isSelected && "ring-2 ring-[#dc2626] ring-offset-2 ring-offset-transparent"
        )}
      >
        <img 
          src={item.image} 
          alt={item.name}
          className={cn(
            "pointer-events-none transition-all duration-200",
            uniformMode ? "max-w-full max-h-full object-contain" : "w-full h-full object-contain"
          )}
          style={{
            filter: getDropShadow(),
          }}
        />
      </div>

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
  const [uniformMode, setUniformMode] = useState(false);
  const [render3D, setRender3D] = useState(true); // Toggle 3D WebGL rendering

  // Générer positions par défaut (SSR-safe)
  const getDefaultPositions = () => {
    const cols = 6;
    const spacing = 140;
    return items.map((item, index) => ({
      id: item.id,
      x: (index % cols) * spacing + 100,
      y: Math.floor(index / cols) * spacing + 100,
    }));
  };

  // Positions des items - avec persistence localStorage
  const [positions, setPositions] = useState<ItemPosition[]>(getDefaultPositions);

  // Charger depuis localStorage après le premier render (client-only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('knolling-positions');
      if (saved) {
        try {
          const savedPositions = JSON.parse(saved);
          // Vérifier que tous les items actuels ont une position
          const hasAllItems = items.every(item => 
            savedPositions.find((p: ItemPosition) => p.id === item.id)
          );
          if (hasAllItems) {
            setPositions(savedPositions);
          }
        } catch (e) {
          console.warn('Failed to load positions from localStorage', e);
        }
      }
    }
  }, []); // Run once on mount

  // Sauvegarder positions dans localStorage quand elles changent
  useEffect(() => {
    if (typeof window !== 'undefined' && positions.length > 0) {
      localStorage.setItem('knolling-positions', JSON.stringify(positions));
    }
  }, [positions]);

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

  // Zoom avec molette (SANS Ctrl)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY * 0.002;
      setScale((prev) => Math.min(Math.max(prev + delta, 0.3), 2));
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  // Auto-zoom au chargement pour tout voir
  useEffect(() => {
    if (positions.length > 0 && containerRef.current) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Trouver les bornes des items
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      
      positions.forEach(pos => {
        const item = items.find(i => i.id === pos.id);
        const size = (item?.scale || 1) * 100;
        
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + size);
        maxY = Math.max(maxY, pos.y + size);
      });
      
      const contentWidth = maxX - minX;
      const contentHeight = maxY - minY;
      
      // Calculer le scale pour tout voir avec marge
      const scaleX = (containerWidth * 0.85) / contentWidth;
      const scaleY = (containerHeight * 0.85) / contentHeight;
      const autoScale = Math.min(scaleX, scaleY, 1.5); // Max 1.5x
      
      // Centrer
      const centerX = (containerWidth - contentWidth * autoScale) / 2 - minX * autoScale;
      const centerY = (containerHeight - contentHeight * autoScale) / 2 - minY * autoScale;
      
      setScale(autoScale);
      setPan({ x: centerX, y: centerY });
    }
  }, [positions, items]);

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
        "relative w-full h-full overflow-hidden",
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

      {/* Rendering: 2D Canvas (CSS) vs 3D Canvas (WebGL) */}
      {render3D ? (
        /* Mode 3D: WebGL avec Three.js */
        <Knolling3DCanvas
          items={items}
          positions={positions}
          selectedItem={selectedItem}
          onSelectItem={onSelectItem}
        />
      ) : (
        /* Mode 2D: Canvas transformable traditionnel */
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
                uniformMode={uniformMode}
              />
            );
          })}
        </div>
      )}

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
          Reset
        </button>
        <button
          onClick={resetView}
          className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-sm rounded-xl text-xs font-bold text-white hover:bg-black/80 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset Vue
        </button>
        <button
          onClick={() => setUniformMode(!uniformMode)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 backdrop-blur-sm rounded-xl text-xs font-bold transition-colors",
            uniformMode 
              ? "bg-[#dc2626] text-white hover:bg-[#b91c1c]" 
              : "bg-black/60 text-white hover:bg-black/80"
          )}
          title={uniformMode ? "Mode Échelle Réelle" : "Mode Inventaire 1:1"}
        >
          <svg 
            className="w-4 h-4" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
          </svg>
          1:1
        </button>
        <button
          onClick={() => setRender3D(!render3D)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 backdrop-blur-sm rounded-xl text-xs font-bold transition-colors",
            render3D 
              ? "bg-purple-600 text-white hover:bg-purple-700" 
              : "bg-black/60 text-white hover:bg-black/80"
          )}
          title={render3D ? "Mode 2D (CSS)" : "Mode 3D (WebGL)"}
        >
          <Box className="w-4 h-4" />
          3D
        </button>
      </div>

      {/* Help - Bottom Left */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 text-[10px] text-zinc-300 space-y-1">
        <div><span className="text-white font-semibold">Shift + Drag</span> = Pan</div>
        <div><span className="text-white font-semibold">Molette</span> = Zoom</div>
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
