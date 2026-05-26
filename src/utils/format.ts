/** Format a rupee amount into shorthand notation: ₹1.15L / ₹5.5K / ₹500 */
export const fmt = (n: number): string => {
  if (n >= 100_000) return `₹${parseFloat((n / 100_000).toFixed(2))}L`;
  if (n >= 1_000)   return `₹${parseFloat((n / 1_000).toFixed(1))}K`;
  return `₹${n}`;
};
