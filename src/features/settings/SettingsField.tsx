import type { FC } from 'react';

interface Props {
  label: string;
  value: string;
  type?: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export const SettingsField: FC<Props> = ({ label, value, type = 'text', onChange, disabled, maxLength }) => (
  <div className="group">
    <label className="block text-[10px] font-semibold text-zinc-400 dark:text-[#DDDED9]/50 uppercase tracking-widest mb-1.5 group-focus-within:text-[#E4BC62] transition-colors">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      maxLength={maxLength}
      className="w-full h-11 px-3 text-sm text-[#23292E] dark:text-[#FDFDF8] bg-card border border-[#DDDED9] dark:border-[#2a2f33] focus:outline-none focus:border-[#E4BC62] focus:ring-2 focus:ring-[#E4BC62]/15 transition-all duration-200 hover:border-[#DFB3AE] disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);
