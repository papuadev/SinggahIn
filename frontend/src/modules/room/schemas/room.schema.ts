import { z } from 'zod';

export const roomFormSchema = z.object({
  name: z
    .string({ required_error: 'Nama tipe kamar wajib diisi' })
    .min(2, 'Nama kamar minimal 2 karakter')
    .max(100, 'Nama kamar maksimal 100 karakter'),
  basePrice: z.coerce
    .number({ required_error: 'Harga dasar kamar wajib diisi' })
    .int('Harga dasar harus bilangan bulat')
    .positive('Harga dasar harus lebih dari 0')
    .min(10000, 'Harga dasar minimal Rp 10.000'),
  capacity: z.coerce
    .number({ required_error: 'Kapasitas tamu wajib diisi' })
    .int('Kapasitas harus bilangan bulat')
    .min(1, 'Kapasitas minimal 1 tamu')
    .max(50, 'Kapasitas maksimal 50 tamu'),
  totalUnits: z.coerce
    .number()
    .int('Total unit harus bilangan bulat')
    .min(1, 'Total unit minimal 1 unit')
    .default(1),
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .or(z.literal('')),
});

export type RoomFormData = z.infer<typeof roomFormSchema>;
