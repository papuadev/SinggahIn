import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useRoomRates,
  useCreateRoomRate,
  useDeleteRoomRate,
  useBulkCreatePropertyRates,
  useRoomUnavailabilities,
  useCreateRoomUnavailability,
  useDeleteRoomUnavailability,
} from '../hooks/useRoomPricing';
import { pricingApi } from '../services/pricing.api';

vi.mock('../services/pricing.api', () => ({
  pricingApi: {
    getRoomRates: vi.fn(),
    createRoomRate: vi.fn(),
    deleteRoomRate: vi.fn(),
    bulkCreatePropertyRates: vi.fn(),
    getRoomUnavailabilities: vi.fn(),
    createRoomUnavailability: vi.fn(),
    deleteRoomUnavailability: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useRoomPricing Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches room rates and creates a rate', async () => {
    vi.mocked(pricingApi.getRoomRates).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [{
        id: 'r-1',
        roomId: 'room-1',
        startDate: '2026-12-20',
        endDate: '2027-01-05',
        adjustmentType: 'PERCENTAGE',
        adjustmentValue: 20,
      }],
    });
    vi.mocked(pricingApi.createRoomRate).mockResolvedValueOnce({
      success: true,
      message: 'Created',
      data: {
        id: 'r-2',
        roomId: 'room-1',
        startDate: '2026-07-01',
        endDate: '2026-07-10',
        adjustmentType: 'NOMINAL',
        adjustmentValue: 50000,
      },
    });

    const { result } = renderHook(() => useRoomRates('room-1'), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);

    const { result: createMut } = renderHook(() => useCreateRoomRate('room-1'), {
      wrapper: createWrapper(),
    });
    await createMut.current.mutateAsync({
      startDate: '2026-07-01',
      endDate: '2026-07-10',
      adjustmentType: 'NOMINAL',
      adjustmentValue: 50000,
    });
    expect(pricingApi.createRoomRate).toHaveBeenCalled();
  });

  it('deletes a rate and bulk creates property rates', async () => {
    vi.mocked(pricingApi.deleteRoomRate).mockResolvedValueOnce({
      success: true,
      message: 'Deleted',
      data: null,
    });
    vi.mocked(pricingApi.bulkCreatePropertyRates).mockResolvedValueOnce({
      success: true,
      message: 'Bulk created',
      data: [],
    });

    const { result: delMut } = renderHook(() => useDeleteRoomRate('room-1'), {
      wrapper: createWrapper(),
    });
    await delMut.current.mutateAsync('r-1');
    expect(pricingApi.deleteRoomRate).toHaveBeenCalledWith('room-1', 'r-1');

    const { result: bulkMut } = renderHook(() => useBulkCreatePropertyRates('prop-1'), {
      wrapper: createWrapper(),
    });
    await bulkMut.current.mutateAsync({
      startDate: '2026-12-20',
      endDate: '2027-01-05',
      adjustmentType: 'PERCENTAGE',
      adjustmentValue: 25,
    });
    expect(pricingApi.bulkCreatePropertyRates).toHaveBeenCalled();
  });

  it('fetches unavailabilities, creates and deletes unavailability', async () => {
    vi.mocked(pricingApi.getRoomUnavailabilities).mockResolvedValueOnce({
      success: true,
      message: 'OK',
      data: [{
        id: 'u-1',
        roomId: 'room-1',
        startDate: '2026-10-01',
        endDate: '2026-10-05',
      }],
    });
    vi.mocked(pricingApi.createRoomUnavailability).mockResolvedValueOnce({
      success: true,
      message: 'Created',
      data: {
        id: 'u-2',
        roomId: 'room-1',
        startDate: '2026-11-01',
        endDate: '2026-11-05',
      },
    });
    vi.mocked(pricingApi.deleteRoomUnavailability).mockResolvedValueOnce({
      success: true,
      message: 'Deleted',
      data: null,
    });

    const { result: unavailList } = renderHook(() => useRoomUnavailabilities('room-1'), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(unavailList.current.isSuccess).toBe(true));
    expect(unavailList.current.data).toHaveLength(1);

    const { result: createUnavail } = renderHook(() => useCreateRoomUnavailability('room-1'), {
      wrapper: createWrapper(),
    });
    await createUnavail.current.mutateAsync({
      startDate: '2026-11-01',
      endDate: '2026-11-05',
    });
    expect(pricingApi.createRoomUnavailability).toHaveBeenCalled();

    const { result: delUnavail } = renderHook(() => useDeleteRoomUnavailability('room-1'), {
      wrapper: createWrapper(),
    });
    await delUnavail.current.mutateAsync('u-1');
    expect(pricingApi.deleteRoomUnavailability).toHaveBeenCalledWith('room-1', 'u-1');
  });
});
