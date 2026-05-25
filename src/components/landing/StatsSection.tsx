import { STATS } from '@/constants/landing';

export const StatsSection = () => (
  <section className="py-20 px-6 bg-dark">
    <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 text-center text-white">
      {STATS.map((s) => (
        <div key={s.label} className="animate-fade-in-up">
          <p className="text-4xl sm:text-5xl font-extrabold text-gold">{s.value}</p>
          <p className="mt-2 text-sm font-medium text-silver">{s.label}</p>
        </div>
      ))}
    </div>
  </section>
);
