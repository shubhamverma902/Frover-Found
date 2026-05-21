import type { IconProps } from './types';

/** Hamburger / sidebar-toggle menu icon */
export function MenuIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M3 5h14M3 10h14M3 15h14"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
      />
    </svg>
  );
}
