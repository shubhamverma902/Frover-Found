import type { IconProps } from './types';

/**
 * Checkmark icon. Uses currentColor — set color via className or style.
 *
 * @example
 * // Checkbox (dark fill on gold bg)
 * <CheckIcon size={11} className="text-[#23292E]" strokeWidth={2.2} />
 *
 * // Selection confirmation (gold)
 * <CheckIcon size={10} className="text-[#E4BC62]" strokeWidth={1.8} />
 */
export function CheckIcon({ size = 11, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 11 9" fill="none" {...props}>
      <path
        d="M1 4.5l3 3L10 1"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}
