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
