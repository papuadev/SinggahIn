import { z } from 'zod';

export const CreatePropertySchema = z.object({
  title: z
    .string({ required_error: 'Nama properti wajib diisi' })
    .min(3, 'Nama properti minimal 3 karakter')
    .max(100, 'Nama properti maksimal 100 karakter'),
  categoryId: z
    .string({ required_error: 'Kategori properti wajib dipilih' })
    .cuid('Format ID kategori tidak valid'),
  description: z
    .string({ required_error: 'Deskripsi properti wajib diisi' })
    .min(10, 'Deskripsi properti minimal 10 karakter'),
  address: z
    .string({ required_error: 'Alamat lengkap properti wajib diisi' })
    .min(5, 'Alamat properti minimal 5 karakter'),
  city: z
    .string({ required_error: 'Kota properti wajib diisi' })
    .min(2, 'Nama kota minimal 2 karakter'),
  latitude: z
    .number({ required_error: 'Titik latitude wajib diisi' })
    .min(-90, 'Latitude tidak valid')
    .max(90, 'Latitude tidak valid'),
  longitude: z
    .number({ required_error: 'Titik longitude wajib diisi' })
    .min(-180, 'Longitude tidak valid')
    .max(180, 'Longitude tidak valid'),
});

export const UpdatePropertySchema = z
  .object({
    title: z.string().min(3).max(100).optional(),
    categoryId: z.string().cuid().optional(),
    description: z.string().min(10).optional(),
    address: z.string().min(5).optional(),
    city: z.string().min(2).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi untuk memperbarui properti',
  });

export const PropertyIdParamSchema = z.object({
  id: z.string().cuid('Format ID properti tidak valid'),
});

export const PropertyImageParamSchema = z.object({
  id: z.string().cuid('Format ID properti tidak valid'),
  imageId: z.string().cuid('Format ID gambar tidak valid'),
});

export const ReverseGeocodeQuerySchema = z.object({
  latitude: z.coerce
    .number({ invalid_type_error: 'Latitude harus berupa angka' })
    .min(-90, 'Latitude harus di antara -90 dan 90')
    .max(90, 'Latitude harus di antara -90 dan 90'),
  longitude: z.coerce
    .number({ invalid_type_error: 'Longitude harus berupa angka' })
    .min(-180, 'Longitude harus di antara -180 dan 180')
    .max(180, 'Longitude harus di antara -180 dan 180'),
});

export const SearchGeocodeQuerySchema = z.object({
  query: z
    .string({ required_error: 'Query pencarian wajib diisi' })
    .min(1, 'Query pencarian minimal 1 karakter'),
  limit: z.coerce.number().min(1).max(10).optional().default(5),
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;
export type PropertyIdParam = z.infer<typeof PropertyIdParamSchema>;
export type PropertyImageParam = z.infer<typeof PropertyImageParamSchema>;
export type ReverseGeocodeQuery = z.infer<typeof ReverseGeocodeQuerySchema>;
export type SearchGeocodeQuery = z.infer<typeof SearchGeocodeQuerySchema>;

