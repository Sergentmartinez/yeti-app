'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Printer } from 'lucide-react';
import { Task, Phase } from '@/lib/types/timeline';
import { TaskItem } from './TaskItem';
import { QuickAddTask } from './QuickAddTask';
import { TaskEditModal } from './TaskEditModal';
import { useTimelineStore } from '@/lib/store/useTimelineStore';
import { PhaseIcon } from './PhaseIcon';

interface PhaseSectionProps {
  phase: Phase;
}

export function PhaseSection({ phase }: PhaseSectionProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showPhaseMenu, setShowPhaseMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showCompleted } = useTimelineStore();

  const visibleTasks = showCompleted 
    ? phase.tasks 
    : phase.tasks.filter(t => t.status !== 'done');

  const completedCount = phase.tasks.filter(t => t.status === 'done').length;
  const totalCount = phase.tasks.length;

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          menuButtonRef.current && !menuButtonRef.current.contains(e.target as Node)) {
        setShowPhaseMenu(false);
      }
    };

    if (showPhaseMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPhaseMenu]);

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimer ${phase.name}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
            h1 { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
            .subtitle { color: #666; font-size: 14px; margin-bottom: 20px; }
            .task { padding: 10px 0; border-bottom: 1px solid #e5e5e5; }
            .task-title { font-weight: 500; }
            .task-desc { color: #666; font-size: 13px; margin-top: 4px; }
            .task-done { text-decoration: line-through; opacity: 0.6; }
            .checkbox { display: inline-block; width: 16px; height: 16px; border: 2px solid #666; 
                       border-radius: 50%; margin-right: 10px; vertical-align: middle; }
            .checkbox-done { background: #3b82f6; border-color: #3b82f6; }
          </style>
        </head>
        <body>
          <h1>${phase.name}</h1>
          <p class="subtitle">${phase.dateRange} • ${completedCount}/${totalCount} tâches complétées</p>
          ${phase.tasks.map(task => `
            <div class="task ${task.status === 'done' ? 'task-done' : ''}">
              <span class="checkbox ${task.status === 'done' ? 'checkbox-done' : ''}"></span>
              <span class="task-title">${task.title}</span>
              ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
            </div>
          `).join('')}
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    setShowPhaseMenu(false);
  };

  return (
    <>
      <div 
        className="rounded-xl overflow-hidden print:border-zinc-300"
        style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-subtle)'
        }}
      >
        {/* Phase Header */}
        <div 
          className="p-4 print:border-zinc-300"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--accent-cyan-muted)' }}
              >
                <PhaseIcon icon={phase.id} size={18} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <h3 className="text-lg font-bold print:text-black" style={{ color: 'var(--text-primary)' }}>
                {phase.name}
              </h3>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm print:text-gray-600" style={{ color: 'var(--text-muted)' }}>
                {completedCount}/{totalCount} tâches
              </span>
              
              {/* Phase Menu Button */}
              <button
                ref={menuButtonRef}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuPosition({ x: rect.right - 200, y: rect.bottom + 4 });
                  setShowPhaseMenu(!showPhaseMenu);
                }}
                className="p-1.5 rounded transition-colors no-print hover:opacity-80"
                style={{ background: 'var(--bg-surface-3)' }}
              >
                <MoreVertical size={16} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          </div>
          <p className="text-xs print:text-gray-500" style={{ color: 'var(--text-faint)' }}>
            {phase.dateRange}
          </p>
        </div>

        {/* Phase Menu */}
        {showPhaseMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowPhaseMenu(false)} />
            <div
              ref={menuRef}
              className="fixed z-50 rounded-lg shadow-2xl py-2 w-56"
              style={{ 
                top: `${menuPosition.y}px`, 
                left: `${menuPosition.x}px`,
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-default)'
              }}
            >
              <button
                onClick={handlePrint}
                className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
              >
                <Printer size={18} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  Imprimer cette liste
                </span>
              </button>
            </div>
          </>
        )}

        {/* Tasks List */}
        <div className="p-2 print:p-3">
          {visibleTasks.length > 0 ? (
            <div className="space-y-0.5">
              {visibleTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onEdit={() => setEditingTask(task)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center no-print">
              <div 
                className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-surface-3)' }}
              >
                <PhaseIcon icon="list" size={28} style={{ color: 'var(--text-faint)', opacity: 0.5 }} />
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Aucune tâche dans cette phase
              </p>
            </div>
          )}

          {/* Quick Add */}
          <div 
            className="mt-2 pt-2 no-print"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <QuickAddTask phaseId={phase.id} />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
