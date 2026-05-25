interface VendorsEmptyStateProps {
  onAddVendor?: () => void;
}

const StorefrontIllustration = () => (
  <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
    {/* Building base */}
    <rect x="16" y="36" width="56" height="38" rx="1" fill="#1c2226" stroke="#E4BC62" strokeWidth="1.5" strokeOpacity="0.3"/>
    {/* Awning */}
    <path d="M10 36 L44 22 L78 36Z" fill="#E4BC62" fillOpacity="0.12" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.3"/>
    {/* Door */}
    <rect x="36" y="54" width="16" height="20" rx="1" fill="#E4BC62" fillOpacity="0.1" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.25"/>
    <circle cx="50" cy="64" r="1.5" fill="#E4BC62" fillOpacity="0.5"/>
    {/* Windows */}
    <rect x="20" y="44" width="12" height="10" rx="1" fill="#E4BC62" fillOpacity="0.08" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.2"/>
    <rect x="56" y="44" width="12" height="10" rx="1" fill="#E4BC62" fillOpacity="0.08" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.2"/>
    {/* Star above */}
    <path d="M44 10 L45.5 14.5 L50 14.5 L46.5 17 L48 21.5 L44 19 L40 21.5 L41.5 17 L38 14.5 L42.5 14.5Z" fill="#E4BC62" fillOpacity="0.4" stroke="#E4BC62" strokeWidth="0.5" strokeOpacity="0.5"/>
    {/* Ground line */}
    <line x1="10" y1="74" x2="78" y2="74" stroke="#DDDED9" strokeOpacity="0.12" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Corner dots */}
    <circle cx="14" cy="76" r="1.5" fill="#DFB3AE" fillOpacity="0.3"/>
    <circle cx="74" cy="76" r="1.5" fill="#DFB3AE" fillOpacity="0.3"/>
  </svg>
);

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
