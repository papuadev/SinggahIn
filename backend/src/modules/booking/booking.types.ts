import { BookingStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

export interface CreateBookingInput {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  paymentMethod: PaymentMethod;
}

export interface BookingResponseDto {
  id: string;
  bookingId: string;
  bookingCode: string;
  status: BookingStatus;
  totalPrice: number;
  expiresAt: string;
}

export interface BookingListQuery {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  search?: string;
  sortBy?: 'createdAt_desc' | 'createdAt_asc' | 'checkIn_asc' | 'checkIn_desc' | 'price_desc' | 'price_asc';
}
