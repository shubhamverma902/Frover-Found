interface EventsEmptyStateProps {
  onAddEvent: () => void;
}

export const EventsEmptyState = ({ onAddEvent }: EventsEmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <span className="text-5xl mb-4">◆</span>
    <h2 className="text-lg font-bold text-[#23292E] dark:text-white mb-2">No events yet</h2>
    <p className="text-sm text-zinc-400 dark:text-[#DDDED9]/50 max-w-sm mb-6 leading-relaxed">
      Your events will appear here once you add them. Complete your onboarding to auto-seed events from your wedding plan.
    </p>
    <button
      onClick={onAddEvent}
      className="px-6 py-3 text-sm font-bold bg-[#23292E] text-[#E4BC62] border border-[#E4BC62]/30 hover:bg-[#E4BC62] hover:text-[#23292E] transition-all duration-200"
    >
      + Add First Event
    </button>
  </div>
);
