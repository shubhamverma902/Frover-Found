import { ClipboardIllustration } from '@/components/icons';

interface ChecklistEmptyStateProps {
  onAddTask: () => void;
}

export const ChecklistEmptyState = ({ onAddTask }: ChecklistEmptyStateProps) => (
  <div className="flex flex-col items-center py-16 px-6 text-center border border-dashed border-gold/20 bg-gold/[0.02]">

    <div className="relative mb-6">
      <ClipboardIllustration />
      <div className="absolute inset-0 -z-10 blur-2xl bg-gold/10 rounded-full scale-75" />
    </div>

    <p className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.35em] mb-2">Checklist</p>
    <h2 className="text-base font-bold text-dark dark:text-white mb-3">Your checklist is empty</h2>
    <p className="text-sm text-zinc-400 dark:text-silver/50 max-w-xs mb-7 leading-relaxed">
      Complete your onboarding to auto-seed tasks, or start adding your own wedding to-dos.
    </p>

    <button
      onClick={onAddTask}
      className="px-7 py-3 text-sm font-bold bg-subtle dark:bg-dark text-gold border border-gold/30 hover:bg-gold hover:text-dark transition-all duration-200 hover:shadow-[0_4px_20px_rgba(205,180,219,0.35)]"
    >
      + Add First Task
    </button>

    <p className="mt-4 text-[10px] text-zinc-400/50 dark:text-silver/55 max-w-xs">
      Tip: Tasks are organised by category — venue, catering, attire, and more
    </p>
  </div>
);
