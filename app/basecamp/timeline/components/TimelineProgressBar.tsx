'use client';

import { useTimelineStore } from '@/lib/store/useTimelineStore';
import { TrendingUp, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

export function TimelineProgressBar() {
  const { stats } = useTimelineStore();

  // Calcul de la progression temporelle (J-60 → J-0)
  const departureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const daysUntil = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = 60; // J-60 à J-0
  const timelineProgress = Math.max(0, Math.min(100, ((totalDays - daysUntil) / totalDays) * 100));

  return (
    <div className="mb-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {/* Progress */}
        <div 
          className="rounded-lg p-5"
          style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent-emerald)' }} />
            <span className="text-sm uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
              Progression
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {stats.progressPercentage}%
          </div>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-faint)' }}>
            {stats.completedTasks}/{stats.totalTasks} tâches
          </p>
        </div>

        {/* Critical */}
        <div 
          className="rounded-lg p-5"
          style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" style={{ color: 'var(--accent-red)' }} />
            <span className="text-sm uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
              Critiques
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--accent-red)' }}>
            {stats.criticalTasks}
          </div>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-faint)' }}>
            Haute priorité
          </p>
        </div>

        {/* Overdue */}
        <div 
          className="rounded-lg p-5"
          style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5" style={{ color: 'var(--accent-orange)' }} />
            <span className="text-sm uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
              En retard
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--accent-orange)' }}>
            {stats.overdueTasks}
          </div>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-faint)' }}>
            À rattraper
          </p>
        </div>

        {/* Remaining */}
        <div 
          className="rounded-lg p-5"
          style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--accent-cyan)' }} />
            <span className="text-sm uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
              Restantes
            </span>
          </div>
          <div className="text-3xl font-bold" style={{ color: 'var(--accent-cyan)' }}>
            {stats.totalTasks - stats.completedTasks}
          </div>
          <p className="text-sm mt-2 font-medium" style={{ color: 'var(--text-faint)' }}>
            À faire
          </p>
        </div>
      </div>

      {/* Progress Bar - Basée sur le temps */}
      <div 
        className="rounded-lg p-5"
        style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
            Timeline
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            J-{daysUntil} / J-0
          </span>
        </div>
        <div 
          className="h-4 rounded-full overflow-hidden relative"
          style={{ background: 'var(--bg-surface-4)' }}
        >
          <div
            className="h-full transition-all duration-500"
            style={{ 
              width: `${timelineProgress}%`,
              background: 'linear-gradient(to right, var(--accent-cyan), var(--accent-emerald))'
            }}
          />
        </div>
        {/* Date markers */}
        <div className="flex justify-between mt-4 text-sm font-medium" style={{ color: 'var(--text-faint)' }}>
          <span>J-60</span>
          <span>J-45</span>
          <span>J-30</span>
          <span>J-15</span>
          <span>J-0</span>
        </div>
      </div>

      {/* Current position indicator */}
      <div className="text-center mt-4">
        <span className="text-sm font-semibold" style={{ color: 'var(--accent-cyan)' }}>
          Position actuelle : J-{daysUntil} ({Math.round(timelineProgress)}% du temps écoulé)
        </span>
      </div>
    </div>
  );
}
