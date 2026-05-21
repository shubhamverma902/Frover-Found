interface ChecklistEmptyStateProps {
  onAddTask: () => void;
}

const ClipboardIllustration = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
    {/* Clipboard body */}
    <rect x="16" y="20" width="56" height="56" rx="2" fill="#1c2226" stroke="#E4BC62" strokeWidth="1.5" strokeOpacity="0.3"/>
    {/* Clip at top */}
    <rect x="32" y="14" width="24" height="12" rx="2" fill="#1c2226" stroke="#E4BC62" strokeWidth="1.5" strokeOpacity="0.4"/>
    <rect x="38" y="17" width="12" height="6" rx="1" fill="#E4BC62" fillOpacity="0.15" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.3"/>
    {/* Checklist rows */}
    <rect x="26" y="37" width="8" height="8" rx="1" fill="#E4BC62" fillOpacity="0.08" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.3"/>
    <line x1="39" y1="41" x2="60" y2="41" stroke="#DDDED9" strokeWidth="1.5" strokeOpacity="0.2" strokeLinecap="round"/>
    <rect x="26" y="51" width="8" height="8" rx="1" fill="#E4BC62" fillOpacity="0.08" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.2"/>
    <line x1="39" y1="55" x2="56" y2="55" stroke="#DDDED9" strokeWidth="1.5" strokeOpacity="0.15" strokeLinecap="round"/>
    <rect x="26" y="65" width="8" height="8" rx="1" fill="#E4BC62" fillOpacity="0.08" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.15"/>
    <line x1="39" y1="69" x2="52" y2="69" stroke="#DDDED9" strokeWidth="1.5" strokeOpacity="0.1" strokeLinecap="round"/>
    {/* Checkmark in first box hint */}
    <path d="M28 41 L30 43.5 L34 38.5" stroke="#E4BC62" strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Corner accents */}
    <circle cx="14" cy="76" r="1.5" fill="#DFB3AE" fillOpacity="0.3"/>
    <circle cx="74" cy="18" r="1.5" fill="#E4BC62" fillOpacity="0.25"/>
  </svg>
);

export const ChecklistEmptyState = ({ onAddTask }: ChecklistEmptyStateProps) => (
  <div className="flex flex-col items-center py-16 px-6 text-center border border-dashed border-[#E4BC62]/20 bg-[#E4BC62]/[0.02]">

    <div className="relative mb-6">
      <ClipboardIllustration />
      <div className="absolute inset-0 -z-10 blur-2xl bg-[#E4BC62]/10 rounded-full scale-75" />
    </div>

    <p className="text-[10px] font-bold text-[#E4BC62]/60 uppercase tracking-[0.35em] mb-2">Checklist</p>
    <h2 className="text-base font-bold text-[#23292E] dark:text-white mb-3">Your checklist is empty</h2>
    <p className="text-sm text-zinc-400 dark:text-[#DDDED9]/50 max-w-xs mb-7 leading-relaxed">
      Complete your onboarding to auto-seed tasks, or start adding your own wedding to-dos.
    </p>

    <button
      onClick={onAddTask}
      className="px-7 py-3 text-sm font-bold bg-[#23292E] text-[#E4BC62] border border-[#E4BC62]/30 hover:bg-[#E4BC62] hover:text-[#23292E] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(228,188,98,0.35)]"
    >
      + Add First Task
    </button>

    <p className="mt-4 text-[10px] text-zinc-400/50 dark:text-[#DDDED9]/25 max-w-xs">
      Tip: Tasks are organised by category — venue, catering, attire, and more
    </p>
  </div>
);
