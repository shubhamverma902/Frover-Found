import type { FC } from 'react';

interface Props {
  booked: number;
  shortlisted: number;
  loading: boolean;
  onAddVendor: () => void;
}

export const VendorsHeader: FC<Props> = ({ booked, shortlisted, loading, onAddVendor }) => (
  <div className="bg-[#23292E] p-[3px] glow-gold-strong relative">
    <span className="absolute top-2 left-2 text-[#E4BC62]/25 text-[10px]">◆</span>
    <span className="absolute top-2 right-2 text-[#E4BC62]/25 text-[10px]">◆</span>
    <div className="border border-[#E4BC62]/20 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E4BC62] pulse-dot" />
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em]">Planning</p>
        </div>
        <h1 className="text-xl font-bold text-white">Vendors</h1>
        <p className="text-xs text-[#DDDED9]/50 mt-1">
          {loading ? '—' : `${booked} booked · ${shortlisted} shortlisted`}
        </p>
      </div>
      <button
        onClick={onAddVendor}
        className="relative self-start sm:self-auto px-5 py-2.5 text-xs font-bold bg-[#E4BC62] text-[#23292E] hover:bg-[#E4BC62]/85 transition-all hover:shadow-[0_4px_16px_rgba(228,188,98,0.45)]"
      >
        + Add Vendor
      </button>
    </div>
  </div>
);
