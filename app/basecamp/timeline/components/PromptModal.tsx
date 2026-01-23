'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PromptModalProps {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function PromptModal({
  title,
  message,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel
}: PromptModalProps) {
  const [value, setValue] = useState(defaultValue);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Auto-focus input
  useEffect(() => {
    if (mounted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mounted]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
    }
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
        className="rounded-xl max-w-md w-full"
        style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6">
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {message}
          </p>
        </div>

        {/* Input */}
        <div className="px-6">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) {
                e.preventDefault();
                onConfirm(value.trim());
              }
            }}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2"
            style={{
              background: 'var(--bg-surface-3)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          />
        </div>

        {/* Actions */}
        <div 
          className="flex gap-3 p-6"
          style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '1.5rem' }}
        >
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 rounded-lg font-medium transition-colors hover:opacity-80"
            style={{ 
              background: 'var(--bg-surface-3)',
              color: 'var(--text-secondary)'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!value.trim()}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--accent-cyan)' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
