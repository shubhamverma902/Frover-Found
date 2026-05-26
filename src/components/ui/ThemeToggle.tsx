'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@/components/icons';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8 rounded-lg border border-silver/40 shrink-0" />;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-200 ${
        isDark
          ? 'border-gold/30 text-gold hover:bg-gold/10'
          : 'border-silver/60 text-dark/60 hover:border-blush hover:text-dark hover:bg-silver/10'
      } ${className}`}
    >
      {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  );
};
