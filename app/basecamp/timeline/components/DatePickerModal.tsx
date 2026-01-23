'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerModalProps {
  currentDate?: string;
  onConfirm: (date: string) => void;
  onCancel: () => void;
}

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

export function DatePickerModal({ currentDate, onConfirm, onCancel }: DatePickerModalProps) {
  const [mounted, setMounted] = useState(false);
  
  // Parse date string to local date (avoid UTC conversion issues)
  const parseLocalDate = (dateStr: string): Date => {
    if (dateStr.includes('-') && dateStr.length >= 10) {
      // Parse YYYY-MM-DD as local date
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date();
  };

  // Format date to YYYY-MM-DD using local time
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (currentDate) {
      // Check if it's an ISO date format
      if (currentDate.includes('-') && currentDate.length >= 10) {
        return parseLocalDate(currentDate);
      }
      // Check if it's J-X format
      const match = currentDate.match(/J([+-]?)(\d+)/);
      if (match) {
        const sign = match[1] === '-' ? -1 : 1;
        const daysFromNow = parseInt(match[2]) * sign;
        const date = new Date();
        date.setDate(date.getDate() + daysFromNow);
        return date;
      }
    }
    return new Date();
  });

  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  // Générer les années (10 ans avant et après)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewYear, viewMonth, day);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    const localDate = formatLocalDate(selectedDate);
    onConfirm(localDate);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
  };

  const handleClearDate = () => {
    onConfirm('');
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      viewMonth === today.getMonth() &&
      viewYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return (
      day === selectedDate.getDate() &&
      viewMonth === selectedDate.getMonth() &&
      viewYear === selectedDate.getFullYear()
    );
  };

  const calendarDays = generateCalendarDays();

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div 
        className="rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header avec sélecteurs */}
        <div 
          className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-surface-3)' }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--text-muted)' }} />
          </button>

          {/* Sélecteurs Mois et Année */}
          <div className="flex items-center gap-2">
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value))}
              className="rounded-lg px-2 py-1 text-sm font-medium focus:outline-none cursor-pointer"
              style={{
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              {MONTHS.map((month, i) => (
                <option key={i} value={i}>
                  {month.charAt(0).toUpperCase() + month.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value))}
              className="rounded-lg px-2 py-1 text-sm font-medium focus:outline-none cursor-pointer"
              style={{
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--bg-surface-3)' }}
          >
            <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Days header */}
        <div className="grid grid-cols-7 gap-1 px-4 py-2">
          {DAYS.map((day, i) => (
            <div 
              key={i} 
              className="text-center text-xs font-medium py-1"
              style={{ color: 'var(--text-muted)' }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 px-4 pb-4">
          {calendarDays.map((day, i) => (
            <button
              key={i}
              onClick={() => day && handleDayClick(day)}
              disabled={!day}
              className={`
                h-9 rounded-full text-sm font-medium transition-all
                ${!day ? 'invisible' : 'hover:opacity-80'}
              `}
              style={{
                background: day && isSelected(day) 
                  ? 'var(--accent-cyan)' 
                  : day && isToday(day) 
                    ? 'var(--bg-surface-4)' 
                    : 'transparent',
                color: day && isSelected(day) 
                  ? 'white' 
                  : 'var(--text-primary)',
                border: day && isToday(day) && !isSelected(day) 
                  ? '2px solid var(--accent-cyan)' 
                  : 'none'
              }}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Quick actions */}
        <div 
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={handleClearDate}
            className="px-2 py-1 rounded-md text-xs transition-colors hover:opacity-80"
            style={{
              background: 'var(--bg-surface-3)',
              color: '#ef4444'
            }}
          >
            Effacer
          </button>
          <button
            onClick={handleTodayClick}
            className="px-2 py-1 rounded-md text-xs transition-colors hover:opacity-80"
            style={{
              background: 'var(--bg-surface-3)',
              color: 'var(--text-secondary)'
            }}
          >
            Aujourd&apos;hui
          </button>
          <div className="flex-1" />
          <button
            onClick={onCancel}
            className="px-2 py-1 rounded-md text-xs transition-colors hover:opacity-80"
            style={{
              background: 'var(--bg-surface-3)',
              color: 'var(--text-secondary)'
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1 rounded-md text-xs font-medium transition-colors hover:opacity-80"
            style={{
              background: 'var(--accent-cyan)',
              color: 'white'
            }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
