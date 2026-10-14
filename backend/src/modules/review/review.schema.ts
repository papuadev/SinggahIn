import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.string().cuid('ID pesanan tidak valid.'),
  rating: z
    .number()
    .int('Rating harus berupa bilangan bulat.')
    .min(1, 'Rating minimal 1 bintang.')
    .max(5, 'Rating maksimal 5 bintang.'),
  comment: z
    .string()
    .trim()
    .min(5, 'Komentar ulasan minimal 5 karakter.')
    .max(1000, 'Komentar ulasan maksimal 1000 karakter.'),
});

export const propertyReviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateReviewSchemaInput = z.infer<typeof createReviewSchema>;
export type PropertyReviewQueryInput = z.infer<typeof propertyReviewQuerySchema>;
