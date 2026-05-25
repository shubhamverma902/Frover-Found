const pulse = 'bg-silver/10 animate-pulse';

const SkeletonRow = ({ delay }: { delay: number }) => (
  <div
    className="grid grid-cols-[2fr_1fr_1fr_auto_auto] items-center gap-4 px-5 py-3 border-t border-silver/10"
    style={{ animationDelay: `${delay}s` }}
  >
    {/* Avatar + name */}
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full shrink-0 ${pulse}`} />
      <div className="flex-1 space-y-1.5">
        <div className={`h-3 w-28 rounded ${pulse}`} />
        <div className={`h-2 w-20 rounded ${pulse}`} />
      </div>
    </div>
    {/* RSVP badge */}
    <div className={`h-5 w-16 rounded ${pulse}`} />
    {/* Meal */}
    <div className={`h-3 w-12 rounded ${pulse} hidden md:block`} />
    {/* +1 */}
    <div className={`w-6 h-6 rounded ${pulse}`} />
    {/* Edit btn */}
    <div className={`w-10 h-6 rounded ${pulse}`} />
  </div>
);

export const GuestsSkeleton = () => (
  <div className="space-y-4">
    {/* Stat cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className={`h-24 rounded ${pulse}`} />
      ))}
    </div>

    {/* Response rate bar */}
    <div className={`h-14 rounded ${pulse}`} />

    {/* Table */}
    <div className="border border-silver/20 overflow-hidden">
      {/* Header */}
      <div className={`h-10 ${pulse} opacity-50`} />
      {/* Rows */}
      {[...Array(6)].map((_, i) => (
        <SkeletonRow key={i} delay={i * 0.04} />
      ))}
    </div>
  </div>
);
