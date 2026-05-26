'use client';

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const FaqRow = ({ question, answer }: FaqItem) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-silver dark:border-[#3D3268] last:border-0 transition-colors ${open ? 'bg-silver/8 dark:bg-silver/5' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left group"
      >
        <span className={`text-sm font-semibold leading-snug transition-colors ${open ? 'text-gold' : 'text-dark dark:text-white group-hover:text-blush'}`}>
          {question}
        </span>
        <span className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center text-[10px] transition-all duration-200 ${
          open ? 'bg-gold border-gold text-dark rotate-45' : 'border-silver dark:border-[#3D3268] text-dark/40 dark:text-silver/40'
        }`}>
          ✦
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-zinc-500 dark:text-silver/60 leading-relaxed border-l-2 border-gold/40 pl-4">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
};

interface FaqAccordionProps {
  filtered: FaqItem[];
  activeCategory: string;
  faqCategories: string[];
  onCategoryChange: (cat: string) => void;
  onClearFilters: () => void;
}

export const FaqAccordion = ({
  filtered, activeCategory, faqCategories, onCategoryChange, onClearFilters,
}: FaqAccordionProps) => (
  <div className="bg-card rounded-2xl shadow-lg ring-1 ring-silver/20 dark:ring-white/5 overflow-hidden">
    <div className="flex items-center justify-between px-6 py-4 border-b border-silver/30 dark:border-white/5 bg-silver/10 dark:bg-silver/5">
      <div className="flex items-center gap-3">
        <span className="text-gold text-[10px] tracking-[0.3em]">◆</span>
        <h2 className="text-sm font-bold text-dark dark:text-white uppercase tracking-widest">
          Frequently Asked Questions
        </h2>
      </div>
      <div className="hidden sm:flex items-center gap-1.5">
        {['All', ...faqCategories].map(cat => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider border transition-colors ${
              activeCategory === cat
                ? 'rounded-lg bg-blush/15 dark:bg-[#1E1840] border-blush/40 dark:border-gold/30 text-blush dark:text-gold'
                : 'rounded-lg border-silver dark:border-[#3D3268] text-zinc-400 dark:text-silver/50 hover:border-blush hover:text-dark dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>

    {filtered.length > 0 ? (
      filtered.map((item, i) => (
        <FaqRow key={i} question={item.question} answer={item.answer} />
      ))
    ) : (
      <div className="py-12 text-center">
        <p className="text-2xl mb-2">◆</p>
        <p className="text-sm font-semibold text-dark dark:text-white">No results found</p>
        <p className="text-xs text-zinc-400 dark:text-silver/50 mt-1">Try a different search term or browse all categories</p>
        <button
          onClick={onClearFilters}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl border border-silver dark:border-[#3D3268] text-zinc-500 dark:text-silver/60 hover:border-blush hover:text-dark dark:hover:text-white transition-colors"
        >
          Clear filters
        </button>
      </div>
    )}
  </div>
);