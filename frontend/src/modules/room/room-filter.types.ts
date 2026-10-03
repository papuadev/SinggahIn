import { Room } from './room.types';

export type RoomSortOption =
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'units_desc';

export interface SortOptionItem {
  value: RoomSortOption;
  label: string;
}

export const ROOM_SORT_OPTIONS: SortOptionItem[] = [
  { value: 'price_asc', label: 'Harga: Terendah ke Tertinggi' },
  { value: 'price_desc', label: 'Harga: Tertinggi ke Terendah' },
  { value: 'name_asc', label: 'Nama: A ke Z' },
  { value: 'name_desc', label: 'Nama: Z ke A' },
  { value: 'units_desc', label: 'Jumlah Unit: Terbanyak' },
];

export interface UseRoomListFilterOptions {
  pageSize?: number;
}

export interface UseRoomListFilterReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: RoomSortOption;
  setSortBy: (sort: RoomSortOption) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalFiltered: number;
  totalPages: number;
  paginatedRooms: Room[];
  resetFilters: () => void;
}
