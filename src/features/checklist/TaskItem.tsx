import type { ChecklistTask } from '@/types/checklist';
import { CheckIcon, PencilIcon } from '@/components/icons';

interface TaskItemProps {
  task:       ChecklistTask;
  index:      number;
  isToggling: boolean;
  onToggle:   () => void;
  onEdit:     () => void;
}

export const TaskItem = ({ task, index, isToggling, onToggle, onEdit }: TaskItemProps) => (
  <li
    className={`group flex items-center gap-4 px-5 py-3.5 border-b border-silver/50 dark:border-[#3D3268]/50 last:border-0 transition-all duration-200 row-reveal ${
      task.done ? 'stripe-done' : 'stripe-hover'
    }`}
    style={{ animationDelay: `${index * 0.04}s` }}
  >
    {/* Checkbox */}
    <button
      type="button"
      onClick={onToggle}
      disabled={isToggling}
      className={`w-5 h-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-all duration-250 ${
        isToggling
          ? 'border-gold/40 opacity-50 cursor-not-allowed'
          : task.done
            ? 'bg-gold border-gold shadow-[0_0_12px_rgba(205,180,219,0.45)]'
            : 'border-silver dark:border-[#3D3268] hover:border-gold/50'
      }`}
    >
      {task.done && (
        <CheckIcon size={11} className="check-bounce text-dark" strokeWidth={2.2} />
      )}
    </button>

    {/* Label */}
    <span
      onClick={isToggling ? undefined : onToggle}
      className={`flex-1 text-sm transition-all duration-200 select-none ${isToggling ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${
        task.done
          ? 'text-zinc-400 dark:text-zinc-500 line-through decoration-gold/40'
          : 'text-dark dark:text-white font-medium'
      }`}
    >
      {task.label}
    </span>

    {/* Due badge */}
    <span className={`text-[10px] font-bold rounded-lg px-2.5 py-1 border shrink-0 transition-all ${
      task.done
        ? 'bg-gold/12 border-gold/30 text-gold'
        : 'border-blush/30 text-blush'
    }`}>
      {task.done
        ? '✓ Done'
        : task.due
          ? new Date(task.due).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : 'No date'}
    </span>

    {/* Edit button */}
    <button
      type="button"
      onClick={onEdit}
      className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-zinc-400 dark:text-silver/50 hover:text-gold hover:bg-gold/10 transition-all duration-200"
      title="Edit task"
    >
      <PencilIcon size={12} />
    </button>
  </li>
);