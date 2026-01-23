'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Clock, ChevronDown } from 'lucide-react';
import { DatePickerModal } from './DatePickerModal';

interface RepeatConfig {
  frequency: number;
  unit: 'day' | 'week' | 'month' | 'year';
  time?: string;
  startDate: string;
  endType: 'never' | 'date' | 'occurrences';
  endDate?: string;
  occurrences?: number;
}

interface RepeatModalProps {
  currentConfig?: RepeatConfig;
  onConfirm: (config: RepeatConfig | null) => void;
  onCancel: () => void;
}

const UNIT_OPTIONS = [
  { value: 'day', label: 'jour' },
  { value: 'week', label: 'semaine' },
  { value: 'month', label: 'mois' },
  { value: 'year', label: 'an' },
];

export function RepeatModal({ currentConfig, onConfirm, onCancel }: RepeatModalProps) {
  const [mounted, setMounted] = useState(false);
  
  // Format date to YYYY-MM-DD using local time
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = formatLocalDate(new Date());
  
  const [frequency, setFrequency] = useState(currentConfig?.frequency || 1);
  const [unit, setUnit] = useState<'day' | 'week' | 'month' | 'year'>(currentConfig?.unit || 'day');
  const [time, setTime] = useState(currentConfig?.time || '');
  const [startDate, setStartDate] = useState(currentConfig?.startDate || today);
  const [endType, setEndType] = useState<'never' | 'date' | 'occurrences'>(currentConfig?.endType || 'never');
  const [endDate, setEndDate] = useState(currentConfig?.endDate || '');
  const [occurrences, setOccurrences] = useState(currentConfig?.occurrences || 30);
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      // Parse as local date
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
    } catch {
      return dateStr;
    }
  };

  const handleConfirm = () => {
    const config: RepeatConfig = {
      frequency,
      unit,
      time: time || undefined,
      startDate,
      endType,
      endDate: endType === 'date' ? endDate : undefined,
      occurrences: endType === 'occurrences' ? occurrences : undefined,
    };
    onConfirm(config);
  };

  const handleClear = () => {
    onConfirm(null);
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div 
        className="rounded-2xl w-full max-w-sm shadow-2xl"
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
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Fréquence de répétition
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-surface-3)' }}
          >
            <X size={18} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Frequency */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="99"
              value={frequency}
              onChange={(e) => setFrequency(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-3 py-2 rounded-lg text-center text-sm focus:outline-none"
              style={{
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            />
            <div className="relative flex-1">
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as typeof unit)}
                className="w-full px-3 py-2 rounded-lg text-sm appearance-none cursor-pointer focus:outline-none"
                style={{
                  background: 'var(--bg-surface-3)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-primary)'
                }}
              >
                {UNIT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}{frequency > 1 && opt.value !== 'mois' ? 's' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown 
                size={16} 
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
          </div>

          {/* Time */}
          <button
            onClick={() => setShowTimePicker(!showTimePicker)}
            className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors hover:opacity-80 flex items-center gap-2"
            style={{
              background: 'var(--bg-surface-3)',
              border: '1px solid var(--border-subtle)',
              color: time ? 'var(--text-primary)' : 'var(--text-muted)'
            }}
          >
            <Clock size={16} />
            {time || "Définir l'heure"}
          </button>
          
          {showTimePicker && (
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
              style={{
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            />
          )}

          {/* Start date */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Début
            </label>
            <button
              onClick={() => setShowStartDatePicker(true)}
              className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors hover:opacity-80"
              style={{
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              {formatDate(startDate)}
            </button>
          </div>

          {/* End options */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Fin
            </label>
            
            <div className="space-y-2">
              {/* Never */}
              <button
                onClick={() => setEndType('never')}
                className="w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left"
                style={{ background: 'var(--bg-surface-3)' }}
              >
                <div 
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ 
                    borderColor: endType === 'never' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    background: endType === 'never' ? 'var(--accent-cyan)' : 'transparent'
                  }}
                >
                  {endType === 'never' && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Jamais</span>
              </button>

              {/* By date */}
              <div 
                className="flex items-center gap-3 p-2 rounded-lg"
                style={{ background: 'var(--bg-surface-3)' }}
              >
                <button
                  onClick={() => setEndType('date')}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ 
                      borderColor: endType === 'date' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      background: endType === 'date' ? 'var(--accent-cyan)' : 'transparent'
                    }}
                  >
                    {endType === 'date' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Le</span>
                </button>
                <button
                  onClick={() => {
                    setEndType('date');
                    setShowEndDatePicker(true);
                  }}
                  className="flex-1 px-3 py-1.5 rounded text-sm text-left"
                  style={{
                    background: 'var(--bg-surface-4)',
                    color: endDate ? 'var(--text-primary)' : 'var(--text-muted)'
                  }}
                >
                  {endDate ? formatDate(endDate) : 'Choisir une date'}
                </button>
              </div>

              {/* By occurrences */}
              <div 
                className="flex items-center gap-3 p-2 rounded-lg"
                style={{ background: 'var(--bg-surface-3)' }}
              >
                <button
                  onClick={() => setEndType('occurrences')}
                  className="flex items-center gap-3"
                >
                  <div 
                    className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                    style={{ 
                      borderColor: endType === 'occurrences' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      background: endType === 'occurrences' ? 'var(--accent-cyan)' : 'transparent'
                    }}
                  >
                    {endType === 'occurrences' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Après</span>
                </button>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={occurrences}
                  onChange={(e) => {
                    setEndType('occurrences');
                    setOccurrences(Math.max(1, parseInt(e.target.value) || 1));
                  }}
                  className="w-16 px-2 py-1.5 rounded text-sm text-center focus:outline-none"
                  style={{
                    background: 'var(--bg-surface-4)',
                    color: 'var(--text-primary)'
                  }}
                />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>occurrences</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          {currentConfig && (
            <button
              onClick={handleClear}
              className="text-sm px-2 py-1 transition-colors hover:opacity-80"
              style={{ color: '#ef4444' }}
            >
              Supprimer
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--accent-cyan)' }}
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors hover:opacity-80"
              style={{ background: 'var(--accent-cyan)' }}
            >
              Terminé
            </button>
          </div>
        </div>
      </div>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DatePickerModal
          currentDate={startDate}
          onConfirm={(date) => {
            if (date) setStartDate(date);
            setShowStartDatePicker(false);
          }}
          onCancel={() => setShowStartDatePicker(false)}
        />
      )}
      
      {showEndDatePicker && (
        <DatePickerModal
          currentDate={endDate}
          onConfirm={(date) => {
            if (date) setEndDate(date);
            setShowEndDatePicker(false);
          }}
          onCancel={() => setShowEndDatePicker(false)}
        />
      )}
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
