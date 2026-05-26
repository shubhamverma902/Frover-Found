interface CheckRowProps {
  label:    string;
  checked:  boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const CheckRow = ({ label, checked, onChange, disabled }: CheckRowProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onChange}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
      checked
        ? 'border-gold/40 bg-gold/8 text-gold'
        : 'border-silver/15 text-silver/40 hover:border-silver/30'
    }`}
  >
    <span className="text-xs font-semibold">{label}</span>
    <span className={`w-5 h-5 rounded-md border flex items-center justify-center text-[11px] font-bold transition-colors ${
      checked ? 'border-gold/50 bg-gold/15 text-gold' : 'border-silver/20'
    }`}>
      {checked ? '✓' : ''}
    </span>
  </button>
);
