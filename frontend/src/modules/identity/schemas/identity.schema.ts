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
