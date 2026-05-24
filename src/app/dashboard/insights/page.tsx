'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { useGetAnalyticsQuery } from '@/store/api';
import type {
  TaskCategoryPoint,
  AnalyticsSummary,
} from '@/api/analytics.api';

// Chart components loaded client-only — Recharts uses ResizeObserver / useLayoutEffect
// which are not available during SSR.
const chartFallback = () => <div className="h-[220px] bg-zinc-100 dark:bg-[#1a1f23] animate-pulse" />;

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
  if (pct >= 50) return 'text-[#E4BC62]';
  return 'text-emerald-400';
}

// ── Shared UI pieces ──────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent,
}: { label: string; value: string; sub: string; accent: string }) {
  return (
    <div className="bg-card border border-[#DDDED9] dark:border-[#2a2f33] p-5 relative overflow-hidden lift shadow-crystal">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-400 dark:text-[#DDDED9]/40 mb-2">{label}</p>
      <p className="text-3xl font-bold" style={{ color: accent }}>{value}</p>
      <p className="text-xs text-zinc-500 dark:text-[#DDDED9]/40 mt-1">{sub}</p>
    </div>
  );
}

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: ReactNode }) {
  return (
    <div className="bg-card border border-[#DDDED9] dark:border-[#2a2f33] overflow-hidden shadow-crystal">
      <div className="px-5 py-4 border-b border-[#DDDED9] dark:border-[#2a2f33] flex items-center gap-3">
        <div className="w-1 h-4 bg-[#E4BC62]" />
        <div>
          <h2 className="text-sm font-bold text-[#23292E] dark:text-white uppercase tracking-wider">{title}</h2>
          {sub && <p className="text-[10px] text-zinc-400 dark:text-[#DDDED9]/40 mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function TaskCategoryProgress({ data }: { data: TaskCategoryPoint[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-zinc-400 dark:text-[#DDDED9]/40 py-4 text-center">No checklist categories yet.</p>;
  }
  return (
    <div className="space-y-3">
      {data.map(({ category, done, total }) => {
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#23292E] dark:text-[#DDDED9]/80 font-medium truncate max-w-[70%]">
                {category}
              </span>
              <span className={`text-xs font-semibold tabular-nums ${pctColor(pct)}`}>
                {done}/{total}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-[#2a2f33] overflow-hidden">
              <div
                className="h-full bg-[#E4BC62] transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="h-20 bg-[#23292E] animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-24 bg-card border border-[#DDDED9] dark:border-[#2a2f33] animate-pulse" />
        ))}
      </div>
      <div className="h-64 bg-card border border-[#DDDED9] dark:border-[#2a2f33] animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-card border border-[#DDDED9] dark:border-[#2a2f33] animate-pulse" />
        <div className="h-64 bg-card border border-[#DDDED9] dark:border-[#2a2f33] animate-pulse" />
      </div>
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
      <div className="bg-[#23292E] p-[3px] glow-gold-strong relative">
        <span className="absolute top-2 left-2 text-[#E4BC62]/25 text-[10px]">◉</span>
        <span className="absolute top-2 right-2 text-[#E4BC62]/25 text-[10px]">◉</span>
        <div className="border border-[#E4BC62]/20 px-6 py-5 relative overflow-hidden">
          <div className="absolute inset-0 shimmer pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E4BC62] pulse-dot" />
              <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em]">Analytics</p>
            </div>
            <h1 className="text-xl font-bold text-white">Planning Insights</h1>
            <p className="text-xs text-[#DDDED9]/50 mt-1">
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
