import { z } from 'zod';

export const CalendarQuerySchema = z.object({
  month: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : val),
    z.coerce
      .number()
      .int('Bulan harus berupa bilangan bulat')
      .min(1, 'Bulan minimal 1')
      .max(12, 'Bulan maksimal 12')
      .optional()
      .default(() => new Date().getUTCMonth() + 1)
  ),
  year: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : val),
    z.coerce
      .number()
      .int('Tahun harus berupa bilangan bulat')
      .min(2020, 'Tahun minimal 2020')
      .max(2100, 'Tahun maksimal 2100')
      .optional()
      .default(() => new Date().getUTCFullYear())
  ),
  roomId: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : val),
    z.string().cuid('Format ID kamar tidak valid').optional()
  ),
});

export type CalendarQueryInput = z.infer<typeof CalendarQuerySchema>;
