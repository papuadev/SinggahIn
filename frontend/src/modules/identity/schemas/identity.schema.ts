import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  role: z.enum(['USER', 'TENANT'], {
    errorMap: () => ({ message: 'Peran akun harus USER atau TENANT' }),
  }),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const verifySchema = z
  .object({
    token: z.string().min(1, 'Token verifikasi wajib diisi'),
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type VerifyFormData = z.infer<typeof verifySchema>;

export const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  role: z.enum(['USER', 'TENANT'], {
    errorMap: () => ({ message: 'Peran akun harus USER atau TENANT' }),
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional().or(z.literal('')),
  phoneNumber: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{8,15}$/, 'Format nomor telepon tidak valid (contoh: 08123456789)')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token reset password wajib diisi'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi password baru minimal 8 karakter'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password baru tidak cocok',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Password baru harus berbeda dari password saat ini',
    path: ['newPassword'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const requestEmailChangeSchema = z.object({
  newEmail: z.string().min(1, 'Email baru wajib diisi').email('Format email baru tidak valid'),
  password: z.string().min(1, 'Password akun wajib diisi untuk konfirmasi keamanan'),
});

export type RequestEmailChangeFormData = z.infer<typeof requestEmailChangeSchema>;

export const verifyEmailChangeSchema = z.object({
  token: z.string().min(1, 'Token verifikasi email wajib diisi'),
});

export type VerifyEmailChangeFormData = z.infer<typeof verifyEmailChangeSchema>;

