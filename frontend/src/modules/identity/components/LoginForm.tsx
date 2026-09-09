import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { loginSchema, LoginFormData } from '../schemas/identity.schema';
import { FormField } from '../../../components/molecules/FormField';
import { RoleSelector } from '../../../components/molecules/RoleSelector';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';
import { Role } from '../../../types/auth.types';

export interface LoginFormProps {
  initialRole?: Role;
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  serverError?: string | null;
}

export function LoginForm({
  initialRole = 'USER',
  onSubmit,
  isLoading = false,
  serverError,
}: LoginFormProps): React.JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', role: initialRole },
  });

  const selectedRole = watch('role');

  const togglePassword = () => setShowPassword((prev) => !prev);
  const handleRoleChange = (role: Role) => setValue('role', role);

  const handleFormSubmit = async (data: LoginFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <FormField label="Pilih Peran Akun">
        <RoleSelector
          value={selectedRole}
          onChange={handleRoleChange}
          disabled={isLoading}
        />
      </FormField>

      <FormField
        label="Alamat Email"
        required
        error={errors.email?.message}
        htmlFor="login-email"
      >
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          leftIcon={<Mail className="w-4 h-4" />}
          hasError={!!errors.email}
          disabled={isLoading}
          {...register('email')}
        />
      </FormField>

      <FormField
        label="Password"
        required
        error={errors.password?.message}
        htmlFor="login-password"
      >
        <Input
          id="login-password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Masukkan password Anda"
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

      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        className="w-full mt-2"
      >
        Masuk sebagai {selectedRole === 'TENANT' ? 'Pemilik' : 'Penyewa'}
      </Button>
    </form>
  );
}
