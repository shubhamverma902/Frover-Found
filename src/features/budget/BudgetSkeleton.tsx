export const BudgetSkeleton = () => (
  <div className="space-y-5">
    <div className="animate-pulse h-24 bg-[#DDDED9]/10" />
    <div className="grid grid-cols-3 gap-3">
      {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-32 bg-[#DDDED9]/10" />)}
    </div>
    <div className="animate-pulse h-20 bg-[#DDDED9]/10" />
    {[1, 2, 3].map(i => <div key={i} className="animate-pulse h-16 bg-[#DDDED9]/10" />)}
  </div>
);
