'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ModalProps {
  onClose:     () => void;
  children:    ReactNode;
  maxWidth?:   string;
  className?:  string;
  'aria-label'?: string;
}

const Modal = ({ onClose, children, maxWidth = 'max-w-lg', className = '', 'aria-label': ariaLabel }: ModalProps) => {
  const dialogRef  = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Lock <main> scroll and manage focus
  useEffect(() => {
    const main = document.querySelector('main') as HTMLElement | null;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (main) main.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    // Save trigger and move focus into dialog
    const prevFocus = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onCloseRef.current(); return; }
      if (e.key !== 'Tab' || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (main) main.style.overflow = '';
      document.body.style.paddingRight = '';
      prevFocus?.focus();
    };
  }, []);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 backdrop-blur-sm">
      <div
        className="flex min-h-full items-center justify-center p-3 sm:p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          tabIndex={-1}
          className={`w-full ${maxWidth} bg-dark border border-gold/25 shadow-2xl shadow-black/60 outline-none ${className}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
