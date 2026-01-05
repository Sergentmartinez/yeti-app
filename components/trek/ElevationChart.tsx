"use client";
import { POI } from "@/types";

interface ElevationChartProps { 
  profile: number[]; 
  pois?: POI[]; 
  theme?: "orange" | "spirit"; 
  height?: number; 
}

export function ElevationChart({ profile, pois, theme = "orange", height = 200 }: ElevationChartProps) {
  if (!profile || profile.length < 2) {
    return (
      <div className="w-full h-32 bg-stone-100 rounded-lg flex items-center justify-center text-stone-400 text-sm">
        Pas de données
      </div>
    );
  }
  
  const width = 800;
  const topPadding = 40, bottomPadding = 10;
  const drawHeight = height - topPadding - bottomPadding;
  
  let realMin = Math.min(...profile), realMax = Math.max(...profile);
  const range = realMax - realMin;
  if (range < 500) { 
    realMax += (500 - range) / 2; 
    realMin -= (500 - range) / 2; 
  }
  const scaleMax = realMax * 1.05, scaleMin = realMin * 0.95;
  
  const points = profile.map((alt, i) => {
    const x = (i / (profile.length - 1)) * width;
    const y = height - bottomPadding - ((alt - scaleMin) / (scaleMax - scaleMin)) * drawHeight;
    return `${x},${y}`;
  }).join(" ");
  
  const fillPoints = `0,${height} ${points} ${width},${height}`;
  const strokeColor = theme === "spirit" ? "#2563eb" : "#ea580c";
  const gradientId = `elev-${Math.random().toString(36).substring(7)}`;
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full block">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill={`url(#${gradientId})`} />
      <polyline points={points} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {pois?.map((poi, idx) => {
        const realX = (poi.x / 100) * width;
        const closestIndex = Math.round((poi.x / 100) * (profile.length - 1));
        const alt = profile[Math.min(closestIndex, profile.length - 1)];
        const y = height - bottomPadding - ((alt - scaleMin) / (scaleMax - scaleMin)) * drawHeight;
        return (
          <g key={idx}>
            <line x1={realX} y1={y} x2={realX} y2={height} stroke={strokeColor} strokeWidth="1" strokeDasharray="4,4" opacity="0.3" />
            <circle cx={realX} cy={y} r="4" fill="white" stroke={strokeColor} strokeWidth="2" />
            <text x={realX} y={y - 12} fontSize="11" textAnchor="middle" fill="#44403c" fontWeight="bold" fontFamily="system-ui, sans-serif">{poi.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
