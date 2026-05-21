export const VendorsSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="grid grid-cols-3 gap-3">
      {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#DDDED9]/10 rounded" />)}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-[#DDDED9]/10 rounded" />)}
    </div>
  </div>
);
