'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { getAccessToken } from '@/api/tokenStore';
import { useGetGuestsQuery } from '@/store/api';
import {
  AddGuestModal,
  EditGuestModal,
  ImportGuestModal,
  GuestsHeader,
  GuestStatCards,
  ResponseRateBar,
  GuestTable,
  GuestPagination,
  GuestsSkeleton,
} from '@/features/guests';
import type { Guest } from '@/types/guest';
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
  const [editGuest,  setEditGuest]  = useState<Guest | null>(null);
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

      {addOpen   && <AddGuestModal  onClose={() => setAddOpen(false)} onSuccess={() => { setAddOpen(false); goToPage(1); }} />}
      {importOpen && <ImportGuestModal onClose={() => setImportOpen(false)} />}
      {editGuest && (
        <EditGuestModal
          guest={editGuest}
          onClose={() => setEditGuest(null)}
          onDeleted={() => setEditGuest(null)}
        />
      )}

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
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-silver" />
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl border border-gold/25 bg-gold/5">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  <p className="text-[10px] font-bold text-gold uppercase tracking-[0.35em]">All Guests</p>
                  <span className="w-1 h-1 rounded-full bg-gold" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-silver" />
              </div>
              <div className="relative sm:w-60">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-silver/40 text-sm pointer-events-none">⌕</span>
                <input
                  type="text"
                  aria-label="Search guests"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Search guests…"
                  className="w-full pl-8 pr-7 py-2 text-xs rounded-xl bg-white dark:bg-[#1E1840] border border-silver/20 dark:border-silver/20 text-dark dark:text-silver placeholder:text-silver/40 dark:placeholder:text-silver/40 focus:outline-none focus:border-blush/50 dark:focus:border-gold/50 transition-colors"
                />
                {inputValue && (
                  <button aria-label="Clear search" onClick={() => setInputValue('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-silver/40 hover:text-silver text-xs leading-none">✕</button>
                )}
              </div>
            </div>

            <GuestTable guests={guests} onEditGuest={setEditGuest} />

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
