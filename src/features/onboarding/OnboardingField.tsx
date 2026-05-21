import type { FC, ReactNode } from 'react';

interface Props {
  label: string;
  error?: string;
  children: ReactNode;
}

export const OnboardingField: FC<Props> = ({ label, error, children }) => (
  <label className="block">
    <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
      {label}
    </span>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </label>
);
