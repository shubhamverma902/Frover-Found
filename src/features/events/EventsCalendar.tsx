'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { WeddingEvent } from '@/types/event';
import { STATUS_META } from '@/constants/events';
import { toDisplayTime } from '@/utils/dateTime';

const WEEKDAYS   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_FULL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTH_ABB  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const pad   = (n: number) => String(n).padStart(2, '0');
const ymd   = (d: Date)   => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const TODAY = ymd(new Date());

const fmtDate = (dateStr: string) => {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface Props {
  events: WeddingEvent[];
  onEdit: (event: WeddingEvent) => void;
  onAdd:  () => void;
}

export const EventsCalendar = ({ events, onEdit, onAdd }: Props) => {
  const topRef = useRef<HTMLDivElement>(null);

  const [viewDate, setViewDate] = useState(() => {
    const upcoming = [...events]
      .filter(e => e.date >= TODAY)
      .sort((a, b) => a.date.localeCompare(b.date));
    const anchor = upcoming[0] ?? events.at(-1);
    if (anchor) {
      const [y, m] = anchor.date.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const [selectedDay,  setSelectedDay]  = useState<string | null>(null);
  const [showPicker,   setShowPicker]   = useState(false);
  const [pickerYear,   setPickerYear]   = useState(viewDate.getFullYear());
  const [showAllEvts,  setShowAllEvts]  = useState(true);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  // ── Navigation helpers ───────────────────────────────────────
  const prevMonth  = useCallback(() => { setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)); setSelectedDay(null); }, []);
  const nextMonth  = useCallback(() => { setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)); setSelectedDay(null); }, []);
  const prevYear   = useCallback(() => { setViewDate(d => new Date(d.getFullYear() - 1, d.getMonth(), 1)); setSelectedDay(null); }, []);
  const nextYear   = useCallback(() => { setViewDate(d => new Date(d.getFullYear() + 1, d.getMonth(), 1)); setSelectedDay(null); }, []);
  const goToday    = useCallback(() => { const n = new Date(); setViewDate(new Date(n.getFullYear(), n.getMonth(), 1)); setSelectedDay(null); setShowPicker(false); }, []);

  // Keyboard ← → for month navigation, Escape closes picker
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prevMonth();
      if (e.key === 'ArrowRight') nextMonth();
      if (e.key === 'Escape')     setShowPicker(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prevMonth, nextMonth]);

  // Jump to a specific event's month and highlight its day
  const jumpToEvent = useCallback((ev: WeddingEvent) => {
    const [y, m] = ev.date.split('-').map(Number);
    setViewDate(new Date(y, m - 1, 1));
    setSelectedDay(ev.date);
    setShowPicker(false);
    setTimeout(() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }, []);

  // ── Derived data ─────────────────────────────────────────────
  const byDate = useMemo(() => {
    const map: Record<string, WeddingEvent[]> = {};
    events.forEach(e => { (map[e.date] ??= []).push(e); });
    return map;
  }, [events]);

  // Which "YYYY-MM" strings have events — used by the picker dots
  const eventMonths = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => set.add(e.date.slice(0, 7)));
    return set;
  }, [events]);

  const sortedEvents = useMemo(() =>
    [...events].sort((a, b) => a.date.localeCompare(b.date)),
  [events]);

  const upcomingEvts = sortedEvents.filter(e => e.date >= TODAY);
  const pastEvts     = sortedEvents.filter(e => e.date <  TODAY);

  // 42-cell grid
  const cells = useMemo(() => {
    const firstDow     = new Date(year, month, 1).getDay();
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const daysInPrevMo = new Date(year, month, 0).getDate();
    const result: { day: number; dateStr: string; current: boolean }[] = [];

    for (let i = firstDow - 1; i >= 0; i--) {
      const d  = daysInPrevMo - i;
      const mo = month === 0 ? 12 : month;
      const yr = month === 0 ? year - 1 : year;
      result.push({ day: d, dateStr: `${yr}-${pad(mo)}-${pad(d)}`, current: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, dateStr: `${year}-${pad(month + 1)}-${pad(d)}`, current: true });
    }
    for (let d = 1; result.length < 42; d++) {
      const mo = month === 11 ? 1 : month + 2;
      const yr = month === 11 ? year + 1 : year;
      result.push({ day: d, dateStr: `${yr}-${pad(mo)}-${pad(d)}`, current: false });
    }
    return result;
  }, [year, month]);

  const selectedEvents = selectedDay ? (byDate[selectedDay] ?? []) : [];
  const nowY = new Date().getFullYear();
  const nowM = new Date().getMonth();
  const isThisMonth = year === nowY && month === nowM;

  // ── Nav button shared classes ────────────────────────────────
  const navBtn = 'w-8 h-8 flex items-center justify-center border border-silver/20 dark:border-silver/15 text-silver dark:text-silver/60 hover:border-gold/40 hover:text-gold transition-colors text-sm font-bold leading-none';

  // ── Event chip colour helper ─────────────────────────────────
  const chipCls = (status: WeddingEvent['status']) =>
    status === 'confirmed' ? 'bg-gold/15 text-gold' :
    status === 'planning'  ? 'bg-blush/15 text-blush' :
                             'bg-silver/10 text-silver/55';

  return (
    <div ref={topRef} className="bg-card dark:bg-[#0F0C24] rounded-2xl border border-silver/20 dark:border-silver/10 p-4 sm:p-5 space-y-4">

      {/* ── Navigation bar ── */}
      <div className="flex items-center justify-between">
        {/* Left: year ← month heading → month year → */}
        <div className="flex items-center gap-1">
          <button onClick={prevYear}  aria-label="Previous year"  className={navBtn} title="Previous year (Shift+←)">«</button>
          <button onClick={prevMonth} aria-label="Previous month" className={navBtn} title="Previous month (←)">‹</button>
          <button
            onClick={() => { setPickerYear(year); setShowPicker(p => !p); }}
            className="mx-1 flex items-center gap-1.5 px-2 py-1 hover:bg-silver/10 dark:hover:bg-silver/5 transition-colors group"
            title="Jump to month"
          >
            <span className="text-sm font-bold text-dark dark:text-white group-hover:text-gold transition-colors">
              {MONTH_FULL[month]}
            </span>
            <span className="text-gold text-sm font-bold">{year}</span>
            <span className={`text-[10px] text-silver/30 transition-transform duration-200 ${showPicker ? 'rotate-180' : ''}`}>▾</span>
          </button>
          <button onClick={nextMonth} aria-label="Next month" className={navBtn} title="Next month (→)">›</button>
          <button onClick={nextYear}  aria-label="Next year"  className={navBtn} title="Next year (Shift+→)">»</button>
        </div>

        {/* Right: Today button + keyboard hint */}
        <div className="flex items-center gap-2">
          {!isThisMonth && (
            <button
              onClick={goToday}
              className="text-[10px] font-bold text-gold/60 hover:text-gold border border-gold/20 hover:border-gold/40 px-2 py-1 transition-colors"
            >
              Today
            </button>
          )}
          <span className="hidden sm:block text-[9px] text-silver/20 tracking-wider">← → keys</span>
        </div>
      </div>

      {/* ── Inline month picker ── */}
      {showPicker && (
        <div className="border border-gold/20 bg-subtle dark:bg-dark p-4 rounded-xl">
          {/* Picker year navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setPickerYear(y => y - 1)}
              className="w-7 h-7 flex items-center justify-center text-silver/50 hover:text-gold transition-colors text-sm"
            >‹</button>
            <span className="text-xs font-bold text-gold">{pickerYear}</span>
            <button
              onClick={() => setPickerYear(y => y + 1)}
              className="w-7 h-7 flex items-center justify-center text-silver/50 hover:text-gold transition-colors text-sm"
            >›</button>
          </div>
          {/* 4×3 month grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {MONTH_ABB.map((abbr, i) => {
              const key       = `${pickerYear}-${pad(i + 1)}`;
              const hasEvts   = eventMonths.has(key);
              const isCurrent = pickerYear === year && i === month;
              const evtCount  = events.filter(e => e.date.startsWith(key)).length;
              return (
                <button
                  key={abbr}
                  onClick={() => { setViewDate(new Date(pickerYear, i, 1)); setSelectedDay(null); setShowPicker(false); }}
                  className={[
                    'relative flex flex-col items-center justify-center py-2 px-1 text-[11px] font-bold transition-colors border',
                    isCurrent
                      ? 'bg-gold text-dark border-gold'
                      : hasEvts
                      ? 'border-gold/25 text-silver/80 hover:border-gold/50 hover:text-gold'
                      : 'border-silver/10 text-silver/30 hover:border-silver/25 hover:text-silver/60',
                  ].join(' ')}
                >
                  {abbr}
                  {hasEvts && !isCurrent && (
                    <span className="mt-0.5 flex gap-0.5">
                      {Array.from({ length: Math.min(evtCount, 3) }).map((_, j) => (
                        <span key={j} className="w-1 h-1 rounded-full bg-gold/60" />
                      ))}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="mt-0.5 text-[8px] font-semibold text-dark/70">now</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Weekday headers ── */}
      <div className="grid grid-cols-7 border border-b-0 border-silver/20 dark:border-silver/10 bg-subtle dark:bg-transparent">
        {WEEKDAYS.map(d => (
          <div key={d} className="py-2 text-center text-[9px] font-bold text-silver dark:text-silver/35 uppercase tracking-[0.3em]">
            {d}
          </div>
        ))}
      </div>

      {/* ── Calendar grid ── */}
      <div className="grid grid-cols-7 gap-px bg-silver/25 dark:bg-[#3D3268] border border-silver/20 dark:border-silver/10 !mt-0">
        {cells.map(cell => {
          const evs        = byDate[cell.dateStr] ?? [];
          const hasEvs     = evs.length > 0;
          const isToday    = cell.dateStr === TODAY;
          const isSelected = selectedDay === cell.dateStr;

          return (
            <div
              key={cell.dateStr}
              onClick={() => hasEvs ? setSelectedDay(isSelected ? null : cell.dateStr) : undefined}
              className={[
                'relative min-h-[72px] p-1.5 bg-white dark:bg-[#0F0C24] transition-colors duration-150',
                !cell.current ? 'opacity-25' : '',
                hasEvs        ? 'cursor-pointer hover:bg-silver/10 dark:hover:bg-dark' : '',
                isSelected    ? '!bg-silver/15 dark:!bg-dark ring-1 ring-inset ring-gold/25' : '',
              ].filter(Boolean).join(' ')}
            >
              <span className={[
                'flex items-center justify-center w-6 h-6 text-[11px] font-bold mb-1 select-none',
                isToday ? 'rounded-full bg-gold text-dark' : 'text-silver dark:text-silver/55',
              ].join(' ')}>
                {cell.day}
              </span>
              <div className="space-y-0.5">
                {evs.slice(0, 2).map(e => (
                  <div key={e._id ?? e.name} className={`px-1.5 py-[2px] text-[8px] font-semibold truncate leading-tight ${chipCls(e.status)}`}>
                    {e.name}
                  </div>
                ))}
                {evs.length > 2 && (
                  <p className="text-[8px] font-semibold text-gold/50 pl-1.5">+{evs.length - 2}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-0.5">
        {[
          { label: 'Confirmed', chip: 'bg-gold/15',  text: 'text-gold'    },
          { label: 'Planning',  chip: 'bg-blush/15',  text: 'text-blush'   },
          { label: 'Pending',   chip: 'bg-silver/10',  text: 'text-silver/55' },
        ].map(({ label, chip, text }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`inline-block w-7 h-1.5 ${chip}`} />
            <span className={`text-[9px] font-semibold uppercase tracking-widest ${text}`}>{label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gold flex items-center justify-center text-[8px] font-black text-dark">1</span>
          <span className="text-[9px] text-silver/40 uppercase tracking-widest">Today</span>
        </div>
      </div>

      {/* ── Selected-day panel ── */}
      {selectedDay && selectedEvents.length > 0 && (
        <div className="border border-gold/20 bg-subtle dark:bg-[#0F0C24] rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/15" />
            <p className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] whitespace-nowrap">
              {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </p>
            <button aria-label="Clear selected day" onClick={() => setSelectedDay(null)} className="text-silver/30 hover:text-silver transition-colors text-xs ml-1">✕</button>
          </div>
          {selectedEvents.map(e => {
            const meta = STATUS_META[e.status];
            return (
              <div key={e._id ?? e.name} className={`flex items-start gap-3 px-4 py-3 bg-white dark:bg-dark rounded-lg border-l-2 ${meta.stripe}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                    <p className="text-sm font-bold text-dark dark:text-white truncate">{e.name}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 border uppercase tracking-wide ml-auto shrink-0 ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1.5 text-[10px] text-silver dark:text-silver/45 pl-3.5">
                    {e.time  && <span>⏱ {toDisplayTime(e.time)}</span>}
                    {e.venue && <span>◎ {e.venue}</span>}
                    {e.guests > 0 && <span>✉ {e.guests} guests</span>}
                  </div>
                  {e.desc && <p className="text-[10px] text-silver/30 mt-1 pl-3.5 line-clamp-1">{e.desc}</p>}
                </div>
                <button
                  onClick={() => onEdit(e)}
                  className="shrink-0 self-center px-3 py-1.5 text-[10px] font-bold border border-blush/30 text-blush hover:bg-blush/10 transition-colors"
                >
                  Edit
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── All Events quick-jump list ── */}
      {events.length > 0 && (
        <div className="border-t border-silver/20 dark:border-silver/10 pt-4">
          <button
            onClick={() => setShowAllEvts(v => !v)}
            className="w-full flex items-center justify-between mb-3 group"
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gold/80 dark:text-gold/70 uppercase tracking-[0.35em]">All Events</span>
              <span className="text-[10px] text-silver dark:text-silver/30 border border-silver/30 dark:border-silver/15 px-1.5 py-0.5">{events.length}</span>
            </div>
            <span className={`text-silver dark:text-silver/30 text-xs transition-transform duration-200 ${showAllEvts ? 'rotate-180' : ''}`}>▾</span>
          </button>

          {showAllEvts && (
            <div className="space-y-4">

              {/* Upcoming */}
              {upcomingEvts.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-gold/70 dark:text-gold/40 uppercase tracking-[0.4em] mb-2">Upcoming</p>
                  <div className="space-y-1">
                    {upcomingEvts.map(e => {
                      const meta      = STATUS_META[e.status];
                      const isViewing = e.date.slice(0, 7) === `${year}-${pad(month + 1)}`;
                      return (
                        <div key={e._id ?? e.name} className="flex items-center gap-3 px-3 py-2 bg-subtle dark:bg-dark hover:bg-silver/15 dark:hover:bg-[#3D3268] rounded-lg transition-colors group/row">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-dark dark:text-white truncate">{e.name}</p>
                            <p className="text-[9px] text-silver dark:text-silver/35 mt-0.5">{fmtDate(e.date)}{e.venue ? ` · ${e.venue}` : ''}</p>
                          </div>
                          <span className={`hidden sm:block text-[9px] font-bold px-2 py-0.5 border uppercase tracking-wide shrink-0 ${meta.badge}`}>
                            {meta.label}
                          </span>
                          <button
                            onClick={() => jumpToEvent(e)}
                            className={[
                              'shrink-0 px-2 py-1 text-[9px] font-bold border transition-colors',
                              isViewing
                                ? 'border-silver/40 dark:border-gold/30 text-silver dark:text-gold/50 cursor-default'
                                : 'border-blush/40 dark:border-gold/20 text-blush dark:text-gold/60 hover:border-blush hover:text-blush dark:hover:border-gold/50 dark:hover:text-gold hover:bg-blush/5 dark:hover:bg-gold/5',
                            ].join(' ')}
                            disabled={isViewing}
                            title={isViewing ? 'Already on this month' : 'Jump to this month'}
                          >
                            {isViewing ? 'Here' : 'Go →'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Past */}
              {pastEvts.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-silver dark:text-silver/25 uppercase tracking-[0.4em] mb-2">Past</p>
                  <div className="space-y-1">
                    {pastEvts.map(e => {
                      const meta      = STATUS_META[e.status];
                      const isViewing = e.date.slice(0, 7) === `${year}-${pad(month + 1)}`;
                      return (
                        <div key={e._id ?? e.name} className="flex items-center gap-3 px-3 py-2 bg-silver/5 dark:bg-dark/60 hover:bg-silver/15 dark:hover:bg-dark rounded-lg transition-colors opacity-60 hover:opacity-100">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-dark/50 dark:text-silver/70 truncate">{e.name}</p>
                            <p className="text-[9px] text-silver dark:text-silver/30 mt-0.5">{fmtDate(e.date)}{e.venue ? ` · ${e.venue}` : ''}</p>
                          </div>
                          <button
                            onClick={() => jumpToEvent(e)}
                            className={[
                              'shrink-0 px-2 py-1 text-[9px] font-bold border transition-colors',
                              isViewing
                                ? 'border-silver/30 dark:border-silver/15 text-silver/50 dark:text-silver/25 cursor-default'
                                : 'border-silver/30 dark:border-silver/15 text-silver dark:text-silver/35 hover:border-silver/50 dark:hover:border-silver/35 hover:text-dark dark:hover:text-silver/70',
                            ].join(' ')}
                            disabled={isViewing}
                          >
                            {isViewing ? 'Here' : 'Go →'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {events.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-10 border border-dashed border-gold/15">
          <p className="text-xs text-silver/30">No events to display</p>
          <button
            onClick={onAdd}
            className="px-5 py-2 text-xs font-bold bg-subtle dark:bg-dark text-gold border border-gold/30 hover:bg-gold hover:text-dark transition-all"
          >
            + Add First Event
          </button>
        </div>
      )}
    </div>
  );
};