export const InsightsSkeleton = () => (
  <div className="p-6 lg:p-8 space-y-6">
    <div className="h-20 animate-pulse bg-silver/10" />
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="h-24 animate-pulse bg-silver/10" />
      ))}
    </div>
    <div className="h-64 animate-pulse bg-silver/10" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-64 animate-pulse bg-silver/10" />
      <div className="h-64 animate-pulse bg-silver/10" />
    </div>
  </div>
);
