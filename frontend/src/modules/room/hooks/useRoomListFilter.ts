import { useState, useMemo } from 'react';
import { Room } from '../room.types';
import {
  RoomSortOption,
  UseRoomListFilterOptions,
  UseRoomListFilterReturn,
} from '../room-filter.types';

function matchesQuery(room: Room, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const nameMatch = room.name.toLowerCase().includes(q);
  const descMatch = room.description?.toLowerCase().includes(q) ?? false;
  return nameMatch || descMatch;
}

function compareBySort(a: Room, b: Room, sort: RoomSortOption): number {
  switch (sort) {
    case 'price_asc': return a.basePrice - b.basePrice;
    case 'price_desc': return b.basePrice - a.basePrice;
    case 'name_asc': return a.name.localeCompare(b.name);
    case 'name_desc': return b.name.localeCompare(a.name);
    case 'units_desc': return b.totalUnits - a.totalUnits;
    default: return 0;
  }
}

function paginateList(items: Room[], page: number, pageSize: number): Room[] {
  const startIndex = (page - 1) * pageSize;
  return items.slice(startIndex, startIndex + pageSize);
}

function useFilterState() {
  const [searchQuery, setSearchQueryState] = useState('');
  const [sortBy, setSortByState] = useState<RoomSortOption>('price_asc');
  const [currentPage, setCurrentPage] = useState(1);
  const setSearchQuery = (q: string) => { setSearchQueryState(q); setCurrentPage(1); };
  const setSortBy = (s: RoomSortOption) => { setSortByState(s); setCurrentPage(1); };
  const resetFilters = () => { setSearchQueryState(''); setSortByState('price_asc'); setCurrentPage(1); };
  return { searchQuery, setSearchQuery, sortBy, setSortBy, currentPage, setCurrentPage, resetFilters };
}

function useProcessedRooms(rooms: Room[], query: string, sort: RoomSortOption) {
  const filtered = useMemo(() => rooms.filter((r) => matchesQuery(r, query)), [rooms, query]);
  return useMemo(() => [...filtered].sort((a, b) => compareBySort(a, b, sort)), [filtered, sort]);
}

function usePaginationCalc(total: number, curPage: number, size: number) {
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(curPage, totalPages);
  return { totalPages, safePage };
}

export function useRoomListFilter(rooms: Room[], opts: UseRoomListFilterOptions = {}): UseRoomListFilterReturn {
  const pageSize = opts.pageSize || 5;
  const state = useFilterState();
  const sorted = useProcessedRooms(rooms, state.searchQuery, state.sortBy);
  const { totalPages, safePage } = usePaginationCalc(sorted.length, state.currentPage, pageSize);
  const paginated = useMemo(() => paginateList(sorted, safePage, pageSize), [sorted, safePage, pageSize]);
  return {
    ...state, currentPage: safePage, pageSize,
    totalFiltered: sorted.length, totalPages, paginatedRooms: paginated,
  };
}
