import { z } from 'zod';

const cleanString = (schema: z.ZodString) =>
  z.preprocess((v) => (v === '' ? undefined : v), schema.optional());

const booleanQuery = z.preprocess((v) => {
  if (v === undefined || v === '' || v === null) return undefined;
  return v === 'true' || v === true;
}, z.boolean().optional());

export const salesReportQuerySchema = z.object({
  startDate: cleanString(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format startDate harus YYYY-MM-DD.')),
  endDate: cleanString(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format endDate harus YYYY-MM-DD.')),
  month: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().min(1, 'Bulan minimal 1.').max(12, 'Bulan maksimal 12.').optional()),
  year: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().min(2020, 'Tahun minimal 2020.').max(2100, 'Tahun maksimal 2100.').optional()),
  allData: booleanQuery,
  groupBy: z.enum(['PROPERTY', 'TRANSACTION', 'USER']).default('PROPERTY'),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  propertyId: cleanString(z.string()),
});

export const occupancyMatrixQuerySchema = z.object({
  month: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().min(1, 'Bulan minimal 1.').max(12, 'Bulan maksimal 12.').optional()),
  year: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().min(2020, 'Tahun minimal 2020.').max(2100, 'Tahun maksimal 2100.').optional()),
  propertyId: cleanString(z.string()),
});

export type SalesReportQueryInput = z.infer<typeof salesReportQuerySchema>;
export type OccupancyMatrixQueryInput = z.infer<typeof occupancyMatrixQuerySchema>;
