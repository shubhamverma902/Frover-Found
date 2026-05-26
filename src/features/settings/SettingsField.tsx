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
    <label className="block text-[10px] font-semibold text-zinc-400 dark:text-silver/50 uppercase tracking-widest mb-1.5 group-focus-within:text-gold transition-colors">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      maxLength={maxLength}
      className="w-full h-11 px-3 text-sm text-dark dark:text-white bg-card rounded-xl border border-silver dark:border-[#3D3268] focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/15 transition-all duration-200 hover:border-blush disabled:opacity-50 disabled:cursor-not-allowed"
    />
  </div>
);