import { StorefrontIllustration } from '@/components/icons';

interface VendorsEmptyStateProps {
  onAddVendor?: () => void;
}

export const VendorsEmptyState = ({ onAddVendor }: VendorsEmptyStateProps) => (
  <div className="flex flex-col items-center py-16 px-6 text-center border border-dashed border-gold/20 bg-gold/[0.02]">

    <div className="relative mb-6">
      <StorefrontIllustration />
      <div className="absolute inset-0 -z-10 blur-2xl bg-blush/10 rounded-full scale-75" />
    </div>

    <p className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.35em] mb-2">Vendors</p>
    <h2 className="text-base font-bold text-dark dark:text-white mb-3">No vendors added yet</h2>
    <p className="text-sm text-zinc-400 dark:text-silver/50 max-w-xs mb-7 leading-relaxed">
      Add photographers, caterers, decorators, and every vendor who&apos;ll make your day unforgettable.
    </p>

    {onAddVendor && (
      <button
        onClick={onAddVendor}
        className="px-7 py-3 text-sm font-bold bg-dark text-gold border border-gold/30 hover:bg-gold hover:text-dark transition-all duration-200 hover:shadow-[0_4px_20px_rgba(228,188,98,0.35)]"
      >
        + Add First Vendor
      </button>
    )}

    <p className="mt-4 text-[10px] text-zinc-400/50 dark:text-silver/25 max-w-xs">
      Tip: Track status as shortlisted, in-discussion, or booked
    </p>
  </div>
);
