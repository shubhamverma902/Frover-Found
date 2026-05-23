'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface ModalProps {
  onClose:    () => void;
  children:   ReactNode;
  maxWidth?:  string;   // e.g. 'max-w-lg', 'max-w-2xl'
  className?: string;   // extra classes on the inner container
}

/**
 * Generic modal HOC — renders via React Portal into document.body so it sits
 * completely outside the dashboard layout DOM tree. This avoids any stacking
 * context or overflow clipping from parent elements (sidebar, main, etc.),
 * and ensures the backdrop always covers the full viewport.
 *
 * Usage:
 *   <Modal onClose={close} maxWidth="max-w-lg">
 *     <YourContent />
 *   </Modal>
 */
const Modal = ({ onClose, children, maxWidth = 'max-w-lg', className = '' }: ModalProps) => {

  // Lock <main> (the actual scrollable container) — useEffect is correct here
  // because we are syncing React state with an external DOM system.
  useEffect(() => {
    const main = document.querySelector('main') as HTMLElement | null;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (main) main.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      if (main) main.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  // SSR guard — document does not exist on the server.
  // In practice, modals are conditionally rendered on the client only
  // (e.g. {show && <Modal .../>}), so this branch is rarely hit.
  if (typeof document === 'undefined') return null;

  return createPortal(
    // Outer div scrolls on mobile when the modal is taller than the viewport.
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-black/70 backdrop-blur-sm">
      {/* Inner div handles centering and is the click-outside target. */}
      <div
        className="flex min-h-full items-center justify-center p-3 sm:p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div
          className={`w-full ${maxWidth} bg-[#23292E] border border-[#E4BC62]/25 shadow-2xl shadow-black/60 ${className}`}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
