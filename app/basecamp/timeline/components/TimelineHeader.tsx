'use client';

import { Calendar } from 'lucide-react';

export function TimelineHeader() {
  // Calcul de J-X (60 jours avant le départ pour cet exemple)
  const departureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const daysUntil = Math.ceil((departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Timeline de Préparation
          </h1>
          <p className="text-base mt-1" style={{ color: 'var(--text-muted)' }}>
            Départ prévu le {departureDate.toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Right: Countdown Badge */}
        <div 
          className="flex items-center gap-3 rounded-xl px-6 py-4"
          style={{
            background: 'var(--accent-cyan-muted)',
            border: '1px solid var(--accent-cyan)'
          }}
        >
          <Calendar className="w-8 h-8" style={{ color: 'var(--accent-cyan)' }} />
          <div>
            <div className="text-3xl font-bold" style={{ color: 'var(--accent-cyan)' }}>
              J-{daysUntil}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              jours restants
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
