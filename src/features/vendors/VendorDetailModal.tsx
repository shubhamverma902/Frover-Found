'use client';

import Modal from '@/components/ui/Modal';
import { Button } from '@/components/elements';
import { StarIcon } from '@/components/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { patchVendorStatus, selectVendorMutating } from '@/store/slices/vendorsSlice';
import { STATUS_META } from '@/constants/vendors';
import type { Vendor } from '@/constants/dashboard-pages';

interface VendorDetailModalProps {
  vendor:   Vendor;
  onClose:  () => void;
  onEdit:   () => void;
}

const VendorDetailModal = ({ vendor, onClose, onEdit }: VendorDetailModalProps) => {
  const dispatch = useAppDispatch();
  const mutating = useAppSelector(selectVendorMutating);
  const meta     = STATUS_META[vendor.status];

  const handleBook = async () => {
    const result = await dispatch(patchVendorStatus({ vendorId: vendor._id, status: 'booked' }));
    if (patchVendorStatus.fulfilled.match(result)) onClose();
  };

  return (
    <Modal onClose={onClose} className="flex flex-col max-h-[90svh]">
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Vendors</p>
          <h2 className="text-base font-bold text-white">Vendor Details</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-6 space-y-5">

        {/* Identity block */}
        <div className="flex items-stretch gap-0 border border-[#E4BC62]/20 overflow-hidden">
          <div className={`w-16 bg-[#23292E] flex items-center justify-center text-3xl shrink-0 border-r border-[#E4BC62]/10 ${meta.bar} bg-gradient-to-b`}>
            <span className="text-3xl">{vendor.icon}</span>
          </div>
          <div className="flex-1 px-4 py-3.5 bg-[#E4BC62]/5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-white">{vendor.name}</p>
                <p className="text-[10px] text-[#DDDED9]/40 uppercase tracking-widest mt-0.5">{vendor.category}</p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wide shrink-0 ${meta.badge}`}>
                {meta.label}
              </span>
            </div>
            <div className="flex items-center gap-0.5 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} size={11} filled={i < vendor.rating}
                  className={i < vendor.rating ? 'text-[#E4BC62]' : 'text-[#DDDED9]/20'} />
              ))}
              <span className="ml-1.5 text-[10px] font-semibold text-[#DDDED9]/40">{vendor.rating}.0</span>
            </div>
          </div>
        </div>

        {/* Ornament */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E4BC62]/15" />
          <span className="text-[#E4BC62]/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
          <div className="flex-1 h-px bg-[#E4BC62]/15" />
        </div>

        {/* Details */}
        <div className="space-y-3">
          <DetailRow icon="✉" label="Contact" value={vendor.contact || '—'} />
          <DetailRow icon="◎" label="Location" value={vendor.location || '—'} />
          {vendor.notes && (
            <div className="px-4 py-3 bg-[#DDDED9]/5 border border-[#DDDED9]/10">
              <p className="text-[10px] font-bold text-[#DDDED9]/40 uppercase tracking-widest mb-1.5">Notes</p>
              <p className="text-xs text-[#DDDED9]/60 leading-relaxed">{vendor.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
        <Button variant="cancel" type="button" onClick={onEdit}>Edit ✎</Button>
        {vendor.status !== 'booked' ? (
          <Button variant="gold" type="button" disabled={mutating} onClick={handleBook}>
            {mutating ? 'Booking…' : 'Book Now ✦'}
          </Button>
        ) : (
          <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-[#E4BC62] bg-[#E4BC62]/8 border border-[#E4BC62]/20">
            ✓ Confirmed Booking
          </div>
        )}
      </div>
    </Modal>
  );
};

const DetailRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <div className="flex items-center gap-3 px-4 py-2.5 border border-[#DDDED9]/10">
    <span className="text-[#DFB3AE] text-sm w-5 shrink-0">{icon}</span>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-[#DDDED9]/35 uppercase tracking-widest">{label}</p>
      <p className="text-xs text-[#DDDED9]/70 mt-0.5 truncate">{value}</p>
    </div>
  </div>
);

export default VendorDetailModal;
