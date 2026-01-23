"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HorizontalTimelineProps {
  currentJ: number; // e.g., 58
  maxJ: number; // e.g., 60
}

const HorizontalTimeline = ({ currentJ, maxJ = 60 }: HorizontalTimelineProps) => {
  const phases = [
    { name: "PLANIF", status: "completed" },
    { name: "MATÉRIEL", status: "in-progress" },
    { name: "RAVITALL.", status: "upcoming" },
    { name: "DÉPART", status: "upcoming" }
  ];

  return (
    <div className="w-full mt-2 mb-8">
      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-4 block">Progression</span>
      
      <div className="relative flex justify-between items-center px-2">
        {/* Connecting Line */}
        <div className="absolute left-2 right-2 top-[7px] h-px bg-zinc-800" />
        
        {/* Active Line Segment (demo logic) */}
        <div className="absolute left-2 w-[33%] top-[7px] h-px bg-emerald-500" />

        {phases.map((p, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center gap-3">
            <div className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-500 flex items-center justify-center",
              p.status === 'completed' ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : 
              p.status === 'in-progress' ? "bg-black border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" :
              "bg-black border-zinc-800"
            )}>
              {p.status === 'in-progress' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
            </div>
            <span className={cn(
              "text-[8px] font-black tracking-widest whitespace-nowrap",
              p.status === 'upcoming' ? "text-zinc-600" : "text-white"
            )}>
              {p.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HorizontalTimeline;
