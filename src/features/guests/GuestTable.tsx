import type { Guest } from '@/constants/dashboard-pages';
import { RSVP_META, AVATAR_COLORS } from '@/constants/guests';

const Initials = ({ name }: { name: string }) => {
  const p = name.split(' ');
  return <>{p[0]?.[0]}{p[1]?.[0] ?? ''}</>;
};

interface GuestTableProps {
  guests: Guest[];
  onEditGuest: (g: Guest) => void;
}

export const GuestTable = ({ guests, onEditGuest }: GuestTableProps) => {
  if (guests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 border border-dashed border-[#E4BC62]/20 bg-[#E4BC62]/3">
        <span className="text-4xl text-[#E4BC62]/20">◎</span>
        <div className="text-center">
          <p className="text-sm font-bold text-[#DDDED9]/40">No guests yet</p>
          <p className="text-xs text-[#DDDED9]/25 mt-1">Add your first guest using the button above</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-[#DDDED9] dark:border-[#2a2f33] overflow-hidden shadow-crystal">
      <div className="grid grid-cols-[2fr_1fr_1fr_auto_auto] items-center gap-4 px-5 py-3 bg-[#23292E] border-b border-[#E4BC62]/10">
        {['Guest', 'RSVP', 'Meal', '+1', ''].map((h, i) => (
          <p key={i} className="text-[9px] font-bold text-[#DDDED9]/35 uppercase tracking-[0.35em]">{h}</p>
        ))}
      </div>

      <div className="divide-y divide-[#DDDED9]/40 dark:divide-[#2a2f33]">
        {guests.map((g, i) => {
          const meta  = RSVP_META[g.rsvp];
          const avcls = AVATAR_COLORS[i % AVATAR_COLORS.length];
          return (
            <div
              key={g._id}
              className={`grid grid-cols-[2fr_1fr_1fr_auto_auto] items-center gap-4 px-5 py-3 border-l-[3px] transition-all duration-200 row-reveal group ${meta.stripe} ${meta.row} hover:bg-gradient-to-r hover:from-[#DDDED9]/8 hover:to-transparent`}
              style={{ animationDelay: `${i * 0.025}s` }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 transition-all duration-200 group-hover:scale-110 ${avcls}`}>
                  <Initials name={g.name} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#23292E] dark:text-[#FDFDF8] truncate">{g.name}</p>
                  <p className="text-[10px] text-zinc-400 dark:text-[#DDDED9]/50 truncate">{g.relation}{g.phone ? ` · ${g.phone}` : ''}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${meta.dot}`} />
                <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide whitespace-nowrap ${meta.badge}`}>
                  {meta.label}
                </span>
              </div>

              <p className="text-xs text-zinc-400 dark:text-[#DDDED9]/50 hidden md:block">{g.meal}</p>

              <div>
                {g.plusOne
                  ? <span className="w-6 h-6 bg-[#E4BC62]/15 border border-[#E4BC62]/30 text-[#E4BC62] text-[11px] font-bold flex items-center justify-center">✓</span>
                  : <span className="text-[#DDDED9] text-xs">—</span>
                }
              </div>

              <button
                onClick={() => onEditGuest(g)}
                className="px-2 py-1 text-[10px] font-bold border border-zinc-300 dark:border-[#DDDED9]/20 text-zinc-500 dark:text-[#DDDED9]/50 hover:border-[#E4BC62] hover:text-[#E4BC62] hover:bg-[#E4BC62]/8 transition-colors whitespace-nowrap"
              >
                Edit
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
