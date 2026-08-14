import React from 'react';

const CATEGORIES = [
  { id: 'all', label: 'All News' },
  { id: 'breakthrough', label: 'Breakthroughs' },
  { id: 'clinical', label: 'Clinical & Health' },
  { id: 'technology', label: 'Tech & AI' },
  { id: 'environment', label: 'Environment' },
  { id: 'space', label: 'Space & Physics' },
  { id: 'policy', label: 'Policy & Society' }
];

const CategoryFilter = ({ activeCategory = 'all', onChange }) => {
  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
      {CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            onClick={() => onChange && onChange(cat.id)}
            className={`flex shrink-0 items-center rounded-[8px] px-3.5 py-1.5 text-xs transition-all cursor-pointer ${
              isActive
                ? 'bg-[#315CFF] font-semibold text-white shadow-xs rounded-[8px]'
                : 'border border-[#E5E5DF] bg-white font-medium text-slate-700 hover:bg-[#F3F3EF] rounded-[8px]'
            }`}
          >
            <span className="whitespace-nowrap">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
