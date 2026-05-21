import type { IconProps } from './types';

/** Chevron pointing down — rotate-180 for up, rotate-90/-90 for left/right */
export function ChevronDownIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" {...props}>
      <path
        d="M3 5l4 4 4-4"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
