'use client';

import { Task, Priority } from '@/lib/types/timeline';
import { Star, Calendar, CornerDownRight, Check, Trash2, List, Flag, AlertTriangle, Flame } from 'lucide-react';
import { useTimelineStore } from '@/lib/store/useTimelineStore';
import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { ConfirmModal } from './ConfirmModal';
import { PromptModal } from './PromptModal';
import { DatePickerModal } from './DatePickerModal';
import { PhaseIcon } from './PhaseIcon';

interface TaskContextMenuProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
  position: { x: number; y: number };
}

const PRIORITY_OPTIONS: { value: Priority; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'critical', label: 'Critique', icon: <Flame size={16} />, color: '#ef4444' },
  { value: 'high', label: 'Haute', icon: <AlertTriangle size={16} />, color: '#f97316' },
  { value: 'medium', label: 'Moyenne', icon: <Flag size={16} />, color: 'var(--text-muted)' },
  { value: 'low', label: 'Basse', icon: <Flag size={16} />, color: 'var(--text-faint)' },
];

export function TaskContextMenu({ task, onClose, onEdit, position }: TaskContextMenuProps) {
  const { toggleStar, deleteTask, moveTask, phases, lists, addSubtask, addList, updateTask } = useTimelineStore();
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSubtaskPrompt, setShowSubtaskPrompt] = useState(false);
  const [showNewListPrompt, setShowNewListPrompt] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const [finalPosition, setFinalPosition] = useState({ x: 0, y: 0 });

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate position after mount using useLayoutEffect
  useLayoutEffect(() => {
    if (mounted && menuRef.current) {
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let newX = position.x;
      let newY = position.y;
      
      // Check if menu goes below viewport
      if (position.y + menuRect.height > viewportHeight - 20) {
        // Try positioning above the click point
        const aboveY = position.y - menuRect.height;
        if (aboveY > 20) {
          newY = aboveY;
        } else {
          // Position at bottom of viewport with scroll
          newY = Math.max(20, viewportHeight - menuRect.height - 20);
        }
      }
      
      // Check if menu goes beyond right edge
      if (position.x + menuRect.width > viewportWidth - 20) {
        newX = Math.max(20, viewportWidth - menuRect.width - 20);
      }
      
      // Check if menu goes beyond left edge
      if (position.x < 20) {
        newX = 20;
      }
      
      setFinalPosition({ x: newX, y: newY });
      setIsPositioned(true);
    }
  }, [mounted, position]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const handlePriorityChange = (priority: Priority) => {
    updateTask(task.id, { priority });
    setShowPriorityMenu(false);
    onClose();
  };

  // Combine phases and lists
  const allLists = [
    ...phases.map(p => ({ id: p.id, name: p.name, icon: p.icon })),
    ...lists.map(l => ({ id: l.id, name: l.name, icon: l.icon || 'list' }))
  ];

  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === task.priority);

  const menuContent = (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]" 
        onClick={handleBackdropClick}
        onContextMenu={(e) => { e.preventDefault(); onClose(); }}
      />
      
      {/* Menu */}
      <div
        ref={menuRef}
        onClick={handleMenuClick}
        className="fixed z-[9999] rounded-xl shadow-2xl py-2 w-64 max-h-[80vh] overflow-y-auto"
        style={{ 
          top: isPositioned ? `${finalPosition.y}px` : `${position.y}px`,
          left: isPositioned ? `${finalPosition.x}px` : `${position.x}px`,
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)',
          opacity: isPositioned ? 1 : 0,
          transition: 'opacity 0.1s ease-in-out'
        }}
      >
        {/* Star/Unstar */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleAction(() => toggleStar(task.id));
          }}
          className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
          style={{ background: 'transparent' }}
        >
          <Star 
            size={18} 
            className={task.starred ? "fill-blue-500 text-blue-500" : ""}
            style={{ color: task.starred ? '#3b82f6' : 'var(--text-muted)' }}
          />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {task.starred ? 'Retirer de Suivies' : 'Ajouter à Suivies'}
          </span>
        </button>

        {/* Priority */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPriorityMenu(!showPriorityMenu);
            }}
            className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
            style={{ background: 'transparent' }}
          >
            <span style={{ color: currentPriority?.color }}>{currentPriority?.icon}</span>
            <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>
              Priorité : {currentPriority?.label}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>▸</span>
          </button>
          
          {/* Priority submenu */}
          {showPriorityMenu && (
            <div 
              className="absolute left-full top-0 ml-1 w-48 rounded-lg shadow-xl py-1 z-10"
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-default)'
              }}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePriorityChange(option.value);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-3 transition-colors text-left hover:opacity-80"
                  style={{
                    background: task.priority === option.value ? 'var(--bg-surface-4)' : 'transparent'
                  }}
                >
                  {task.priority === option.value && (
                    <Check size={14} style={{ color: 'var(--accent-cyan)' }} />
                  )}
                  <span style={{ color: option.color, marginLeft: task.priority === option.value ? 0 : 22 }}>
                    {option.icon}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit deadline */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDatePicker(true);
          }}
          className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
          style={{ background: 'transparent' }}
        >
          <Calendar size={18} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            {task.dueDate ? 'Modifier la date limite' : 'Ajouter une date limite'}
          </span>
        </button>

        {/* Add subtask */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowSubtaskPrompt(true);
          }}
          className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
          style={{ background: 'transparent' }}
        >
          <CornerDownRight size={18} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Ajouter une tâche secondaire
          </span>
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDeleteConfirm(true);
          }}
          className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
          style={{ color: '#ef4444', background: 'transparent' }}
        >
          <Trash2 size={18} />
          <span className="text-sm">Supprimer</span>
        </button>

        {/* Separator */}
        <div className="my-2" style={{ borderTop: '1px solid var(--border-subtle)' }} />

        {/* Move to list */}
        <div className="px-2">
          <p className="px-2 py-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Déplacer vers
          </p>
          {allLists.map((list) => (
            <button
              key={list.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAction(() => moveTask(task.id, list.id));
              }}
              className="w-full px-3 py-2 flex items-center gap-2 rounded-lg transition-colors text-left hover:opacity-80"
              style={{
                background: task.phaseId === list.id ? 'var(--bg-surface-4)' : 'transparent'
              }}
            >
              {task.phaseId === list.id && (
                <Check size={16} style={{ color: 'var(--accent-cyan)' }} />
              )}
              <PhaseIcon icon={list.id} size={16} style={{ color: 'var(--text-muted)' }} />
              <span 
                className={`text-sm ${task.phaseId === list.id ? '' : 'ml-5'}`}
                style={{ color: 'var(--text-primary)' }}
              >
                {list.name}
              </span>
            </button>
          ))}
        </div>

        {/* Separator */}
        <div className="my-2" style={{ borderTop: '1px solid var(--border-subtle)' }} />

        {/* Nouvelle liste */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowNewListPrompt(true);
          }}
          className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors text-left hover:opacity-80"
          style={{ background: 'transparent' }}
        >
          <List size={18} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
            Nouvelle liste
          </span>
        </button>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DatePickerModal
          currentDate={task.dueDate}
          onConfirm={(date) => {
            updateTask(task.id, { dueDate: date || undefined });
            setShowDatePicker(false);
            onClose();
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          title="Supprimer cette tâche ?"
          message="Cette action est irréversible. La tâche et toutes ses sous-tâches seront supprimées."
          confirmText="Supprimer"
          cancelText="Annuler"
          variant="danger"
          onConfirm={() => {
            deleteTask(task.id);
            setShowDeleteConfirm(false);
            onClose();
          }}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {/* Subtask Prompt Modal */}
      {showSubtaskPrompt && (
        <PromptModal
          title="Nouvelle sous-tâche"
          message="Donnez un titre à votre sous-tâche"
          placeholder="Ex: Acheter des piles..."
          confirmText="Ajouter"
          cancelText="Annuler"
          onConfirm={(title) => {
            addSubtask(task.id, title);
            setShowSubtaskPrompt(false);
            onClose();
          }}
          onCancel={() => setShowSubtaskPrompt(false)}
        />
      )}

      {/* New List Prompt Modal */}
      {showNewListPrompt && (
        <PromptModal
          title="Nouvelle liste"
          message="Donnez un nom à votre nouvelle liste"
          placeholder="Ex: Transport, Kit secours, Alimentation..."
          confirmText="Créer"
          cancelText="Annuler"
          onConfirm={(name) => {
            addList(name);
            setShowNewListPrompt(false);
            onClose();
          }}
          onCancel={() => setShowNewListPrompt(false)}
        />
      )}
    </>
  );

  // Use portal to render outside of DnD context
  if (!mounted) return null;
  
  return createPortal(menuContent, document.body);
}
