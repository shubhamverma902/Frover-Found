'use client';

import type { FormHTMLAttributes, ReactNode } from 'react';
import Modal from './Modal';
import { Button } from '@/components/elements';

interface ModalShellProps {
  onClose:        () => void;
  eyebrow:        string;
  title:          string;
  maxWidth?:      string;
  'aria-label'?:  string;
  headerSlot?:    ReactNode;
  children:       ReactNode;
}

const ModalShellBase = ({
  onClose,
  eyebrow,
  title,
  maxWidth,
  'aria-label': ariaLabel,
  headerSlot,
  children,
}: ModalShellProps) => (
  <Modal
    onClose={onClose}
    maxWidth={maxWidth}
    aria-label={ariaLabel}
    className="relative flex flex-col max-h-[90svh]"
  >
    <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gold/15">
      <div>
        <p className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-0.5">{eyebrow}</p>
        <h2 className="text-base font-bold text-white">{title}</h2>
      </div>
      <div className="flex items-center gap-3">
        {headerSlot}
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>
    </div>
    {children}
  </Modal>
);

const Body = ({
  children,
  className = 'pb-2 space-y-4',
}: {
  children:   ReactNode;
  className?: string;
}) => (
  <div className={`overflow-y-auto flex-1 min-h-0 px-6 pt-5 ${className}`}>
    {children}
  </div>
);

const Footer = ({ children }: { children: ReactNode }) => (
  <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gold/10">
    {children}
  </div>
);

const Form = ({
  children,
  ...props
}: FormHTMLAttributes<HTMLFormElement> & { children: ReactNode }) => (
  <form {...props} className="flex flex-col min-h-0 flex-1">
    {children}
  </form>
);

export const ModalShell = Object.assign(ModalShellBase, { Body, Footer, Form });
