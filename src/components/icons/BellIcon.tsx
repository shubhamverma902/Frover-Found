import type { IconProps } from './types';

/** Notification bell icon */
export function BellIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" {...props}>
      <path
        d="M9 1.5A5.25 5.25 0 003.75 6.75c0 2.625-.75 4.5-1.5 5.25h13.5c-.75-.75-1.5-2.625-1.5-5.25A5.25 5.25 0 009 1.5z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"
      />
      <path
        d="M7.5 12v.75a1.5 1.5 0 003 0V12"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"
      />
    </svg>
  );
}
