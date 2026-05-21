import type { IconProps } from './types';

interface StarIconProps extends IconProps {
  /** Whether the star is filled (active) or outlined (inactive) */
  filled?: boolean;
}

/** Star rating icon. Use `filled` prop to toggle filled vs outlined state. */
export function StarIcon({ size = 11, filled = false, ...props }: StarIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1"
      {...props}
    >
      <path d="M6 1l1.4 2.8 3.1.45-2.25 2.2.53 3.1L6 8.1 3.22 9.55l.53-3.1L1.5 4.25l3.1-.45z" />
    </svg>
  );
}
