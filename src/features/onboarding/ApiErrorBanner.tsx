interface Props {
  error: string;
  onDismiss: () => void;
}

export const ApiErrorBanner = ({ error, onDismiss }: Props) => (
  <div role="alert" className="mb-6 px-4 py-3 border border-[#DFB3AE]/50 bg-[#DFB3AE]/10 text-xs text-[#23292E] flex items-center justify-between gap-3">
    <span>{error}</span>
    <button aria-label="Dismiss error" onClick={onDismiss} className="shrink-0 text-[#DFB3AE] hover:text-[#23292E] transition-colors">✕</button>
  </div>
);
