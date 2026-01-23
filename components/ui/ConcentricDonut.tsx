import React from "react";
import { motion } from "framer-motion";

interface Ring {
  id: string;
  value: number; // 0-100
  color: string;
  label?: string;
}

interface ConcentricDonutProps {
  rings: Ring[];
  size?: number;
  strokeWidth?: number;
  gap?: number;
  globalLabel?: string;
  globalValue?: number;
}

export const ConcentricDonut = ({
  rings,
  size = 140,
  strokeWidth = 8,
  gap = 6,
  globalLabel = "Global",
  globalValue,
}: ConcentricDonutProps) => {
  const center = size / 2;
  
  // Calculate default global value if not provided (average of rings)
  const displayValue = globalValue !== undefined 
    ? globalValue 
    : Math.round(rings.reduce((acc, r) => acc + r.value, 0) / (rings.length || 1));

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Percentage Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <span className="text-3xl font-black text-white leading-none">{displayValue}%</span>
        {globalLabel && (
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
            {globalLabel}
          </span>
        )}
      </div>

      <svg width={size} height={size} className="-rotate-90">
        {rings.map((ring, index) => {
          // Outer ring is at index 0? Or Inner? 
          // Image 1 shows concentric rings. 
          // Let's assume index 0 is Outer.
          const radius = (size - strokeWidth) / 2 - index * (strokeWidth + gap);
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (ring.value / 100) * circumference;

          return (
            <g key={ring.id}>
              {/* Background Track */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#27272a"
                strokeWidth={strokeWidth}
                strokeOpacity={0.4}
                strokeLinecap="round"
              />
              {/* Progress */}
              <motion.circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.2 }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
