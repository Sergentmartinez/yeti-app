'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Check, Square } from 'lucide-react';
import { Phase } from '@/lib/types/timeline';

interface PrintModalProps {
  phases: Phase[];
  onClose: () => void;
}

type PrintOption = 'todo' | 'all';

export function PrintModal({ phases, onClose }: PrintModalProps) {
  const [mounted, setMounted] = useState(false);
  const [printOption, setPrintOption] = useState<PrintOption>('todo');
  const [selectedPhases, setSelectedPhases] = useState<string[]>(phases.map(p => p.id));

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const togglePhase = (phaseId: string) => {
    setSelectedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const handlePrint = () => {
    const selectedPhasesData = phases.filter(p => selectedPhases.includes(p.id));
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Checklist YETI</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              padding: 40px;
              color: #333;
            }
            h1 { 
              font-size: 24px; 
              margin-bottom: 8px;
              color: #111;
            }
            .subtitle {
              font-size: 12px;
              color: #666;
              margin-bottom: 32px;
              padding-bottom: 16px;
              border-bottom: 2px solid #111;
            }
            .phase {
              margin-bottom: 32px;
              page-break-inside: avoid;
            }
            .phase-header {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 12px;
              padding-bottom: 8px;
              border-bottom: 1px solid #ddd;
            }
            .phase-name {
              font-size: 16px;
              font-weight: 600;
            }
            .phase-count {
              font-size: 12px;
              color: #666;
            }
            .task {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .checkbox {
              width: 16px;
              height: 16px;
              border: 2px solid #666;
              border-radius: 50%;
              flex-shrink: 0;
              margin-top: 2px;
            }
            .checkbox-done {
              background: #3b82f6;
              border-color: #3b82f6;
              position: relative;
            }
            .checkbox-done::after {
              content: '✓';
              color: white;
              font-size: 10px;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
            .task-content {
              flex: 1;
            }
            .task-title {
              font-size: 14px;
              color: #333;
            }
            .task-done .task-title {
              text-decoration: line-through;
              color: #999;
            }
            .task-desc {
              font-size: 12px;
              color: #666;
              margin-top: 2px;
            }
            .task-date {
              font-size: 11px;
              color: #888;
              margin-top: 4px;
            }
            .separator {
              border-top: 2px dashed #ccc;
              margin: 24px 0;
              position: relative;
            }
            .separator-label {
              position: absolute;
              top: -10px;
              left: 50%;
              transform: translateX(-50%);
              background: white;
              padding: 0 12px;
              font-size: 11px;
              color: #999;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .priority-critical {
              border-left: 3px solid #ef4444;
              padding-left: 8px;
              margin-left: -11px;
            }
            .priority-high {
              border-left: 3px solid #f97316;
              padding-left: 8px;
              margin-left: -11px;
            }
          </style>
        </head>
        <body>
          <h1>📋 Checklist Expédition YETI</h1>
          <p class="subtitle">
            Généré le ${new Date().toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            ${printOption === 'todo' ? ' • Tâches à faire uniquement' : ' • Toutes les tâches'}
          </p>
          
          ${selectedPhasesData.map(phase => {
            const todoTasks = phase.tasks.filter(t => t.status !== 'done');
            const doneTasks = phase.tasks.filter(t => t.status === 'done');
            
            // Skip if no tasks to show
            if (printOption === 'todo' && todoTasks.length === 0) return '';
            if (printOption === 'all' && phase.tasks.length === 0) return '';
            
            return `
              <div class="phase">
                <div class="phase-header">
                  <span class="phase-name">${phase.name}</span>
                  <span class="phase-count">
                    ${printOption === 'todo' 
                      ? `${todoTasks.length} tâche${todoTasks.length > 1 ? 's' : ''} à faire`
                      : `${doneTasks.length}/${phase.tasks.length} terminée${doneTasks.length > 1 ? 's' : ''}`
                    }
                  </span>
                </div>
                
                ${todoTasks.map(task => `
                  <div class="task priority-${task.priority}">
                    <div class="checkbox"></div>
                    <div class="task-content">
                      <div class="task-title">${task.title}</div>
                      ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                      ${task.dueDate ? `<div class="task-date">📅 ${task.dueDate}</div>` : ''}
                    </div>
                  </div>
                `).join('')}
                
                ${printOption === 'all' && doneTasks.length > 0 ? `
                  <div class="separator">
                    <span class="separator-label">Terminées</span>
                  </div>
                  ${doneTasks.map(task => `
                    <div class="task task-done">
                      <div class="checkbox checkbox-done"></div>
                      <div class="task-content">
                        <div class="task-title">${task.title}</div>
                      </div>
                    </div>
                  `).join('')}
                ` : ''}
              </div>
            `;
          }).join('')}
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
    onClose();
  };

  const todoCount = phases
    .filter(p => selectedPhases.includes(p.id))
    .reduce((acc, p) => acc + p.tasks.filter(t => t.status !== 'done').length, 0);
  
  const totalCount = phases
    .filter(p => selectedPhases.includes(p.id))
    .reduce((acc, p) => acc + p.tasks.length, 0);

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="rounded-2xl w-full max-w-md shadow-2xl"
        style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <Printer size={20} style={{ color: 'var(--accent-cyan)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Options d&apos;impression
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-surface-3)' }}
          >
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Print options */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Que souhaitez-vous imprimer ?
            </label>
            
            <div className="space-y-2">
              <button
                onClick={() => setPrintOption('todo')}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left"
                style={{
                  background: printOption === 'todo' ? 'var(--accent-cyan-muted)' : 'var(--bg-surface-3)',
                  border: `1px solid ${printOption === 'todo' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`
                }}
              >
                <div 
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ 
                    borderColor: printOption === 'todo' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    background: printOption === 'todo' ? 'var(--accent-cyan)' : 'transparent'
                  }}
                >
                  {printOption === 'todo' && <Check size={12} className="text-white" />}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Tâches à faire uniquement
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {todoCount} tâche{todoCount > 1 ? 's' : ''} à imprimer
                  </p>
                </div>
              </button>

              <button
                onClick={() => setPrintOption('all')}
                className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left"
                style={{
                  background: printOption === 'all' ? 'var(--accent-cyan-muted)' : 'var(--bg-surface-3)',
                  border: `1px solid ${printOption === 'all' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`
                }}
              >
                <div 
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ 
                    borderColor: printOption === 'all' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    background: printOption === 'all' ? 'var(--accent-cyan)' : 'transparent'
                  }}
                >
                  {printOption === 'all' && <Check size={12} className="text-white" />}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Toutes les tâches
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {totalCount} tâche{totalCount > 1 ? 's' : ''} (avec séparation terminées)
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Phase selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Listes à inclure
            </label>
            
            <div className="space-y-1">
              {phases.map(phase => (
                <button
                  key={phase.id}
                  onClick={() => togglePhase(phase.id)}
                  className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left hover:opacity-80"
                  style={{ background: 'var(--bg-surface-3)' }}
                >
                  <div 
                    className="w-4 h-4 rounded border-2 flex items-center justify-center"
                    style={{ 
                      borderColor: selectedPhases.includes(phase.id) ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      background: selectedPhases.includes(phase.id) ? 'var(--accent-cyan)' : 'transparent'
                    }}
                  >
                    {selectedPhases.includes(phase.id) && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {phase.name}
                  </span>
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                    {phase.tasks.filter(t => t.status !== 'done').length}/{phase.tasks.length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-4"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:opacity-80"
            style={{ 
              color: 'var(--text-muted)',
              background: 'var(--bg-surface-3)'
            }}
          >
            Annuler
          </button>
          <button
            onClick={handlePrint}
            disabled={selectedPhases.length === 0}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
            style={{ background: 'var(--accent-cyan)' }}
          >
            <Printer size={16} />
            Imprimer
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
