import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { verifySchema, VerifyFormData } from '../schemas/identity.schema';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';

export interface VerifyFormProps {
  token: string;
  onSubmit: (data: VerifyFormData) => Promise<void>;
  isLoading?: boolean;
  serverError?: string | null;
}

export function VerifyForm({
  token,
  onSubmit,
  isLoading = false,
  serverError,
}: VerifyFormProps): React.JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: { token, name: '', password: '', confirmPassword: '' },
  });

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleFormSubmit = async (data: VerifyFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <input type="hidden" value={token} {...register('token')} />

      <FormField
        label="Nama Lengkap"
        required
        error={errors.name?.message}
        htmlFor="verify-name"
      >
        <Input
          id="verify-name"
          type="text"
          placeholder="Contoh: Rian Pratama"
          leftIcon={<User className="w-4 h-4" />}
          hasError={!!errors.name}
          disabled={isLoading}
          {...register('name')}
        />
      </FormField>

      <FormField
        label="Password Baru"
        required
        error={errors.password?.message}
        hint="Minimal 8 karakter."
        htmlFor="verify-password"
      >
        <Input
          id="verify-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Buat password baru"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={togglePassword}
              className="hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          hasError={!!errors.password}
          disabled={isLoading}
          {...register('password')}
        />
      </FormField>

      <FormField
        label="Konfirmasi Password"
        required
        error={errors.confirmPassword?.message}
        htmlFor="verify-confirm-password"
      >
        <Input
          id="verify-confirm-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Ulangi password baru"
          leftIcon={<Lock className="w-4 h-4" />}
          hasError={!!errors.confirmPassword}
          disabled={isLoading}
          {...register('confirmPassword')}
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-2"
      >
        Aktivasi Akun & Masuk
      </Button>
    </form>
  );
}
