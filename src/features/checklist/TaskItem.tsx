import type { ChecklistTask } from '@/constants/dashboard-pages';
import { CheckIcon, PencilIcon } from '@/components/icons';

interface TaskItemProps {
  task: ChecklistTask;
  index: number;
  onToggle: () => void;
  onEdit: () => void;
}

export const TaskItem = ({ task, index, onToggle, onEdit }: TaskItemProps) => (
  <li
    className={`group flex items-center gap-4 px-5 py-3.5 border-b border-[#DDDED9]/50 dark:border-[#2a2f33]/50 last:border-0 transition-all duration-200 row-reveal ${
      task.done ? 'stripe-done' : 'stripe-hover'
    }`}
    style={{ animationDelay: `${index * 0.04}s` }}
  >
    {/* Checkbox */}
    <button
      type="button"
      onClick={onToggle}
      className={`w-5 h-5 shrink-0 border-2 flex items-center justify-center transition-all duration-250 ${
        task.done
          ? 'bg-[#E4BC62] border-[#E4BC62] shadow-[0_0_12px_rgba(228,188,98,0.45)]'
          : 'border-[#DDDED9] dark:border-[#2a2f33] hover:border-[#E4BC62]/50'
      }`}
    >
      {task.done && (
        <CheckIcon size={11} className="check-bounce text-[#23292E]" strokeWidth={2.2} />
      )}
    </button>

    {/* Label */}
    <span
      onClick={onToggle}
      className={`flex-1 text-sm transition-all duration-200 cursor-pointer select-none ${
        task.done
          ? 'text-zinc-400 dark:text-zinc-500 line-through decoration-[#E4BC62]/40'
          : 'text-[#23292E] dark:text-[#FDFDF8] font-medium'
      }`}
    >
      {task.label}
    </span>

    {/* Due badge */}
    <span className={`text-[10px] font-bold px-2.5 py-1 border shrink-0 transition-all ${
      task.done
        ? 'bg-[#E4BC62]/12 border-[#E4BC62]/30 text-[#E4BC62]'
        : 'border-[#DFB3AE]/30 text-[#DFB3AE]'
    }`}>
      {task.done ? '✓ Done' : task.due}
    </span>

    {/* Edit button */}
    <button
      type="button"
      onClick={onEdit}
      className="w-7 h-7 shrink-0 flex items-center justify-center text-zinc-400 dark:text-[#DDDED9]/50 hover:text-[#E4BC62] hover:bg-[#E4BC62]/10 transition-all duration-200"
      title="Edit task"
    >
      <PencilIcon size={12} />
    </button>
  </li>
);
