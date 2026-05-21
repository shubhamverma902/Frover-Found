export const ChecklistSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="animate-pulse border border-[#DDDED9] dark:border-[#2a2f33] h-40 bg-[#DDDED9]/10" />
    ))}
  </div>
);
