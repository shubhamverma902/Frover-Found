export const SettingsHeader = () => (
  <div className="bg-[#23292E] p-[3px] glow-gold-strong relative">
    <span className="absolute top-2 left-2 text-[#E4BC62]/25 text-[10px]">◆</span>
    <span className="absolute top-2 right-2 text-[#E4BC62]/25 text-[10px]">◆</span>
    <div className="border border-[#E4BC62]/20 px-6 py-5 relative overflow-hidden">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <div className="flex items-center gap-2 mb-1 relative">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E4BC62] pulse-dot" />
        <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em]">Account</p>
      </div>
      <h1 className="text-xl font-bold text-white relative">Settings</h1>
      <p className="text-xs text-[#DDDED9]/50 mt-1 relative">Manage your profile and wedding details</p>
    </div>
  </div>
);
