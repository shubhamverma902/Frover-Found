import type { IconProps } from './types';

/** Arrow pointing left — back / return navigation */
export function ArrowLeftIcon({ size = 12, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" {...props}>
      <path
        d="M5 2L1 6l4 4M1 6h10"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
