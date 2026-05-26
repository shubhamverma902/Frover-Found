import type { ReactNode } from 'react';

interface OptionPillProps {
  active:     boolean;
  onClick:    () => void;
  children:   ReactNode;
  className?: string;
}

export const OptionPill = ({ active, onClick, children, className = '' }: OptionPillProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`border transition-colors ${
      active
        ? 'border-gold/50 bg-gold/10 text-gold'
        : 'border-silver/15 text-silver/40 hover:border-silver/30'
    } ${className}`}
  >
    {children}
  </button>
);
