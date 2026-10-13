import { z } from 'zod';

export const PROTECTED_CATEGORY_SLUGS = [
  'villa',
  'hotel',
  'apartemen',
  'homestay',
  'guesthouse',
  'others',
] as const;

export const CreateCategorySchema = z.object({
  name: z
    .string({ required_error: 'Nama kategori wajib diisi' })
    .trim()
    .min(3, 'Nama kategori minimal 3 karakter')
    .max(50, 'Nama kategori maksimal 50 karakter'),
  description: z
    .string()
    .trim()
    .max(255, 'Deskripsi kategori maksimal 255 karakter')
    .optional(),
});

export const UpdateCategorySchema = z.object({
  name: z
    .string({ required_error: 'Nama kategori wajib diisi' })
    .trim()
    .min(3, 'Nama kategori minimal 3 karakter')
    .max(50, 'Nama kategori maksimal 50 karakter'),
  description: z
    .string()
    .trim()
    .max(255, 'Deskripsi kategori maksimal 255 karakter')
    .optional(),
});

export const CategoryIdParamSchema = z.object({
  id: z.string().min(1, 'ID kategori wajib diisi'),
});

export const GetCategoriesQuerySchema = z.object({
  activeOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true'),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type GetCategoriesQueryInput = z.infer<typeof GetCategoriesQuerySchema>;
