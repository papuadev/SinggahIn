import { z } from 'zod';

export const reviewFormSchema = z.object({
  rating: z
    .number({ required_error: 'Silakan pilih rating bintang.' })
    .int()
    .min(1, 'Rating minimal 1 bintang.')
    .max(5, 'Rating maksimal 5 bintang.'),
  comment: z
    .string({ required_error: 'Silakan tulis komentar ulasan Anda.' })
    .trim()
    .min(5, 'Komentar ulasan minimal 5 karakter.')
    .max(1000, 'Komentar ulasan maksimal 1000 karakter.'),
});

export type ReviewFormData = z.infer<typeof reviewFormSchema>;
