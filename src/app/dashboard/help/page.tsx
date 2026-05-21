'use client';

import { useState } from 'react';
import { FAQ_ITEMS } from '@/constants/help';
import {
  HelpHeader,
  HelpSearchHero,
  HelpCategories,
  FaqAccordion,
  HelpGuides,
  ContactOptions,
  PremiumNudge,
} from '@/features/help';

const FAQ_CATEGORIES = Array.from(new Set(FAQ_ITEMS.map(f => f.category)));

const HelpPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search,         setSearch]         = useState('');

  const filtered = FAQ_ITEMS.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch   = search === '' || item.question.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSearch('');
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      <HelpHeader />

      <HelpSearchHero search={search} onChange={setSearch} />

      <HelpCategories activeCategory={activeCategory} onChange={handleCategoryChange} />

      <FaqAccordion
        filtered={filtered}
        activeCategory={activeCategory}
        faqCategories={FAQ_CATEGORIES}
        onCategoryChange={setActiveCategory}
        onClearFilters={() => { setSearch(''); setActiveCategory('All'); }}
      />

      <HelpGuides />

      <ContactOptions />

      <PremiumNudge />

    </div>
  );
};

export default HelpPage;
