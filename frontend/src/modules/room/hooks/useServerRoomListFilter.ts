import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { roomApi } from '../services/room.api';
import { Room } from '../room.types';
import {
  BaseRoomFilterItem,
  UseRoomListFilterOptions,
  UseRoomListFilterReturn,
} from '../room-filter.types';
import {
  useFilterState,
  matchesQuery,
  compareBySort,
  paginateList,
} from './useRoomListFilter';

export function useServerRoomListFilter<T extends BaseRoomFilterItem = Room>(
  propertyId?: string,
  opts: UseRoomListFilterOptions<T> = {}
): UseRoomListFilterReturn<T> {
  const pageSize = opts.pageSize || 5;
  const state = useFilterState();

  const { data, isLoading } = useQuery({
    queryKey: [
      'rooms-server-list',
      propertyId,
      {
        search: state.searchQuery.trim() || undefined,
        sortBy: state.sortBy,
        page: state.currentPage,
        limit: pageSize,
      },
    ],
    queryFn: async () => {
      if (!propertyId) throw new Error('ID properti wajib diisi');
      const res = await roomApi.getRoomsByProperty(propertyId, {
        search: state.searchQuery.trim() || undefined,
        sortBy: state.sortBy,
        page: state.currentPage,
        limit: pageSize,
      });
      return res ?? { success: true, message: 'OK', data: [] };
    },
    enabled: Boolean(propertyId),
  });

  const { paginatedRooms, totalFiltered, totalPages } = useMemo(() => {
    if (data?.data) {
      const serverRooms = data.data as unknown as T[];
      const total = data.meta?.totalItems ?? serverRooms.length;
      const pages = Math.max(
        1,
        data.meta?.totalPages ?? (total > 0 ? Math.ceil(total / pageSize) : 1)
      );
      return {
        paginatedRooms: serverRooms,
        totalFiltered: total,
        totalPages: pages,
      };
    }

    if (opts.initialRooms && opts.initialRooms.length > 0) {
      const filtered = opts.initialRooms.filter((r) =>
        matchesQuery(r, state.searchQuery)
      );
      const sorted = [...filtered].sort((a, b) =>
        compareBySort(a, b, state.sortBy)
      );
      const total = sorted.length;
      const pages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(state.currentPage, pages);
      const paginated = paginateList(sorted, safePage, pageSize);
      return {
        paginatedRooms: paginated,
        totalFiltered: total,
        totalPages: pages,
      };
    }

    return {
      paginatedRooms: [] as T[],
      totalFiltered: 0,
      totalPages: 1,
    };
  }, [
    data,
    opts.initialRooms,
    state.searchQuery,
    state.sortBy,
    state.currentPage,
    pageSize,
  ]);

  return {
    ...state,
    pageSize,
    totalFiltered,
    totalPages,
    paginatedRooms,
    isLoading,
  };
}
