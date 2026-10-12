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

function EmailField({ register, errors, isLoading }: any) {
  return (
    <FormField label="Alamat Email" required error={errors.email?.message} htmlFor="login-email">
      <Input
        id="login-email" type="email" autoComplete="email" placeholder="nama@email.com"
        leftIcon={<Mail className="w-4 h-4" />} hasError={!!errors.email} disabled={isLoading}
        {...register('email')}
      />
    </FormField>
  );
}

function PasswordToggle({ showPassword, togglePassword }: any) {
  return (
    <button type="button" onClick={togglePassword} className="hover:text-gray-600 focus:outline-none" aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}>
      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

function PasswordField({ register, errors, isLoading, showPassword, togglePassword }: any) {
  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor="login-password" className="text-sm font-medium text-gray-700">
          Password <span className="text-red-500">*</span>
        </label>
        <a
          href="/forgot-password"
          className="text-xs font-semibold text-primary-600 hover:text-primary-500 transition-colors"
        >
          Lupa password?
        </a>
      </div>
      <Input
        id="login-password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="Masukkan password Anda"
        leftIcon={<Lock className="w-4 h-4" />}
        rightIcon={<PasswordToggle showPassword={showPassword} togglePassword={togglePassword} />}
        hasError={!!errors.password}
        disabled={isLoading}
        {...register('password')}
      />
      {errors.password?.message && (
        <p className="text-xs text-red-600 font-medium mt-1">{errors.password.message}</p>
      )}
    </div>
  );
}

function useLoginFormState(initialRole: Role, onSubmit: (data: LoginFormData) => Promise<void>) {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', role: initialRole },
  });
  const selectedRole = watch('role');
  const togglePassword = () => setShowPassword((prev) => !prev);
  const handleRoleChange = (role: Role) => setValue('role', role);
  return {
    register, errors, selectedRole, showPassword, togglePassword, handleRoleChange,
    handleSubmit: handleSubmit((data) => onSubmit(data)),
  };
}

export function LoginForm(props: LoginFormProps): React.JSX.Element {
  const { initialRole = 'USER', onSubmit, isLoading = false, serverError } = props;
  const s = useLoginFormState(initialRole, onSubmit);
  return (
    <form onSubmit={s.handleSubmit} className="space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <FormField label="Pilih Peran Akun">
        <RoleSelector value={s.selectedRole} onChange={s.handleRoleChange} disabled={isLoading} />
      </FormField>
      <EmailField register={s.register} errors={s.errors} isLoading={isLoading} />
      <PasswordField register={s.register} errors={s.errors} isLoading={isLoading} showPassword={s.showPassword} togglePassword={s.togglePassword} />
      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">
        Masuk sebagai {s.selectedRole === 'TENANT' ? 'Pemilik' : 'Penyewa'}
      </Button>
    </form>
  );
}
