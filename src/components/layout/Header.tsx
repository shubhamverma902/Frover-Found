'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from './Logo';
import { PATH } from '@/constants/path';
import { ThemeToggle } from '@/components/ui';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectHydrated } from '@/store/slices/authSlice';

const NAV_LINKS = [
  { href: '#services',     label: 'Services' },
  { href: '#gallery',      label: 'Gallery' },
  { href: '#testimonials', label: 'Love Stories' },
  { href: '#contact',      label: 'Contact' },
];

export function Header() {
  const [menuOpen,        setMenuOpen]        = useState(false);
  const [scrolled,        setScrolled]        = useState(false);
  const [announcementOn,  setAnnouncementOn]  = useState(true);

  const hydrated        = useAppSelector(selectHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const showAuthButtons = hydrated; // only render auth buttons after hydration (avoids flash)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const linkClass = scrolled
    ? 'text-zinc-500 hover:text-dark'
    : 'text-white/80 hover:text-white';

  const barClass = scrolled
    ? 'bg-white/95 backdrop-blur-md border-b border-silver shadow-sm shadow-dark/5'
    : 'bg-transparent';

  return (
    <header className="fixed top-0 left-0 right-0 z-50">

      {/* ── Announcement strip — hide when logged in ── */}
      {!isAuthenticated && (
        <div className={`overflow-hidden transition-all duration-300 ${announcementOn ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-gold text-dark text-xs font-medium py-2 px-6 flex items-center justify-center relative">
            <p>
              ✦ Now serving 50+ cities across India &nbsp;—&nbsp;
              <Link href={PATH.auth.signup} className="font-bold underline underline-offset-2 hover:no-underline">
                Start planning free →
              </Link>
            </p>
            <button
              onClick={() => setAnnouncementOn(false)}
              className="absolute right-4 text-dark/50 hover:text-dark text-lg leading-none transition-colors"
              aria-label="Dismiss announcement"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* ── Main nav ── */}
      <div className={`transition-all duration-300 ${barClass}`}>
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <Logo size="md" theme={scrolled ? 'dark' : 'light'} />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`relative group ${linkClass} transition-colors duration-200`}
              >
                {label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold group-hover:w-full transition-[width] duration-300 ease-out" />
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle className={scrolled ? '' : 'border-white/25 text-white/70 hover:text-white hover:border-white/50'} />

            {showAuthButtons && (
              isAuthenticated ? (
                /* Logged-in state — single Dashboard button */
                <Link
                  href={PATH.dashboard.base}
                  className={`text-sm font-semibold px-5 py-2.5 rounded-full active:scale-95 transition-all duration-300 ${
                    scrolled
                      ? 'bg-dark text-white hover:bg-dark/85 shadow-md shadow-dark/20'
                      : 'bg-gold text-dark hover:bg-gold/90 shadow-md shadow-black/20'
                  }`}
                >
                  Dashboard →
                </Link>
              ) : (
                /* Guest state — Login + Start Planning */
                <>
                  <Link
                    href={PATH.auth.login}
                    className={`text-sm font-medium transition-colors duration-200 ${linkClass}`}
                  >
                    Login
                  </Link>
                  <Link
                    href={PATH.auth.signup}
                    className={`text-sm font-semibold px-5 py-2.5 rounded-full active:scale-95 transition-all duration-300 ${
                      scrolled
                        ? 'bg-dark text-white hover:bg-dark/85 shadow-md shadow-dark/20'
                        : 'bg-gold text-dark hover:bg-gold/90 shadow-md shadow-black/20'
                    }`}
                  >
                    Start Planning ✦
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 flex flex-col gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {(['', '', ''] as const).map((_, i) => (
              <span
                key={i}
                className={`block w-6 h-0.5 transition-all duration-300 origin-center
                  ${scrolled ? 'bg-dark' : 'bg-white'}
                  ${i === 0 && menuOpen ? 'rotate-45 translate-y-2' : ''}
                  ${i === 1 && menuOpen ? 'opacity-0 scale-x-0' : ''}
                  ${i === 2 && menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
              />
            ))}
          </button>
        </nav>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`border-t px-6 py-5 flex flex-col gap-4 text-sm font-medium ${
            scrolled
              ? 'border-silver bg-white'
              : 'border-white/15 bg-dark/95 backdrop-blur-md'
          }`}>
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={scrolled ? 'text-zinc-500 hover:text-dark' : 'text-white/75 hover:text-white'}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </a>
            ))}

            {showAuthButtons && (
              <div className={`flex flex-col gap-2 pt-3 border-t ${scrolled ? 'border-silver' : 'border-white/15'}`}>
                {isAuthenticated ? (
                  <Link
                    href={PATH.dashboard.base}
                    className="text-center py-2.5 bg-gold text-dark font-semibold hover:bg-gold/90 transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Go to Dashboard →
                  </Link>
                ) : (
                  <>
                    <Link
                      href={PATH.auth.login}
                      className={`text-center py-2.5 border font-medium transition-colors ${
                        scrolled
                          ? 'border-silver text-dark hover:border-blush hover:bg-silver/30'
                          : 'border-white/25 text-white hover:border-white/50 hover:bg-white/10'
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href={PATH.auth.signup}
                      className="text-center py-2.5 bg-gold text-dark font-semibold hover:bg-gold/90 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Start Planning ✦
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
}
