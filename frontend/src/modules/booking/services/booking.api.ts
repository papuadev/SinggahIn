import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import {
  Booking,
  CreateBookingPayload,
  BookingListQuery,
} from '../booking.types';

export const bookingApi = {
  async createBooking(payload: CreateBookingPayload): Promise<ApiResponse<Booking>> {
    const res = await apiClient.post<ApiResponse<Booking>>('/bookings', payload);
    return res.data;
  },

  async getUserBookings(query?: BookingListQuery): Promise<ApiResponse<Booking[]>> {
    const res = await apiClient.get<ApiResponse<Booking[]>>('/bookings', {
      params: query,
    });
    return res.data;
  },

  async getBookingById(id: string): Promise<ApiResponse<Booking>> {
    const res = await apiClient.get<ApiResponse<Booking>>(`/bookings/${id}`);
    return res.data;
  },

  async cancelBooking(id: string, reason?: string): Promise<ApiResponse<Booking>> {
    const res = await apiClient.post<ApiResponse<Booking>>(`/bookings/${id}/cancel`, {
      reason,
    });
    return res.data;
  },

  async getTenantBookings(query?: BookingListQuery): Promise<ApiResponse<Booking[]>> {
    const res = await apiClient.get<ApiResponse<Booking[]>>('/bookings/tenant', {
      params: query,
    });
    return res.data;
  },
};
