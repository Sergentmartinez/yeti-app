'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Filter, Tag, Flag, Flame, AlertTriangle, X } from 'lucide-react';
import { useTimelineStore } from '@/lib/store/useTimelineStore';
import { Priority } from '@/lib/types/timeline';

const PRIORITY_OPTIONS: { value: 'all' | Priority; label: string; icon?: React.ReactNode; color: string }[] = [
  { value: 'all', label: 'Toutes priorités', color: 'var(--text-secondary)' },
  { value: 'critical', label: 'Critique', icon: <Flame size={14} />, color: '#ef4444' },
  { value: 'high', label: 'Haute', icon: <AlertTriangle size={14} />, color: '#f97316' },
  { value: 'medium', label: 'Moyenne', icon: <Flag size={14} />, color: 'var(--text-muted)' },
  { value: 'low', label: 'Basse', icon: <Flag size={14} />, color: 'var(--text-faint)' },
];

export function FilterSortBar() {
  const { filters, setFilterPriority, setFilterTag, getAllTags } = useTimelineStore();
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  
  const priorityRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  const allTags = getAllTags();
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === filters.priority);
  const hasActiveFilters = filters.priority !== 'all' || filters.tag !== null;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (priorityRef.current && !priorityRef.current.contains(e.target as Node)) {
        setShowPriorityDropdown(false);
      }
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const clearFilters = () => {
    setFilterPriority('all');
    setFilterTag(null);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Filter size={14} style={{ color: 'var(--text-muted)' }} />
        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Filtres :</span>
      </div>
      
      {/* Priority filter */}
      <div className="relative" ref={priorityRef}>
        <button 
          onClick={() => {
            setShowPriorityDropdown(!showPriorityDropdown);
            setShowTagDropdown(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors hover:opacity-80"
          style={{
            background: filters.priority !== 'all' ? 'var(--accent-cyan-muted)' : 'var(--bg-surface-3)',
            border: `1px solid ${filters.priority !== 'all' ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
            color: filters.priority !== 'all' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
          }}
        >
          {currentPriority?.icon && <span style={{ color: currentPriority.color }}>{currentPriority.icon}</span>}
          <span>{currentPriority?.label}</span>
          <ChevronDown size={12} />
        </button>

        {/* Priority Dropdown */}
        {showPriorityDropdown && (
          <div 
            className="absolute top-full left-0 mt-1 w-44 rounded-lg shadow-xl py-1 z-50"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)'
            }}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setFilterPriority(option.value);
                  setShowPriorityDropdown(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 transition-colors text-left hover:opacity-80"
                style={{
                  background: filters.priority === option.value ? 'var(--bg-surface-4)' : 'transparent'
                }}
              >
                {option.icon && <span style={{ color: option.color }}>{option.icon}</span>}
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tag filter */}
      <div className="relative" ref={tagRef}>
        <button 
          onClick={() => {
            setShowTagDropdown(!showTagDropdown);
            setShowPriorityDropdown(false);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors hover:opacity-80"
          style={{
            background: filters.tag ? 'var(--accent-cyan-muted)' : 'var(--bg-surface-3)',
            border: `1px solid ${filters.tag ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
            color: filters.tag ? 'var(--accent-cyan)' : 'var(--text-secondary)'
          }}
        >
          <Tag size={12} />
          <span>{filters.tag || 'Tous les tags'}</span>
          <ChevronDown size={12} />
        </button>

        {/* Tag Dropdown */}
        {showTagDropdown && (
          <div 
            className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-xl py-1 z-50 max-h-64 overflow-y-auto"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)'
            }}
          >
            <button
              onClick={() => {
                setFilterTag(null);
                setShowTagDropdown(false);
              }}
              className="w-full px-3 py-2 flex items-center gap-2 transition-colors text-left hover:opacity-80"
              style={{
                background: filters.tag === null ? 'var(--bg-surface-4)' : 'transparent'
              }}
            >
              <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                Tous les tags
              </span>
            </button>
            
            {allTags.length > 0 ? (
              <>
                <div className="my-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setFilterTag(tag);
                      setShowTagDropdown(false);
                    }}
                    className="w-full px-3 py-2 flex items-center gap-2 transition-colors text-left hover:opacity-80"
                    style={{
                      background: filters.tag === tag ? 'var(--bg-surface-4)' : 'transparent'
                    }}
                  >
                    <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                      {tag}
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <div className="px-3 py-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                Aucun tag trouvé
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear filters button */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs transition-colors hover:opacity-80"
          style={{
            color: '#ef4444'
          }}
          title="Effacer les filtres"
        >
          <X size={14} />
          <span>Effacer</span>
        </button>
      )}
    </div>
  );
}
