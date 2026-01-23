'use client';

import { useEffect, useState } from 'react';
import { useTimelineStore } from '@/lib/store/useTimelineStore';
import { TimelineHeader } from './components/TimelineHeader';
import { TimelineProgressBar } from './components/TimelineProgressBar';
import { ListSection } from './components/ListSection';
import { FilterSortBar } from './components/FilterSortBar';
import { Printer, Sparkles, Plus } from 'lucide-react';
import { ConfirmModal } from './components/ConfirmModal';
import { PromptModal } from './components/PromptModal';
import { TaskEditModal } from './components/TaskEditModal';
import { PrintModal } from './components/PrintModal';

// DnD Kit imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Task } from '@/lib/types/timeline';
import { TaskItem } from './components/TaskItem';

export default function TimelinePage() {
  const { 
    phases, 
    loadFromTemplate, 
    recomputeStats, 
    addList,
    reorderTaskInPhase,
    moveTaskToPhase
  } = useTimelineStore();
  
  const [showTemplateConfirm, setShowTemplateConfirm] = useState(false);
  const [showNewListModal, setShowNewListModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  // DnD state
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    recomputeStats();
  }, [recomputeStats]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleLoadTemplate = () => setShowTemplateConfirm(true);
  
  const confirmLoadTemplate = () => {
    loadFromTemplate('GR20');
    setShowTemplateConfirm(false);
  };

  // DnD handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskData = active.data.current;
    
    if (taskData?.type === 'task') {
      setActiveTask(taskData.task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveTask(null);
    
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || activeData.type !== 'task') return;

    const activeTaskId = active.id as string;
    const activePhaseId = activeData.phaseId;

    // Dropped on a phase (empty area)
    if (overData?.type === 'phase') {
      const targetPhaseId = overData.phaseId;
      
      if (activePhaseId !== targetPhaseId) {
        // Move to end of target phase
        const targetPhase = phases.find(p => p.id === targetPhaseId);
        const newIndex = targetPhase ? targetPhase.tasks.filter(t => t.status !== 'done').length : 0;
        moveTaskToPhase(activeTaskId, activePhaseId, targetPhaseId, newIndex);
      }
      return;
    }

    // Dropped on another task
    if (overData?.type === 'task') {
      const overTaskId = over.id as string;
      const overPhaseId = overData.phaseId;
      
      // Find indices
      const sourcePhase = phases.find(p => p.id === activePhaseId);
      const targetPhase = phases.find(p => p.id === overPhaseId);
      
      if (!sourcePhase || !targetPhase) return;

      const activeTasks = sourcePhase.tasks.filter(t => t.status !== 'done');
      const targetActiveTasks = targetPhase.tasks.filter(t => t.status !== 'done');
      
      const oldIndex = activeTasks.findIndex(t => t.id === activeTaskId);
      const newIndex = targetActiveTasks.findIndex(t => t.id === overTaskId);

      if (activePhaseId === overPhaseId) {
        // Same phase - reorder
        if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
          reorderTaskInPhase(activePhaseId, oldIndex, newIndex);
        }
      } else {
        // Different phase - move
        moveTaskToPhase(activeTaskId, activePhaseId, overPhaseId, newIndex);
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Optional: Add visual feedback during drag
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="min-h-screen p-4 sm:p-6 print:bg-white print:p-0" style={{ background: 'var(--bg-base)' }}>
        
        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            @page { 
              margin: 1.5cm; 
              size: A4;
            }
            
            body { 
              background: white !important; 
              color: black !important; 
            }
            
            .no-print, 
            [data-quick-add], 
            header, 
            button:not(.print-checkbox) { 
              display: none !important; 
            }
            
            .print-only { 
              display: block !important; 
            }
            
            .print-section {
              background: white !important;
              border: 1px solid #ddd !important;
              page-break-inside: avoid;
            }
            
            .print-task {
              padding: 8px 12px;
              border-bottom: 1px solid #eee;
            }
            
            .print-task-done {
              text-decoration: line-through;
              color: #999;
            }
            
            .print-separator {
              border-top: 2px solid #333;
              margin: 16px 0;
              padding-top: 8px;
            }
            
            .overflow-hidden { 
              overflow: visible !important; 
              height: auto !important; 
            }
          }
        `}</style>

        <div className="max-w-6xl mx-auto print:max-w-none">
          
          {/* Header */}
          <div className="no-print">
            <TimelineHeader />
            <TimelineProgressBar />
          </div>

          {/* Print-only Title */}
          <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
            <h1 className="text-3xl font-bold text-black">Checklist Expédition YETI</h1>
            <p className="text-sm text-gray-600 mt-2">
              Généré le {new Date().toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 no-print">
            <FilterSortBar />

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPrintModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors hover:opacity-80"
                style={{
                  background: 'var(--bg-surface-3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)'
                }}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer</span>
              </button>

              <button
                onClick={handleLoadTemplate}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors hover:opacity-80"
                style={{
                  background: 'var(--accent-cyan-muted)',
                  border: '1px solid var(--accent-cyan)',
                  color: 'var(--accent-cyan)'
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Template GR20</span>
              </button>

              <button
                onClick={() => setShowNewListModal(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors hover:opacity-80"
                style={{
                  background: 'var(--accent-blue-muted)',
                  border: '1px solid var(--accent-blue)',
                  color: 'var(--accent-blue)'
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nouvelle liste</span>
              </button>
            </div>
          </div>

          {/* Phases Grid - Google Tasks Style */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-1 print:gap-8">
            {phases.map((phase) => (
              <div key={phase.id} className="print:break-inside-avoid">
                <ListSection 
                  phase={phase} 
                  onTaskEdit={(taskId) => setEditingTaskId(taskId)}
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center no-print">
            <div 
              className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-medium"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Mission Control • YETI</span>
            </div>
          </div>
        </div>

        {/* Drag Overlay - Shows the dragged item */}
        <DragOverlay>
          {activeTask ? (
            <div 
              className="opacity-90 shadow-2xl rounded-lg"
              style={{ 
                transform: 'rotate(3deg)',
                width: '400px'
              }}
            >
              <TaskItem 
                task={activeTask} 
                onEdit={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>

        {/* Print Modal */}
        {showPrintModal && (
          <PrintModal
            phases={phases}
            onClose={() => setShowPrintModal(false)}
          />
        )}

        {/* Template Confirmation */}
        {showTemplateConfirm && (
          <ConfirmModal
            title="Charger le template GR20"
            message="Attention : Ceci écrasera votre liste actuelle. Voulez-vous charger les 16 tâches du GR20 ?"
            confirmText="Charger la mission"
            cancelText="Annuler"
            variant="warning"
            onConfirm={confirmLoadTemplate}
            onCancel={() => setShowTemplateConfirm(false)}
          />
        )}

        {/* New List Modal */}
        {showNewListModal && (
          <PromptModal
            title="Nouvelle liste"
            message="Donnez un nom à votre nouvelle liste"
            placeholder="Ex: Matériel bivouac, Entraînement, Refuges..."
            confirmText="Créer"
            cancelText="Annuler"
            onConfirm={(name) => {
              addList(name);
              setShowNewListModal(false);
            }}
            onCancel={() => setShowNewListModal(false)}
          />
        )}

        {/* Task Edit Modal */}
        {editingTaskId && (() => {
          const task = phases
            .flatMap(p => p.tasks)
            .find(t => t.id === editingTaskId);
          
          return task ? (
            <TaskEditModal
              task={task}
              onClose={() => setEditingTaskId(null)}
            />
          ) : null;
        })()}
      </div>
    </DndContext>
  );
}
