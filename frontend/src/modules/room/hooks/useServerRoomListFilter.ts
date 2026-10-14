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

export function useServerRoomListFilter<T extends BaseRoomFilterItem = Room>(
  propertyId?: string,
  opts: UseRoomListFilterOptions<T> = {}
): UseRoomListFilterReturn<T> {
  const pageSize = opts.pageSize || 5;
  const state = useFilterState();
  const debouncedSearch = useDebounce(state.searchQuery, 300);

  const { data, isLoading } = useQuery({
    queryKey: [
      'rooms-server-list',
      propertyId,
      {
        search: debouncedSearch.trim() || undefined,
        sortBy: state.sortBy,
        page: state.currentPage,
        limit: pageSize,
      },
    ],
    queryFn: async () => {
      if (!propertyId) throw new Error('ID properti wajib diisi');
      const res = await roomApi.getRoomsByProperty(propertyId, {
        search: debouncedSearch.trim() || undefined,
        sortBy: state.sortBy,
        page: state.currentPage,
        limit: pageSize,
      });
      return res ?? { success: true, message: 'OK', data: [] };
    },
    initialData:
      opts.initialRooms &&
      opts.initialRooms.length > 0 &&
      !debouncedSearch &&
      state.sortBy === 'price_asc' &&
      state.currentPage === 1
        ? {
            success: true,
            message: 'OK',
            data: opts.initialRooms.slice(0, pageSize) as unknown as Room[],
            meta: {
              page: 1,
              limit: pageSize,
              totalItems: opts.initialRooms.length,
              totalPages: Math.max(1, Math.ceil(opts.initialRooms.length / pageSize)),
            },
          }
        : undefined,
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

    return {
      paginatedRooms: [] as T[],
      totalFiltered: 0,
      totalPages: 1,
    };
  }, [data, pageSize]);

  return {
    ...state,
    pageSize,
    totalFiltered,
    totalPages,
    paginatedRooms,
    isLoading,
  };
}
