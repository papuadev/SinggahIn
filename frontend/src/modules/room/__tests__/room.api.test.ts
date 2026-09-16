import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roomApi } from '../services/room.api';
import { apiClient } from '../../../libs/axios';

vi.mock('../../../libs/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Room API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls getRoomsByProperty with propertyId', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: [] },
    });

    const res = await roomApi.getRoomsByProperty('prop-1');
    expect(apiClient.get).toHaveBeenCalledWith('/properties/prop-1/rooms');
    expect(res.success).toBe(true);
  });

  it('calls getRoomById with roomId', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { success: true, message: 'OK', data: { id: 'room-1' } },
    });

    const res = await roomApi.getRoomById('room-1');
    expect(apiClient.get).toHaveBeenCalledWith('/rooms/room-1');
    expect(res.data.id).toBe('room-1');
  });

  it('calls createRoom with propertyId and payload', async () => {
    const payload = {
      name: 'Deluxe Room',
      basePrice: 300000,
      capacity: 2,
      totalUnits: 3,
    };
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      data: { success: true, message: 'Created', data: { id: 'room-1', ...payload } },
    });

    const res = await roomApi.createRoom('prop-1', payload);
    expect(apiClient.post).toHaveBeenCalledWith('/properties/prop-1/rooms', payload);
    expect(res.success).toBe(true);
  });

  it('calls updateRoom with roomId and payload', async () => {
    const payload = { basePrice: 400000 };
    vi.mocked(apiClient.patch).mockResolvedValueOnce({
      data: { success: true, message: 'Updated', data: { id: 'room-1', ...payload } },
    });

    const res = await roomApi.updateRoom('room-1', payload);
    expect(apiClient.patch).toHaveBeenCalledWith('/rooms/room-1', payload);
    expect(res.success).toBe(true);
  });

  it('calls deleteRoom with roomId', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({
      data: { success: true, message: 'Deleted', data: null },
    });

    const res = await roomApi.deleteRoom('room-1');
    expect(apiClient.delete).toHaveBeenCalledWith('/rooms/room-1');
    expect(res.success).toBe(true);
  });
});
