import { SERVICES } from '@/constants/landing';

export const ServicesSection = () => (
  <section id="services" className="py-24 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-block mb-3 text-sm font-semibold text-[#E4BC62] uppercase tracking-widest">
          What We Do
        </span>
        <h2 className="text-4xl font-bold text-[#23292E]">Every celebration, covered</h2>
        <p className="mt-4 text-zinc-500 max-w-xl mx-auto leading-relaxed">
          From the first planning meeting to the final farewell, our team
          handles every element of your special day.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {SERVICES.map((s, i) => (
          <div
            key={s.title}
            className="service-card card-hover animate-fade-in-up group relative overflow-hidden rounded-2xl border border-[#DDDED9] bg-white p-7 shadow-sm hover:border-[#DFB3AE] hover:bg-[#DDDED9]/10 transition-colors duration-300"
          >
            {/* Decorative background number */}
            <span className="pointer-events-none absolute -right-1 -top-3 select-none text-8xl font-black leading-none text-[#DDDED9]/70 transition-colors duration-300 group-hover:text-[#DFB3AE]/40">
              {String(i + 1).padStart(2, '0')}
            </span>

            {/* Gold accent bar */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r from-[#E4BC62] to-[#DFB3AE] transition-[width] duration-500 ease-out group-hover:w-full" />

            <span className="service-icon mb-4 block w-fit text-4xl">{s.icon}</span>

            <h3 className="text-lg font-bold text-[#23292E] mb-2 transition-colors">
              {s.title}
            </h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
