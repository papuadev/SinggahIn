import { z } from 'zod';

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val === '' ? undefined : val));

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((val) => (val === '' ? undefined : val))
  .pipe(
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal harus YYYY-MM-DD')
      .optional()
  );

export const CatalogQuerySchema = z
  .object({
    city: optionalString,
    name: optionalString,
    category: optionalString.transform((val) => val?.toLowerCase()),
    checkIn: optionalDate,
    checkOut: optionalDate,
    guests: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : val),
      z.coerce
        .number()
        .int('Jumlah tamu harus bilangan bulat')
        .positive('Jumlah tamu minimal 1')
        .optional()
    ),
    sortBy: z.enum(['price', 'name']).optional().default('price'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    page: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : val),
      z.coerce.number().int().min(1, 'Halaman minimal 1').optional().default(1)
    ),
    limit: z.preprocess(
      (val) => (val === '' || val === undefined ? undefined : val),
      z.coerce
        .number()
        .int()
        .min(1, 'Limit minimal 1')
        .max(50, 'Limit maksimal 50')
        .optional()
        .default(10)
    ),
  })
  .refine(
    (data) => {
      if ((data.checkIn && !data.checkOut) || (!data.checkIn && data.checkOut)) {
        return false;
      }
      return true;
    },
    {
      message: 'Tanggal check-in dan check-out harus diisi bersamaan',
      path: ['checkOut'],
    }
  )
  .refine(
    (data) => {
      if (data.checkIn && data.checkOut) {
        return new Date(data.checkIn) < new Date(data.checkOut);
      }
      return true;
    },
    {
      message: 'Tanggal check-out harus setelah tanggal check-in',
      path: ['checkOut'],
    }
  );

export type CatalogQueryInput = z.infer<typeof CatalogQuerySchema>;
