'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

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

  const variants = {
    danger: {
      iconBg: 'rgba(239, 68, 68, 0.2)',
      iconColor: '#ef4444',
      buttonBg: '#dc2626',
      buttonHover: '#ef4444'
    },
    warning: {
      iconBg: 'var(--accent-orange-muted)',
      iconColor: 'var(--accent-orange)',
      buttonBg: '#ea580c',
      buttonHover: '#f97316'
    },
    info: {
      iconBg: 'var(--accent-cyan-muted)',
      iconColor: 'var(--accent-cyan)',
      buttonBg: 'var(--accent-cyan)',
      buttonHover: '#06b6d4'
    }
  };

  const style = variants[variant];

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
        {/* Icon */}
        <div className="flex flex-col items-center p-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: style.iconBg }}
          >
            <AlertTriangle className="w-8 h-8" style={{ color: style.iconColor }} />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-bold mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          
          {/* Message */}
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            {message}
          </p>
        </div>

        {/* Actions */}
        <div 
          className="flex gap-3 p-6"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
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
            onClick={onConfirm}
            className="flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors hover:opacity-90"
            style={{ background: style.buttonBg }}
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
