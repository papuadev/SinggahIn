import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import {
  changePasswordSchema,
  ChangePasswordFormData,
} from '../schemas/identity.schema';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';
import { useAuthStore } from '../../../stores/auth.store';

export interface ChangePasswordFormProps {
  onChangePassword: (data: ChangePasswordFormData) => Promise<void>;
  isLoading?: boolean;
}

function MinimalistLoadingTransition(): React.JSX.Element {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center py-10 space-y-4 text-center animate-fade-in"
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle modern ambient pulse ring */}
        <div className="absolute w-12 h-12 rounded-full bg-primary-100/70 animate-ping opacity-60" />
        {/* Sleek minimalist spinner */}
        <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-gray-900">
          Kata Sandi Berhasil Diperbarui
        </h3>
        <p className="text-xs text-gray-500">
          Mengalihkan ke halaman masuk...
        </p>
      </div>
    </div>
  );
}

export function ChangePasswordForm({
  onChangePassword,
  isLoading = false,
}: ChangePasswordFormProps): React.JSX.Element {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setServerError(null);
    try {
      await onChangePassword(data);
      setIsSuccess(true);
      reset();
    } catch (err: any) {
      setServerError(err.message || 'Gagal memperbarui kata sandi.');
    }
  };

  useEffect(() => {
    if (!isSuccess) return;

    const timer = setTimeout(() => {
      logout().finally(() => {
        navigate('/login');
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [isSuccess, logout, navigate]);

  if (isSuccess) {
    return <MinimalistLoadingTransition />;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-700 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          Ketentuan Kata Sandi
        </div>
        <p className="leading-relaxed text-slate-600">
          Kata sandi baru minimal 8 karakter dan harus berbeda dari kata sandi Anda saat ini.
        </p>
      </div>

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Kata Sandi Saat Ini"
          required
          error={errors.currentPassword?.message}
          htmlFor="current-password"
        >
          <Input
            id="current-password"
            type={showCurrent ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Masukkan kata sandi saat ini"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrent((p) => !p)}
                className="hover:text-gray-600 focus:outline-none"
                aria-label={showCurrent ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            hasError={!!errors.currentPassword}
            disabled={isLoading}
            {...register('currentPassword')}
          />
        </FormField>

        <FormField
          label="Kata Sandi Baru"
          required
          error={errors.newPassword?.message}
          htmlFor="new-password"
        >
          <Input
            id="new-password"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Minimal 8 karakter"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNew((p) => !p)}
                className="hover:text-gray-600 focus:outline-none"
                aria-label={showNew ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            hasError={!!errors.newPassword}
            disabled={isLoading}
            {...register('newPassword')}
          />
        </FormField>

        <FormField
          label="Konfirmasi Kata Sandi Baru"
          required
          error={errors.confirmPassword?.message}
          htmlFor="confirm-password"
        >
          <Input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Ulangi kata sandi baru"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className="hover:text-gray-600 focus:outline-none"
                aria-label={showConfirm ? 'Sembunyikan konfirmasi password' : 'Lihat konfirmasi password'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
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
          Perbarui Kata Sandi
        </Button>
      </form>
    </div>
  );
}
export default ChangePasswordForm;
