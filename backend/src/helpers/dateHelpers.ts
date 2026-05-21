export const fmtRelative = (date: Date): string => {
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 7)  return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

/** YYYY-MM-DD */
export const fmtDateISO = (d: Date): string => d.toISOString().slice(0, 10);

/** "1 January 2025" — long locale, used on the dashboard */
export const fmtDateLong = (d: Date): string =>
  d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

/** "Jan 1, 2025" — short locale, used for expense dates in budget */
export const fmtDateShort = (d: Date): string =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
