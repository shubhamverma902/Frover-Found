import type { IconProps } from './types';

/** Sign-out / logout door-with-arrow icon */
export function LogoutIcon({ size = 13, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" {...props}>
      <path
        d="M5 2H2.5A1.5 1.5 0 001 3.5v6A1.5 1.5 0 002.5 11H5M9 9l3-3-3-3M12 6.5H5"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
