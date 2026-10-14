import React, { useContext } from 'react';
import { QueryClientContext } from '@tanstack/react-query';
import { usePropertyCategories } from '../../../modules/property/hooks/useProperties';
import { PropertyCategory } from '../../../modules/property/property.types';

export interface CategoryOption {
  label: string;
  slug: string;
  isProtected?: boolean;
  propertyCount?: number;
}

export const QUICK_CATEGORIES: CategoryOption[] = [
  { label: 'Semua', slug: '', isProtected: true },
  { label: 'Villa', slug: 'villa', isProtected: true },
  { label: 'Hotel', slug: 'hotel', isProtected: true },
  { label: 'Apartemen', slug: 'apartemen', isProtected: true },
  { label: 'Homestay', slug: 'homestay', isProtected: true },
  { label: 'Guesthouse', slug: 'guesthouse', isProtected: true },
  { label: 'Others', slug: 'others', isProtected: true },
];

function CategoryChip({
  cat, isActive, onSelect,
}: {
  cat: CategoryOption; isActive: boolean; onSelect: (slug: string) => void;
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

function ChipsTrack({
  categories, selected, onSelect,
}: {
  categories: CategoryOption[]; selected: string; onSelect: (s: string) => void;
}) {
  return (
    <div aria-label="Filter kategori cepat" className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
      {categories.map((cat) => (
        <CategoryChip key={cat.slug || 'all'} cat={cat} isActive={selected === cat.slug} onSelect={onSelect} />
      ))}
    </div>
  );
}

function orderCategoryOptions(list: CategoryOption[]): CategoryOption[] {
  const allChip = list.find((c) => c.slug === '');
  const system = list.filter((c) => c.slug !== '' && c.isProtected !== false);
  const custom = list.filter((c) => c.slug !== '' && c.isProtected === false && (c.propertyCount === undefined || c.propertyCount > 0));
  return allChip ? [allChip, ...system, ...custom] : [...system, ...custom];
}

function resolveCategories(data?: PropertyCategory[]): CategoryOption[] {
  if (!data || data.length === 0) return QUICK_CATEGORIES;
  const system = data.filter((c) => c.isProtected).map((c) => ({ label: c.name, slug: c.slug, isProtected: true }));
  const custom = data
    .filter((c) => !c.isProtected && ((c.propertyCount ?? c._count?.properties ?? 0) > 0))
    .map((c) => ({ label: c.name, slug: c.slug, isProtected: false }));
  return [{ label: 'Semua', slug: '', isProtected: true }, ...system, ...custom];
}

function DynamicChips({ selected, onSelect }: { selected: string; onSelect: (slug: string) => void }) {
  const { data } = usePropertyCategories(true);
  const categories = resolveCategories(data);
  return <ChipsTrack categories={categories} selected={selected} onSelect={onSelect} />;
}

export function CategoryFilterChips({
  selected, onSelect, categories,
}: {
  selected: string; onSelect: (slug: string) => void; categories?: CategoryOption[];
}): React.JSX.Element {
  const queryClient = useContext(QueryClientContext);
  if (categories || !queryClient) {
    const list = orderCategoryOptions(categories || QUICK_CATEGORIES);
    return <ChipsTrack categories={list} selected={selected} onSelect={onSelect} />;
  }
  return <DynamicChips selected={selected} onSelect={onSelect} />;
}
