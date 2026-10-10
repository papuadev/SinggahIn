import { z } from 'zod';

export const salesReportQuerySchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format startDate harus YYYY-MM-DD.')
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format endDate harus YYYY-MM-DD.')
    .optional(),
  groupBy: z
    .enum(['PROPERTY', 'TRANSACTION', 'USER'])
    .default('PROPERTY'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  propertyId: z.string().optional(),
});

export const occupancyMatrixQuerySchema = z.object({
  month: z.coerce
    .number()
    .int()
    .min(1, 'Bulan minimal 1.')
    .max(12, 'Bulan maksimal 12.')
    .optional(),
  year: z.coerce
    .number()
    .int()
    .min(2020, 'Tahun minimal 2020.')
    .max(2100, 'Tahun maksimal 2100.')
    .optional(),
  propertyId: z.string().optional(),
});

export type SalesReportQueryInput = z.infer<typeof salesReportQuerySchema>;
export type OccupancyMatrixQueryInput = z.infer<typeof occupancyMatrixQuerySchema>;
