import Image from 'next/image';
import { GALLERY_IMAGES } from '@/constants/landing';

const cardRotations = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-3', 'rotate-1'];
const tapeStyles = [
  'bg-[#E4BC62]/65 -rotate-3',
  'bg-[#DFB3AE]/80  rotate-2',
  'bg-[#DDDED9]     -rotate-2',
  'bg-[#E4BC62]/55  rotate-3',
  'bg-[#DFB3AE]/70 -rotate-1',
  'bg-[#E4BC62]/70  rotate-2',
];

export const GallerySection = () => (
  <section id="gallery" className="py-24 px-6 bg-[#DDDED9]">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-4">
        <span className="inline-block mb-3 text-sm font-semibold text-[#E4BC62] uppercase tracking-widest">
          Our Work
        </span>
        <h2 className="text-4xl font-bold text-[#23292E]">Magical Moments</h2>
        <p className="mt-4 text-zinc-500 max-w-xl mx-auto">
          A glimpse of the love stories we&apos;ve been honoured to bring to life.
        </p>
      </div>

      {/* Polaroid scatter wall */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-14 pt-10">
        {GALLERY_IMAGES.map((img, i) => (
          <div
            key={i}
            className={`group relative bg-white p-2.5 pb-9 rounded-[2px] shadow-2xl shadow-[#23292E]/30 cursor-pointer
              ${cardRotations[i % cardRotations.length]}
              hover:rotate-0 hover:-translate-y-4
              hover:shadow-[0_24px_60px_-8px_rgba(35,41,46,0.35)]
              transition-all duration-300 ease-out`}
          >
            {/* Washi tape strip */}
            <div
              className={`absolute -top-3.5 left-1/2 -translate-x-1/2 w-14 h-[18px] rounded-[3px] opacity-90 pointer-events-none z-10 ${tapeStyles[i % tapeStyles.length]}`}
            />

            {/* Photo */}
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                className="transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <p className="text-center mt-2 text-[11px] font-medium text-zinc-400 tracking-widest uppercase">
              {img.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
