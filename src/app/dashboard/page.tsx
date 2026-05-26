'use client';

import Link from 'next/link';
import { CheckIcon } from '@/components/icons';
import { PATH } from '@/constants/path';
import { useAppDispatch } from '@/store/hooks';
import { DASHBOARD_ACTIONS, toggleDashboardTask } from '@/store/slices/dashboardSlice';
import { useGetDashboardQuery, useToggleTaskMutation } from '@/store/api';
import { DashboardSkeleton } from '@/features/dashboard/DashboardSkeleton';
import { fmt } from '@/utils/format';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const [toggleTask] = useToggleTaskMutation();
  const { data, isLoading: loading } = useGetDashboardQuery(undefined, { pollingInterval: 60_000 });

  const USER     = data?.user     ?? null;
  const STATS    = data?.stats    ?? null;
  const TASKS    = data?.tasks    ?? [];
  const ACTIVITY = data?.activity ?? [];

  const doneTasks  = TASKS.filter(t => t.done).length;
  const totalTasks = TASKS.length;
  const progress   = STATS
    ? Math.round(
        ((STATS.tasksDone + STATS.vendorsBooked + STATS.guestsConfirmed) /
         Math.max(1, STATS.tasksTotal + STATS.vendorsTotal + STATS.guestsTotal)) * 100
      )
    : 0;

  const statsRow = STATS ? [
    { value: STATS.daysLeft ?? '—',                      unit: 'days',             label: 'Until your wedding', accent: true  },
    { value: `${STATS.tasksDone}`,  unit: `/ ${STATS.tasksTotal}`,   label: 'Tasks completed',    accent: false },
    { value: fmt(STATS.budgetSpent), unit: `/ ${fmt(STATS.budgetTotal)}`, label: 'Budget utilised',    accent: false },
    { value: `${STATS.guestsConfirmed}`, unit: `/ ${STATS.guestsTotal}`, label: 'Guests confirmed',   accent: false },
  ] : [];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      {/* ── Welcome banner ── */}
      <div className="bg-dark p-[3px] glow-gold-strong relative">
        <span className="absolute top-2 left-2 text-gold/30 text-[10px]">◆</span>
        <span className="absolute top-2 right-2 text-gold/30 text-[10px]">◆</span>
        <span className="absolute bottom-2 left-2 text-gold/20 text-[10px]">◆</span>
        <span className="absolute bottom-2 right-2 text-gold/20 text-[10px]">◆</span>
        <div className="border border-gold/20 px-8 py-8 relative overflow-hidden">
          <div className="absolute inset-0 shimmer pointer-events-none" />

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
            <span className="text-gold/50 text-[10px] tracking-[0.5em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 relative">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold pulse-dot" />
                <p className="text-[10px] font-semibold text-gold uppercase tracking-[0.4em]">Welcome back</p>
              </div>
              {USER ? (
                <>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                    {USER.name}
                    {USER.partner && <> <span className="text-gold/60">&amp;</span> {USER.partner}</>}
                    <span className="ml-2 text-gold">✦</span>
                  </h1>
                  <p className="mt-2 text-sm text-silver/50 flex items-center gap-2">
                    <span className="text-blush">◎</span>
                    {USER.weddingDate || 'Wedding date not set'}
                    {USER.venue && <> &nbsp;·&nbsp; {USER.venue}</>}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white">Your Dashboard <span className="text-gold">✦</span></h1>
                  <p className="mt-2 text-sm text-silver/50">Complete your profile in Settings to personalise this view.</p>
                </>
              )}
            </div>

            <div className="shrink-0 border border-gold/20 bg-gold/5 px-6 py-4 text-center">
              <p className="text-[9px] font-bold text-gold/60 uppercase tracking-[0.4em] mb-1">Days Until</p>
              <p className="text-5xl font-black text-gold leading-none num-pop">
                {STATS?.daysLeft ?? '—'}
              </p>
              <p className="text-[10px] text-silver/40 uppercase tracking-widest mt-1">days to go</p>
            </div>
          </div>

          <div className="mt-7">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] font-semibold text-silver/40 uppercase tracking-[0.3em]">Planning Progress</p>
              <p className="text-xs font-black text-gold">{progress}%</p>
            </div>
            <div className="h-2 bg-silver/8 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-gold via-gold to-blush rounded-full bar-animate relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-4 bg-white/20 rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
            <span className="text-gold/25 text-[10px]">◆</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statsRow.map((s) => (
              <div
                key={s.label}
                className={`relative stat-card border p-5 lift grad-border ${
                  s.accent ? 'bg-dark border-gold/25' : 'bg-card border-silver dark:border-[#2a2f33]'
                }`}
              >
                <div className="flex items-baseline gap-1">
                  <span className={`text-2xl font-black num-pop ${s.accent ? 'text-gold' : 'text-dark dark:text-white'}`}>
                    {s.value}
                  </span>
                  <span className={`text-sm font-medium ${s.accent ? 'text-silver/40' : 'text-zinc-400 dark:text-silver/50'}`}>
                    {s.unit}
                  </span>
                </div>
                <p className={`mt-1 text-xs font-medium ${s.accent ? 'text-silver/50' : 'text-zinc-400 dark:text-silver/50'}`}>
                  {s.label}
                </p>
                {s.accent && <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />}
              </div>
            ))
        }
      </div>

      {/* ── Quick actions ── */}
      <div>
        <div className="flex items-center gap-4 mb-5">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-silver" />
          <div className="flex items-center gap-2 px-3 py-1 border border-gold/30 bg-gold/5">
            <span className="w-1 h-1 rounded-full bg-gold" />
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.35em]">Quick Actions</p>
            <span className="w-1 h-1 rounded-full bg-gold" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-silver" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
          {DASHBOARD_ACTIONS.map((a) => (
            <Link
              key={a.label}
              href={a.href}
              className="group relative flex items-center gap-4 bg-card border border-silver dark:border-[#2a2f33] p-4 lift grad-border overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-silver/0 to-silver/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="text-2xl shrink-0 group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-300 relative">{a.icon}</span>
              <div className="min-w-0 relative">
                <p className="text-sm font-bold text-dark dark:text-background group-hover:text-blush transition-colors truncate">{a.label}</p>
                <p className="text-xs text-zinc-400 dark:text-silver/50 truncate mt-0.5">{a.desc}</p>
              </div>
              <span className="ml-auto text-silver group-hover:text-blush group-hover:translate-x-1 transition-all duration-200 text-sm shrink-0">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Tasks + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Upcoming tasks */}
        <div className="lg:col-span-3 bg-card border border-silver dark:border-[#2a2f33] shadow-crystal overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-silver dark:border-[#2a2f33] bg-gradient-to-r from-silver/15 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-5 bg-gold" />
              <h2 className="text-sm font-bold text-dark dark:text-white uppercase tracking-widest">Upcoming Tasks</h2>
              {totalTasks > 0 && (
                <span className="text-[10px] text-silver/40">{doneTasks}/{totalTasks}</span>
              )}
            </div>
            <Link
              href={PATH.dashboard.checklist}
              className="text-[10px] font-bold text-blush hover:text-dark uppercase tracking-widest transition-colors flex items-center gap-1 group"
            >
              View all <span className="group-hover:translate-x-0.5 transition-transform inline-block">→</span>
            </Link>
          </div>

          {TASKS.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12">
              <span className="text-3xl text-gold/40 dark:text-gold/20">✓</span>
              <p className="text-sm font-bold text-zinc-400 dark:text-silver/30">All clear — no pending tasks</p>
              <Link href={PATH.dashboard.checklist} className="text-[10px] font-bold text-blush hover:underline uppercase tracking-widest">
                Go to Checklist →
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-silver/60 dark:divide-[#2a2f33]">
              {TASKS.map((task, i) => (
                <li
                  key={task._id}
                  onClick={() => {
                    dispatch(toggleDashboardTask(task._id));
                    toggleTask(task._id);
                  }}
                  className={`flex items-center gap-4 px-6 py-3.5 row-reveal cursor-pointer stripe-hover ${task.done ? 'stripe-done' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className={`w-5 h-5 shrink-0 border-2 flex items-center justify-center transition-all duration-200 ${
                    task.done
                      ? 'bg-gold border-gold shadow-[0_0_10px_rgba(228,188,98,0.35)]'
                      : 'border-silver dark:border-[#2a2f33]'
                  }`}>
                    {task.done && <CheckIcon size={11} className="check-bounce text-dark" strokeWidth={2.2} />}
                  </div>
                  <span className="text-base shrink-0">{task.categoryIcon}</span>
                  <p className={`flex-1 text-sm transition-colors ${task.done ? 'text-zinc-400 dark:text-zinc-500 line-through' : 'text-dark dark:text-background font-medium'}`}>
                    {task.label}
                  </p>
                  <span className={`text-[10px] font-bold px-2.5 py-1 border shrink-0 ${
                    task.done
                      ? 'bg-gold/10 border-gold/25 text-gold'
                      : 'border-blush/40 text-blush'
                  }`}>
                    {task.due
                      ? new Date(task.due + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                      : 'No date'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 bg-card border border-silver dark:border-[#2a2f33] shadow-crystal overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-silver dark:border-[#2a2f33] bg-gradient-to-r from-silver/15 to-transparent">
            <div className="w-1.5 h-5 bg-blush" />
            <h2 className="text-sm font-bold text-dark dark:text-white uppercase tracking-widest">Recent Activity</h2>
          </div>

          <div className="relative px-6 py-4 flex-1">
            {ACTIVITY.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <span className="text-3xl text-blush/50 dark:text-blush/20">◎</span>
                <p className="text-xs text-zinc-400 dark:text-silver/30 text-center leading-relaxed">
                  Activity will appear here as you<br />add guests, vendors, tasks & expenses.
                </p>
              </div>
            ) : (
              <>
                <div className="absolute left-[2.125rem] top-6 bottom-6 w-px bg-gradient-to-b from-gold/30 via-silver/40 to-transparent timeline-line" />
                <ul className="space-y-4">
                  {ACTIVITY.map((item, i) => (
                    <li key={item._id} className="flex items-start gap-4 row-reveal" style={{ animationDelay: `${i * 0.07}s` }}>
                      <div className="relative w-8 h-8 shrink-0 bg-dark border border-gold/20 flex items-center justify-center text-sm z-10">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className="text-sm text-dark dark:text-background leading-snug font-medium">{item.text}</p>
                        <p className="text-[11px] text-zinc-400 dark:text-blush mt-1 font-medium">{item.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="mx-4 mb-4 p-4 bg-dark border border-gold/15 relative overflow-hidden">
            <div className="absolute inset-0 shimmer pointer-events-none" />
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-1 relative">Premium Plan</p>
            <p className="text-xs text-silver/50 leading-relaxed mb-3 relative">
              Unlock vendor management, budget tracking &amp; more.
            </p>
            <button className="w-full py-2.5 text-xs font-bold bg-gold text-dark hover:bg-gold/85 hover:shadow-[0_4px_14px_rgba(228,188,98,0.35)] transition-all relative">
              Upgrade ✦
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
