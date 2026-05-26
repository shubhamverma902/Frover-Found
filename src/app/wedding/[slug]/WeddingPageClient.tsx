'use client';

import { useState, useEffect, CSSProperties } from 'react';

export interface WeddingData {
  partner1:    string;
  partner2:    string;
  weddingDate: string;
  venue:       string;
  city:        string;
  guestCount:  number;
  style:       string;
}

// Fixed positions so there's no hydration mismatch
const SPARKLES: Array<{ top: string; left: string; delay: string; dur: string }> = [
  { top: '7%',  left: '5%',   delay: '0s',    dur: '7s'   },
  { top: '11%', left: '91%',  delay: '1.8s',  dur: '6.5s' },
  { top: '32%', left: '2%',   delay: '3.3s',  dur: '5.5s' },
  { top: '52%', left: '96%',  delay: '0.6s',  dur: '8s'   },
  { top: '71%', left: '6%',   delay: '2.2s',  dur: '6s'   },
  { top: '87%', left: '89%',  delay: '4.2s',  dur: '7.5s' },
  { top: '24%', left: '48%',  delay: '1.1s',  dur: '9s'   },
  { top: '63%', left: '53%',  delay: '5.3s',  dur: '6s'   },
  { top: '43%', left: '93%',  delay: '2.8s',  dur: '7s'   },
  { top: '81%', left: '38%',  delay: '3.9s',  dur: '5s'   },
];

function anim(name: string, dur: string, delay = '0s', extra = ''): CSSProperties {
  return { animation: `${name} ${dur} ease-out ${delay} both ${extra}` };
}

// ── Countdown ──────────────────────────────────────────────────────────────────
interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target + 'T00:00:00').getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  };
}

function Countdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(calcTimeLeft(targetDate));
    const id = setInterval(() => setTime(calcTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!time) return null;

  const isPast = Object.values(time).every(v => v === 0);
  if (isPast) {
    return (
      <p className="text-sm tracking-widest uppercase text-gold/70">
        Today is the day ✦
      </p>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const units = [
    { v: time.days,    l: 'Days'  },
    { v: time.hours,   l: 'Hours' },
    { v: time.minutes, l: 'Mins'  },
    { v: time.seconds, l: 'Secs'  },
  ];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5">
      {units.map(({ v, l }, i) => (
        <div
          key={l}
          className="flex flex-col items-center gap-2"
          style={anim('weddingFadeUp', '0.6s', `${0.9 + i * 0.08}s`)}
        >
          <div className="w-14 h-14 sm:w-[72px] sm:h-[72px] flex items-center justify-center border border-gold/20 bg-[rgba(205,180,219,0.04)] backdrop-blur-sm">
            <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">
              {pad(v)}
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-gold/50">
            {l}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Main client component ──────────────────────────────────────────────────────
interface Props {
  data:          WeddingData;
  formattedDate: string | null;
}

export function WeddingPageClient({ data, formattedDate }: Props) {
  const details = [
    formattedDate && { label: 'Date',     value: formattedDate },
    data.venue    && { label: 'Venue',    value: data.venue    },
    data.city     && { label: 'Location', value: data.city     },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0c0e] flex flex-col items-center justify-center px-6 py-20">

      {/* Central ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 60% at 50% 50%, rgba(205,180,219,0.07) 0%, transparent 65%)',
        }}
        aria-hidden
      />

      {/* Floating sparkle particles */}
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className="absolute text-gold text-xs pointer-events-none select-none"
          style={{
            top:       s.top,
            left:      s.left,
            animation: `sparkleRise ${s.dur} ease-in-out ${s.delay} infinite`,
          }}
          aria-hidden
        >
          ✦
        </span>
      ))}

      {/* Corner ornaments */}
      {(['top-6 left-6 border-t border-l', 'top-6 right-6 border-t border-r',
         'bottom-6 left-6 border-b border-l', 'bottom-6 right-6 border-b border-r'] as const).map((cls, i) => (
        <div key={i} className={`absolute w-10 h-10 sm:w-14 sm:h-14 border-gold/15 pointer-events-none ${cls}`} aria-hidden />
      ))}

      {/* ── Content ── */}
      <div className="relative z-10 w-full max-w-xl text-center">

        {/* Eyebrow */}
        <p
          className="text-[10px] uppercase tracking-[0.45em] text-gold/60 mb-10"
          style={anim('weddingFadeUp', '0.7s', '0.1s')}
        >
          You are cordially invited
        </p>

        {/* Partner 1 */}
        <div style={anim('weddingFadeUp', '0.8s', '0.3s')}>
          <h1 className="text-5xl sm:text-[72px] font-bold tracking-tight text-white leading-none">
            {data.partner1}
          </h1>
        </div>

        {/* Ampersand ring */}
        <div
          className="my-5 sm:my-7 flex justify-center"
          style={anim('weddingFadeUp', '0.8s', '0.5s')}
        >
          <div className="relative flex items-center justify-center">
            {/* Outer ring */}
            <div className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-gold/20" />
            {/* Inner ring */}
            <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-gold/10" />
            {/* Symbol */}
            <span
              className="relative text-4xl sm:text-5xl font-bold text-gold z-10"
              style={{ animation: 'goldGlow 3s ease-in-out infinite' }}
            >
              &amp;
            </span>
          </div>
        </div>

        {/* Partner 2 */}
        <div style={anim('weddingFadeUp', '0.8s', '0.7s')}>
          <h1 className="text-5xl sm:text-[72px] font-bold tracking-tight text-white leading-none">
            {data.partner2}
          </h1>
        </div>

        {/* Expanding divider */}
        <div
          className="mt-10 mb-10 flex items-center gap-4"
          style={anim('weddingFadeUp', '0.6s', '0.9s')}
        >
          <div
            className="flex-1 h-px bg-gradient-to-r from-transparent to-gold/35 origin-right"
            style={anim('expandWidth', '1.1s', '1s')}
          />
          <span className="text-gold/60 text-sm shrink-0">✦</span>
          <div
            className="flex-1 h-px bg-gradient-to-l from-transparent to-gold/35 origin-left"
            style={anim('expandWidth', '1.1s', '1s')}
          />
        </div>

        {/* Detail cards */}
        {details.length > 0 && (
          <div
            className={`grid gap-3 mb-12 ${details.length === 3 ? 'grid-cols-3' : details.length === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-xs mx-auto'}`}
            style={anim('weddingFadeUp', '0.7s', '1s')}
          >
            {details.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 px-3 py-5 border border-gold/12 bg-[rgba(205,180,219,0.03)] backdrop-blur-sm"
              >
                <span className="text-[9px] uppercase tracking-[0.3em] text-gold/50">
                  {label}
                </span>
                <span className="text-xs sm:text-sm text-white/75 font-medium leading-snug text-center">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Countdown */}
        {data.weddingDate && (
          <div style={anim('weddingFadeUp', '0.7s', '1.15s')}>
            <p className="text-[9px] uppercase tracking-[0.35em] text-gold/40 mb-6">
              Counting down
            </p>
            <Countdown targetDate={data.weddingDate} />
          </div>
        )}

        {/* Style badge */}
        {data.style && (
          <div
            className="mt-8"
            style={anim('weddingFadeUp', '0.6s', '1.3s')}
          >
            <span className="inline-block px-5 py-1.5 border border-gold/20 text-gold/60 text-[10px] uppercase tracking-[0.35em]">
              {data.style}
            </span>
          </div>
        )}

        {/* Footer divider */}
        <div
          className="mt-14 flex items-center gap-4"
          style={anim('weddingFadeUp', '0.5s', '1.4s')}
        >
          <div className="flex-1 h-px bg-gold/10" />
          <span className="text-gold/30 text-xs">✦</span>
          <div className="flex-1 h-px bg-gold/10" />
        </div>

        {/* Branding */}
        <div
          className="mt-6 space-y-1"
          style={anim('weddingFadeUp', '0.5s', '1.5s')}
        >
          <p className="text-[9px] uppercase tracking-[0.45em] text-white/15">Planned with</p>
          <p className="text-[11px] font-bold tracking-[0.4em] uppercase text-white/25">Forever Found</p>
        </div>

      </div>
    </div>
  );
}
