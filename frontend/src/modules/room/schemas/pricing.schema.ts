import { z } from 'zod';

export const peakRateFormSchema = z
  .object({
    startDate: z
      .string({ required_error: 'Tanggal mulai wajib diisi' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal mulai harus YYYY-MM-DD'),
    endDate: z
      .string({ required_error: 'Tanggal selesai wajib diisi' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal selesai harus YYYY-MM-DD'),
    adjustmentType: z.enum(['NOMINAL', 'PERCENTAGE'], {
      required_error: 'Tipe penyesuaian tarif wajib dipilih',
    }),
    adjustmentValue: z.coerce
      .number({ required_error: 'Nilai penyesuaian wajib diisi' })
      .int('Nilai penyesuaian harus bilangan bulat')
      .refine((val) => val !== 0, 'Nilai penyesuaian tidak boleh 0'),
    reason: z
      .string()
      .max(255, 'Alasan penyesuaian maksimal 255 karakter')
      .optional()
      .or(z.literal('')),
    applyToAllRooms: z.boolean().optional().default(false),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Tanggal mulai tidak boleh melebihi tanggal selesai',
    path: ['endDate'],
  })
  .superRefine((data, ctx) => {
    if (data.adjustmentType === 'PERCENTAGE') {
      if (data.adjustmentValue < -90 || data.adjustmentValue > 500) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Persentase penyesuaian harus antara -90% dan +500%',
          path: ['adjustmentValue'],
        });
      }
    }
  });

export type PeakRateFormData = z.infer<typeof peakRateFormSchema>;

export const roomUnavailabilityFormSchema = z
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
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Tanggal mulai tidak boleh melebihi tanggal selesai',
    path: ['endDate'],
  });

export type RoomUnavailabilityFormData = z.infer<typeof roomUnavailabilityFormSchema>;
