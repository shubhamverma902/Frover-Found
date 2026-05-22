'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchVendors,
  patchVendorStatus,
  selectVendors,
  selectVendorTotal,
  selectVendorPage,
  selectVendorTotalPages,
  selectVendorStatus,
  selectBookedCount,
  selectShortlisted,
} from '@/store/slices/vendorsSlice';
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
  const dispatch    = useAppDispatch();
  const vendors     = useAppSelector(selectVendors);
  const total       = useAppSelector(selectVendorTotal);
  const page        = useAppSelector(selectVendorPage);
  const totalPages  = useAppSelector(selectVendorTotalPages);
  const status      = useAppSelector(selectVendorStatus);
  const booked      = useAppSelector(selectBookedCount);
  const shortlisted = useAppSelector(selectShortlisted);

  const [addOpen,      setAddOpen]      = useState(false);
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);
  const [editVendor,   setEditVendor]   = useState<Vendor | null>(null);
  const [query,        setQuery]        = useState('');

  const loading = status === 'idle' || status === 'loading';
  const q = query.trim().toLowerCase();
  const visibleVendors = q
    ? vendors.filter(v => [v.name, v.category, v.location ?? ''].some(f => f.toLowerCase().includes(q)))
    : vendors;

  useEffect(() => {
    if (status !== 'idle') return;
    const thunk = dispatch(fetchVendors({ page: 1, limit: PAGE_LIMIT }));
    return () => thunk.abort();
  }, [dispatch, status]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    dispatch(fetchVendors({ page: p, limit: PAGE_LIMIT }));
  };

  const openEdit = (v: Vendor) => { setDetailVendor(null); setEditVendor(v); };

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      <VendorsHeader booked={booked} shortlisted={shortlisted} loading={loading} onAddVendor={() => setAddOpen(true)} />

      {loading ? <VendorsSkeleton /> : (
        <>
          <VendorsSummaryStrip total={total} booked={booked} shortlisted={shortlisted} />

          {vendors.length > 0 && (
            <div className="relative w-full sm:w-72">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 text-sm pointer-events-none">⌕</span>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, category, location…"
                className="w-full pl-8 pr-7 py-2 text-xs bg-[#23292E] border border-[#DDDED9]/15 text-[#DDDED9] placeholder:text-[#DDDED9]/30 focus:outline-none focus:border-[#E4BC62]/50 transition-colors"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#DDDED9]/40 hover:text-[#DDDED9] text-xs leading-none">✕</button>
              )}
            </div>
          )}

          {vendors.length === 0 && <VendorsEmptyState onAddVendor={() => setAddOpen(true)} />}

          {vendors.length > 0 && visibleVendors.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 border border-dashed border-[#E4BC62]/20 bg-[#E4BC62]/3">
              <span className="text-3xl text-[#E4BC62]/20">⌕</span>
              <p className="text-sm font-bold text-[#DDDED9]/40">No vendors match &ldquo;{query}&rdquo;</p>
              <button onClick={() => setQuery('')} className="text-xs text-[#E4BC62]/60 hover:text-[#E4BC62] transition-colors">Clear search</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger-children">
            {visibleVendors.map(v => (
              <VendorCard
                key={v._id}
                vendor={v}
                onViewDetail={() => setDetailVendor(v)}
                onEdit={() => setEditVendor(v)}
                onBook={() => dispatch(patchVendorStatus({ vendorId: v._id, status: 'booked' }))}
              />
            ))}
          </div>

          {!query && totalPages > 1 && (
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
