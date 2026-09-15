import { z } from 'zod';

export const propertyFormSchema = z.object({
  title: z
    .string({ required_error: 'Nama properti wajib diisi' })
    .min(3, 'Nama properti minimal 3 karakter')
    .max(100, 'Nama properti maksimal 100 karakter'),
  categoryId: z
    .string({ required_error: 'Kategori properti wajib dipilih' })
    .min(1, 'Kategori properti wajib dipilih'),
  description: z
    .string({ required_error: 'Deskripsi properti wajib diisi' })
    .min(10, 'Deskripsi properti minimal 10 karakter')
    .max(2000, 'Deskripsi properti maksimal 2000 karakter'),
  city: z
    .string({ required_error: 'Kota properti wajib diisi' })
    .min(2, 'Nama kota minimal 2 karakter')
    .max(100, 'Nama kota maksimal 100 karakter'),
  address: z
    .string({ required_error: 'Alamat lengkap properti wajib diisi' })
    .min(5, 'Alamat properti minimal 5 karakter')
    .max(255, 'Alamat properti maksimal 255 karakter'),
  latitude: z.coerce
    .number({ invalid_type_error: 'Titik latitude harus berupa angka' })
    .min(-90, 'Latitude harus di antara -90 dan 90')
    .max(90, 'Latitude harus di antara -90 dan 90'),
  longitude: z.coerce
    .number({ invalid_type_error: 'Titik longitude harus berupa angka' })
    .min(-180, 'Longitude harus di antara -180 dan 180')
    .max(180, 'Longitude harus di antara -180 dan 180'),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;
