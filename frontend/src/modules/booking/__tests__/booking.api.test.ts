import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bookingApi } from '../services/booking.api';
import { apiClient } from '../../../libs/axios';

vi.mock('../../../libs/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('bookingApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('createBooking posts to /bookings', async () => {
    const payload: any = { roomId: 'r1', checkInDate: '2026-10-01', checkOutDate: '2026-10-03', guestCount: 2, paymentMethod: 'MANUAL_TRANSFER' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: { id: 'b1' } } });
    const res = await bookingApi.createBooking(payload);
    expect(apiClient.post).toHaveBeenCalledWith('/bookings', payload);
    expect(res.data.id).toBe('b1');
  });

  it('getUserBookings calls GET /bookings with query params', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { success: true, data: [] } });
    await bookingApi.getUserBookings({ status: 'WAITING_PAYMENT', page: 2 });
    expect(apiClient.get).toHaveBeenCalledWith('/bookings', { params: { status: 'WAITING_PAYMENT', page: 2 } });
  });

  it('getBookingById calls GET /bookings/:id', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { success: true, data: { id: 'b1' } } });
    const res = await bookingApi.getBookingById('b1');
    expect(apiClient.get).toHaveBeenCalledWith('/bookings/b1');
    expect(res.data.id).toBe('b1');
  });

  it('cancelBooking calls POST /bookings/:id/cancel with reason', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: { success: true, data: { id: 'b1' } } });
    await bookingApi.cancelBooking('b1', 'Alasan batal');
    expect(apiClient.post).toHaveBeenCalledWith('/bookings/b1/cancel', { reason: 'Alasan batal' });
  });

  it('getTenantBookings calls GET /bookings/tenant with query params', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: { success: true, data: [] } });
    await bookingApi.getTenantBookings({ page: 1, limit: 10 });
    expect(apiClient.get).toHaveBeenCalledWith('/bookings/tenant', { params: { page: 1, limit: 10 } });
  });
});
