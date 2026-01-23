'use client';

import { Phase } from '@/lib/types/timeline';
import { DraggableTaskItem } from './DraggableTaskItem';
import { QuickAddTask } from './QuickAddTask';
import { CompletedSection } from './CompletedSection';
import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Printer, Share2, Download } from 'lucide-react';
import { PhaseIcon } from './PhaseIcon';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTimelineStore } from '@/lib/store/useTimelineStore';

interface ListSectionProps {
  phase: Phase;
  onTaskEdit: (taskId: string) => void;
}

export function ListSection({ phase, onTaskEdit }: ListSectionProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { filters } = useTimelineStore();

  // Apply filters
  const filterTasks = (tasks: typeof phase.tasks) => {
    return tasks.filter(task => {
      // Priority filter
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }
      // Tag filter
      if (filters.tag && !task.tags.includes(filters.tag)) {
        return false;
      }
      return true;
    });
  };

  const filteredTasks = filterTasks(phase.tasks);
  const activeTasks = filteredTasks.filter(t => t.status !== 'done');
  const completedTasks = filteredTasks.filter(t => t.status === 'done');
  const remainingCount = activeTasks.length;
  const totalInPhase = phase.tasks.filter(t => t.status !== 'done').length;

  // Setup droppable
  const { setNodeRef, isOver } = useDroppable({
    id: `phase-${phase.id}`,
    data: {
      type: 'phase',
      phaseId: phase.id,
    }
  });

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const handlePrintList = () => {
    const printContent = document.createElement('div');
    printContent.innerHTML = `
      <h1 style="font-size: 24px; margin-bottom: 16px;">${phase.name}</h1>
      <ul style="list-style: none; padding: 0;">
        ${phase.tasks.map(t => `
          <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
            ${t.status === 'done' ? '☑' : '☐'} ${t.title}
            ${t.dueDate ? `<span style="color: #666; margin-left: 8px;">(${t.dueDate})</span>` : ''}
          </li>
        `).join('')}
      </ul>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>${phase.name} - YETI</title></head>
          <body style="font-family: system-ui, sans-serif; padding: 40px;">
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    setShowMenu(false);
  };

  const handleExportList = () => {
    const data = {
      name: phase.name,
      tasks: phase.tasks.map(t => ({
        title: t.title,
        status: t.status,
        dueDate: t.dueDate,
        priority: t.priority
      }))
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${phase.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setShowMenu(false);
  };

  return (
    <div 
      ref={setNodeRef}
      className="rounded-xl p-6 shadow-sm transition-all duration-200"
      style={{
        background: 'var(--bg-surface-2)',
        border: isOver ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
        transform: isOver ? 'scale(1.01)' : 'scale(1)',
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between mb-6 pb-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent-cyan-muted)' }}
          >
            <PhaseIcon icon={phase.id} size={20} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {phase.name}
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {remainingCount === totalInPhase 
                ? `${remainingCount} restante${remainingCount !== 1 ? 's' : ''}`
                : `${remainingCount}/${totalInPhase} (filtrées)`
              }
            </p>
          </div>
        </div>

        {/* More actions button */}
        <div className="relative">
          <button 
            ref={buttonRef}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-surface-3)' }}
          >
            <MoreVertical className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div 
              ref={menuRef}
              className="absolute right-0 top-full mt-1 w-48 rounded-xl shadow-xl py-2 z-50"
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-default)'
              }}
            >
              <button
                onClick={handlePrintList}
                className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
                style={{ color: 'var(--text-primary)' }}
              >
                <Printer size={16} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm">Imprimer cette liste</span>
              </button>

              <button
                onClick={handleExportList}
                className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
                style={{ color: 'var(--text-primary)' }}
              >
                <Download size={16} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm">Exporter (JSON)</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/timeline?list=${phase.id}`);
                  setShowMenu(false);
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
                style={{ color: 'var(--text-primary)' }}
              >
                <Share2 size={16} style={{ color: 'var(--text-muted)' }} />
                <span className="text-sm">Partager</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Task */}
      <div className="mb-4">
        <QuickAddTask phaseId={phase.id} />
      </div>

      {/* Active Tasks - Sortable */}
      <SortableContext 
        items={activeTasks.map(t => t.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 min-h-[50px]">
          {activeTasks.length === 0 ? (
            <div 
              className="py-8 text-center rounded-lg border-2 border-dashed transition-colors"
              style={{ 
                borderColor: isOver ? 'var(--accent-cyan)' : 'var(--border-subtle)',
                background: isOver ? 'var(--accent-cyan-muted)' : 'transparent'
              }}
            >
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {isOver ? 'Déposer ici' : 'Aucune tâche active'}
              </p>
              {!isOver && (
                <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>
                  Ajoutez une tâche ci-dessus ou glissez-déposez
                </p>
              )}
            </div>
          ) : (
            activeTasks.map((task) => (
              <DraggableTaskItem
                key={task.id}
                task={task}
                onEdit={() => onTaskEdit(task.id)}
              />
            ))
          )}
        </div>
      </SortableContext>

      {/* Completed Section */}
      {completedTasks.length > 0 && (
        <CompletedSection 
          tasks={completedTasks}
          onTaskClick={(task) => onTaskEdit(task.id)}
        />
      )}
    </div>
  );
}
