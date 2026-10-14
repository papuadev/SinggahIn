import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useServerRoomListFilter } from '../hooks/useServerRoomListFilter';
import { roomApi } from '../services/room.api';
import { Room } from '../room.types';

vi.mock('../services/room.api', () => ({
  roomApi: {
    getRoomsByProperty: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

const mockRooms: Room[] = [
  {
    id: 'r-1',
    propertyId: 'prop-1',
    name: 'Standard Room',
    basePrice: 150000,
    capacity: 2,
    totalUnits: 5,
    description: 'Cozy standard room',
  },
  {
    id: 'r-2',
    propertyId: 'prop-1',
    name: 'Deluxe Room',
    basePrice: 300000,
    capacity: 2,
    totalUnits: 3,
    description: 'Luxury deluxe room',
  },
];

describe('useServerRoomListFilter Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('queries roomApi with default parameters and returns server rooms', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: mockRooms,
      meta: {
        page: 1,
        limit: 5,
        totalItems: 2,
        totalPages: 1,
      },
    });

    const { result } = renderHook(
      () => useServerRoomListFilter('prop-1', { pageSize: 5 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.paginatedRooms).toHaveLength(2);
      expect(result.current.totalFiltered).toBe(2);
      expect(result.current.totalPages).toBe(1);
    });

    expect(roomApi.getRoomsByProperty).toHaveBeenCalledWith('prop-1', {
      search: undefined,
      sortBy: 'price_asc',
      page: 1,
      limit: 5,
    });
  });

  it('updates query when search query changes and resets page to 1', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValue({
      success: true,
      message: 'OK',
      data: [mockRooms[1]],
      meta: { page: 1, limit: 5, totalItems: 1, totalPages: 1 },
    });

    const { result } = renderHook(
      () => useServerRoomListFilter('prop-1', { pageSize: 5 }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.setCurrentPage(2);
    });

    act(() => {
      result.current.setSearchQuery('Deluxe');
    });

    expect(result.current.currentPage).toBe(1);

    await waitFor(() => {
      expect(roomApi.getRoomsByProperty).toHaveBeenCalledWith('prop-1', {
        search: 'Deluxe',
        sortBy: 'price_asc',
        page: 1,
        limit: 5,
      });
    });
  });

  it('updates query when sort option changes', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockRooms,
      meta: { page: 1, limit: 5, totalItems: 2, totalPages: 1 },
    });

    const { result } = renderHook(
      () => useServerRoomListFilter('prop-1', { pageSize: 5 }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.setSortBy('price_desc');
    });

    await waitFor(() => {
      expect(roomApi.getRoomsByProperty).toHaveBeenCalledWith('prop-1', {
        search: undefined,
        sortBy: 'price_desc',
        page: 1,
        limit: 5,
      });
    });
  });

  it('updates query when page changes', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockRooms,
      meta: { page: 2, limit: 5, totalItems: 10, totalPages: 2 },
    });

    const { result } = renderHook(
      () => useServerRoomListFilter('prop-1', { pageSize: 5 }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.setCurrentPage(2);
    });

    await waitFor(() => {
      expect(roomApi.getRoomsByProperty).toHaveBeenCalledWith('prop-1', {
        search: undefined,
        sortBy: 'price_asc',
        page: 2,
        limit: 5,
      });
    });
  });

  it('resets filters to default', async () => {
    vi.mocked(roomApi.getRoomsByProperty).mockResolvedValue({
      success: true,
      message: 'OK',
      data: mockRooms,
      meta: { page: 1, limit: 5, totalItems: 2, totalPages: 1 },
    });

    const { result } = renderHook(
      () => useServerRoomListFilter('prop-1', { pageSize: 5 }),
      { wrapper: createWrapper() }
    );

    act(() => {
      result.current.setSearchQuery('Deluxe');
      result.current.setSortBy('name_desc');
      result.current.setCurrentPage(3);
    });

    act(() => {
      result.current.resetFilters();
    });

    expect(result.current.searchQuery).toBe('');
    expect(result.current.sortBy).toBe('price_asc');
    expect(result.current.currentPage).toBe(1);
  });
});
