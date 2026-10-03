import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRoomListFilter } from '../hooks/useRoomListFilter';
import { Room } from '../room.types';

function createMockRooms(count: number): Room[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `room-${i + 1}`,
    propertyId: 'prop-1',
    name: `Tipe Kamar ${String.fromCharCode(65 + i)}`,
    basePrice: (i + 1) * 100000,
    capacity: (i % 4) + 1,
    totalUnits: (i % 3) + 1,
    description: `Deskripsi kamar ${i + 1}`,
  }));
}

describe('useRoomListFilter Hook', () => {
  const rooms = createMockRooms(10);

  it('paginates 10 rooms into 2 pages with default pageSize 5', () => {
    const { result } = renderHook(() => useRoomListFilter(rooms));
    expect(result.current.totalFiltered).toBe(10);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.paginatedRooms).toHaveLength(5);
    expect(result.current.paginatedRooms[0].name).toBe('Tipe Kamar A');
  });

  it('navigates to page 2 and shows the next 5 rooms', () => {
    const { result } = renderHook(() => useRoomListFilter(rooms));
    act(() => result.current.setCurrentPage(2));
    expect(result.current.currentPage).toBe(2);
    expect(result.current.paginatedRooms).toHaveLength(5);
    expect(result.current.paginatedRooms[0].name).toBe('Tipe Kamar F');
  });

  it('filters rooms by name and resets page to 1', () => {
    const { result } = renderHook(() => useRoomListFilter(rooms));
    act(() => result.current.setCurrentPage(2));
    act(() => result.current.setSearchQuery('Kamar B'));
    expect(result.current.currentPage).toBe(1);
    expect(result.current.totalFiltered).toBe(1);
    expect(result.current.paginatedRooms[0].name).toBe('Tipe Kamar B');
  });

  it('filters rooms by description', () => {
    const { result } = renderHook(() => useRoomListFilter(rooms));
    act(() => result.current.setSearchQuery('kamar 7'));
    expect(result.current.totalFiltered).toBe(1);
    expect(result.current.paginatedRooms[0].name).toBe('Tipe Kamar G');
  });

  it('sorts rooms by price descending', () => {
    const { result } = renderHook(() => useRoomListFilter(rooms));
    act(() => result.current.setSortBy('price_desc'));
    expect(result.current.paginatedRooms[0].basePrice).toBe(1000000);
    expect(result.current.paginatedRooms[0].name).toBe('Tipe Kamar J');
  });

  it('sorts rooms by name descending', () => {
    const { result } = renderHook(() => useRoomListFilter(rooms));
    act(() => result.current.setSortBy('name_desc'));
    expect(result.current.paginatedRooms[0].name).toBe('Tipe Kamar J');
  });

  it('sorts rooms by total units descending', () => {
    const { result } = renderHook(() => useRoomListFilter(rooms));
    act(() => result.current.setSortBy('units_desc'));
    expect(result.current.paginatedRooms[0].totalUnits).toBe(3);
  });

  it('resets all filters to initial state', () => {
    const { result } = renderHook(() => useRoomListFilter(rooms));
    act(() => {
      result.current.setSearchQuery('custom');
      result.current.setSortBy('price_desc');
      result.current.setCurrentPage(2);
    });
    act(() => result.current.resetFilters());
    expect(result.current.searchQuery).toBe('');
    expect(result.current.sortBy).toBe('price_asc');
    expect(result.current.currentPage).toBe(1);
  });
});
