import type { FC, ReactNode } from 'react';

interface Props {
  icon: string;
  title: string;
  children: ReactNode;
}

export const SettingsSection: FC<Props> = ({ icon, title, children }) => (
  <div className="bg-card rounded-2xl shadow-lg ring-1 ring-silver/20 dark:ring-white/5 overflow-hidden lift-deep grad-border">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-silver/30 dark:border-white/5 bg-gradient-to-r from-silver/15 dark:from-silver/5 via-silver/5 dark:via-transparent to-transparent">
      <div className="w-9 h-9 bg-blush/15 dark:bg-dark border border-blush/20 dark:border-gold/15 rounded-xl flex items-center justify-center text-lg shrink-0">{icon}</div>
      <div className="w-1 h-5 bg-gold shrink-0" />
      <h2 className="text-sm font-bold text-dark dark:text-white uppercase tracking-widest">{title}</h2>
    </div>
    <div className="px-6 py-6">{children}</div>
  </div>
);
