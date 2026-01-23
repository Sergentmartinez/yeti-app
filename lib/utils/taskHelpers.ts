// lib/utils/taskHelpers.ts
import { Task, Phase, Priority, TaskStatus } from '@/lib/types/timeline';

/**
 * Calcule la progression globale
 */
export function calculateProgress(phases: Phase[]): {
  total: number;
  completed: number;
  percent: number;
} {
  let total = 0;
  let completed = 0;

  phases.forEach(phase => {
    phase.tasks.forEach(task => {
      if (task.status !== 'archived') {
        total++;
        if (task.status === 'done') {
          completed++;
        }
      }
    });
  });

  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}

/**
 * Compte les tâches critiques
 */
export function countCriticalTasks(phases: Phase[]): number {
  return phases.reduce((count, phase) => {
    return count + phase.tasks.filter(
      t => t.priority === 'critical' && t.status !== 'done' && t.status !== 'archived'
    ).length;
  }, 0);
}

/**
 * Compte les tâches en retard
 */
export function countOverdueTasks(phases: Phase[], currentJ: number): number {
  return phases.reduce((count, phase) => {
    return count + phase.tasks.filter(task => {
      if (task.status === 'done' || task.status === 'archived') return false;
      
      const match = task.dueDate.match(/J-(\d+)/);
      if (!match) return false;
      
      const taskJ = parseInt(match[1], 10);
      return taskJ > currentJ;
    }).length;
  }, 0);
}

/**
 * Génère un ID unique
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Retourne les couleurs pour une priorité
 */
export function getPriorityColors(priority: Priority) {
  const colors = {
    low: {
      bg: 'bg-slate-800/30',
      border: 'border-slate-700',
      text: 'text-slate-400',
      badge: 'bg-slate-700/50 text-slate-300'
    },
    medium: {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-600/30',
      text: 'text-yellow-500',
      badge: 'bg-yellow-900/50 text-yellow-300'
    },
    high: {
      bg: 'bg-orange-900/20',
      border: 'border-orange-600/30',
      text: 'text-orange-500',
      badge: 'bg-orange-900/50 text-orange-300'
    },
    critical: {
      bg: 'bg-red-900/30',
      border: 'border-red-600/50',
      text: 'text-red-400',
      badge: 'bg-red-900/50 text-red-300'
    }
  };

  return colors[priority];
}

/**
 * Retourne les couleurs pour un statut
 */
export function getStatusColors(status: TaskStatus) {
  const colors = {
    todo: {
      checkbox: 'border-slate-500 hover:border-cyan-400',
      bg: 'bg-zinc-900'
    },
    'in-progress': {
      checkbox: 'border-cyan-400 bg-cyan-400/10',
      bg: 'bg-cyan-900/10 ring-1 ring-cyan-400/20'
    },
    done: {
      checkbox: 'border-emerald-500 bg-emerald-500',
      bg: 'bg-zinc-900/30 opacity-60'
    },
    archived: {
      checkbox: 'border-slate-700',
      bg: 'bg-zinc-950/20 opacity-40'
    }
  };

  return colors[status];
}

/**
 * Filtre les tâches selon les critères
 */
export function filterTasks(
  tasks: Task[],
  filter: {
    status?: TaskStatus[];
    priority?: Priority[];
    tags?: string[];
    search?: string;
  }
): Task[] {
  return tasks.filter(task => {
    // Filtre par statut
    if (filter.status && filter.status.length > 0) {
      if (!filter.status.includes(task.status)) return false;
    }

    // Filtre par priorité
    if (filter.priority && filter.priority.length > 0) {
      if (!filter.priority.includes(task.priority)) return false;
    }

    // Filtre par tags
    if (filter.tags && filter.tags.length > 0) {
      const hasTag = filter.tags.some(tag => task.tags.includes(tag));
      if (!hasTag) return false;
    }

    // Filtre par recherche
    if (filter.search && filter.search.trim() !== '') {
      const searchLower = filter.search.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(searchLower);
      const matchesDescription = task.description?.toLowerCase().includes(searchLower);
      const matchesNotes = task.notes?.toLowerCase().includes(searchLower);
      
      if (!matchesTitle && !matchesDescription && !matchesNotes) return false;
    }

    return true;
  });
}

/**
 * Trie les tâches
 */
export function sortTasks(
  tasks: Task[],
  sortBy: 'dueDate' | 'priority' | 'manual' | 'alphabetical'
): Task[] {
  const sorted = [...tasks];

  switch (sortBy) {
    case 'dueDate':
      return sorted.sort((a, b) => {
        const aMatch = a.dueDate.match(/J-(\d+)/);
        const bMatch = b.dueDate.match(/J-(\d+)/);
        if (!aMatch || !bMatch) return 0;
        return parseInt(bMatch[1], 10) - parseInt(aMatch[1], 10);
      });

    case 'priority':
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    case 'alphabetical':
      return sorted.sort((a, b) => a.title.localeCompare(b.title, 'fr'));

    case 'manual':
    default:
      return sorted.sort((a, b) => (a.order || 0) - (b.order || 0));
  }
}

/**
 * Calcule le temps total estimé
 */
export function calculateTotalTime(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    return total + (task.estimatedTime || 0);
  }, 0);
}

/**
 * Formate le temps en heures/minutes
 */
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
}
