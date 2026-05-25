'use client';

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  id?: string;
}

export const Toggle = ({ checked, onChange, id }: ToggleProps) => (
  <button
    role="switch"
    aria-checked={checked}
    id={id}
    type="button"
    onClick={onChange}
    className={`relative w-11 h-6 shrink-0 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
      checked
        ? 'bg-gold'
        : 'bg-zinc-300 dark:bg-zinc-600'
    }`}
  >
    <span
      className={`absolute top-1 w-4 h-4 bg-white shadow-sm transition-all duration-300 ${
        checked ? 'left-6' : 'left-1'
      }`}
    >
      {checked && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-dark" />
        </span>
      )}
    </span>
  </button>
);
