'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { patchEventStatus } from '@/store/slices/eventsSlice';
import { useGetEventsQuery } from '@/store/api';
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
  const dispatch = useAppDispatch();

  const [page,      setPage]      = useState(1);
  const [showAdd,   setShowAdd]   = useState(false);
  const [editEvent, setEditEvent] = useState<WeddingEvent | null>(null);
  const [filter,    setFilter]    = useState<EventFilter>('all');
  const [query,     setQuery]     = useState('');
  const [view,      setView]      = useState<'list' | 'calendar'>('list');

  const { data, isLoading } = useGetEventsQuery({ page, limit: PAGE_LIMIT });

  const events     = data?.events     ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const confirmed  = data?.confirmed  ?? 0;
  const planning   = data?.planning   ?? 0;
  const pending    = data?.pending    ?? 0;

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const q = query.trim().toLowerCase();
  const filteredByStatus = filter === 'all' ? events : events.filter(e => e.status === filter);
  const visibleEvents = q
    ? filteredByStatus.filter(e => [e.name, e.venue ?? ''].some(f => f.toLowerCase().includes(q)))
    : filteredByStatus;

  const filters = [
    { value: 'all'       as EventFilter, label: 'All',       count: total },
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
        total={total}
        loading={isLoading}
        onAddEvent={() => setShowAdd(true)}
      />

      <EventsSummaryStrip
        total={total}
        confirmed={confirmed}
        inPlanning={total - confirmed}
      />

      {isLoading && <EventsSkeleton />}

      {!isLoading && view === 'list' && events.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <EventFilterPills filters={filters} activeFilter={filter} onChange={setFilter} />
          <div className="flex items-center gap-2 sm:ml-auto">
            <div className="relative sm:w-56">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 text-sm pointer-events-none">⌕</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search events…"
                className="w-full pl-8 pr-7 py-2 text-xs bg-[#23292E] border border-[#DDDED9]/15 text-[#DDDED9] placeholder:text-[#DDDED9]/30 focus:outline-none focus:border-[#E4BC62]/50 transition-colors"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 hover:text-[#DDDED9] text-xs leading-none">✕</button>
              )}
            </div>
            {viewToggle}
          </div>
        </div>
      )}

      {!isLoading && view === 'calendar' && (
        <div className="flex justify-end">{viewToggle}</div>
      )}

      {!isLoading && events.length === 0 && view === 'list' && (
        <EventsEmptyState onAddEvent={() => setShowAdd(true)} />
      )}

      {!isLoading && events.length > 0 && visibleEvents.length === 0 && view === 'list' && (
        <EventFilteredEmpty filter={filter} onReset={() => { setFilter('all'); setQuery(''); }} />
      )}

      {!isLoading && visibleEvents.length > 0 && view === 'list' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
            {visibleEvents.map(event => (
              <EventCard
                key={event._id ?? event.name}
                event={event}
                onEdit={() => setEditEvent(event)}
                onConfirm={() => event._id && dispatch(patchEventStatus({ id: event._id, status: 'confirmed' }))}
              />
            ))}
          </div>

          {filter === 'all' && !query && totalPages > 1 && (
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
