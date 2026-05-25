'use client';

import {
  ComposedChart, BarChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import type {
  BudgetBurnPoint,
  RsvpTrendPoint,
  TaskVelocityPoint,
} from '@/api/analytics.api';

const GOLD  = '#E4BC62';
const GREEN = '#4ade80';
const RED   = '#f87171';
const BLUSH = '#DFB3AE';

const TOOLTIP_STYLE = {
  background:   '#1a1f23',
  border:       '1px solid rgba(228,188,98,0.2)',
  borderRadius: 0,
  fontSize:     12,
  color:        '#DDDED9',
};

function fmtINR(n: number): string {
  if (n >= 10_00_000) return `₹${(n / 10_00_000).toFixed(1)}L`;
  if (n >= 1_000)     return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
}

export function BudgetBurnChart({ data }: { data: BudgetBurnPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={GOLD} stopOpacity={0.35} />
            <stop offset="95%" stopColor={GOLD} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(221,222,217,0.06)" vertical={false} />
        <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={fmtINR} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={52} />
        <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => fmtINR(Number(v))} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar    dataKey="spent"      name="Weekly Spend" fill={GOLD} fillOpacity={0.55} radius={[2, 2, 0, 0]} />
        <Line   type="monotone" dataKey="cumulative" name="Cumulative"
                stroke={GOLD} strokeWidth={2} dot={false} strokeOpacity={0.9} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function RsvpTrendChart({ data }: { data: RsvpTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(221,222,217,0.06)" vertical={false} />
        <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Bar dataKey="confirmed" name="Confirmed" stackId="rsvp" fill={GREEN} fillOpacity={0.8} />
        <Bar dataKey="declined"  name="Declined"  stackId="rsvp" fill={RED}   fillOpacity={0.8} radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TaskVelocityChart({ data }: { data: TaskVelocityPoint[] }) {
  const allZero = data.every(d => d.completed === 0);

  if (allZero) {
    return (
      <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-2xl">✓</p>
        <p className="text-sm text-zinc-500 dark:text-silver/40">No completions tracked yet</p>
        <p className="text-xs text-zinc-400 dark:text-silver/30 max-w-[200px]">
          Complete checklist tasks to see velocity build up week by week
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(221,222,217,0.06)" vertical={false} />
        <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
        <Tooltip contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="completed" name="Tasks Completed" fill={BLUSH} fillOpacity={0.85} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
