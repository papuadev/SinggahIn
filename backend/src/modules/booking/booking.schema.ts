import { z } from 'zod';
import { PaymentMethod, BookingStatus } from '@prisma/client';

export const createBookingSchema = z.object({
  roomId: z.string().cuid('ID kamar tidak valid.'),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-in harus YYYY-MM-DD.'),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-out harus YYYY-MM-DD.'),
  guestCount: z.number().int().positive('Jumlah tamu minimal 1 orang.'),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    errorMap: () => ({ message: 'Metode pembayaran harus MANUAL_TRANSFER atau PAYMENT_GATEWAY.' }),
  }),
});

export const cancelBookingSchema = z.object({
  reason: z.string().max(255, 'Alasan pembatalan maksimal 255 karakter.').optional(),
});

export const bookingIdParamSchema = z.object({
  id: z.string().cuid('ID pesanan tidak valid.'),
});

export const listBookingsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
  status: z.nativeEnum(BookingStatus).optional(),
});
