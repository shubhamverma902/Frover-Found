'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { patchVendorStatus, resetVendorMutating } from '@/store/slices/vendorsSlice';
import { useGetVendorsQuery } from '@/store/api';
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
  const dispatch = useAppDispatch();
  useEffect(() => { dispatch(resetVendorMutating()); }, [dispatch]);

  const [page,           setPage]           = useState(1);
  const [addOpen,        setAddOpen]        = useState(false);
  const [detailVendor,   setDetailVendor]   = useState<Vendor | null>(null);
  const [editVendor,     setEditVendor]     = useState<Vendor | null>(null);
  const [query,          setQuery]          = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { setPage(1); }, [debouncedQuery]);

  const { data, isLoading } = useGetVendorsQuery({
    page, limit: PAGE_LIMIT, query: debouncedQuery || undefined,
  });

  const vendors     = data?.vendors     ?? [];
  const grandTotal  = data?.grandTotal  ?? 0;
  const total       = data?.total       ?? 0;
  const totalPages  = data?.totalPages  ?? 0;
  const booked      = data?.booked      ?? 0;
  const shortlisted = data?.shortlisted ?? 0;

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const openEdit = (v: Vendor) => { setDetailVendor(null); setEditVendor(v); };

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      <VendorsHeader booked={booked} shortlisted={shortlisted} loading={isLoading} onAddVendor={() => setAddOpen(true)} />

      {isLoading ? <VendorsSkeleton /> : (
        <>
          <VendorsSummaryStrip total={grandTotal} booked={booked} shortlisted={shortlisted} />

          {grandTotal > 0 && (
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 text-sm pointer-events-none">⌕</span>
              <input
                type="text"
                aria-label="Search vendors"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, category, location…"
                className="w-full pl-8 pr-7 py-2 text-xs bg-[#23292E] border border-[#DDDED9]/15 text-[#DDDED9] placeholder:text-[#DDDED9]/30 focus:outline-none focus:border-[#E4BC62]/50 transition-colors"
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 hover:text-[#DDDED9] text-xs leading-none">✕</button>
              )}
            </div>
          )}

          {grandTotal === 0 && <VendorsEmptyState onAddVendor={() => setAddOpen(true)} />}

          {grandTotal > 0 && vendors.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-[#E4BC62]/20 bg-[#E4BC62]/3">
              <span className="text-3xl text-[#E4BC62]/20">⌕</span>
              <p className="text-sm font-bold text-[#DDDED9]/40">No vendors match &ldquo;{query}&rdquo;</p>
              <button onClick={() => setQuery('')} className="text-xs text-[#E4BC62]/60 hover:text-[#E4BC62] transition-colors">Clear search</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
            {vendors.map(v => (
              <VendorCard
                key={v._id}
                vendor={v}
                onViewDetail={() => setDetailVendor(v)}
                onEdit={() => setEditVendor(v)}
                onBook={() => dispatch(patchVendorStatus({ vendorId: v._id, status: 'booked' }))}
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
