import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Select } from '../../atoms/Select';

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
    <Select
      size="sm"
      value={val}
      onChange={onChange}
      aria-label="Urutkan hasil pencarian"
      wrapperClassName="w-auto"
      className="font-medium border-gray-200 rounded-xl text-gray-800"
    >
      {SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </Select>
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
