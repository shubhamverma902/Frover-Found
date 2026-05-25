interface EventsEmptyStateProps {
  onAddEvent: () => void;
}

const CalendarIllustration = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
    <rect x="10" y="16" width="68" height="60" rx="2" fill="#1c2226" stroke="#E4BC62" strokeWidth="1.5" strokeOpacity="0.3"/>
    <rect x="10" y="16" width="68" height="15" fill="#E4BC62" fillOpacity="0.09"/>
    <rect x="26" y="10" width="4" height="11" rx="2" fill="#E4BC62" fillOpacity="0.55"/>
    <rect x="58" y="10" width="4" height="11" rx="2" fill="#E4BC62" fillOpacity="0.55"/>
    <line x1="10" y1="31" x2="78" y2="31" stroke="#E4BC62" strokeOpacity="0.12" strokeWidth="1"/>
    <line x1="20" y1="42" x2="50" y2="42" stroke="#DDDED9" strokeWidth="1.5" strokeOpacity="0.18" strokeLinecap="round"/>
    <line x1="20" y1="52" x2="42" y2="52" stroke="#DDDED9" strokeWidth="1.5" strokeOpacity="0.13" strokeLinecap="round"/>
    <line x1="20" y1="62" x2="54" y2="62" stroke="#DDDED9" strokeWidth="1.5" strokeOpacity="0.09" strokeLinecap="round"/>
    <path d="M64 42 L71 51 L64 60 L57 51Z" fill="#E4BC62" fillOpacity="0.22" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.5"/>
    <circle cx="14" cy="20" r="1.5" fill="#DFB3AE" fillOpacity="0.35"/>
    <circle cx="74" cy="72" r="1.5" fill="#E4BC62" fillOpacity="0.25"/>
  </svg>
);

export const EventsEmptyState = ({ onAddEvent }: EventsEmptyStateProps) => (
  <div className="flex flex-col items-center py-16 px-6 text-center border border-dashed border-gold/20 bg-gold/[0.02]">

    <div className="relative mb-6">
      <CalendarIllustration />
      <div className="absolute inset-0 -z-10 blur-2xl bg-gold/10 rounded-full scale-75" />
    </div>

    <p className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.35em] mb-2">Events</p>
    <h2 className="text-base font-bold text-dark dark:text-white mb-3">No events planned yet</h2>
    <p className="text-sm text-zinc-400 dark:text-silver/50 max-w-xs mb-7 leading-relaxed">
      Add your first ceremony, reception, or sangeet to start building your wedding timeline.
    </p>

    <button
      onClick={onAddEvent}
      className="px-7 py-3 text-sm font-bold bg-dark text-gold border border-gold/30 hover:bg-gold hover:text-dark transition-all duration-200 hover:shadow-[0_4px_20px_rgba(228,188,98,0.35)]"
    >
      + Add First Event
    </button>

    <p className="mt-4 text-[10px] text-zinc-400/50 dark:text-silver/25 max-w-xs">
      Tip: Complete onboarding to auto-seed events from your wedding plan
    </p>
  </div>
);
