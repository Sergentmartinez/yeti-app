import React from "react";
import { motion } from "framer-motion";

export const SleepStyleGauge = ({ total, target = 5 }: { total: number; target?: number }) => {
  const VIOLET = "#a78bfa";
  const VIOLET_LIGHT = "#c4b5fd"; 
  const PINK = "#f9a8d4";
  const BLUE = "#60a5fa";
  
  const HEIGHT = 56;
  const LEVELS = 3;
  const LEVEL_HEIGHT = HEIGHT / LEVELS;
  const BLOCK_HEIGHT = LEVEL_HEIGHT - 2;
  
  // Blocs en segments contigus - comme l'image de référence
  // Chaque segment = une "bande" continue sur un niveau
  const segments = [
    // Premier long bloc violet niveau milieu (avec descente)
    { startPct: 0, endPct: 15, level: 1, color: VIOLET },
    { startPct: 5, endPct: 10, level: 0, color: VIOLET },
    
    // Montée vers rose
    { startPct: 15, endPct: 22, level: 2, color: PINK },
    
    // Descente violet clair puis bleu
    { startPct: 22, endPct: 30, level: 1, color: VIOLET_LIGHT },
    { startPct: 30, endPct: 38, level: 0, color: BLUE },
    
    // Remontée violet
    { startPct: 38, endPct: 52, level: 1, color: VIOLET },
    { startPct: 52, endPct: 58, level: 2, color: PINK },
    
    // Groupe milieu
    { startPct: 58, endPct: 68, level: 1, color: VIOLET_LIGHT },
    { startPct: 68, endPct: 75, level: 0, color: BLUE },
    { startPct: 75, endPct: 88, level: 1, color: VIOLET },
    
    // Fin
    { startPct: 88, endPct: 95, level: 0, color: BLUE },
    { startPct: 95, endPct: 100, level: 1, color: VIOLET_LIGHT },
  ];
  
  // Lignes verticales aux transitions de niveau
  const getConnections = () => {
    const conns: { x: number; y1: number; y2: number }[] = [];
    for (let i = 0; i < segments.length - 1; i++) {
      const curr = segments[i];
      const next = segments[i + 1];
      if (curr.level !== next.level && Math.abs(curr.endPct - next.startPct) < 2) {
        const x = curr.endPct;
        const y1 = HEIGHT - (curr.level * LEVEL_HEIGHT + LEVEL_HEIGHT / 2);
        const y2 = HEIGHT - (next.level * LEVEL_HEIGHT + LEVEL_HEIGHT / 2);
        conns.push({ x, y1, y2 });
      }
    }
    return conns;
  };
  
  const connections = getConnections();
  
  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black text-white tracking-tighter">{total}</span>
          <span className="text-xl font-bold text-zinc-500">kg</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
          <span>♡</span>
          <span>Sous l&apos;objectif de {target}kg</span>
          <span>✓</span>
        </div>
      </div>
      
      <div className="relative w-full" style={{ height: HEIGHT }}>
        {/* Lignes de connexion */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {connections.map((conn, i) => (
            <line
              key={i}
              x1={`${conn.x}%`}
              y1={conn.y1}
              x2={`${conn.x}%`}
              y2={conn.y2}
              stroke="#52525b"
              strokeWidth={2}
            />
          ))}
        </svg>
        
        {/* Segments */}
        {segments.map((seg, i) => {
          const width = seg.endPct - seg.startPct;
          const bottomPx = seg.level * LEVEL_HEIGHT + 1;
          
          // Trouver voisins sur même niveau
          const hasLeft = segments.some(s => 
            s.level === seg.level && Math.abs(s.endPct - seg.startPct) < 1
          );
          const hasRight = segments.some(s => 
            s.level === seg.level && Math.abs(s.startPct - seg.endPct) < 1
          );
          
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${seg.startPct}%`,
                width: `${width}%`,
                bottom: bottomPx,
                height: BLOCK_HEIGHT,
                backgroundColor: seg.color,
                borderRadius: `${hasLeft ? 0 : 8}px ${hasRight ? 0 : 8}px ${hasRight ? 0 : 8}px ${hasLeft ? 0 : 8}px`,
                zIndex: 10,
              }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
            />
          );
        })}
      </div>
      
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide">
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: VIOLET }} />
            Bivouac
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PINK }} />
            Vêtements
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BLUE }} />
            Cuisine
          </span>
        </div>
        <span className="text-zinc-500">Total {total}kg</span>
      </div>
    </div>
  );
};