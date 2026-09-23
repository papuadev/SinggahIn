import React from 'react';
import { ArrowUpDown } from 'lucide-react';

export type SortValue = 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'rating_desc';

interface CatalogSortSelectProps {
  sortBy: 'price' | 'name' | 'rating';
  sortOrder: 'asc' | 'desc';
  onChange: (sortBy: 'price' | 'name' | 'rating', sortOrder: 'asc' | 'desc') => void;
}

const SORT_OPTIONS: { label: string; value: SortValue }[] = [
  { label: 'Harga: Terendah ke Tertinggi', value: 'price_asc' },
  { label: 'Harga: Tertinggi ke Terendah', value: 'price_desc' },
  { label: 'Rating: Tertinggi', value: 'rating_desc' },
  { label: 'Nama: A — Z', value: 'name_asc' },
  { label: 'Nama: Z — A', value: 'name_desc' },
];

function useSortChange(onChange: (by: 'price' | 'name' | 'rating', order: 'asc' | 'desc') => void) {
  return (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as SortValue;
    const [by, order] = val.split('_') as ['price' | 'name' | 'rating', 'asc' | 'desc'];
    onChange(by, order);
  };
}

function SortLabel() {
  return (
    <span className="text-xs font-semibold text-gray-500 hidden sm:flex items-center gap-1 shrink-0">
      <ArrowUpDown className="w-3.5 h-3.5 text-primary-600" />
      Urutkan:
    </span>
  );
}

function SortDropdown({ val, onChange }: { val: SortValue; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) {
  return (
    <select value={val} onChange={onChange} aria-label="Urutkan hasil pencarian" className="text-xs sm:text-sm font-medium border border-gray-200 rounded-xl px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all">
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

export function CatalogSortSelect({ sortBy, sortOrder, onChange }: CatalogSortSelectProps): React.JSX.Element {
  const currentVal = `${sortBy}_${sortOrder}` as SortValue;
  const handleChange = useSortChange(onChange);
  return (
    <div className="flex items-center gap-2">
      <SortLabel />
      <SortDropdown val={currentVal} onChange={handleChange} />
    </div>
  );
}
