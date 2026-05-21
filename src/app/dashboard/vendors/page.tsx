'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchVendors,
  patchVendorStatus,
  selectVendors,
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
import type { Vendor } from '@/constants/dashboard-pages';

const VendorsPage = () => {
  const dispatch    = useAppDispatch();
  const vendors     = useAppSelector(selectVendors);
  const status      = useAppSelector(selectVendorStatus);
  const booked      = useAppSelector(selectBookedCount);
  const shortlisted = useAppSelector(selectShortlisted);

  const [addOpen,      setAddOpen]      = useState(false);
  const [detailVendor, setDetailVendor] = useState<Vendor | null>(null);
  const [editVendor,   setEditVendor]   = useState<Vendor | null>(null);

  const loading = status === 'idle' || status === 'loading';

  useEffect(() => {
    if (status === 'idle') dispatch(fetchVendors());
  }, [dispatch, status]);

  const openEdit = (v: Vendor) => { setDetailVendor(null); setEditVendor(v); };

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      <VendorsHeader booked={booked} shortlisted={shortlisted} loading={loading} onAddVendor={() => setAddOpen(true)} />

      {loading ? <VendorsSkeleton /> : (
        <>
          <VendorsSummaryStrip total={vendors.length} booked={booked} shortlisted={shortlisted} />

          {vendors.length === 0 && <VendorsEmptyState />}

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
