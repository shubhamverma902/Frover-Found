interface EventsHeaderProps {
  confirmed: number;
  total: number;
  loading: boolean;
  onAddEvent: () => void;
}

export const EventsHeader = ({ confirmed, total, loading, onAddEvent }: EventsHeaderProps) => (
  <div className="rounded-2xl overflow-hidden glow-gold-strong relative">
    <span className="absolute top-2 left-2 text-gold/25 text-[10px] z-10">◆</span>
    <span className="absolute top-2 right-2 text-gold/25 text-[10px] z-10">◆</span>
    <div className="bg-card dark:bg-[#2A1F52] rounded-2xl border border-blush/20 dark:border-gold/20 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blush dark:bg-gold pulse-dot" />
          <p className="text-[10px] font-bold text-blush dark:text-gold uppercase tracking-[0.4em]">Planning</p>
        </div>
        <h1 className="text-xl font-bold text-dark dark:text-white">My Events</h1>
        <p className="text-xs text-silver dark:text-silver/50 mt-1">
          {loading ? 'Loading…' : `${confirmed} of ${total} events confirmed`}
        </p>
      </div>
      <button
        onClick={onAddEvent}
        className="relative self-start sm:self-auto px-5 py-2.5 text-xs font-bold rounded-xl bg-blush text-white hover:bg-blush/90 transition-all hover:shadow-[0_4px_16px_rgba(216,167,177,0.45)]"
      >
        + Add Event
      </button>
    </div>
  </div>
);
