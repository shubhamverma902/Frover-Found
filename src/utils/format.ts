/** Format a rupee amount into shorthand notation: ₹1.2L / ₹50K / ₹500 */
export const fmt = (n: number): string => {
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  if (n >= 1_000)   return `₹${(n / 1_000).toFixed(0)}K`;
  return `₹${n}`;
};
