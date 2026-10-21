import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../services/room.api';
import { Room } from '../room.types';
import {
  BaseRoomFilterItem,
  UseRoomListFilterOptions,
  UseRoomListFilterReturn,
} from '../room-filter.types';
import { useFilterState } from './useRoomListFilter';
import { useDebounce } from '../../../libs/useDebounce';

function getInitialRoomData<T>(initialRooms?: T[], pageSize = 5) {
  if (!initialRooms || initialRooms.length === 0) return undefined;
  const total = initialRooms.length;
  return {
    success: true as const, message: 'OK',
    data: initialRooms.slice(0, pageSize) as unknown as Room[],
    meta: { page: 1, limit: pageSize, totalItems: total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
  };
}

async function fetchServerRooms(propertyId?: string, search?: string, sortBy?: string, page = 1, limit = 5) {
  if (!propertyId) throw new Error('ID properti wajib diisi');
  const res = await roomApi.getRoomsByProperty(propertyId, { search, sortBy, page, limit });
  return res ?? { success: true, message: 'OK', data: [] };
}

function parseServerRoomPagination<T>(data: any, pageSize: number) {
  if (!data?.data) return { paginatedRooms: [] as T[], totalFiltered: 0, totalPages: 1 };
  const rooms = data.data as unknown as T[];
  const total = data.meta?.totalItems ?? rooms.length;
  const pages = Math.max(1, data.meta?.totalPages ?? (total > 0 ? Math.ceil(total / pageSize) : 1));
  return { paginatedRooms: rooms, totalFiltered: total, totalPages: pages };
}

function useRoomsQuery<T>(propertyId: string | undefined, search: string, sortBy: string, page: number, pageSize: number, initialRooms?: T[]) {
  const querySearch = search.trim() || undefined;
  const isDefault = !querySearch && sortBy === 'price_asc' && page === 1;
  return useQuery({
    queryKey: ['rooms-server-list', propertyId, { search: querySearch, sortBy, page, limit: pageSize }],
    queryFn: () => fetchServerRooms(propertyId, querySearch, sortBy, page, pageSize),
    initialData: isDefault ? getInitialRoomData(initialRooms, pageSize) : undefined,
    enabled: Boolean(propertyId),
  });
}

export function useServerRoomListFilter<T extends BaseRoomFilterItem = Room>(propertyId?: string, opts: UseRoomListFilterOptions<T> = {}): UseRoomListFilterReturn<T> {
  const pageSize = opts.pageSize || 5;
  const state = useFilterState();
  const debouncedSearch = useDebounce(state.searchQuery, 300);
  const { data, isLoading } = useRoomsQuery(propertyId, debouncedSearch, state.sortBy, state.currentPage, pageSize, opts.initialRooms);
  const pagination = useMemo(() => parseServerRoomPagination<T>(data, pageSize), [data, pageSize]);
  return { ...state, pageSize, ...pagination, isLoading };
}
