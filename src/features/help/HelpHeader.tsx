export const HelpHeader = () => (
  <div className="bg-dark p-[3px] glow-gold-strong relative">
    <span className="absolute top-2 left-2 text-gold/25 text-[10px]">◆</span>
    <span className="absolute top-2 right-2 text-gold/25 text-[10px]">◆</span>
    <div className="border border-gold/20 px-6 py-5 relative overflow-hidden">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <div className="flex items-center gap-2 mb-1 relative">
        <span className="w-1.5 h-1.5 rounded-full bg-gold pulse-dot" />
        <p className="text-[10px] font-bold text-gold uppercase tracking-[0.4em]">Support</p>
      </div>
      <h1 className="text-xl font-bold text-white relative">Help &amp; Support</h1>
      <p className="text-xs text-silver/50 mt-1 relative">Find answers, guides, and ways to reach our team</p>
    </div>
  </div>
);
