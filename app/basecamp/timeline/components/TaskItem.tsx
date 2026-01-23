'use client';

import { useState, useRef, useEffect } from 'react';
import { GripVertical, MoreVertical, ChevronDown, ChevronRight, Check, Star, Calendar } from 'lucide-react';
import { Task } from '@/lib/types/timeline';
import { useTimelineStore } from '@/lib/store/useTimelineStore';
import { cn } from '@/lib/utils';
import { TaskContextMenu } from './TaskContextMenu';
import { DatePickerModal } from './DatePickerModal';
import { formatSmartDate } from '@/lib/utils/dateFormatter';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  dragHandleProps?: Record<string, unknown>;
}

export function TaskItem({ task, onEdit, dragHandleProps }: TaskItemProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);
  
  const { toggleTask, updateTask, toggleSubtask, toggleStar } = useTimelineStore();

  // Priority border color
  const priorityColors = {
    critical: '#ef4444',
    high: '#f97316',
    medium: 'var(--border-subtle)',
    low: 'var(--border-subtle)'
  };

  // Focus inputs when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingDescription && descriptionRef.current) {
      descriptionRef.current.focus();
    }
  }, [isEditingDescription]);


  const handleSaveTitle = () => {
    if (title.trim() && title !== task.title) {
      updateTask(task.id, { title: title.trim() });
    } else {
      setTitle(task.title);
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = () => {
    if (description !== task.description) {
      updateTask(task.id, { description: description.trim() || undefined });
    }
    setIsEditingDescription(false);
  };

  const handleDateChange = (newDate: string) => {
    updateTask(task.id, { dueDate: newDate || undefined });
    setShowDatePicker(false);
  };

  const completedSubtasks = task.subtasks.filter(st => st.isCompleted).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <div className="group print:break-inside-avoid">
      {/* Main task line */}
      <div
        className={cn(
          "flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all",
          task.status === 'done' && "opacity-60"
        )}
        style={{
          background: 'var(--bg-surface-3)',
          borderLeft: `4px solid ${priorityColors[task.priority]}`
        }}
      >
        {/* Drag handle - with drag props */}
        <div 
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing no-print touch-none"
          {...dragHandleProps}
        >
          <GripVertical size={16} style={{ color: 'var(--text-faint)' }} />
        </div>

        {/* Checkbox - circular */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleTask(task.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className={cn(
            "w-5 h-5 flex items-center justify-center rounded-full border-2 transition-all flex-shrink-0 print-checkbox",
            task.status === 'done'
              ? "bg-blue-500 border-blue-500"
              : "hover:border-blue-400"
          )}
          style={{
            borderColor: task.status === 'done' ? '#3b82f6' : 'var(--text-muted)'
          }}
        >
          {task.status === 'done' && (
            <Check size={12} className="text-white stroke-[3]" />
          )}
        </button>

        {/* Title & Description */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSaveTitle();
                } else if (e.key === 'Escape') {
                  setTitle(task.title);
                  setIsEditingTitle(false);
                }
              }}
              className="w-full bg-transparent text-sm focus:outline-none"
              style={{ 
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--accent-cyan)'
              }}
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className={cn(
                "text-left text-sm transition-colors w-full hover:opacity-80",
                task.status === 'done' && "line-through"
              )}
              style={{ color: 'var(--text-primary)' }}
            >
              {task.title}
            </button>
          )}

          {/* Description - Édition inline */}
          {isEditingDescription ? (
            <input
              ref={descriptionRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveDescription}
              placeholder="Détails"
              className="w-full mt-0.5 text-xs bg-transparent focus:outline-none"
              style={{ 
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-subtle)'
              }}
            />
          ) : (
            <button
              onClick={() => setIsEditingDescription(true)}
              className="text-left w-full mt-0.5"
            >
              {task.description ? (
                <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                  {task.description}
                </p>
              ) : (
                <p className="text-xs italic" style={{ color: 'var(--text-faint)' }}>
                  Détails
                </p>
              )}
            </button>
          )}
        </div>

        {/* Metadata - right aligned */}
        <div className="flex items-center gap-2 text-xs">
          {/* Due date - Format intelligent avec couleurs */}
          {task.dueDate && (() => {
            const { text, color } = formatSmartDate(task.dueDate);
            const colorMap = {
              red: { text: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
              orange: { text: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
              blue: { text: 'var(--accent-cyan)', bg: 'var(--accent-cyan-muted)', border: 'var(--accent-cyan)' },
              gray: { text: 'var(--text-muted)', bg: 'var(--bg-surface-3)', border: 'var(--border-subtle)' }
            };
            const colors = colorMap[color];
            
            return (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDatePicker(true);
                }}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors hover:opacity-80"
                style={{
                  color: colors.text,
                  background: colors.bg,
                  border: `1px solid ${colors.border}`
                }}
                title="Cliquer pour modifier la date"
              >
                <Calendar size={12} />
                {text}
              </button>
            );
          })()}
          
          {/* Priority indicator */}
          {task.priority === 'critical' && (
            <span 
              className="text-xs px-2 py-0.5 rounded font-medium"
              style={{
                color: '#ef4444',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)'
              }}
            >
              🔥 Urgent
            </span>
          )}
          {task.priority === 'high' && (
            <span 
              className="text-xs px-2 py-0.5 rounded font-medium"
              style={{
                color: '#f97316',
                background: 'rgba(249,115,22,0.1)',
                border: '1px solid rgba(249,115,22,0.3)'
              }}
            >
              ⚠️ Haute
            </span>
          )}
          
          {/* Subtasks indicator */}
          {totalSubtasks > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSubtasks(!showSubtasks);
              }}
              className="flex items-center gap-1 transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              {showSubtasks ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <span className="font-mono">{completedSubtasks}/{totalSubtasks}</span>
            </button>
          )}
        </div>

        {/* Star */}
        {task.starred && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleStar(task.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1 transition-colors"
          >
            <Star 
              size={16} 
              className="fill-blue-500 text-blue-500"
            />
          </button>
        )}

        {/* Context menu button - hidden until hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenuPos({ x: e.clientX, y: e.clientY });
            setShowContextMenu(true);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all no-print hover:opacity-80"
          style={{ background: 'var(--bg-surface-4)' }}
        >
          <MoreVertical size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DatePickerModal
          currentDate={task.dueDate}
          onConfirm={handleDateChange}
          onCancel={() => setShowDatePicker(false)}
        />
      )}

      {/* Context Menu */}
      {showContextMenu && (
        <TaskContextMenu
          task={task}
          position={contextMenuPos}
          onClose={() => setShowContextMenu(false)}
          onEdit={onEdit}
        />
      )}

      {/* Subtasks - expanded */}
      {showSubtasks && totalSubtasks > 0 && (
        <div className="ml-12 mt-1 space-y-1 print:ml-8">
          {task.subtasks.map((subtask) => (
            <div key={subtask.id} className="flex items-center gap-2 py-1.5 text-sm">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSubtask(task.id, subtask.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={cn(
                  "w-3.5 h-3.5 rounded border-2 transition-all flex-shrink-0",
                  subtask.isCompleted
                    ? "bg-emerald-500 border-emerald-500"
                    : "hover:border-blue-400"
                )}
                style={{
                  borderColor: subtask.isCompleted ? '#10b981' : 'var(--text-muted)'
                }}
              >
                {subtask.isCompleted && (
                  <Check size={8} className="text-white stroke-[3]" />
                )}
              </button>
              <span 
                className={cn(subtask.isCompleted && "line-through")}
                style={{ 
                  color: subtask.isCompleted ? 'var(--text-faint)' : 'var(--text-secondary)' 
                }}
              >
                {subtask.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
