'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getAccessToken } from '@/api/tokenStore';
import { useGetGuestsQuery } from '@/store/api';
import {
  AddGuestModal,
  GuestRsvpModal,
  ImportGuestModal,
  GuestsHeader,
  GuestStatCards,
  ResponseRateBar,
  GuestTable,
  GuestPagination,
  GuestsSkeleton,
} from '@/features/guests';
import type { Guest } from '@/constants/dashboard-pages';
import { API } from '@/constants/api';

const PAGE_LIMIT = 10;

const GuestsPage = () => {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const page           = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const committedQuery = searchParams.get('q') ?? '';

  // Local input value drives the debounce; initialised from URL so back-navigation restores it
  const [inputValue, setInputValue] = useState(committedQuery);

  // Modal / transient state
  const [addOpen,    setAddOpen]    = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [rsvpGuest,  setRsvpGuest]  = useState<Guest | null>(null);
  const [exporting,  setExporting]  = useState(false);

  // Debounce input → URL (also resets page to 1)
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

  const { data, isLoading } = useGetGuestsQuery({
    page,
    limit: PAGE_LIMIT,
    query: committedQuery || undefined,
  });

  const guests     = data?.guests     ?? [];
  const total      = data?.total      ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Redirect to last valid page if a mutation shrinks the list (e.g. bulk delete)
  useEffect(() => {
    if (!isLoading && page > 1 && guests.length === 0 && totalPages > 0) {
      goToPage(totalPages);
    }
  }, [isLoading, guests.length, page, totalPages]); // eslint-disable-line react-hooks/exhaustive-deps
  const grandTotal = data?.grandTotal ?? 0;
  const confirmed  = data?.confirmed  ?? 0;
  const pending    = data?.pending    ?? 0;
  const declined   = data?.declined   ?? 0;

  const handleExport = async () => {
    setExporting(true);
    try {
      const base     = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';
      const token    = getAccessToken();
      const response = await fetch(`${base}${API.guests.export}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`Export failed (${response.status})`);

      // FSAL path: pipe response stream directly to disk — never lives in JS heap
      const fsal = (window as Window & { showSaveFilePicker?: (o: object) => Promise<FileSystemFileHandle> }).showSaveFilePicker;
      if (fsal && response.body) {
        let handle: FileSystemFileHandle;
        try {
          handle = await fsal({ suggestedName: 'guests.csv', types: [{ description: 'CSV File', accept: { 'text/csv': ['.csv'] } }] });
        } catch (e) {
          if ((e as DOMException).name === 'AbortError') return; // user cancelled picker
          throw e;
        }
        const writable = await handle.createWritable();
        await response.body.pipeTo(writable);
        return;
      }

      // Fallback: buffer blob and trigger anchor download (Firefox, Safari, older browsers)
      const blob = await response.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = 'guests.csv';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const responsePct = grandTotal > 0 ? Math.round(((confirmed + declined) / grandTotal) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      {addOpen    && <AddGuestModal    onClose={() => setAddOpen(false)} onSuccess={() => { setAddOpen(false); goToPage(1); }} />}
      {importOpen && <ImportGuestModal onClose={() => setImportOpen(false)} />}
      {rsvpGuest  && <GuestRsvpModal  guest={rsvpGuest} onClose={() => setRsvpGuest(null)} />}

      <GuestsHeader
        confirmed={confirmed}
        pending={pending}
        declined={declined}
        loading={isLoading}
        exporting={exporting}
        onAddGuest={() => setAddOpen(true)}
        onImport={() => setImportOpen(true)}
        onExport={handleExport}
      />

      {isLoading ? (
        <GuestsSkeleton />
      ) : (
        <>
          <GuestStatCards
            total={grandTotal}
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
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Search guests…"
                  className="w-full pl-8 pr-7 py-2 text-xs bg-[#23292E] border border-[#DDDED9]/15 text-[#DDDED9] placeholder:text-[#DDDED9]/30 focus:outline-none focus:border-[#E4BC62]/50 transition-colors"
                />
                {inputValue && (
                  <button aria-label="Clear search" onClick={() => setInputValue('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 hover:text-[#DDDED9] text-xs leading-none">✕</button>
                )}
              </div>
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
