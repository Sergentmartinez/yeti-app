'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerDropdownProps {
  currentDate?: string;
  onConfirm: (date: string) => void;
  onCancel: () => void;
  anchorEl: HTMLElement | null;
}

const DAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MONTHS = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

export function DatePickerDropdown({ currentDate, onConfirm, onCancel, anchorEl }: DatePickerDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (currentDate) {
      const isoDate = new Date(currentDate);
      if (!isNaN(isoDate.getTime()) && currentDate.includes('-') && currentDate.length >= 10) {
        return isoDate;
      }
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
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorEl && dropdownRef.current) {
      const rect = anchorEl.getBoundingClientRect();
      const dropdownRect = dropdownRef.current.getBoundingClientRect();
      
      let top = rect.bottom + 8;
      let left = rect.left;

      if (left + dropdownRect.width > window.innerWidth) {
        left = window.innerWidth - dropdownRect.width - 16;
      }

      if (top + dropdownRect.height > window.innerHeight) {
        top = rect.top - dropdownRect.height - 8;
      }

      setPosition({ top, left });
    }
  }, [anchorEl]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [anchorEl, onCancel]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

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
    const isoDate = newDate.toISOString().split('T')[0];
    onConfirm(isoDate);
  };

  const handleTodayClick = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    const isoDate = today.toISOString().split('T')[0];
    onConfirm(isoDate);
  };

  const handleClearDate = () => {
    onConfirm('');
    onCancel();
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

  return (
    <div
      ref={dropdownRef}
      className="fixed bg-zinc-50 dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-700 w-72 z-[200]"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-700">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ChevronLeft size={18} className="text-zinc-700 dark:text-zinc-300" />
        </button>

        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {MONTHS[viewMonth]} {viewYear}
        </h3>

        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ChevronRight size={18} className="text-zinc-700 dark:text-zinc-300" />
        </button>
      </div>

      {/* Calendar */}
      <div className="p-3">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAYS.map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => (
            <div key={i} className="aspect-square">
              {day && (
                <button
                  onClick={() => handleDayClick(day)}
                  className={`
                    w-full h-full flex items-center justify-center rounded-full text-sm transition-all
                    ${isSelected(day)
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : isToday(day)
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/60 font-medium'
                      : 'text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }
                  `}
                >
                  {day}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-zinc-200 dark:border-zinc-700">
        <button
          onClick={handleClearDate}
          className="text-xs text-red-500 hover:text-red-400 transition-colors"
        >
          Effacer
        </button>
        <button
          onClick={handleTodayClick}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors font-medium"
        >
          Aujourd&apos;hui
        </button>
      </div>
    </div>
  );
}