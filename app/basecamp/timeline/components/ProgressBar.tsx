'use client';

interface ProgressBarProps {
  percent: number;
  color?: string;
  height?: string;
}

export function ProgressBar({ percent, color = 'bg-emerald-500', height = 'h-2' }: ProgressBarProps) {
  return (
    <div className={`w-full ${height} bg-zinc-800 rounded-full overflow-hidden`}>
      <div
        className={`${height} ${color} transition-all duration-500 ease-out rounded-full`}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
      </div>
    </div>
  );
}
