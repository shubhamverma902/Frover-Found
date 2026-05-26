import type { ChecklistTask } from '@/types/checklist';
import { ProgressRing } from '@/components/ui';
import { TaskItem } from './TaskItem';
import type { Filter } from './FilterTabs';

interface Category {
  _id: string;
  icon: string;
  category: string;
  tasks: ChecklistTask[];
}

interface CategorySectionProps {
  cat:          Category;
  filter:       Filter;
  togglingIds:  string[];
  onToggleTask: (id: string) => void;
  onEditTask:   (task: ChecklistTask, category: string) => void;
}

export const CategorySection = ({ cat, filter, togglingIds, onToggleTask, onEditTask }: CategorySectionProps) => {
  const visibleTasks = cat.tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done')    return  t.done;
    return true;
  });

  if (visibleTasks.length === 0) return null;

  const catDone = cat.tasks.filter(t => t.done).length;
  const catPct  = cat.tasks.length > 0 ? Math.round((catDone / cat.tasks.length) * 100) : 0;

  return (
    <div className="bg-card rounded-2xl shadow-lg ring-1 ring-silver/20 dark:ring-white/5 overflow-hidden lift">
      {/* Category header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-silver/30 dark:border-white/5 bg-gradient-to-r from-silver/15 dark:from-silver/5 via-silver/5 dark:via-transparent to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blush/15 dark:bg-dark border border-blush/20 dark:border-gold/15 rounded-xl flex items-center justify-center text-lg shrink-0">
            {cat.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-dark dark:text-white">{cat.category}</p>
            <p className="text-[10px] text-zinc-400 dark:text-silver/50">{catDone} of {cat.tasks.length} done</p>
          </div>
        </div>
        <div className="relative w-9 h-9 shrink-0">
          <ProgressRing
            pct={catPct}
            viewSize={32} radius={12} strokeWidth={3}
            trackColor="rgba(159,134,160,0.4)"
            color="#E4BC62"
            duration="0.8s"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[9px] font-black text-dark dark:text-white">{catPct}%</span>
          </div>
        </div>
      </div>

      {/* Task list */}
      <ul>
        {visibleTasks.map((task, ti) => (
          <TaskItem
            key={task._id}
            task={task}
            index={ti}
            isToggling={togglingIds.includes(task._id)}
            onToggle={() => onToggleTask(task._id)}
            onEdit={() => onEditTask(task, cat.category)}
          />
        ))}
      </ul>
    </div>
  );
};
