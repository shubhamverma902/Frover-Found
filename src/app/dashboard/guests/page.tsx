'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchGuests,
  selectGuests,
  selectGuestTotal,
  selectGuestPage,
  selectTotalPages,
  selectGuestStatus,
  selectConfirmed,
  selectPending,
  selectDeclined,
} from '@/store/slices/guestsSlice';
import {
  AddGuestModal,
  GuestRsvpModal,
  GuestsHeader,
  GuestStatCards,
  ResponseRateBar,
  GuestTable,
  GuestPagination,
} from '@/features/guests';
import type { Guest } from '@/constants/dashboard-pages';

const PAGE_LIMIT = 10;

const GuestsPage = () => {
  const dispatch   = useAppDispatch();
  const guests     = useAppSelector(selectGuests);
  const total      = useAppSelector(selectGuestTotal);
  const page       = useAppSelector(selectGuestPage);
  const totalPages = useAppSelector(selectTotalPages);
  const status     = useAppSelector(selectGuestStatus);
  const confirmed  = useAppSelector(selectConfirmed);
  const pending    = useAppSelector(selectPending);
  const declined   = useAppSelector(selectDeclined);

  const [addOpen,    setAddOpen]    = useState(false);
  const [rsvpGuest,  setRsvpGuest]  = useState<Guest | null>(null);

  const loading      = status === 'idle' || status === 'loading';
  const responsePct  = total > 0 ? Math.round(((confirmed + declined) / total) * 100) : 0;

  useEffect(() => {
    if (status === 'idle') dispatch(fetchGuests({ page: 1, limit: PAGE_LIMIT }));
  }, [dispatch, status]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    dispatch(fetchGuests({ page: p, limit: PAGE_LIMIT }));
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      {addOpen   && <AddGuestModal  onClose={() => setAddOpen(false)} />}
      {rsvpGuest && <GuestRsvpModal guest={rsvpGuest} onClose={() => setRsvpGuest(null)} />}

      <GuestsHeader
        confirmed={confirmed}
        pending={pending}
        declined={declined}
        loading={loading}
        onAddGuest={() => setAddOpen(true)}
      />

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-[#DDDED9]/10 rounded" />)}
          </div>
          <div className="h-16 bg-[#DDDED9]/10 rounded" />
          <div className="h-64 bg-[#DDDED9]/10 rounded" />
        </div>
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
            <div className="flex items-center gap-4 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#DDDED9]" />
              <div className="flex items-center gap-2 px-3 py-1 border border-[#E4BC62]/25 bg-[#E4BC62]/5">
                <span className="w-1 h-1 rounded-full bg-[#E4BC62]" />
                <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.35em]">All Guests</p>
                <span className="w-1 h-1 rounded-full bg-[#E4BC62]" />
              </div>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#DDDED9]" />
            </div>

            <GuestTable guests={guests} onEditGuest={setRsvpGuest} />

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
