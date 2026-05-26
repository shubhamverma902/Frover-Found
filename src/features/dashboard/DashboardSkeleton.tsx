const Bone = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-xl bg-silver/15 dark:bg-silver/8 ${className}`} />
);

export const DashboardSkeleton = () => (
  <div className="p-6 lg:p-8 space-y-6">

    {/* Welcome banner */}
    <div className="rounded-2xl bg-card dark:bg-[#2A1F52] border border-blush/15 dark:border-gold/10 px-8 py-8 space-y-6">
      {/* Top ornament */}
      <Bone className="h-px w-full" />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        {/* Name + date */}
        <div className="space-y-3">
          <Bone className="h-3 w-28" />
          <Bone className="h-9 w-72" />
          <Bone className="h-4 w-48" />
        </div>
        {/* Days counter card */}
        <div className="rounded-2xl bg-blush/8 dark:bg-white/5 border border-blush/20 dark:border-gold/15 px-6 py-4 flex flex-col items-center gap-2 shrink-0">
          <Bone className="h-3 w-20" />
          <Bone className="h-12 w-16" />
          <Bone className="h-3 w-14" />
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Bone className="h-3 w-32" />
          <Bone className="h-3 w-8" />
        </div>
        <div className="h-2 bg-blush/20 dark:bg-white/8 rounded-full overflow-hidden">
          <div className="h-full w-2/5 bg-silver/20 dark:bg-silver/10 rounded-full animate-pulse" />
        </div>
      </div>
    </div>

    {/* Stats row — 4 cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[true, false, false, false].map((accent, i) => (
        <div
          key={i}
          className={`rounded-2xl p-5 space-y-2 ${
            accent
              ? 'bg-gradient-to-br from-dark to-[#1e1710] ring-1 ring-gold/20'
              : 'bg-card dark:bg-[#1E1840] ring-1 ring-silver/20 dark:ring-white/5'
          }`}
        >
          <div className="flex items-baseline gap-1.5">
            <Bone className="h-7 w-12" />
            <Bone className="h-4 w-10" />
          </div>
          <Bone className="h-3 w-24" />
        </div>
      ))}
    </div>

    {/* Quick actions — header + 6 cards */}
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-silver/20 dark:bg-white/8" />
        <Bone className="h-6 w-32 rounded-full" />
        <div className="h-px flex-1 bg-silver/20 dark:bg-white/8" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 bg-card dark:bg-[#1E1840] rounded-2xl p-4 ring-1 ring-silver/20 dark:ring-white/5">
            <Bone className="w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-3.5 w-24" />
              <Bone className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Tasks + Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

      {/* Upcoming tasks — 3/5 */}
      <div className="lg:col-span-3 bg-card dark:bg-[#1E1840] rounded-2xl ring-1 ring-silver/20 dark:ring-white/5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-silver/20 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-gold/40 rounded-full" />
            <Bone className="h-4 w-36" />
          </div>
          <Bone className="h-3 w-14" />
        </div>
        {/* Task rows */}
        <ul className="divide-y divide-silver/15 dark:divide-white/4">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-4 px-6 py-3.5">
              <Bone className="w-5 h-5 shrink-0 rounded-md" />
              <Bone className="w-7 h-7 rounded-lg shrink-0" />
              <Bone className="h-4 flex-1" />
              <Bone className="h-6 w-16 rounded-lg shrink-0" />
            </li>
          ))}
        </ul>
      </div>

      {/* Recent activity — 2/5 */}
      <div className="lg:col-span-2 bg-card dark:bg-[#1E1840] rounded-2xl ring-1 ring-silver/20 dark:ring-white/5 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-silver/20 dark:border-white/5">
          <div className="w-1 h-5 bg-blush/40 rounded-full" />
          <Bone className="h-4 w-32" />
        </div>
        {/* Activity items */}
        <div className="px-6 py-4 flex-1 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Bone className="w-8 h-8 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 pt-0.5">
                <Bone className="h-4 w-full" />
                <Bone className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
        {/* Premium plan card */}
        <div className="mx-4 mb-4 p-4 rounded-2xl bg-subtle dark:bg-dark border border-blush/20 dark:border-gold/15 space-y-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-4 w-full" />
          <Bone className="h-9 w-full rounded-xl" />
        </div>
      </div>

    </div>
  </div>
);
