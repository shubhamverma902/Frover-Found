'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { SIDEBAR_NAV } from '@/constants/navigation';
import { PATH } from '@/constants/path';
import type { AuthUser } from '@/store/slices/authSlice';
import type { WeddingProfile } from '@/types/onboarding';

interface SidebarProps {
  open?:          boolean;
  user:           AuthUser | null;
  profile:        WeddingProfile | null;
  onboardingDone: boolean;
}

const getInitials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

const daysUntil = (dateStr: string): number =>
  Math.ceil((new Date(dateStr + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const formatDate = (dateStr: string): string =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function Sidebar({ open, user, profile, onboardingDone }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const initials  = user ? getInitials(user.name) : '?';
  const planLabel = user?.plan === 'premium' ? 'Premium' : 'Free';

  const countdown = profile?.weddingDate
    ? { days: daysUntil(profile.weddingDate), date: formatDate(profile.weddingDate) }
    : null;

  return (
    <>
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        min-h-screen flex flex-col shrink-0
        bg-[#F5EEF8] dark:bg-[#2A1F52]
        border-r border-[#E5D5EA] dark:border-white/5
        transition-all duration-300
        ${collapsed ? 'w-16' : 'w-60'}
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className={`border-b border-[#E5D5EA] dark:border-white/8 flex items-center ${collapsed ? 'px-3 py-5 justify-center' : 'px-6 py-5'}`}>
          {collapsed ? (
            <Link href="/" className="group select-none">
              <svg
                width={28}
                height={28}
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="transition-transform duration-500 group-hover:rotate-45"
              >
                <ellipse cx="20" cy="7" rx="3" ry="7" className="fill-[#23292E] dark:fill-[#CDB4DB]" transform="rotate(0   20 20)" />
                <ellipse cx="20" cy="7" rx="3" ry="7" className="fill-[#23292E] dark:fill-[#CDB4DB]" transform="rotate(90  20 20)" />
                <ellipse cx="20" cy="7" rx="3" ry="7" className="fill-[#23292E] dark:fill-[#CDB4DB]" transform="rotate(180 20 20)" />
                <ellipse cx="20" cy="7" rx="3" ry="7" className="fill-[#23292E] dark:fill-[#CDB4DB]" transform="rotate(270 20 20)" />
                <ellipse cx="20" cy="7" rx="2.2" ry="6" fill="#DFB3AE" transform="rotate(45  20 20)" />
                <ellipse cx="20" cy="7" rx="2.2" ry="6" fill="#DFB3AE" transform="rotate(135 20 20)" />
                <ellipse cx="20" cy="7" rx="2.2" ry="6" fill="#DFB3AE" transform="rotate(225 20 20)" />
                <ellipse cx="20" cy="7" rx="2.2" ry="6" fill="#DFB3AE" transform="rotate(315 20 20)" />
                <circle cx="20" cy="20" r="6"   fill="#E4BC62" />
                <circle cx="20" cy="20" r="3"   fill="#ffffff" />
                <circle cx="20" cy="20" r="1.5" fill="#23292E" />
              </svg>
            </Link>
          ) : (
            <Logo size="md" theme="auto" href="/" />
          )}
        </div>

        {/* Wedding countdown / setup prompt */}
        {!collapsed && (
          <div className="mx-3 mt-4">
            {countdown ? (
              <div className="px-4 py-4 rounded-2xl bg-blush/15 dark:bg-blush/10 border border-blush/25 dark:border-blush/20">
                {profile?.partner1 && profile?.partner2 && (
                  <p className="text-[10px] font-semibold text-blush truncate mb-1">
                    {profile.partner1} &amp; {profile.partner2}
                  </p>
                )}
                <p className="text-[9px] font-bold text-silver dark:text-blush/80 uppercase tracking-[0.35em] mb-1">
                  Countdown
                </p>
                {countdown.days > 0 ? (
                  <>
                    <p className="text-2xl font-black text-dark dark:text-white leading-none">
                      {countdown.days}{' '}
                      <span className="text-sm font-medium text-silver dark:text-white/70">days</span>
                    </p>
                    <p className="text-[11px] text-silver dark:text-white/65 mt-1">{countdown.date}</p>
                  </>
                ) : countdown.days === 0 ? (
                  <p className="text-sm font-black text-blush">Today is the day! 🎉</p>
                ) : (
                  <>
                    <p className="text-sm font-black text-dark/60 dark:text-white/60">Wedding passed</p>
                    <p className="text-[11px] text-silver dark:text-white/65 mt-0.5">{countdown.date}</p>
                  </>
                )}
                {(profile?.city || profile?.style) && (
                  <div className="flex flex-wrap gap-1 mt-2.5">
                    {profile.city && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-dark/6 dark:bg-white/8 text-silver dark:text-white/70 uppercase tracking-wider">
                        {profile.city}
                      </span>
                    )}
                    {profile.style && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-dark/6 dark:bg-white/8 text-silver dark:text-white/70 uppercase tracking-wider">
                        {profile.style}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : onboardingDone === false && user ? (
              <Link
                href={PATH.onboarding}
                className="flex flex-col px-4 py-3.5 rounded-2xl bg-blush/10 hover:bg-blush/15 transition-colors"
              >
                <p className="text-[10px] font-semibold text-blush uppercase tracking-widest mb-1">
                  Setup needed
                </p>
                <p className="text-xs text-silver dark:text-white/70 leading-snug">
                  Add your wedding date to unlock the countdown →
                </p>
              </Link>
            ) : (
              <div className="px-4 py-4 rounded-2xl bg-dark/5 dark:bg-white/4 animate-pulse">
                <div className="h-2 w-16 bg-blush/25 dark:bg-blush/20 rounded-full mb-2" />
                <div className="h-5 w-20 bg-dark/8 dark:bg-white/10 rounded-lg mb-1" />
                <div className="h-2 w-24 bg-dark/8 dark:bg-white/10 rounded-full" />
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          {SIDEBAR_NAV.map((group) => (
            <div key={group.section} className={collapsed ? 'mb-3' : 'mb-5'}>
              {!collapsed && (
                <p className="px-3 mb-1.5 text-[9px] font-bold text-silver/70 dark:text-white/55 uppercase tracking-[0.35em]">
                  {group.section}
                </p>
              )}
              {collapsed && (
                <div className="mx-1 mb-1.5 h-px bg-dark/8 dark:bg-white/8" />
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl ${
                          collapsed ? 'justify-center px-2' : 'px-3'
                        } ${
                          isActive
                            ? 'bg-blush/15 text-blush dark:bg-blush/20 dark:text-blush'
                            : 'text-dark/60 hover:bg-dark/6 hover:text-dark dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white'
                        }`}
                      >
                        <span className={`text-base leading-none ${collapsed ? '' : 'w-5'} text-center transition-colors shrink-0 ${isActive ? 'text-blush' : 'text-silver dark:text-white/60'}`}>
                          {item.icon}
                        </span>
                        {!collapsed && item.label}
                        {!collapsed && isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blush shadow-[0_0_6px_rgba(216,167,177,0.7)]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Profile card */}
        <div className="p-3 border-t border-[#E5D5EA] dark:border-white/8">
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blush to-blush/70 flex items-center justify-center text-xs font-black text-white">
                {initials}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-dark/5 dark:bg-white/5 hover:bg-dark/8 dark:hover:bg-white/8 transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blush to-blush/70 flex items-center justify-center text-xs font-black text-white shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-dark dark:text-white truncate">{user?.name ?? 'Guest'}</p>
                <p className="text-[11px] text-silver dark:text-white/60 truncate">{planLabel} plan</p>
              </div>
            </div>
          )}

          {/* Collapse toggle — desktop only */}
          <button
            onClick={() => setCollapsed(c => !c)}
            className={`hidden lg:flex w-full items-center justify-center mt-2 py-1.5 rounded-lg text-silver/60 dark:text-white/30 hover:text-dark dark:hover:text-white hover:bg-dark/6 dark:hover:bg-white/8 transition-all text-xs`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

      </aside>
    </>
  );
}

export type SidebarItem = { label: string; href: string; icon?: string };
