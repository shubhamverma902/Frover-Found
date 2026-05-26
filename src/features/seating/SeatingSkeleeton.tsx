export const SeatingSkeleeton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
    <div className="space-y-2">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-10 animate-pulse bg-silver/10" />
      ))}
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-40 animate-pulse bg-silver/10" />
      ))}
    </div>
  </div>
);
