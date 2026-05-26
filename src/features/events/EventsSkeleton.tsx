export const EventsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="animate-pulse border border-silver dark:border-[#3D3268] h-52 bg-silver/10" />
    ))}
  </div>
);