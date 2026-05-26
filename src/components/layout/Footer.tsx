import Link from 'next/link';
import { Logo } from './Logo';
import { PATH } from '@/constants/path';

export function Footer() {
  return (
    <footer className="bg-dark text-white/70">

      {/* Top ornament */}
      <div className="max-w-7xl mx-auto px-6 pt-14 flex items-center gap-4">
        <div className="flex-1 h-px bg-silver/10" />
        <span className="text-gold/40 text-[10px] tracking-[0.45em]">◆ ◆ ◆</span>
        <div className="flex-1 h-px bg-silver/10" />
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo size="md" theme="light" />
          <p className="mt-4 text-sm text-white/60 leading-relaxed">
            India&apos;s most trusted wedding &amp; event planners. We turn love stories into unforgettable celebrations.
          </p>
          <p className="mt-5 text-xs text-blush/60 tracking-wide">
            Est. 2011 &nbsp;·&nbsp; 500+ Weddings &nbsp;·&nbsp; 50+ Cities
          </p>
        </div>

        {/* Explore */}
        <div>
          <h4 className="text-[10px] font-semibold text-gold uppercase tracking-[0.3em] mb-5">Explore</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><a href="#services"     className="hover:text-gold transition-colors duration-200 text-white/60">Services</a></li>
            <li><a href="#gallery"      className="hover:text-gold transition-colors duration-200 text-white/60">Gallery</a></li>
            <li><a href="#testimonials" className="hover:text-gold transition-colors duration-200 text-white/60">Love Stories</a></li>
            <li><a href="#contact"      className="hover:text-gold transition-colors duration-200 text-white/60">Get in Touch</a></li>
          </ul>
        </div>

        {/* Account */}
        <div>
          <h4 className="text-[10px] font-semibold text-gold uppercase tracking-[0.3em] mb-5">Account</h4>
          <ul className="space-y-3 text-sm text-white/60">
            <li><Link href={PATH.auth.login}  className="hover:text-gold transition-colors duration-200 text-white/60">Sign In</Link></li>
            <li><Link href={PATH.auth.signup} className="hover:text-gold transition-colors duration-200 text-white/60">Create Account</Link></li>
            <li><a href="#" className="hover:text-gold transition-colors duration-200 text-white/60">Dashboard</a></li>
            <li><a href="#" className="hover:text-gold transition-colors duration-200 text-white/60">Planning Tools</a></li>
          </ul>
        </div>

        {/* Reach us */}
        <div>
          <h4 className="text-[10px] font-semibold text-gold uppercase tracking-[0.3em] mb-5">Reach Us</h4>
          <ul className="space-y-4 text-sm text-white/60">
            <li className="flex items-start gap-2.5">
              <span className="text-blush shrink-0 mt-0.5">✉</span>
              <span>hello@foreverfound.in</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blush shrink-0 mt-0.5">◎</span>
              <span>Mumbai · Delhi · Jaipur<br />Bengaluru · Chennai</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-blush shrink-0 mt-0.5">◷</span>
              <span>Mon – Sat, 9 am – 7 pm IST</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom divider */}
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-4">
        <div className="flex-1 h-px bg-silver/10" />
        <span className="text-gold/30 text-[10px]">◆</span>
        <div className="flex-1 h-px bg-silver/10" />
      </div>

      {/* Bottom bar */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
        <p>© 2026 Forever Found. All rights reserved.</p>
        <p>Made with ♥ for couples across India</p>
        <div className="flex gap-5">
          <a href="#" className="hover:text-gold transition-colors duration-200 text-white/60">Privacy Policy</a>
          <a href="#" className="hover:text-gold transition-colors duration-200 text-white/60">Terms of Service</a>
        </div>
      </div>

    </footer>
  );
}
