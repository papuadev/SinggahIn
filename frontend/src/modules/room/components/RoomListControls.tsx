import React from 'react';
import { Search, X, ArrowUpDown } from 'lucide-react';
import { RoomSortOption, ROOM_SORT_OPTIONS } from '../room-filter.types';

export interface RoomListControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: RoomSortOption;
  onSortChange: (sort: RoomSortOption) => void;
}

type SearchInputProps = { value: string; onChange: (v: string) => void };
type SortSelectProps = { value: RoomSortOption; onChange: (v: RoomSortOption) => void };

const SEARCH_CLS = 'w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all';
const SORT_CLS = 'w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer font-medium text-gray-700';

function ClearButton({ onClear }: { onClear: () => void }): React.JSX.Element {
  return (
    <button
      type="button" onClick={onClear} aria-label="Hapus pencarian"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-md"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  );
}

function SearchInputField({ value, onChange }: SearchInputProps): React.JSX.Element {
  return (
    <div className="relative flex-1">
      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="Cari tipe kamar..." aria-label="Cari tipe kamar" className={SEARCH_CLS}
      />
      {value && <ClearButton onClear={() => onChange('')} />}
    </div>
  );
}

function SortOptions(): React.JSX.Element {
  return (
    <>
      {ROOM_SORT_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </>
  );
}

function SortSelectField({ value, onChange }: SortSelectProps): React.JSX.Element {
  return (
    <div className="relative flex items-center min-w-[200px]">
      <ArrowUpDown className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
      <select
        value={value} onChange={(e) => onChange(e.target.value as RoomSortOption)}
        aria-label="Urutkan kamar" className={SORT_CLS}
      >
        <SortOptions />
      </select>
    </div>
  );
}

export function RoomListControls({
  searchQuery, onSearchChange, sortBy, onSortChange,
}: RoomListControlsProps): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 bg-gray-50/70 border border-gray-200/80 rounded-2xl">
      <SearchInputField value={searchQuery} onChange={onSearchChange} />
      <SortSelectField value={sortBy} onChange={onSortChange} />
    </div>
  );
}
