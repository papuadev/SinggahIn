import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  role: z.enum(['USER', 'TENANT'], {
    errorMap: () => ({ message: 'Peran akun harus USER atau TENANT' })
  })
});

export const VerifySchema = z
  .object({
    token: z.string().min(1, 'Token verifikasi wajib diisi'),
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword']
  });

export const LoginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
  role: z.enum(['USER', 'TENANT'], {
    errorMap: () => ({ message: 'Peran akun harus USER atau TENANT' })
  })
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').optional(),
  phoneNumber: z
    .string()
    .regex(/^(\+62|62|0)[0-9]{8,15}$/, 'Format nomor telepon tidak valid')
    .optional()
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Format email tidak valid'),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token reset password wajib diisi'),
    password: z.string().min(8, 'Password minimal 8 karakter'),
    confirmPassword: z.string().min(8, 'Konfirmasi password minimal 8 karakter'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });

export const ChangePasswordSchema = z
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

export const RequestEmailChangeSchema = z.object({
  newEmail: z.string().email('Format email baru tidak valid'),
  password: z.string().min(1, 'Password akun wajib diisi untuk konfirmasi keamanan'),
});

export const VerifyEmailChangeSchema = z.object({
  token: z.string().min(1, 'Token verifikasi email wajib diisi'),
});

