import type { FC, ReactNode } from 'react';

interface Props {
  n: string;
  label: string;
  children: ReactNode;
}

export const OnboardingSection: FC<Props> = ({ n, label, children }) => (
  <div className="bg-white border border-[#DDDED9] p-6 space-y-4">
    <div className="flex items-center gap-3 mb-1">
      <span className="text-2xl font-black text-[#E4BC62]/35 leading-none tabular-nums">{n}</span>
      <div className="flex-1 h-px bg-[#DDDED9]" />
      <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</span>
    </div>
    {children}
  </div>
);
