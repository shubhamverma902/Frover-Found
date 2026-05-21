// ── Date / time format converters ────────────────────────────
// Stored display format:  'Dec 12, 2026'  /  '3:00 PM'
// HTML input format:      '2026-12-12'    /  '15:00'

/** 'Dec 12, 2026' → '2026-12-12' */
export function toInputDate(display: string): string {
  if (!display) return '';
  const d = new Date(display);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

/** '2026-12-12' → 'Dec 12, 2026' */
export function toDisplayDate(input: string): string {
  if (!input) return '';
  const d = new Date(input + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** '3:00 PM' → '15:00' */
export function toInputTime(display: string): string {
  if (!display) return '';
  const [time, meridiem] = display.split(' ');
  const [h, m] = time.split(':').map(Number);
  let hours = h;
  if (meridiem === 'PM' && h !== 12) hours += 12;
  if (meridiem === 'AM' && h === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** '15:00' → '3:00 PM' */
export function toDisplayTime(input: string): string {
  if (!input) return '';
  const [h, m] = input.split(':').map(Number);
  const meridiem = h >= 12 ? 'PM' : 'AM';
  const hours = h % 12 || 12;
  return `${hours}:${String(m).padStart(2, '0')} ${meridiem}`;
}
