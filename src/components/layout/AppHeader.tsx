'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { PATH } from '@/constants/path';
import { HEADER_MENU_ITEMS } from '@/constants/navigation';
import { ThemeToggle } from '@/components/ui';
import { MenuIcon, ArrowLeftIcon, BellIcon, ChevronDownIcon, LogoutIcon } from '@/components/icons';
import type { AuthUser } from '@/store/slices/authSlice';
import type { WeddingProfile } from '@/types/onboarding';
import type { AppNotification } from '@/api/notifications.api';

interface AppHeaderProps {
  onMenuClick?:   () => void;
  user:           AuthUser | null;
  profile:        WeddingProfile | null;
  notifications:  AppNotification[];
  unreadCount:    number;
  notifLoading:   boolean;
  onLogout:       () => void;
  onMarkAllRead:  () => void;
}

const getInitials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);

const daysUntil = (dateStr: string): number => {
  const diff = new Date(dateStr + 'T00:00:00').getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const formatShortDate = (dateStr: string): string =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function AppHeader({
  onMenuClick,
  user,
  profile,
  notifications,
  unreadCount,
  notifLoading,
  onLogout,
  onMarkAllRead,
}: AppHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen,   setNotifOpen]   = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const h = (e: MouseEvent) => {
      if (!dropdownRef.current?.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [profileOpen]);

  useEffect(() => {
    if (!notifOpen) return;
    const h = (e: MouseEvent) => {
      if (!notifRef.current?.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [notifOpen]);

  const handleBellClick = () => {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening && unreadCount > 0) onMarkAllRead();
  };

  const initials         = user ? getInitials(user.name) : '?';
  const firstName        = user?.name.split(' ')[0] ?? 'Guest';
  const planLabel        = user?.plan === 'premium' ? 'Premium' : 'Free';
  const weddingCountdown = profile?.weddingDate
    ? { days: daysUntil(profile.weddingDate), date: formatShortDate(profile.weddingDate) }
    : null;

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 bg-white dark:bg-[#1a1f23] border-b border-silver dark:border-[#2a2f33] shrink-0">

      {/* Left — mobile menu + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 text-dark/50 dark:text-silver/50 hover:text-dark dark:hover:text-silver transition-colors"
          aria-label="Toggle sidebar"
        >
          <MenuIcon size={20} />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <Link href={PATH.home} className="text-blush hover:text-dark dark:hover:text-white transition-colors font-medium">
            Forever Found
          </Link>
          <span className="text-silver dark:text-silver/30">/</span>
          <span className="text-dark dark:text-background font-semibold">Dashboard</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">

        {/* Main site link */}
        <Link
          href={PATH.home}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-dark/50 dark:text-silver/50 hover:text-dark dark:hover:text-silver border border-silver dark:border-[#2a2f33] hover:border-blush px-3 py-1.5 transition-all duration-200"
        >
          <ArrowLeftIcon size={12} />
          Main Site
        </Link>

        <ThemeToggle />

        {/* ── Notification bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="relative p-2 text-dark/40 hover:text-dark dark:text-silver/40 dark:hover:text-silver transition-colors"
            aria-label="Notifications"
          >
            <BellIcon size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[1rem] h-4 flex items-center justify-center rounded-full bg-gold border-2 border-white dark:border-[#1a1f23] text-[9px] font-black text-dark px-0.5 leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-[#1a1f23] border border-silver dark:border-[#2a2f33] shadow-xl shadow-dark/12 z-50 animate-fade-in-up">

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-dark border-b border-gold/15">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-gold" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Notifications</p>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-black text-dark bg-gold px-1.5 py-0.5 rounded-full leading-none">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {notifications.length > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[9px] font-bold text-gold/60 hover:text-gold uppercase tracking-widest transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[22rem] overflow-y-auto">
                {notifLoading ? (
                  <div className="space-y-3 p-4 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-7 h-7 bg-silver/20 rounded shrink-0" />
                        <div className="flex-1 space-y-1.5 pt-0.5">
                          <div className="h-2.5 bg-silver/15 rounded w-4/5" />
                          <div className="h-2 bg-silver/10 rounded w-1/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10">
                    <span className="text-2xl text-blush/40">🔔</span>
                    <p className="text-xs text-zinc-400 dark:text-silver/30">No notifications yet</p>
                    <p className="text-[10px] text-zinc-300 dark:text-silver/20 text-center px-6 leading-relaxed">
                      Activity will appear here as you add guests, tasks, and vendors.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-silver/60 dark:divide-[#2a2f33]">
                    {notifications.map(n => (
                      <li
                        key={n._id}
                        className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                          !n.read ? 'bg-gold/5' : ''
                        }`}
                      >
                        <div className="w-7 h-7 shrink-0 bg-dark border border-gold/20 flex items-center justify-center text-xs">
                          {n.icon}
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className="text-xs text-dark dark:text-background leading-snug">{n.text}</p>
                          <p className="text-[10px] text-zinc-400 dark:text-blush/70 mt-0.5">{n.time}</p>
                        </div>
                        {!n.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-2" />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-silver dark:border-[#2a2f33] bg-zinc-50 dark:bg-silver/5">
                <Link
                  href={PATH.dashboard.settings}
                  onClick={() => setNotifOpen(false)}
                  className="text-[9px] font-bold text-zinc-400 dark:text-silver/40 hover:text-dark dark:hover:text-silver uppercase tracking-widest transition-colors"
                >
                  Manage notification preferences →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ── Profile dropdown ── */}
        <div className="relative" ref={dropdownRef}>

          {/* Trigger */}
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className={`flex items-center gap-2.5 pl-3 pr-2 py-1.5 border transition-all duration-200 ${
              profileOpen
                ? 'border-dark bg-dark'
                : 'border-silver dark:border-[#2a2f33] hover:border-blush'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
              profileOpen ? 'bg-gold text-dark' : 'bg-dark text-gold'
            }`}>
              {initials}
            </div>
            <span className={`text-sm font-semibold transition-colors ${profileOpen ? 'text-white' : 'text-dark dark:text-background'}`}>
              {firstName}
            </span>
            <ChevronDownIcon
              size={12}
              className={`transition-transform duration-200 ${profileOpen ? 'rotate-180 text-gold' : 'text-dark'}`}
            />
          </button>

          {/* Dropdown panel */}
          {profileOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-white dark:bg-[#1a1f23] border border-silver dark:border-[#2a2f33] shadow-xl shadow-dark/12 z-50 animate-fade-in-up">

              {/* User info */}
              <div className="px-4 py-4 bg-dark border-b border-gold/20">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-sm font-black text-dark shrink-0">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user?.name ?? 'Guest'}</p>
                    <p className="text-[11px] text-silver/50 truncate">{user?.email ?? ''}</p>
                  </div>
                  <span className="ml-auto shrink-0 text-[9px] font-bold text-gold border border-gold/40 px-1.5 py-0.5 uppercase tracking-widest">
                    {planLabel}
                  </span>
                </div>

                {weddingCountdown && (
                  <div className="mt-3 flex items-center justify-between text-[10px]">
                    <span className="text-silver/40 uppercase tracking-widest">Wedding in</span>
                    <span className="font-bold text-gold">
                      {weddingCountdown.days > 0
                        ? `${weddingCountdown.days} days — ${weddingCountdown.date}`
                        : weddingCountdown.date}
                    </span>
                  </div>
                )}
              </div>

              {/* Nav links */}
              <div className="py-1.5">
                <p className="px-4 pt-1 pb-1.5 text-[9px] font-bold text-zinc-300 uppercase tracking-[0.3em]">Navigate</p>
                {HEADER_MENU_ITEMS.map(({ icon, label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 dark:text-silver/75 hover:bg-silver/30 dark:hover:bg-silver/8 hover:text-dark dark:hover:text-white transition-colors"
                  >
                    <span className="text-blush w-4 text-center text-xs">{icon}</span>
                    {label}
                  </Link>
                ))}
              </div>

              <div className="mx-4 h-px bg-silver dark:bg-[#2a2f33]" />

              {/* Account links */}
              <div className="py-1.5">
                <p className="px-4 pt-1 pb-1.5 text-[9px] font-bold text-zinc-300 uppercase tracking-[0.3em]">Account</p>
                <Link
                  href={PATH.dashboard.settings}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 dark:text-silver/75 hover:bg-silver/30 dark:hover:bg-silver/8 hover:text-dark dark:hover:text-white transition-colors"
                >
                  <span className="text-blush w-4 text-center text-xs">◎</span>
                  Settings
                </Link>
                <Link
                  href={PATH.dashboard.help}
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-zinc-600 dark:text-silver/75 hover:bg-silver/30 dark:hover:bg-silver/8 hover:text-dark dark:hover:text-white transition-colors"
                >
                  <span className="text-blush w-4 text-center text-xs">?</span>
                  Help &amp; Support
                </Link>
              </div>

              <div className="mx-4 h-px bg-silver dark:bg-[#2a2f33]" />

              {/* Upgrade + Sign out */}
              <div className="p-3 space-y-2">
                <button className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold bg-gold/10 border border-gold/30 text-dark hover:bg-gold/20 transition-colors">
                  <span>Upgrade to Premium</span>
                  <span className="text-gold">✦</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold border border-blush/30 text-blush hover:bg-blush/10 transition-colors"
                >
                  <LogoutIcon size={13} />
                  Sign Out
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
