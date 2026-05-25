interface Props {
  error: string;
  onDismiss: () => void;
}

export const ApiErrorBanner = ({ error, onDismiss }: Props) => (
  <div role="alert" className="mb-6 px-4 py-3 border border-blush/50 bg-blush/10 text-xs text-dark flex items-center justify-between gap-3">
    <span>{error}</span>
    <button aria-label="Dismiss error" onClick={onDismiss} className="shrink-0 text-blush hover:text-dark transition-colors">✕</button>
  </div>
);
