import React from 'react';
import { Search } from 'lucide-react';
import { TenantPropertySortOption } from '../../../modules/property/property.types';
import { Input } from '../../../components/atoms/Input';
import { Select } from '../../../components/atoms/Select';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  sortBy: TenantPropertySortOption;
  onSortChange: (val: TenantPropertySortOption) => void;
  selectedCategory?: string;
  onSelectCategory: (id?: string) => void;
  categories?: Array<{ id: string; name: string }>;
}

const getBadgeClass = (active: boolean) =>
  `px-3 py-1 rounded-full text-xs shrink-0 cursor-pointer transition-colors ${
    active ? 'bg-primary-600 text-white font-semibold' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
  }`;

type CategoryBadgesProps = { categories?: Array<{ id: string; name: string }>; selectedCategory?: string; onSelectCategory: (id?: string) => void };

function CategoryBadges({ categories, selectedCategory, onSelectCategory }: CategoryBadgesProps): React.JSX.Element {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none items-center">
      <span className="text-xs font-medium text-gray-500 mr-1 shrink-0">Kategori:</span>
      <button type="button" onClick={() => onSelectCategory(undefined)} className={getBadgeClass(!selectedCategory)}>Semua</button>
      {categories?.map((c) => (
        <button key={c.id} type="button" onClick={() => onSelectCategory(c.id)} className={getBadgeClass(selectedCategory === c.id)}>{c.name}</button>
      ))}
    </div>
  );
}

function SortSelect({ sortBy, onSortChange }: { sortBy: TenantPropertySortOption; onSortChange: (v: TenantPropertySortOption) => void }) {
  return (
    <div className="w-full sm:w-52">
      <Select value={sortBy} onChange={(e) => onSortChange(e.target.value as TenantPropertySortOption)} size="md">
        <option value="createdAt_desc">Terbaru</option><option value="createdAt_asc">Terlama</option>
        <option value="title_asc">Nama: A - Z</option><option value="title_desc">Nama: Z - A</option>
        <option value="city_asc">Kota: A - Z</option>
      </Select>
    </div>
  );
}

export function TenantPropertyFilterBar({ search, onSearchChange, sortBy, onSortChange, selectedCategory, onSelectCategory, categories }: FilterBarProps): React.JSX.Element {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Cari properti berdasarkan judul, kota, atau alamat..." leftIcon={<Search className="w-4 h-4 text-gray-400" />} />
        </div>
        <SortSelect sortBy={sortBy} onSortChange={onSortChange} />
      </div>
      <CategoryBadges categories={categories} selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} />
    </div>
  );
}
