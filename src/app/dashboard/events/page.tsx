'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchEvents,
  patchEventStatus,
  selectEvents,
  selectEventsStatus,
  selectConfirmedCount,
} from '@/store/slices/eventsSlice';
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
} from '@/features/events';
import type { EventFilter } from '@/features/events';
import type { WeddingEvent } from '@/constants/dashboard-pages';

const EventsPage = () => {
  const dispatch  = useAppDispatch();
  const events    = useAppSelector(selectEvents);
  const status    = useAppSelector(selectEventsStatus);
  const confirmed = useAppSelector(selectConfirmedCount);

  const [showAdd,   setShowAdd]   = useState(false);
  const [editEvent, setEditEvent] = useState<WeddingEvent | null>(null);
  const [filter,    setFilter]    = useState<EventFilter>('all');
  const [query,     setQuery]     = useState('');

  useEffect(() => {
    if (status === 'idle') dispatch(fetchEvents());
  }, [status, dispatch]);

  const loading = status === 'loading';
  const q = query.trim().toLowerCase();
  const filteredByStatus = filter === 'all' ? events : events.filter(e => e.status === filter);
  const visibleEvents = q
    ? filteredByStatus.filter(e => [e.name, e.venue ?? ''].some(f => f.toLowerCase().includes(q)))
    : filteredByStatus;

  const filters = [
    { value: 'all'       as EventFilter, label: 'All',       count: events.length },
    { value: 'pending'   as EventFilter, label: 'Pending',   count: events.filter(e => e.status === 'pending').length },
    { value: 'planning'  as EventFilter, label: 'Planning',  count: events.filter(e => e.status === 'planning').length },
    { value: 'confirmed' as EventFilter, label: 'Confirmed', count: events.filter(e => e.status === 'confirmed').length },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      {showAdd   && <AddEventModal  onClose={() => setShowAdd(false)} />}
      {editEvent && <EditEventModal event={editEvent} onClose={() => setEditEvent(null)} />}

      <EventsHeader
        confirmed={confirmed}
        total={events.length}
        loading={loading}
        onAddEvent={() => setShowAdd(true)}
      />

      <EventsSummaryStrip
        total={events.length}
        confirmed={confirmed}
        inPlanning={events.filter(e => e.status !== 'confirmed').length}
      />

      {!loading && events.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <EventFilterPills filters={filters} activeFilter={filter} onChange={setFilter} />
          <div className="relative sm:ml-auto sm:w-60">
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
        </div>
      )}

      {loading && <EventsSkeleton />}

      {!loading && events.length === 0 && (
        <EventsEmptyState onAddEvent={() => setShowAdd(true)} />
      )}

      {!loading && events.length > 0 && visibleEvents.length === 0 && (
        <EventFilteredEmpty filter={filter} onReset={() => { setFilter('all'); setQuery(''); }} />
      )}

      {!loading && visibleEvents.length > 0 && (
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
      )}

    </div>
  );
};

export default EventsPage;
