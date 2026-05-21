'use client';

interface GradientStop {
  offset: string;
  color:  string;
}

interface ProgressRingProps {
  /** Progress value 0–100 */
  pct:          number;
  /** Outer diameter in px (also the SVG viewBox size) */
  viewSize?:    number;
  /** Circle radius */
  radius?:      number;
  /** Stroke width */
  strokeWidth?: number;
  /** Track (background) circle color */
  trackColor?:  string;
  /** Solid progress color — used when no gradient is provided */
  color?:       string;
  /** Gradient stops for the progress stroke. Needs a unique `gradientId`. */
  gradientStops?: GradientStop[];
  /** Unique id for the linearGradient element — required when using gradientStops */
  gradientId?:  string;
  /** Transition duration (CSS value, e.g. "1.2s") */
  duration?:    string;
  /** Extra className on the wrapping svg */
  className?:   string;
}

/**
 * Reusable circular progress ring.
 *
 * @example
 * // Solid gold ring
 * <ProgressRing pct={75} viewSize={32} radius={12} strokeWidth={3} color="#E4BC62" />
 *
 * // Gradient ring
 * <ProgressRing
 *   pct={60} viewSize={64} radius={26} strokeWidth={5}
 *   gradientId="checklistGrad"
 *   gradientStops={[
 *     { offset: '0%',   color: '#E4BC62' },
 *     { offset: '100%', color: '#DFB3AE' },
 *   ]}
 * />
 */
export function ProgressRing({
  pct,
  viewSize    = 64,
  radius      = 26,
  strokeWidth = 5,
  trackColor  = 'rgba(221,222,217,0.08)',
  color       = '#E4BC62',
  gradientStops,
  gradientId,
  duration    = '1.2s',
  className   = '',
}: ProgressRingProps) {
  const circumference = 2 * Math.PI * radius;
  const dashoffset    = circumference * (1 - Math.min(pct, 100) / 100);
  const cx = viewSize / 2;
  const strokeColor = gradientStops && gradientId ? `url(#${gradientId})` : color;

  return (
    <svg
      className={`w-full h-full -rotate-90 ${className}`}
      viewBox={`0 0 ${viewSize} ${viewSize}`}
    >
      {/* Track */}
      <circle
        cx={cx} cy={cx} r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={cx} cy={cx} r={radius}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        style={{ transition: `stroke-dashoffset ${duration} cubic-bezier(0.22,1,0.36,1)` }}
      />
      {/* Gradient definition */}
      {gradientStops && gradientId && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map(stop => (
              <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>
      )}
    </svg>
  );
}
