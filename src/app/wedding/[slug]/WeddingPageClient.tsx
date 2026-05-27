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

const T = {
  bg:     '#FFF8F0',
  fg:     '#2A1F52',
  mid:    '#5E548E',
  gold:   '#CDB4DB',
  blush:  '#D8A7B1',
  silver: '#9F86A0',
} as const;

const SPARKLES = [
  { top: '8%',  left: '5%',   delay: '0s',    dur: '7s'   },
  { top: '14%', left: '91%',  delay: '1.8s',  dur: '6.5s' },
  { top: '34%', left: '2%',   delay: '3.3s',  dur: '5.5s' },
  { top: '54%', left: '97%',  delay: '0.6s',  dur: '8s'   },
  { top: '72%', left: '6%',   delay: '2.2s',  dur: '6s'   },
  { top: '87%', left: '89%',  delay: '4.2s',  dur: '7.5s' },
  { top: '22%', left: '46%',  delay: '1.1s',  dur: '9s'   },
  { top: '63%', left: '53%',  delay: '5.3s',  dur: '6s'   },
  { top: '44%', left: '95%',  delay: '2.8s',  dur: '7s'   },
  { top: '80%', left: '38%',  delay: '3.9s',  dur: '5s'   },
  { top: '11%', left: '28%',  delay: '0.5s',  dur: '8.5s' },
  { top: '91%', left: '19%',  delay: '2.1s',  dur: '6.2s' },
];

// ── Countdown ────────────────────────────────────────────────────────────────
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
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(calcTimeLeft(targetDate)), 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  const isPast = Object.values(time).every(v => v === 0);
  if (isPast) {
    return (
      <p style={{ fontSize: 10, letterSpacing: '0.5em', color: T.mid, textTransform: 'uppercase' }}>
        Today is the day ✦
      </p>
    );
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const units = [
    { v: time.days,    l: 'Days' },
    { v: time.hours,   l: 'Hrs'  },
    { v: time.minutes, l: 'Min'  },
    { v: time.seconds, l: 'Sec'  },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
      {units.map(({ v, l }) => (
        <div key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 68, height: 68 }}>
            <div style={{ position: 'absolute', inset: 0, border: `1px solid ${T.gold}`, background: 'rgba(205,180,219,0.06)', borderRadius: 3 }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderRadius: '3px 3px 0 0', background: `linear-gradient(to right, transparent, ${T.blush}, transparent)`, opacity: 0.45 }} />
            <span
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 300, color: T.fg, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
              suppressHydrationWarning
            >
              {pad(v)}
            </span>
          </div>
          <span style={{ fontSize: 7, letterSpacing: '0.4em', color: T.silver, textTransform: 'uppercase' }}>{l}</span>
        </div>
      ))}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
interface Props { data: WeddingData; formattedDate: string | null }

export function WeddingPageClient({ data, formattedDate }: Props) {
  // visible starts false — opacity:0 on all items (cream bg hides the gap).
  // setTimeout(100) gives the browser one full paint cycle to commit the
  // initial hidden state before we start the opacity transition.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Pure opacity fade — no translateY, so elements never visually overlap
  // with siblings during the cascade. Layout stays completely stable.
  const fade = (delay: number, dur = 0.85): CSSProperties => ({
    opacity:    visible ? 1 : 0,
    transition: `opacity ${dur}s ease ${delay}s`,
  });

  const details = [
    formattedDate && { label: 'Date',     value: formattedDate },
    data.venue    && { label: 'Venue',    value: data.venue    },
    data.city     && { label: 'Location', value: data.city     },
  ].filter(Boolean) as { label: string; value: string }[];

  const labelStyle: CSSProperties = {
    fontSize: 7, letterSpacing: '0.5em',
    color: T.silver, textTransform: 'uppercase',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: T.bg }}>

      {/* ── Atmospheric glows ─────────────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} aria-hidden>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(205,180,219,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '-6rem', right: '-6rem', width: 440, height: 440, borderRadius: '50%', background: 'radial-gradient(circle, rgba(216,167,177,0.18) 0%, transparent 65%)' }} />
        <div style={{ position: 'absolute', bottom: '-6rem', left: '-6rem', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(159,134,160,0.12) 0%, transparent 65%)' }} />
      </div>

      {/* ── Sparkles — CSS loop, always visible ──────────────────────────── */}
      {SPARKLES.map((s, i) => (
        <span key={i} aria-hidden style={{
          position: 'fixed', top: s.top, left: s.left, zIndex: 1,
          fontSize: 9, color: T.blush, opacity: 0.4,
          pointerEvents: 'none', userSelect: 'none',
          animationName: 'sparkleRise',
          animationDuration: s.dur,
          animationDelay: s.delay,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }}>✦</span>
      ))}

      {/* ── Corner ornaments ──────────────────────────────────────────────── */}
      <div aria-hidden style={{ position: 'fixed', top: 24, left: 24, width: 44, height: 44, borderTop: `1px solid ${T.gold}`, borderLeft: `1px solid ${T.gold}`, opacity: 0.5, pointerEvents: 'none', zIndex: 1 }} />
      <div aria-hidden style={{ position: 'fixed', top: 24, right: 24, width: 44, height: 44, borderTop: `1px solid ${T.gold}`, borderRight: `1px solid ${T.gold}`, opacity: 0.5, pointerEvents: 'none', zIndex: 1 }} />
      <div aria-hidden style={{ position: 'fixed', bottom: 24, left: 24, width: 44, height: 44, borderBottom: `1px solid ${T.gold}`, borderLeft: `1px solid ${T.gold}`, opacity: 0.5, pointerEvents: 'none', zIndex: 1 }} />
      <div aria-hidden style={{ position: 'fixed', bottom: 24, right: 24, width: 44, height: 44, borderBottom: `1px solid ${T.gold}`, borderRight: `1px solid ${T.gold}`, opacity: 0.5, pointerEvents: 'none', zIndex: 1 }} />

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '7rem 2rem', textAlign: 'center' }}>
        <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', ...fade(0.1) }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${T.gold})` }} />
            <p style={{ ...labelStyle, letterSpacing: '0.6em', whiteSpace: 'nowrap', flexShrink: 0 }}>
              You are cordially invited
            </p>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${T.gold})` }} />
          </div>

          {/* Partner 1 */}
          <h1 style={{ marginTop: 44, fontSize: 'clamp(48px,12vw,84px)', fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1, color: T.fg, ...fade(0.3) }}>
            {data.partner1}
          </h1>

          {/* Ampersand */}
          <div style={{ margin: '32px 0', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, ...fade(0.48) }}>
            <div style={{
              position: 'absolute', width: 84, height: 84, borderRadius: '50%',
              border: `1px solid ${T.gold}`, opacity: 0.55,
              animationName: 'breathe', animationDuration: '5s',
              animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
            }} />
            <div style={{ position: 'absolute', width: 60, height: 60, borderRadius: '50%', border: `1px solid ${T.blush}`, opacity: 0.3 }} />
            <span style={{
              position: 'relative', zIndex: 1, fontSize: 44, fontWeight: 700, color: T.mid,
              animationName: 'goldGlow', animationDuration: '4s',
              animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite',
            }}>&amp;</span>
          </div>

          {/* Partner 2 */}
          <h1 style={{ fontSize: 'clamp(48px,12vw,84px)', fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1, color: T.fg, ...fade(0.64) }}>
            {data.partner2}
          </h1>

          {/* Divider */}
          <div style={{ margin: '44px 0', width: '100%', display: 'flex', alignItems: 'center', gap: 14, ...fade(0.8) }}>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${T.blush})`, opacity: 0.45 }} />
            <span style={{ color: T.blush, fontSize: 10, flexShrink: 0, opacity: 0.65 }}>✦</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${T.blush})`, opacity: 0.45 }} />
          </div>

          {/* Details */}
          {details.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'stretch', justifyContent: 'center', width: '100%', ...fade(0.95) }}>
              {details.map(({ label, value }, i) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 1, padding: '0 20px', ...(i > 0 ? { borderLeft: `1px solid ${T.gold}` } : {}) }}>
                  <span style={labelStyle}>{label}</span>
                  <span style={{ fontSize: 13, color: T.fg, fontWeight: 400, lineHeight: 1.5, opacity: 0.75 }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Countdown */}
          {data.weddingDate && (
            <div style={fade(1.1)}>
              <p style={{ marginTop: 48, marginBottom: 24, ...labelStyle }}>Counting down</p>
              <Countdown targetDate={data.weddingDate} />
            </div>
          )}

          {/* Style badge */}
          {data.style && (
            <div style={{ marginTop: 48, ...fade(1.25) }}>
              <span style={{ padding: '8px 28px', border: `1px solid ${T.gold}`, fontSize: 8, letterSpacing: '0.5em', color: T.mid, textTransform: 'uppercase', borderRadius: 2 }}>
                {data.style}
              </span>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, ...fade(1.38) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: 160 }}>
              <div style={{ flex: 1, height: 1, background: T.blush, opacity: 0.25 }} />
              <span style={{ color: T.blush, fontSize: 8, opacity: 0.55 }}>✦</span>
              <div style={{ flex: 1, height: 1, background: T.blush, opacity: 0.25 }} />
            </div>
            <p style={{ marginTop: 4, ...labelStyle, opacity: 0.55 }}>Planned with</p>
            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.45em', color: T.mid, textTransform: 'uppercase', opacity: 0.65 }}>Forever Found</p>
          </div>

        </div>
      </div>
    </div>
  );
}
