export const DashboardSkeleton = () => (
  <div className="p-6 lg:p-8 space-y-8">
    <div className="animate-pulse h-52 bg-silver/10" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="animate-pulse h-20 bg-silver/10" />
      ))}
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="animate-pulse h-20 bg-silver/10" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 animate-pulse h-72 bg-silver/10" />
      <div className="lg:col-span-2 animate-pulse h-72 bg-silver/10" />
    </div>
  </div>
);
