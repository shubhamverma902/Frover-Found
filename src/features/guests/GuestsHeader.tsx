interface GuestsHeaderProps {
  confirmed:  number;
  pending:    number;
  declined:   number;
  loading:    boolean;
  exporting?: boolean;
  onAddGuest:  () => void;
  onImport?:   () => void;
  onExport?:   () => void;
}

export const GuestsHeader = ({ confirmed, pending, declined, loading, exporting, onAddGuest, onImport, onExport }: GuestsHeaderProps) => (
  <div className="bg-dark p-[3px] glow-gold-strong relative">
    <span className="absolute top-2 left-2 text-gold/25 text-[10px]">◆</span>
    <span className="absolute top-2 right-2 text-gold/25 text-[10px]">◆</span>
    <div className="border border-gold/20 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-gold pulse-dot" />
          <p className="text-[10px] font-bold text-gold uppercase tracking-[0.4em]">Planning</p>
        </div>
        <h1 className="text-xl font-bold text-white">Guest List</h1>
        <p className="text-xs text-silver/50 mt-1">
          {loading ? '—' : `${confirmed} confirmed · ${pending} pending · ${declined} declined`}
        </p>
      </div>
      <div className="relative self-start sm:self-auto flex items-center gap-2">
        {onImport && (
          <button
            onClick={onImport}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-bold border border-gold/25 text-gold/65 hover:border-gold/50 hover:text-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ↑ Import
          </button>
        )}
        {onExport && (
          <button
            onClick={onExport}
            disabled={loading || exporting}
            className="px-4 py-2.5 text-xs font-bold border border-gold/25 text-gold/65 hover:border-gold/50 hover:text-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {exporting ? 'Exporting…' : '↓ CSV'}
          </button>
        )}
        <button
          onClick={onAddGuest}
          className="px-5 py-2.5 text-xs font-bold bg-gold text-dark hover:bg-gold/85 transition-all hover:shadow-[0_4px_16px_rgba(228,188,98,0.45)]"
        >
          + Add Guest
        </button>
      </div>
    </div>
  </div>
);
