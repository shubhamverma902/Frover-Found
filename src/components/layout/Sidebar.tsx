'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { SIDEBAR_NAV } from '@/constants/navigation';
import { PATH } from '@/constants/path';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectUser } from '@/store/slices/authSlice';
import {
  fetchOnboarding,
  selectWeddingProfile,
  selectOnboardingCompleted,
  selectOnboardingStatus,
} from '@/store/slices/onboardingSlice';

interface SidebarProps {
  open?: boolean;
}

const getInitials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

const daysUntil = (dateStr: string): number =>
  Math.ceil((new Date(dateStr + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const formatDate = (dateStr: string): string =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function Sidebar({ open }: SidebarProps) {
  const pathname  = usePathname();
  const dispatch  = useAppDispatch();

  const user              = useAppSelector(selectUser);
  const profile           = useAppSelector(selectWeddingProfile);
  const onboardingDone    = useAppSelector(selectOnboardingCompleted);
  const onboardingStatus  = useAppSelector(selectOnboardingStatus);

  // Fetch onboarding data on mount if authenticated but profile not in store yet
  useEffect(() => {
    if (user && !profile && onboardingStatus === 'idle') {
      dispatch(fetchOnboarding());
    }
  }, [user, profile, onboardingStatus, dispatch]);

  const initials  = user ? getInitials(user.name) : '?';
  const planLabel = user?.plan === 'premium' ? 'Premium' : 'Free';

  const countdown = profile?.weddingDate
    ? { days: daysUntil(profile.weddingDate), date: formatDate(profile.weddingDate) }
    : null;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-60 min-h-screen bg-dark flex flex-col shrink-0
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Logo */}
        <div className="px-6 py-5 border-b border-silver/10">
          <Logo size="md" theme="light" href="/" />
        </div>

        {/* Wedding countdown / setup prompt */}
        <div className="mx-4 mt-4">
          {countdown ? (
            <div className="px-4 py-3 bg-gold/10 border border-gold/20">
              {/* Couple names */}
              {profile?.partner1 && profile?.partner2 && (
                <p className="text-[10px] font-semibold text-gold/70 truncate mb-1">
                  {profile.partner1} &amp; {profile.partner2}
                </p>
              )}
              <p className="text-[10px] font-semibold text-gold uppercase tracking-widest mb-1">
                Countdown
              </p>
              {countdown.days > 0 ? (
                <>
                  <p className="text-lg font-black text-white leading-none">
                    {countdown.days}{' '}
                    <span className="text-sm font-medium text-silver/60">days</span>
                  </p>
                  <p className="text-[11px] text-silver/50 mt-0.5">{countdown.date}</p>
                </>
              ) : countdown.days === 0 ? (
                <p className="text-sm font-black text-gold">Today is the day! 🎉</p>
              ) : (
                <>
                  <p className="text-sm font-black text-silver/60">Wedding passed</p>
                  <p className="text-[11px] text-silver/40 mt-0.5">{countdown.date}</p>
                </>
              )}
              {/* City + style chips */}
              {(profile?.city || profile?.style) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {profile.city && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-silver/10 text-silver/50 uppercase tracking-wider">
                      {profile.city}
                    </span>
                  )}
                  {profile.style && (
                    <span className="text-[9px] px-1.5 py-0.5 bg-silver/10 text-silver/50 uppercase tracking-wider">
                      {profile.style}
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : onboardingDone === false && user ? (
            /* Onboarding not completed — nudge */
            <Link
              href={PATH.onboarding}
              className="flex flex-col px-4 py-3 bg-blush/10 border border-blush/25 hover:bg-blush/15 transition-colors"
            >
              <p className="text-[10px] font-semibold text-blush uppercase tracking-widest mb-1">
                Setup needed
              </p>
              <p className="text-xs text-silver/60 leading-snug">
                Add your wedding date to unlock the countdown →
              </p>
            </Link>
          ) : (
            /* Loading / skeleton */
            <div className="px-4 py-3 bg-gold/5 border border-gold/10 animate-pulse">
              <div className="h-2 w-16 bg-gold/20 rounded mb-2" />
              <div className="h-5 w-20 bg-silver/10 rounded mb-1" />
              <div className="h-2 w-24 bg-silver/10 rounded" />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {SIDEBAR_NAV.map((group) => (
            <div key={group.section} className="mb-5">
              <p className="px-3 mb-2 text-[9px] font-bold text-blush/40 uppercase tracking-[0.3em]">
                {group.section}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 border-l-2 ${
                          isActive
                            ? 'border-gold bg-gold/10 text-gold'
                            : 'border-transparent text-silver/60 hover:bg-silver/8 hover:text-white'
                        }`}
                      >
                        <span className={`text-base leading-none w-5 text-center ${isActive ? 'text-gold' : 'text-silver/40'}`}>
                          {item.icon}
                        </span>
                        {item.label}
                        {isActive && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />
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
        <div className="p-4 border-t border-silver/10">
          <div className="flex items-center gap-3 px-3 py-3 bg-silver/5">
            <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-xs font-black text-dark shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'Guest'}</p>
              <p className="text-[11px] text-silver/40 truncate">{planLabel} plan</p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}

export type SidebarItem = { label: string; href: string; icon?: string };
