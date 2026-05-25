import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** light = white text (for use on dark/gradient bg) */
  theme?: 'dark' | 'light';
  href?: string;
}

export function Logo({ size = 'md', theme = 'dark', href = '/' }: LogoProps) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  const textClass =
    size === 'sm'
      ? 'text-lg'
      : size === 'lg'
      ? 'text-3xl'
      : 'text-xl';

  const nameColor = theme === 'light' ? 'text-white' : 'text-dark';

  return (
    <Link href={href} className="inline-flex items-center gap-2.5 group select-none">
      {/* Mandala-style SVG icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-500 group-hover:rotate-45"
      >
        {/* Outer petals — charcoal */}
        <ellipse cx="20" cy="7"  rx="3" ry="7" fill="#23292E" transform="rotate(0   20 20)" />
        <ellipse cx="20" cy="7"  rx="3" ry="7" fill="#23292E" transform="rotate(90  20 20)" />
        <ellipse cx="20" cy="7"  rx="3" ry="7" fill="#23292E" transform="rotate(180 20 20)" />
        <ellipse cx="20" cy="7"  rx="3" ry="7" fill="#23292E" transform="rotate(270 20 20)" />
        {/* Diagonal petals — blush */}
        <ellipse cx="20" cy="7"  rx="2.2" ry="6" fill="#DFB3AE" transform="rotate(45  20 20)" />
        <ellipse cx="20" cy="7"  rx="2.2" ry="6" fill="#DFB3AE" transform="rotate(135 20 20)" />
        <ellipse cx="20" cy="7"  rx="2.2" ry="6" fill="#DFB3AE" transform="rotate(225 20 20)" />
        <ellipse cx="20" cy="7"  rx="2.2" ry="6" fill="#DFB3AE" transform="rotate(315 20 20)" />
        {/* Gold center ring */}
        <circle cx="20" cy="20" r="6"   fill="#E4BC62" />
        {/* White inner dot */}
        <circle cx="20" cy="20" r="3"   fill="#ffffff" />
        {/* Charcoal center dot */}
        <circle cx="20" cy="20" r="1.5" fill="#23292E" />
      </svg>

      {/* Wordmark */}
      <span className={`font-bold tracking-tight leading-none ${textClass} ${nameColor}`}>
        <span className="italic">Forever</span>
        <span className="text-gold"> Found</span>
      </span>
    </Link>
  );
}
