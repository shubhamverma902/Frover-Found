export const PremiumNudge = () => (
  <div className="bg-[#23292E] p-1">
    <div className="border border-[#E4BC62]/20 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold text-[#E4BC62] uppercase tracking-[0.35em] mb-1">Premium Plan</p>
        <h3 className="text-base font-bold text-white">Get priority support</h3>
        <p className="text-xs text-[#DDDED9]/50 mt-1">
          Premium members get dedicated support with response times under 2 hours.
        </p>
      </div>
      <button className="shrink-0 px-6 py-2.5 text-xs font-semibold bg-[#E4BC62] text-[#23292E] hover:bg-[#E4BC62]/90 transition-colors whitespace-nowrap">
        Upgrade ✦
      </button>
    </div>
  </div>
);
