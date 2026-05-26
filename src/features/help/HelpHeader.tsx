export const HelpHeader = () => (
  <div className="rounded-2xl overflow-hidden glow-gold-strong relative">
    <span className="absolute top-2 left-2 text-gold/25 text-[10px] z-10">◆</span>
    <span className="absolute top-2 right-2 text-gold/25 text-[10px] z-10">◆</span>
    <div className="bg-card dark:bg-[#2A1F52] rounded-2xl border border-blush/20 dark:border-gold/20 px-6 py-5 relative overflow-hidden">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <div className="flex items-center gap-2 mb-1 relative">
        <span className="w-1.5 h-1.5 rounded-full bg-blush dark:bg-gold pulse-dot" />
        <p className="text-[10px] font-bold text-blush dark:text-gold uppercase tracking-[0.4em]">Support</p>
      </div>
      <h1 className="text-xl font-bold text-dark dark:text-white relative">Help &amp; Support</h1>
      <p className="text-xs text-silver dark:text-silver/50 mt-1 relative">Find answers, guides, and ways to reach our team</p>
    </div>
  </div>
);
