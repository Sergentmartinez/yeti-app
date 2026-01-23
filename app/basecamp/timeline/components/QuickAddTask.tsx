'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Calendar, Repeat, Flag, Flame, AlertTriangle, ChevronDown } from 'lucide-react';
import { useTimelineStore } from '@/lib/store/useTimelineStore';
import { Priority } from '@/lib/types/timeline';
import { cn } from '@/lib/utils';
import { DatePickerModal } from './DatePickerModal';
import { RepeatModal } from './RepeatModal';

interface RepeatConfig {
  frequency: number;
  unit: 'day' | 'week' | 'month' | 'year';
  time?: string;
  startDate: string;
  endType: 'never' | 'date' | 'occurrences';
  endDate?: string;
  occurrences?: number;
}

const PRIORITY_OPTIONS: { value: Priority; label: string; icon: React.ReactNode; color: string; shortLabel: string }[] = [
  { value: 'critical', label: 'Critique', shortLabel: '🔥', icon: <Flame size={14} />, color: '#ef4444' },
  { value: 'high', label: 'Haute', shortLabel: '⚠️', icon: <AlertTriangle size={14} />, color: '#f97316' },
  { value: 'medium', label: 'Moyenne', shortLabel: '', icon: <Flag size={14} />, color: 'var(--text-muted)' },
  { value: 'low', label: 'Basse', shortLabel: '', icon: <Flag size={14} />, color: 'var(--text-faint)' },
];

interface QuickAddTaskProps {
  phaseId: string;
}

export function QuickAddTask({ phaseId }: QuickAddTaskProps) {
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const priorityMenuRef = useRef<HTMLDivElement>(null);
  
  const { addTask } = useTimelineStore();

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isActive && !title.trim()) {
          setIsActive(false);
          reset();
        }
      }
      // Close priority menu when clicking outside
      if (priorityMenuRef.current && !priorityMenuRef.current.contains(e.target as Node)) {
        setShowPriorityMenu(false);
      }
    };

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isActive, title]);

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isActive]);

  const reset = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('medium');
    setRepeatConfig(null);
  };

  const handleAdd = () => {
    if (title.trim()) {
      addTask(phaseId, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        priority,
        status: 'todo',
        tags: [],
      });

      reset();
      inputRef.current?.focus();
    }
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      // Parse as local date
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  // Format date to YYYY-MM-DD using local time
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format repeat config for display
  const formatRepeatConfig = (config: RepeatConfig) => {
    const unitLabels: Record<string, string> = {
      day: 'jour',
      week: 'semaine',
      month: 'mois',
      year: 'an'
    };
    const unit = unitLabels[config.unit];
    const plural = config.frequency > 1 && config.unit !== 'month' ? 's' : '';
    return `${config.frequency} ${unit}${plural}`;
  };

  const todayStr = formatLocalDate(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = formatLocalDate(tomorrowDate);

  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === priority)!;

  if (!isActive) {
    return (
      <button
        onClick={() => setIsActive(true)}
        className="flex items-center gap-2 w-full py-2.5 px-3 transition-colors rounded-lg hover:opacity-80"
        style={{ color: 'var(--accent-cyan)' }}
      >
        <Plus size={18} />
        <span className="text-sm font-medium">Ajouter une tâche</span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-lg p-3"
      style={{
        background: 'var(--bg-surface-3)',
        border: '1px solid var(--border-default)'
      }}
    >
      {/* Title input with checkbox */}
      <div className="flex items-center gap-3">
        <div 
          className="w-5 h-5 rounded-full border-2 shrink-0"
          style={{ borderColor: 'var(--text-muted)' }}
        />
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            } else if (e.key === 'Escape') {
              setIsActive(false);
              reset();
            }
          }}
          placeholder="Titre"
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ color: 'var(--text-primary)' }}
        />
      </div>

      {/* Details inline */}
      <div className="flex items-start gap-2 mt-3">
        <span style={{ color: 'var(--text-faint)' }} className="text-lg leading-none">≡</span>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ajouter des détails..."
          className="flex-1 bg-transparent text-sm focus:outline-none"
          style={{ color: 'var(--text-secondary)' }}
        />
      </div>

      {/* Date & Priority buttons */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <button
          onClick={() => setDueDate(todayStr)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm transition-colors"
          )}
          style={{
            background: dueDate === todayStr ? 'var(--accent-cyan-muted)' : 'var(--bg-surface-4)',
            border: `1px solid ${dueDate === todayStr ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
            color: dueDate === todayStr ? 'var(--accent-cyan)' : 'var(--text-secondary)'
          }}
        >
          Aujourd&apos;hui
        </button>

        <button
          onClick={() => setDueDate(tomorrowStr)}
          className="px-3 py-1.5 rounded-lg text-sm transition-colors"
          style={{
            background: dueDate === tomorrowStr ? 'var(--accent-cyan-muted)' : 'var(--bg-surface-4)',
            border: `1px solid ${dueDate === tomorrowStr ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
            color: dueDate === tomorrowStr ? 'var(--accent-cyan)' : 'var(--text-secondary)'
          }}
        >
          Demain
        </button>

        {/* Calendar button */}
        <button
          onClick={() => setShowDatePicker(true)}
          className="p-1.5 rounded-lg transition-colors hover:opacity-80"
          style={{ 
            background: 'var(--bg-surface-4)',
            border: '1px solid var(--border-subtle)'
          }}
          title="Choisir une date"
        >
          <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
        </button>

        {/* Repeat button */}
        <button
          onClick={() => setShowRepeatModal(true)}
          className="p-1.5 rounded-lg transition-colors hover:opacity-80"
          style={{ 
            background: repeatConfig ? 'var(--accent-cyan-muted)' : 'var(--bg-surface-4)',
            border: `1px solid ${repeatConfig ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`
          }}
          title="Répéter"
        >
          <Repeat size={16} style={{ color: repeatConfig ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
        </button>

        {/* Priority button */}
        <div className="relative" ref={priorityMenuRef}>
          <button
            onClick={() => setShowPriorityMenu(!showPriorityMenu)}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ 
              background: priority !== 'medium' ? 'var(--bg-surface-4)' : 'var(--bg-surface-4)',
              border: `1px solid ${priority === 'critical' ? '#ef4444' : priority === 'high' ? '#f97316' : 'var(--border-subtle)'}`,
              color: currentPriority.color
            }}
            title="Priorité"
          >
            {currentPriority.icon}
            <ChevronDown size={12} />
          </button>

          {/* Priority dropdown */}
          {showPriorityMenu && (
            <div 
              className="absolute bottom-full left-0 mb-1 w-40 rounded-lg shadow-xl py-1 z-10"
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-default)'
              }}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setPriority(option.value);
                    setShowPriorityMenu(false);
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 transition-colors text-left hover:opacity-80"
                  style={{
                    background: priority === option.value ? 'var(--bg-surface-4)' : 'transparent'
                  }}
                >
                  <span style={{ color: option.color }}>{option.icon}</span>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Date badge */}
        {dueDate && (
          <span 
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              color: 'var(--accent-cyan)',
              background: 'var(--accent-cyan-muted)',
              border: '1px solid var(--accent-cyan)'
            }}
          >
            📅 {formatDisplayDate(dueDate)}
          </span>
        )}

        {/* Repeat badge */}
        {repeatConfig && (
          <span 
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              color: 'var(--accent-cyan)',
              background: 'var(--accent-cyan-muted)',
              border: '1px solid var(--accent-cyan)'
            }}
          >
            🔄 {formatRepeatConfig(repeatConfig)}
          </span>
        )}

        {/* Priority badge (only for high/critical) */}
        {(priority === 'critical' || priority === 'high') && (
          <span 
            className="text-xs px-2 py-1 rounded-lg font-medium"
            style={{
              color: currentPriority.color,
              background: priority === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)',
              border: `1px solid ${currentPriority.color}`
            }}
          >
            {currentPriority.shortLabel} {currentPriority.label}
          </span>
        )}
      </div>

      {/* DatePickerModal */}
      {showDatePicker && (
        <DatePickerModal
          currentDate={dueDate}
          onConfirm={(date) => {
            if (date) setDueDate(date);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />
      )}

      {/* RepeatModal */}
      {showRepeatModal && (
        <RepeatModal
          currentConfig={repeatConfig || undefined}
          onConfirm={(config) => {
            setRepeatConfig(config);
            setShowRepeatModal(false);
          }}
          onCancel={() => setShowRepeatModal(false)}
        />
      )}

      {/* Actions */}
      <div 
        className="flex items-center justify-end gap-2 mt-3 pt-3"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <button
          onClick={() => {
            setIsActive(false);
            reset();
          }}
          className="px-3 py-1.5 text-sm transition-colors hover:opacity-80"
          style={{ color: 'var(--text-muted)' }}
        >
          Annuler
        </button>
        <button
          onClick={handleAdd}
          disabled={!title.trim()}
          className="px-4 py-1.5 rounded-lg text-sm text-white font-medium transition-colors disabled:opacity-50"
          style={{ background: 'var(--accent-cyan)' }}
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
