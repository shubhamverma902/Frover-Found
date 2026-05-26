export const ChecklistSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse border border-silver dark:border-[#3D3268] h-40 bg-silver/10" />
    ))}
  </div>
);