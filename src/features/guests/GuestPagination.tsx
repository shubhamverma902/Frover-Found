interface GuestPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onGoToPage: (p: number) => void;
}

export const GuestPagination = ({ page, totalPages, total, onGoToPage }: GuestPaginationProps) => (
  <div className="flex items-center justify-between mt-4 px-1">
    <p className="text-[10px] text-silver/35">
      Page {page} of {totalPages} · {total} guests total
    </p>
    <div className="flex items-center gap-1">
      <button
        onClick={() => onGoToPage(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-[11px] font-bold border border-silver/15 text-silver/40 hover:border-gold/40 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        ‹ Prev
      </button>
      {[...Array(totalPages)].map((_, idx) => {
        const p = idx + 1;
        return (
          <button
            key={p}
            onClick={() => onGoToPage(p)}
            className={`w-8 h-8 text-[11px] font-bold border transition-colors ${
              p === page
                ? 'border-gold/50 bg-gold/10 text-gold'
                : 'border-silver/15 text-silver/40 hover:border-gold/30 hover:text-gold/70'
            }`}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={() => onGoToPage(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-[11px] font-bold border border-silver/15 text-silver/40 hover:border-gold/40 hover:text-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        Next ›
      </button>
    </div>
  </div>
);
