'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useGetVendorsQuery, usePatchVendorStatusMutation } from '@/store/api';
import {
  AddVendorModal,
  EditVendorModal,
  VendorDetailModal,
  VendorsHeader,
  VendorsSkeleton,
  VendorsSummaryStrip,
  VendorsEmptyState,
  VendorCard,
} from '@/features/vendors';
import { Pagination } from '@/components/ui';
import type { Vendor } from '@/constants/dashboard-pages';

const PAGE_LIMIT = 10;

const VendorsPage = () => {
  const [patchVendorStatus] = usePatchVendorStatusMutation();

  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const page           = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const committedQuery = searchParams.get('q') ?? '';

  const [inputValue,   setInputValue]   = useState(committedQuery);
  const [addOpen,      setAddOpen]      = useState(false);
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);
  const [editVendor,   setEditVendor]   = useState<Vendor | null>(null);

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

  const { data, isLoading } = useGetVendorsQuery({
    page, limit: PAGE_LIMIT, query: committedQuery || undefined,
  });

  const vendors     = data?.vendors     ?? [];
  const grandTotal  = data?.grandTotal  ?? 0;
  const total       = data?.total       ?? 0;
  const totalPages  = data?.totalPages  ?? 0;
  const booked      = data?.booked      ?? 0;
  const shortlisted = data?.shortlisted ?? 0;

  const openEdit = (v: Vendor) => { setDetailVendor(null); setEditVendor(v); };

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      <VendorsHeader booked={booked} shortlisted={shortlisted} loading={isLoading} onAddVendor={() => setAddOpen(true)} />

      {isLoading ? <VendorsSkeleton /> : (
        <>
          <VendorsSummaryStrip total={grandTotal} booked={booked} shortlisted={shortlisted} />

          {grandTotal > 0 && (
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-silver/40 text-sm pointer-events-none">⌕</span>
              <input
                type="text"
                aria-label="Search vendors"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Search by name, category, location…"
                className="w-full pl-8 pr-7 py-2 text-xs bg-dark border border-silver/15 text-silver placeholder:text-silver/30 focus:outline-none focus:border-gold/50 transition-colors"
              />
              {inputValue && (
                <button aria-label="Clear search" onClick={() => setInputValue('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-silver/40 hover:text-silver text-xs leading-none">✕</button>
              )}
            </div>
          )}

          {grandTotal === 0 && <VendorsEmptyState onAddVendor={() => setAddOpen(true)} />}

          {grandTotal > 0 && vendors.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-gold/20 bg-gold/3">
              <span className="text-3xl text-gold/20">⌕</span>
              <p className="text-sm font-bold text-silver/40">No vendors match &ldquo;{committedQuery}&rdquo;</p>
              <button onClick={() => setInputValue('')} className="text-xs text-gold/60 hover:text-gold transition-colors">Clear search</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
            {vendors.map(v => (
              <VendorCard
                key={v._id}
                vendor={v}
                onViewDetail={() => setDetailVendor(v)}
                onEdit={() => setEditVendor(v)}
                onBook={() => patchVendorStatus({ vendorId: v._id, status: 'booked' })}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              noun="vendors"
              onGoToPage={goToPage}
            />
          )}
        </>
      )}

      {addOpen && <AddVendorModal onClose={() => setAddOpen(false)} />}
      {detailVendor && (
        <VendorDetailModal
          vendor={detailVendor}
          onClose={() => setDetailVendor(null)}
          onEdit={() => openEdit(detailVendor)}
        />
      )}
      {editVendor && <EditVendorModal vendor={editVendor} onClose={() => setEditVendor(null)} />}

    </div>
  );
};

export default VendorsPage;
