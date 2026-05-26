'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { BudgetCategory } from '@/types/budget';
import { fmt } from '@/utils/format';

// Palette that complements the gold/dark theme
const SLICE_COLORS = [
  '#E4BC62', // gold
  '#DFB3AE', // blush
  '#7FB5B0', // teal
  '#B8A9C9', // lavender
  '#E8956D', // peach
  '#8FBF88', // sage
  '#C4A882', // sand
  '#9BBDD4', // sky
  '#D4A0A0', // rose
  '#A8B8A0', // muted green
];

interface Props {
  categories: BudgetCategory[];
  spent:      number;
  total:      number;
}

interface TooltipPayload {
  name:  string;
  value: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: TooltipPayload }[] }) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div className="bg-white dark:bg-[#0F0C24] rounded-xl border border-silver/30 dark:border-gold/20 px-3 py-2 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-bold text-silver dark:text-silver/80">{name}</span>
      </div>
      <p className="text-sm font-black text-dark dark:text-white">₹{fmt(value)}</p>
    </div>
  );
};

export const SpendingDonut = ({ categories, spent, total }: Props) => {
  const data = categories
    .filter(c => c.spent > 0)
    .map((c, i) => ({
      name:  c.category,
      value: c.spent,
      icon:  c.icon,
      pct:   total > 0 ? Math.round((c.spent / total) * 100) : 0,
      color: SLICE_COLORS[i % SLICE_COLORS.length],
    }));

  const isEmpty = data.length === 0;

  return (
    <div className="bg-card dark:bg-[#2A1F52] rounded-2xl border border-blush/15 dark:border-gold/12 p-6">

      {/* Section header */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-blush/60 dark:text-gold/50 text-[9px]">◈</span>
        <p className="text-[10px] font-bold text-silver dark:text-silver/50 uppercase tracking-[0.35em]">Spend by Category</p>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <span className="text-4xl text-silver/30 dark:text-silver/10">◎</span>
          <p className="text-xs text-silver dark:text-silver/65">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center gap-8">

          {/* Donut */}
          <div className="relative shrink-0 w-52 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} opacity={0.9} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Centre label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-[9px] font-bold text-silver dark:text-silver/60 uppercase tracking-[0.3em]">Spent</p>
              <p className="text-xl font-black text-dark dark:text-white leading-tight">₹{fmt(spent)}</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {data.map(entry => (
              <div key={entry.name} className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-base shrink-0">{entry.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] font-semibold text-silver dark:text-silver/70 truncate">{entry.name}</p>
                    <p className="text-[11px] font-black text-dark dark:text-white shrink-0">₹{fmt(entry.value)}</p>
                  </div>
                  {/* Mini bar */}
                  <div className="mt-0.5 h-[3px] bg-silver/15 dark:bg-silver/8 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${entry.pct}%`, backgroundColor: entry.color, opacity: 0.7 }}
                    />
                  </div>
                </div>
                <span className="text-[10px] text-silver/60 dark:text-silver/60 shrink-0 w-7 text-right">{entry.pct}%</span>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
};