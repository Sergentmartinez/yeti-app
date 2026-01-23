'use client';

import { Icons } from '@/components/icons';
import { AlertTriangle, CheckCircle2, Clock, Package, Calendar, CloudAlert, TrendingUp } from 'lucide-react';

// Données de démo pour les alertes
const ALERTS = [
  {
    id: 1,
    type: 'warning',
    project: 'GR20 Nord → Sud',
    title: 'Tente non confirmée',
    description: 'La réservation de votre tente MSR Hubba Hubba expire dans 3 jours',
    date: '2026-01-22',
    category: 'gear'
  },
  {
    id: 2,
    type: 'warning',
    project: 'GR20 Nord → Sud',
    title: 'Météo défavorable',
    description: 'Risque d\'orages prévu sur les étapes 3-5 pour votre date de départ',
    date: '2026-01-20',
    category: 'weather'
  },
  {
    id: 3,
    type: 'info',
    project: 'GR20 Nord → Sud',
    title: 'Tâche en retard',
    description: 'Réserver le ferry Marseille-Bastia',
    date: '2026-01-15',
    category: 'task'
  },
  {
    id: 4,
    type: 'info',
    project: 'Tour du Mont-Blanc',
    title: 'Refuge à réserver',
    description: 'Les refuges du TMB ouvrent leurs réservations le 1er février',
    date: '2026-02-01',
    category: 'task'
  },
];

// Stats globales
const GLOBAL_STATS = [
  { label: 'Projets actifs', value: '3', icon: Icons.Folder, color: 'text-accent-cyan' },
  { label: 'Tâches restantes', value: '24', icon: Icons.Activity, color: 'text-accent-orange' },
  { label: 'Articles garage', value: '62', icon: Package, color: 'text-accent-emerald' },
  { label: 'Jours avant GR20', value: 'J-60', icon: Calendar, color: 'text-accent-purple' },
];

export default function ControlCenterPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary mb-2">Centre de contrôle</h1>
        <p className="text-text-muted">Vue d'ensemble de toutes vos expéditions et alertes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {GLOBAL_STATS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-bg-surface-2 rounded-xl p-4 border border-border-subtle"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-bg-surface-3 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
              <div className="text-sm text-text-muted">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Alerts Section */}
      <div className="bg-bg-surface-2 rounded-xl border border-border-subtle overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent-orange-muted">
              <AlertTriangle className="w-5 h-5 text-accent-orange" />
            </div>
            <div>
              <h2 className="font-bold text-text-primary">Alertes & Actions</h2>
              <p className="text-sm text-text-muted">{ALERTS.length} éléments nécessitent votre attention</p>
            </div>
          </div>
          
          {/* Filter toggle */}
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-medium rounded-lg bg-bg-surface-3 text-text-primary">
              Tous les projets
            </button>
          </div>
        </div>

        {/* Alerts List */}
        <div className="divide-y divide-border-subtle">
          {ALERTS.map((alert) => (
            <div 
              key={alert.id}
              className="px-5 py-4 hover:bg-bg-surface-3/30 transition-colors flex items-start gap-4"
            >
              {/* Icon */}
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                alert.type === 'warning' 
                  ? 'bg-accent-orange-muted' 
                  : 'bg-accent-cyan-muted'
              }`}>
                {alert.category === 'weather' ? (
                  <CloudAlert className={`w-5 h-5 ${alert.type === 'warning' ? 'text-accent-orange' : 'text-accent-cyan'}`} />
                ) : alert.category === 'gear' ? (
                  <Package className={`w-5 h-5 ${alert.type === 'warning' ? 'text-accent-orange' : 'text-accent-cyan'}`} />
                ) : (
                  <Clock className={`w-5 h-5 ${alert.type === 'warning' ? 'text-accent-orange' : 'text-accent-cyan'}`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-bg-surface-3 text-text-muted">
                    {alert.project}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary mb-1">{alert.title}</h3>
                <p className="text-sm text-text-muted">{alert.description}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-2 rounded-lg hover:bg-bg-surface-3 transition-colors text-text-muted hover:text-accent-emerald">
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Progress Overview */}
        <div className="bg-bg-surface-2 rounded-xl border border-border-subtle p-5">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-cyan" />
            <h3 className="font-bold text-text-primary">Progression globale</h3>
          </div>
          
          <div className="space-y-4">
            {[
              { name: 'GR20 Nord → Sud', progress: 85, daysLeft: 60 },
              { name: 'Tour du Mont-Blanc', progress: 42, daysLeft: 116 },
              { name: 'Camino Frances', progress: 15, daysLeft: 225 },
            ].map((project, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text-primary">{project.name}</span>
                  <span className="text-sm text-text-muted">J-{project.daysLeft}</span>
                </div>
                <div className="h-2 bg-bg-surface-4 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${project.progress}%`,
                      background: project.progress >= 80 ? 'var(--accent-emerald)' 
                        : project.progress >= 20 ? 'var(--accent-orange)' 
                        : 'var(--accent-red)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-bg-surface-2 rounded-xl border border-border-subtle p-5">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-accent-orange" />
            <h3 className="font-bold text-text-primary">Prochaines échéances</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { task: 'Réserver ferry Marseille-Bastia', project: 'GR20', date: 'Aujourd\'hui', urgent: true },
              { task: 'Commander cartouches gaz', project: 'GR20', date: 'Dans 3 jours', urgent: false },
              { task: 'Vérifier passeport', project: 'Camino', date: 'Dans 1 semaine', urgent: false },
              { task: 'Réserver refuges TMB', project: 'TMB', date: '1er février', urgent: false },
            ].map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface-3/50"
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.urgent ? 'bg-accent-red' : 'bg-accent-cyan'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text-primary truncate">{item.task}</div>
                  <div className="text-xs text-text-muted">{item.project} • {item.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
