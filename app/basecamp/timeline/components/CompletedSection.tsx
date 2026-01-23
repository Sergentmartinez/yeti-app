'use client';

import { Task } from '@/lib/types/timeline';
import { ChevronRight, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CompletedSectionProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function CompletedSection({ tasks, onTaskClick }: CompletedSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const completedTasks = tasks.filter(t => t.status === 'done');

  if (completedTasks.length === 0) {
    return null;
  }

  const formatCompletionDate = (task: Task) => {
    const date = task.completedAt || task.updatedAt;
    try {
      // EXACT Google format: "mer. 14 janv."
      return format(date, 'EEE d MMM', { locale: fr });
    } catch {
      return 'date inconnue';
    }
  };

  return (
    <div className="mt-6">
      {/* Toggle button - EXACT Google */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full py-2 px-3 rounded-lg transition-colors text-sm hover:opacity-80"
        style={{ color: 'var(--text-muted)' }}
      >
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        <span>Tâches terminées ({completedTasks.length})</span>
      </button>

      {/* Completed tasks */}
      {isExpanded && (
        <div className="mt-1 space-y-0.5">
          {completedTasks.map((task) => (
            <div key={task.id}>
              <div
                onClick={() => onTaskClick?.(task)}
                className="flex items-center gap-3 py-2.5 px-3 cursor-pointer transition-colors rounded-lg hover:opacity-80"
                style={{ background: 'var(--bg-surface-3)' }}
              >
                {/* Checkbox (checked) - circular - DÉCOCHABLE! */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle pour décocher
                    const { toggleTask } = require('@/lib/store/useTimelineStore').useTimelineStore.getState();
                    toggleTask(task.id);
                  }}
                  className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-blue-500 bg-blue-500 flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <Check size={12} className="text-white stroke-[3]" />
                </button>

                <div className="flex-1 min-w-0">
                  {/* Title (strikethrough) */}
                  <p className="text-sm line-through" style={{ color: 'var(--text-faint)' }}>
                    {task.title}
                  </p>

                  {/* Description if present */}
                  {task.description && (
                    <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-faint)' }}>
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Completion date - EXACT Google format */}
              {task.completedAt && (
                <p className="text-xs ml-11 -mt-1 mb-1" style={{ color: 'var(--text-faint)' }}>
                  Terminée : {formatCompletionDate(task)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
