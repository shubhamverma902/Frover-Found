'use client';

import { useState } from 'react';
import { exportGuestListPDF } from '@/utils/exportPdf';
import { useAppDispatch } from '@/store/hooks';
import { useGetGuestsQuery } from '@/store/api';
import {
  AddGuestModal,
  GuestRsvpModal,
  GuestsHeader,
  GuestStatCards,
  ResponseRateBar,
  GuestTable,
  GuestPagination,
  GuestsSkeleton,
} from '@/features/guests';
import type { Guest } from '@/constants/dashboard-pages';

const PAGE_LIMIT = 10;

const GuestsPage = () => {
  const dispatch = useAppDispatch();

  const [page,      setPage]      = useState(1);
  const [addOpen,   setAddOpen]   = useState(false);
  const [rsvpGuest, setRsvpGuest] = useState<Guest | null>(null);
  const [query,     setQuery]     = useState('');
  const [exporting, setExporting] = useState(false);

  const { data, isLoading } = useGetGuestsQuery({ page, limit: PAGE_LIMIT });

  const guests     = data?.guests     ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const confirmed  = guests.filter(g => g.rsvp === 'confirmed').length;
  const pending    = guests.filter(g => g.rsvp === 'pending').length;
  const declined   = guests.filter(g => g.rsvp === 'declined').length;

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportGuestListPDF({ total, confirmed, pending, declined });
    } finally {
      setExporting(false);
    }
  };

  const q             = query.trim().toLowerCase();
  const visibleGuests = q
    ? guests.filter(g => [g.name, g.relation, g.phone ?? ''].some(f => f.toLowerCase().includes(q)))
    : guests;
  const responsePct = total > 0 ? Math.round(((confirmed + declined) / total) * 100) : 0;

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // dispatch is still needed by modals; suppress unused-var warning
  void dispatch;

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      {addOpen   && <AddGuestModal  onClose={() => setAddOpen(false)} />}
      {rsvpGuest && <GuestRsvpModal guest={rsvpGuest} onClose={() => setRsvpGuest(null)} />}

      <GuestsHeader
        confirmed={confirmed}
        pending={pending}
        declined={declined}
        loading={isLoading}
        exporting={exporting}
        onAddGuest={() => setAddOpen(true)}
        onExport={handleExport}
      />

      {isLoading ? (
        <GuestsSkeleton />
      ) : (
        <>
          <GuestStatCards
            total={total}
            confirmed={confirmed}
            pending={pending}
            declined={declined}
          />

          <ResponseRateBar
            responsePct={responsePct}
            confirmed={confirmed}
            declined={declined}
            pending={pending}
          />

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#DDDED9]" />
                <div className="flex items-center gap-2 px-3 py-1 border border-[#E4BC62]/25 bg-[#E4BC62]/5">
                  <span className="w-1 h-1 rounded-full bg-[#E4BC62]" />
                  <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.35em]">All Guests</p>
                  <span className="w-1 h-1 rounded-full bg-[#E4BC62]" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#DDDED9]" />
              </div>
              <div className="relative sm:w-60">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 text-sm pointer-events-none">⌕</span>
                <input
                  type="text"
                  aria-label="Search guests"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search guests…"
                  className="w-full pl-8 pr-7 py-2 text-xs bg-[#23292E] border border-[#DDDED9]/15 text-[#DDDED9] placeholder:text-[#DDDED9]/30 focus:outline-none focus:border-[#E4BC62]/50 transition-colors"
                />
                {query && (
                  <button aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 hover:text-[#DDDED9] text-xs leading-none">✕</button>
                )}
              </div>
            </div>

            <GuestTable guests={visibleGuests} onEditGuest={setRsvpGuest} />

            {totalPages > 1 && (
              <GuestPagination
                page={page}
                totalPages={totalPages}
                total={total}
                onGoToPage={goToPage}
              />
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default GuestsPage;
