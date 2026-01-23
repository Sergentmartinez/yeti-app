'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Flag, Plus, Trash2, Check } from 'lucide-react';
import { Task, Priority } from '@/lib/types/timeline';
import { useTimelineStore } from '@/lib/store/useTimelineStore';
import { DatePickerModal } from './DatePickerModal';
import { cn } from '@/lib/utils';

interface TaskEditModalProps {
  task: Task;
  onClose: () => void;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Basse', color: 'var(--text-muted)' },
  { value: 'medium', label: 'Moyenne', color: 'var(--text-secondary)' },
  { value: 'high', label: 'Haute', color: '#f97316' },
  { value: 'critical', label: 'Critique', color: '#ef4444' },
];

export function TaskEditModal({ task, onClose }: TaskEditModalProps) {
  const { updateTask, addSubtask, deleteSubtask, toggleSubtask } = useTimelineStore();
  
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.dueDate);
  const [priority, setPriority] = useState(task.priority);
  const [notes, setNotes] = useState(task.notes || '');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleSave = () => {
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      notes: notes.trim()
    });
    onClose();
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  // Format date for display
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      // Parse as local date
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Modifier la tâche
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-surface-3)', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Titre */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
              placeholder="Titre de la tâche"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none resize-none"
              style={{
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
              placeholder="Brève description..."
            />
          </div>

          {/* Date & Priorité */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Calendar size={16} />
                Date d&apos;échéance
              </label>
              <button
                onClick={() => setShowDatePicker(true)}
                className="w-full px-4 py-2 rounded-lg text-left transition-colors focus:outline-none text-sm hover:opacity-80"
                style={{
                  background: 'var(--bg-surface-3)',
                  border: '1px solid var(--border-subtle)',
                  color: formatDisplayDate(dueDate) ? 'var(--text-primary)' : 'var(--text-muted)'
                }}
              >
                {formatDisplayDate(dueDate) || 'Aucune date'}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Flag size={16} />
                Priorité
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none cursor-pointer"
                style={{
                  background: 'var(--bg-surface-3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                {PRIORITY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sous-tâches */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
              Sous-tâches ({task.subtasks.length})
            </label>
            
            <div className="space-y-2 mb-3">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center gap-3 p-2 rounded-lg group"
                  style={{ background: 'var(--bg-surface-3)' }}
                >
                  <button
                    onClick={() => toggleSubtask(task.id, subtask.id)}
                    className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0",
                      subtask.isCompleted ? "bg-emerald-500 border-emerald-500" : ""
                    )}
                    style={{
                      borderColor: subtask.isCompleted ? '#10b981' : 'var(--text-muted)'
                    }}
                  >
                    {subtask.isCompleted && (
                      <Check size={10} className="text-white stroke-[3]" />
                    )}
                  </button>
                  
                  <span
                    className={cn("flex-1 text-sm", subtask.isCompleted && "line-through")}
                    style={{ 
                      color: subtask.isCompleted ? 'var(--text-faint)' : 'var(--text-secondary)' 
                    }}
                  >
                    {subtask.title}
                  </span>
                  
                  <button
                    onClick={() => deleteSubtask(task.id, subtask.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all hover:opacity-80"
                    style={{ color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none"
                style={{
                  background: 'var(--bg-surface-3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Nouvelle sous-tâche..."
              />
              <button
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="p-2 rounded-lg transition-colors text-white disabled:opacity-50"
                style={{ background: 'var(--accent-cyan)' }}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg text-sm focus:outline-none resize-none"
              style={{
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
              placeholder="Notes détaillées..."
            />
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-6"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium transition-colors hover:opacity-80"
            style={{ 
              background: 'var(--bg-surface-3)',
              color: 'var(--text-secondary)'
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-6 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50"
            style={{ background: 'var(--accent-cyan)' }}
          >
            Enregistrer
          </button>
        </div>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DatePickerModal
          currentDate={dueDate}
          onConfirm={(date) => {
            setDueDate(date);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
