import type { IconProps } from './types';

/** Trash / delete icon */
export function TrashIcon({ size = 12, ...props }: IconProps) {
  return (
    <svg width={size} height={Math.round(size * 13 / 12)} viewBox="0 0 12 13" fill="none" {...props}>
      <path
        d="M1 3h10M4 3V2h4v1M2 3l.7 8h6.6L10 3"
        stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
