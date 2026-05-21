'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@/components/icons';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-8 h-8" />;

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex items-center justify-center w-8 h-8 border transition-all duration-200 ${
        isDark
          ? 'border-[#E4BC62]/30 text-[#E4BC62] hover:bg-[#E4BC62]/10'
          : 'border-[#DDDED9] text-[#23292E]/60 hover:border-[#DFB3AE] hover:text-[#23292E]'
      } ${className}`}
    >
      {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
    </button>
  );
};
