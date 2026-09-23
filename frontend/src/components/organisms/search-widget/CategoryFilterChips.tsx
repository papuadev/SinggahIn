import React from 'react';

export interface CategoryOption {
  label: string;
  slug: string;
}

export const QUICK_CATEGORIES: CategoryOption[] = [
  { label: 'Semua', slug: '' },
  { label: 'Villa', slug: 'villa' },
  { label: 'Hotel', slug: 'hotel' },
  { label: 'Apartemen', slug: 'apartemen' },
  { label: 'Homestay', slug: 'homestay' },
  { label: 'Guesthouse', slug: 'guesthouse' },
  { label: 'Others', slug: 'others' },
];

function CategoryChip({
  cat,
  isActive,
  onSelect,
}: {
  cat: CategoryOption;
  isActive: boolean;
  onSelect: (slug: string) => void;
}) {
  const cls = isActive
    ? 'bg-primary-600 text-white font-semibold shadow-sm'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  return (
    <button
      type="button"
      onClick={() => onSelect(cat.slug)}
      className={`px-3.5 py-1.5 rounded-full text-xs transition-colors shrink-0 ${cls}`}
    >
      {cat.label}
    </button>
  );
}

export function CategoryFilterChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (slug: string) => void;
}): React.JSX.Element {
  return (
    <div aria-label="Filter kategori cepat" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
      {QUICK_CATEGORIES.map((cat) => (
        <CategoryChip key={cat.slug || 'all'} cat={cat} isActive={selected === cat.slug} onSelect={onSelect} />
      ))}
    </div>
  );
}
