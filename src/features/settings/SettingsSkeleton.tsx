export const SettingsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-silver/10 rounded" />)}
  </div>
);
