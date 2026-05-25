'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useGetEventsQuery, usePatchEventStatusMutation } from '@/store/api';
import {
  AddEventModal,
  EditEventModal,
  EventsHeader,
  EventsSummaryStrip,
  EventFilterPills,
  EventsSkeleton,
  EventsEmptyState,
  EventFilteredEmpty,
  EventCard,
  EventsCalendar,
} from '@/features/events';
import { Pagination } from '@/components/ui';
import type { EventFilter } from '@/features/events';
import type { WeddingEvent } from '@/constants/dashboard-pages';

const PAGE_LIMIT = 20;

const EventsPage = () => {
  const [patchEventStatus] = usePatchEventStatusMutation();

  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const page           = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const committedQuery = searchParams.get('q') ?? '';
  const filter         = (searchParams.get('filter') ?? 'all') as EventFilter;
  const view           = (searchParams.get('view') ?? 'list') as 'list' | 'calendar';

  const [inputValue, setInputValue] = useState(committedQuery);
  const [showAdd,    setShowAdd]    = useState(false);
  const [editEvent,  setEditEvent]  = useState<WeddingEvent | null>(null);

  useEffect(() => {
    const trimmed = inputValue.trim();
    const t = setTimeout(() => {
      if (trimmed === committedQuery) return;
      const next = new URLSearchParams(searchParams.toString());
      if (trimmed) next.set('q', trimmed); else next.delete('q');
      next.delete('page');
      router.replace(`${pathname}?${next.toString()}`);
    }, 350);
    return () => clearTimeout(t);
  }, [inputValue]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    const next = new URLSearchParams(searchParams.toString());
    if (p === 1) next.delete('page'); else next.set('page', String(p));
    router.replace(`${pathname}?${next.toString()}`);
  };

  const setFilter = (f: EventFilter) => {
    const next = new URLSearchParams(searchParams.toString());
    if (f === 'all') next.delete('filter'); else next.set('filter', f);
    next.delete('page');
    router.replace(`${pathname}?${next.toString()}`);
  };

  const setView = (v: 'list' | 'calendar') => {
    const next = new URLSearchParams(searchParams.toString());
    if (v === 'list') next.delete('view'); else next.set('view', v);
    router.replace(`${pathname}?${next.toString()}`);
  };

  const resetFilters = () => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('filter');
    next.delete('q');
    next.delete('page');
    router.replace(`${pathname}?${next.toString()}`);
    setInputValue('');
  };

  const { data, isLoading } = useGetEventsQuery({
    page,
    limit: PAGE_LIMIT,
    query:  committedQuery || undefined,
    status: filter !== 'all' ? filter : undefined,
  });

  const events     = data?.events     ?? [];
  const grandTotal = data?.grandTotal ?? 0;
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const confirmed  = data?.confirmed  ?? 0;
  const planning   = data?.planning   ?? 0;
  const pending    = data?.pending    ?? 0;

  const filters = [
    { value: 'all'       as EventFilter, label: 'All',       count: grandTotal },
    { value: 'pending'   as EventFilter, label: 'Pending',   count: pending },
    { value: 'planning'  as EventFilter, label: 'Planning',  count: planning },
    { value: 'confirmed' as EventFilter, label: 'Confirmed', count: confirmed },
  ];

  const viewToggle = (
    <div className="flex items-center gap-px border border-[#23292E]/20 dark:border-[#DDDED9]/15 self-start sm:self-auto">
      {(['list', 'calendar'] as const).map(v => (
        <button
          key={v}
          onClick={() => setView(v)}
          className={[
            'px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.3em] transition-colors',
            view === v
              ? 'bg-[#E4BC62] text-[#23292E]'
              : 'text-[#23292E]/50 dark:text-[#DDDED9]/50 hover:text-[#23292E] dark:hover:text-[#DDDED9] hover:bg-[#23292E]/8 dark:hover:bg-[#DDDED9]/5',
          ].join(' ')}
        >
          {v === 'list' ? '≡ List' : '▦ Calendar'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      {showAdd   && <AddEventModal  onClose={() => setShowAdd(false)} />}
      {editEvent && <EditEventModal event={editEvent} onClose={() => setEditEvent(null)} />}

      <EventsHeader
        confirmed={confirmed}
        total={grandTotal}
        loading={isLoading}
        onAddEvent={() => setShowAdd(true)}
      />

      <EventsSummaryStrip
        total={grandTotal}
        confirmed={confirmed}
        inPlanning={grandTotal - confirmed}
      />

      {isLoading && <EventsSkeleton />}

      {!isLoading && view === 'list' && grandTotal > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <EventFilterPills filters={filters} activeFilter={filter} onChange={setFilter} />
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative sm:w-56">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 text-sm pointer-events-none">⌕</span>
              <input
                type="text"
                aria-label="Search events"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search events…"
                className="w-full pl-8 pr-7 py-2 text-xs bg-[#23292E] border border-[#DDDED9]/15 text-[#DDDED9] placeholder:text-[#DDDED9]/30 focus:outline-none focus:border-[#E4BC62]/50 transition-colors"
              />
              {inputValue && (
                <button aria-label="Clear search" onClick={() => setInputValue('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 hover:text-[#DDDED9] text-xs leading-none">✕</button>
              )}
            </div>
            {viewToggle}
          </div>
        </div>
      )}

      {!isLoading && view === 'calendar' && (
        <div className="flex justify-end">{viewToggle}</div>
      )}

      {!isLoading && grandTotal === 0 && view === 'list' && (
        <EventsEmptyState onAddEvent={() => setShowAdd(true)} />
      )}

      {!isLoading && grandTotal > 0 && events.length === 0 && view === 'list' && (
        <EventFilteredEmpty filter={filter} onReset={resetFilters} />
      )}

      {!isLoading && events.length > 0 && view === 'list' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
            {events.map(event => (
              <EventCard
                key={event._id ?? event.name}
                event={event}
                onEdit={() => setEditEvent(event)}
                onConfirm={() => event._id && patchEventStatus({ id: event._id, status: 'confirmed' })}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              noun="events"
              onGoToPage={goToPage}
            />
          )}
        </>
      )}

      {!isLoading && view === 'calendar' && (
        <EventsCalendar
          events={events}
          onEdit={setEditEvent}
          onAdd={() => setShowAdd(true)}
        />
      )}

    </div>
  );
};

export default EventsPage;
