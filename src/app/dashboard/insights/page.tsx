'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useGetAnalyticsQuery } from '@/store/api';
import type {
  TaskCategoryPoint,
  AnalyticsSummary,
} from '@/api/analytics.api';
import { InsightsSkeleton } from './InsightsSkeleton';

// Chart components loaded client-only — Recharts uses ResizeObserver / useLayoutEffect
// which are not available during SSR.
const chartFallback = () => <div className="h-[220px] bg-zinc-100 dark:bg-[#1E1840] animate-pulse" />;

const BudgetBurnChart   = dynamic(() => import('./InsightsCharts').then(m => m.BudgetBurnChart),   { ssr: false, loading: chartFallback });
const RsvpTrendChart    = dynamic(() => import('./InsightsCharts').then(m => m.RsvpTrendChart),    { ssr: false, loading: chartFallback });
const TaskVelocityChart = dynamic(() => import('./InsightsCharts').then(m => m.TaskVelocityChart), { ssr: false, loading: chartFallback });

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtINR(n: number): string {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000)     return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

function pctColor(pct: number): string {
  if (pct >= 80) return 'text-red-400';
  if (pct >= 50) return 'text-gold';
  return 'text-emerald-400';
}

// ── Shared UI pieces ──────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent,
}: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="bg-card rounded-2xl shadow-lg ring-1 ring-silver/20 dark:ring-white/5 p-5 relative overflow-hidden lift">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 dark:text-silver/65 mb-2">{label}</p>
      <p className="text-3xl font-bold" style={{ color: accent }}>{value}</p>
      <p className="text-xs text-zinc-500 dark:text-silver/65 mt-1">{sub}</p>
    </div>
  );
}

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="bg-card rounded-2xl shadow-lg ring-1 ring-silver/20 dark:ring-white/5 overflow-hidden">
      <div className="px-5 py-4 border-b border-silver/30 dark:border-white/5 flex items-center gap-3">
        <div className="w-1 h-4 rounded-full bg-gold" />
        <div>
          <h2 className="text-sm font-bold text-dark dark:text-white uppercase tracking-wider">{title}</h2>
          {sub && <p className="text-[10px] text-zinc-400 dark:text-silver/65 mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function TaskCategoryProgress({ data }: { data: TaskCategoryPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-400 dark:text-silver/65 py-4 text-center">No checklist categories yet.</p>;
  }
  return (
    <div className="space-y-3">
      {data.map(({ category, done, total }) => {
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-dark dark:text-silver/80 font-medium truncate max-w-[70%]">
                {category}
              </span>
              <span className={`text-xs font-semibold tabular-nums ${pctColor(pct)}`}>
                {done}/{total}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-[#3D3268] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gold transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
const InsightsPage = () => {
  const { data, isLoading } = useGetAnalyticsQuery();

  if (isLoading) return <InsightsSkeleton />;
  if (!data)     return null;

  const { summary, budgetBurn, rsvpTrend, taskVelocity, taskByCategory } = data;
  const s = summary as AnalyticsSummary;

  return (
    <div className="p-6 lg:p-8 space-y-6 page-sections">

      {/* Header */}
      <div className="rounded-2xl overflow-hidden glow-gold-strong relative">
        <span className="absolute top-2 left-2 text-gold/25 text-[10px] z-10">◉</span>
        <span className="absolute top-2 right-2 text-gold/25 text-[10px] z-10">◉</span>
        <div className="bg-card dark:bg-[#2A1F52] rounded-2xl border border-blush/20 dark:border-gold/20 px-6 py-5 relative overflow-hidden">
          <div className="absolute inset-0 shimmer pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blush dark:bg-gold pulse-dot" />
              <p className="text-[10px] font-bold text-blush dark:text-gold uppercase tracking-[0.4em]">Analytics</p>
            </div>
            <h1 className="text-xl font-bold text-dark dark:text-white">Planning Insights</h1>
            <p className="text-xs text-silver dark:text-silver/50 mt-1">
              Budget burn, RSVP responses, and task velocity — last 8 weeks
            </p>
          </div>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Budget Used"
          value={`${s.burnPct}%`}
          sub={`${fmtINR(s.budgetSpent)} of ${fmtINR(s.budgetTotal)}`}
          accent="#E4BC62"
        />
        <StatCard
          label="RSVP Rate"
          value={`${s.rsvpRate}%`}
          sub={`${s.guestsConfirmed} of ${s.guestsTotal} guests confirmed`}
          accent="#4ade80"
        />
        <StatCard
          label="Tasks Done"
          value={`${s.taskRate}%`}
          sub={`${s.tasksDone} of ${s.tasksTotal} complete`}
          accent="#DFB3AE"
        />
      </div>

      {/* Budget Burn Rate */}
      <ChartCard title="Budget Burn Rate" sub="Weekly spend (bars) vs. cumulative total (line)">
        <BudgetBurnChart data={budgetBurn} />
      </ChartCard>

      {/* RSVP Trend + Task Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="RSVP Trend" sub="Confirmed & declined responses per week">
          <RsvpTrendChart data={rsvpTrend} />
        </ChartCard>

        <ChartCard title="Task Velocity" sub="Checklist tasks completed per week">
          <TaskVelocityChart data={taskVelocity} />
        </ChartCard>
      </div>

      {/* Checklist progress by category */}
      <ChartCard title="Checklist Progress" sub="Done vs. total tasks per category">
        <TaskCategoryProgress data={taskByCategory} />
      </ChartCard>

    </div>
  );
};

export default InsightsPage;