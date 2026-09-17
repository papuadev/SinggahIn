import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pricingApi } from '../services/pricing.api';
import { apiClient } from '../../../libs/axios';

vi.mock('../../../libs/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Pricing API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getRoomRates with roomId', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: [] },
    });
    const res = await pricingApi.getRoomRates('room-1');
    expect(apiClient.get).toHaveBeenCalledWith('/rooms/room-1/rates');
    expect(res.success).toBe(true);
  });

  it('calls createRoomRate with roomId and payload', async () => {
    const payload = {
      startDate: '2026-12-20',
      endDate: '2027-01-05',
      adjustmentType: 'NOMINAL' as const,
      adjustmentValue: 150000,
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, message: 'Created', data: { id: 'rate-1', ...payload } },
    });
    const res = await pricingApi.createRoomRate('room-1', payload);
    expect(apiClient.post).toHaveBeenCalledWith('/rooms/room-1/rates', payload);
    expect(res.data.id).toBe('rate-1');
  });

  it('calls deleteRoomRate with roomId and rateId', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true, message: 'Deleted', data: null },
    });
    const res = await pricingApi.deleteRoomRate('room-1', 'rate-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/rooms/room-1/rates/rate-1');
    expect(res.success).toBe(true);
  });

  it('calls bulkCreatePropertyRates with propertyId and payload', async () => {
    const payload = {
      startDate: '2026-12-20',
      endDate: '2027-01-05',
      adjustmentType: 'PERCENTAGE' as const,
      adjustmentValue: 25,
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, message: 'Created', data: [{ id: 'rate-1' }] },
    });
    const res = await pricingApi.bulkCreatePropertyRates('prop-1', payload);
    expect(apiClient.post).toHaveBeenCalledWith('/properties/prop-1/rooms/rates', payload);
    expect(res.success).toBe(true);
  });

  it('calls getRoomUnavailabilities, create, and delete', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: [] },
    });
    await pricingApi.getRoomUnavailabilities('room-1');
    expect(apiClient.get).toHaveBeenCalledWith('/rooms/room-1/unavailability');

    const unavailPayload = { startDate: '2026-11-01', endDate: '2026-11-05' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, message: 'Created', data: { id: 'u-1', ...unavailPayload } },
    });
    await pricingApi.createRoomUnavailability('room-1', unavailPayload);
    expect(apiClient.post).toHaveBeenCalledWith('/rooms/room-1/unavailability', unavailPayload);

    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true, message: 'Deleted', data: null },
    });
    await pricingApi.deleteRoomUnavailability('room-1', 'u-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/rooms/room-1/unavailability/u-1');
  });
});
