import { z } from 'zod';

export const CreateRoomSchema = z.object({
  name: z
    .string({ required_error: 'Nama tipe kamar wajib diisi' })
    .min(2, 'Nama kamar minimal 2 karakter')
    .max(100, 'Nama kamar maksimal 100 karakter'),
  basePrice: z
    .number({ required_error: 'Harga dasar kamar wajib diisi' })
    .int('Harga dasar harus berupa bilangan bulat')
    .positive('Harga dasar harus lebih dari 0'),
  capacity: z
    .number({ required_error: 'Kapasitas tamu wajib diisi' })
    .int('Kapasitas harus berupa bilangan bulat')
    .min(1, 'Kapasitas minimal 1 tamu')
    .max(50, 'Kapasitas maksimal 50 tamu'),
  totalUnits: z
    .number()
    .int('Total unit harus berupa bilangan bulat')
    .min(1, 'Total unit minimal 1')
    .default(1),
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional(),
});

export const UpdateRoomSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    basePrice: z.number().int().positive().optional(),
    capacity: z.number().int().min(1).max(50).optional(),
    totalUnits: z.number().int().min(1).optional(),
    description: z.string().max(1000).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi untuk memperbarui kamar',
  });

export const PropertyIdParamSchema = z.object({
  propertyId: z.string().cuid('Format ID properti tidak valid'),
});

export const RoomIdParamSchema = z.object({
  id: z.string().cuid('Format ID kamar tidak valid'),
});

export const RoomUnavailabilityParamSchema = z.object({
  id: z.string().cuid('Format ID kamar tidak valid'),
  unavailabilityId: z.string().cuid('Format ID pemblokiran kamar tidak valid'),
});

export const CreateRoomUnavailabilitySchema = z
  .object({
    startDate: z
      .string({ required_error: 'Tanggal mulai wajib diisi' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal mulai harus YYYY-MM-DD'),
    endDate: z
      .string({ required_error: 'Tanggal selesai wajib diisi' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal selesai harus YYYY-MM-DD'),
    reason: z
      .string()
      .max(255, 'Alasan pemblokiran maksimal 255 karakter')
      .optional(),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Tanggal mulai tidak boleh melebihi tanggal selesai',
    path: ['endDate'],
  });

export const CheckRoomAvailabilityQuerySchema = z
  .object({
    checkInDate: z
      .string({ required_error: 'Tanggal check-in wajib diisi' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-in harus YYYY-MM-DD'),
    checkOutDate: z
      .string({ required_error: 'Tanggal check-out wajib diisi' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal check-out harus YYYY-MM-DD'),
  })
  .refine((data) => new Date(data.checkInDate) < new Date(data.checkOutDate), {
    message: 'Tanggal check-out harus setelah tanggal check-in',
    path: ['checkOutDate'],
  });

export type CreateRoomInput = z.infer<typeof CreateRoomSchema>;
export type UpdateRoomInput = z.infer<typeof UpdateRoomSchema>;
export type PropertyIdParam = z.infer<typeof PropertyIdParamSchema>;
export type RoomIdParam = z.infer<typeof RoomIdParamSchema>;
export type RoomUnavailabilityParam = z.infer<typeof RoomUnavailabilityParamSchema>;
export type CreateRoomUnavailabilityInput = z.infer<typeof CreateRoomUnavailabilitySchema>;
export type CheckRoomAvailabilityQuery = z.infer<typeof CheckRoomAvailabilityQuerySchema>;
