interface EventFilteredEmptyProps {
  filter: string;
  onReset: () => void;
}

export const EventFilteredEmpty = ({ filter, onReset }: EventFilteredEmptyProps) => (
  <div className="relative overflow-hidden animate-fade-in-up">
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: "url('/images/weddings/grand-floral.jpg')" }}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-[#0F0C24]/85 via-[#0F0C24]/90 to-dark" />

    <span className="pointer-events-none absolute top-6 left-8 text-gold/10 text-5xl animate-float select-none">◆</span>
    <span className="pointer-events-none absolute bottom-8 right-10 text-blush/10 text-3xl animate-float [animation-delay:1s] select-none">◆</span>
    <span className="pointer-events-none absolute top-1/2 right-1/4 text-gold/5 text-7xl animate-float [animation-delay:0.5s] select-none">◆</span>

    <div className="relative flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="animate-float mb-5">
        <span className="text-gold/40 text-6xl leading-none">◆</span>
      </div>
      <h3 className="text-base font-bold text-white mb-1.5 capitalize">No {filter} events</h3>
      <p className="text-xs text-silver/40 max-w-xs leading-relaxed mb-6">
        {filter === 'confirmed'
          ? 'None of your events are confirmed yet. Mark events as confirmed once they are locked in.'
          : filter === 'planning'
          ? 'No events are currently in the planning stage.'
          : 'No pending events right now.'}
      </p>
      <button
        onClick={onReset}
        className="px-5 py-2 text-[11px] font-bold text-dark bg-gold hover:bg-gold/85 uppercase tracking-widest transition-colors"
      >
        Show all events
      </button>
    </div>
  </div>
);