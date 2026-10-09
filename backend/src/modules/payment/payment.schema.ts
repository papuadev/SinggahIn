import { z } from 'zod';

export const bookingIdParamSchema = z.object({
  bookingId: z.string().cuid('ID pesanan tidak valid.'),
});

export const rejectPaymentSchema = z.object({
  reason: z.string().max(255, 'Alasan penolakan maksimal 255 karakter.').optional(),
});

export const emergencyCancelSchema = z.preprocess(
  (val: any) => {
    if (val && typeof val === 'object' && !val.cancellationReason && val.reason) {
      return { ...val, cancellationReason: val.reason };
    }
    return val;
  },
  z.object({
    cancellationReason: z
      .string({ required_error: 'Alasan pembatalan wajib diisi.' })
      .min(5, 'Alasan pembatalan minimal 5 karakter.')
      .max(500, 'Alasan pembatalan maksimal 500 karakter.'),
    refundContact: z
      .string({ required_error: 'Nomor kontak refund wajib diisi.' })
      .min(8, 'Nomor kontak refund minimal 8 karakter.')
      .max(50, 'Nomor kontak refund maksimal 50 karakter.'),
    isForceMajeure: z.boolean().optional().default(false),
  })
);
