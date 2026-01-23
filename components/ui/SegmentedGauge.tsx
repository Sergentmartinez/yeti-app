import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { GAUGE_PRESETS, type GaugePreset } from "./gaugePresets";

export interface Segment {
  id: string;
  value: number; // raw value
  color: string;
  label?: string;
}

interface SegmentedGaugeProps {
  segments: Segment[];
  total: number; // Total value to calculate percentages against.
  preset?: GaugePreset;
  className?: string; // Allow overriding/adding classes
  showConnectingLine?: boolean; // Keep for backward compatibility or manual override if needed, though preset usually dictates
  height?: number; // Keep for backward compatibility
}

export const SegmentedGauge = ({
  segments,
  total,
  preset = "pack",
  className,
  showConnectingLine: manualShowLine,
  height: manualHeight,
}: SegmentedGaugeProps) => {
  const p = GAUGE_PRESETS[preset];
  
  // Allow manual overrides if strictly necessary, but prefer preset
  const height = manualHeight ?? p.height;
  const showConnectingLine = manualShowLine ?? p.showConnectingLine;
  const radius = p.radius;
  const gap = p.gap;

  // garde-fou : clamp + normalisation (ensure no negative values)
  const safeTotal = total > 0 ? total : 1;
  const safeSegments = segments.map(s => ({
    ...s,
    value: Math.max(0, s.value),
  }));

  const sumValues = safeSegments.reduce((acc, s) => acc + s.value, 0);
  
  // Calculate percentages based on total
  const parsedSegments = safeSegments.map(s => ({
    ...s,
    percent: (s.value / safeTotal) * 100
  }));

  return (
    <div 
      className={cn("relative w-full flex items-center", p.containerClassName, className)} 
      style={{ height }}
      data-testid={`gauge-${preset}`}
    >
      {/* Connecting Line (The "Void" connector) */}
      {showConnectingLine && (
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-800 w-full z-0" />
      )}

      {/* Segments Container */}
      <div className="relative w-full h-full flex items-center z-10 font-sans" style={{ gap: gap }}>
        {parsedSegments.map((seg, i) => {
          // "ijauge" visual tweak: Vary height slightly for 'pack' style to match "audio wave" or "tech" look
          // If preset is 'pack', maybe we toggle between 80% and 100% height?
          // Or just keep full height but add a top gradient overlay
          
          const isStaggered = preset === 'pack';
          // Varied height pattern for visual interest if 'pack'
          // cycle: 100%, 75%, 90%, 85%... based on index
          const segmentHeight = isStaggered ? [100, 70, 90, 80][i % 4] + '%' : '100%';
          
          return (
            <motion.div
              key={seg.id}
              className={cn(
                "relative flex items-center justify-center group overflow-hidden shadow-lg",
                // Add a subtle border/ring for 'tech' feel
                "ring-1 ring-white/5"
              )}
              style={{ 
                width: `${seg.percent}%`,
                height: segmentHeight, 
                backgroundColor: seg.color,
                borderRadius: radius,
                // Add a subtle gradient
                backgroundImage: `linear-gradient(to bottom right, rgba(255,255,255,0.15), rgba(0,0,0,0.1))`
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {/* Optional: Hover Label */}
              <div className="opacity-0 group-hover:opacity-100 absolute inset-0 flex items-center justify-center bg-black/20 text-[9px] font-bold text-white transition-opacity backdrop-blur-sm">
                {seg.value}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
