import type { FC } from 'react';

interface Props {
  saving: boolean;
  label: string;
  disabled?: boolean;
}

export const SettingsSaveBtn: FC<Props> = ({ saving, label, disabled }) => (
  <button
    type="submit"
    disabled={disabled || saving}
    className="mt-5 px-6 py-2.5 text-xs font-semibold bg-dark text-gold hover:bg-dark/85 transition-all duration-200 hover:shadow-[0_4px_14px_rgba(35,41,46,0.25)] disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {saving ? 'Saving…' : label}
  </button>
);
