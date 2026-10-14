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

  async downloadInvoice(bookingId: string, bookingCode: string): Promise<void> {
    const res = await apiClient.get(`/bookings/${bookingId}/invoice`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Invoice-${bookingCode}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};

