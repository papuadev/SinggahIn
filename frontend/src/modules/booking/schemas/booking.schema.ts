import { z } from 'zod';

export const checkoutFormSchema = z
  .object({
    roomId: z.string().min(1, 'Pilih tipe kamar'),
    checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-in tidak valid (YYYY-MM-DD)'),
    checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-out tidak valid (YYYY-MM-DD)'),
    guestCount: z.coerce.number().int().min(1, 'Minimal 1 tamu'),
    paymentMethod: z.enum(['MANUAL_TRANSFER', 'PAYMENT_GATEWAY'], {
      required_error: 'Pilih metode pembayaran',
    }),
  })
  .refine(
    (data) => new Date(data.checkOutDate) > new Date(data.checkInDate),
    {
      message: 'Tanggal check-out harus setelah tanggal check-in',
      path: ['checkOutDate'],
    }
  );

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export const cancelBookingSchema = z.object({
  reason: z.string().min(3, 'Alasan pembatalan minimal 3 karakter').max(200, 'Alasan pembatalan maksimal 200 karakter'),
});

export type CancelBookingValues = z.infer<typeof cancelBookingSchema>;
