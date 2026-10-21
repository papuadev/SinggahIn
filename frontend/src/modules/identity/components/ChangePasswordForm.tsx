import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { changePasswordSchema, ChangePasswordFormData } from '../schemas/identity.schema';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';
import { useAuthStore } from '../../../stores/auth.store';
import { MinimalistLoadingTransition } from './ChangePasswordSuccessState';
import { PasswordFieldInput } from './PasswordFieldInput';

export interface ChangePasswordFormProps {
  onChangePassword: (data: ChangePasswordFormData) => Promise<void>;
  isLoading?: boolean;
}

function PasswordPolicyNotice(): React.JSX.Element {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 text-xs text-slate-700 space-y-1">
      <div className="flex items-center gap-1.5 font-bold text-slate-800">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        Ketentuan Kata Sandi
      </div>
      <p className="leading-relaxed text-slate-600">Kata sandi baru minimal 8 karakter dan harus berbeda dari kata sandi saat ini.</p>
    </div>
  );
}

function usePasswordRedirect(isSuccess: boolean) {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  useEffect(() => {
    if (!isSuccess) return;
    const timer = setTimeout(() => { logout().finally(() => navigate('/login')); }, 1800);
    return () => clearTimeout(timer);
  }, [isSuccess, logout, navigate]);
}

function useChangePasswordState(onChangePassword: (data: ChangePasswordFormData) => Promise<void>) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const form = useForm<ChangePasswordFormData>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });
  usePasswordRedirect(isSuccess);
  const onSubmit = async (data: ChangePasswordFormData) => {
    setServerError(null);
    try { await onChangePassword(data); setIsSuccess(true); form.reset(); }
    catch (err: any) { setServerError(err.message || 'Gagal memperbarui kata sandi.'); }
  };
  return { isSuccess, serverError, form, onSubmit };
}

function PasswordFieldsGroup({ form, isLoading }: { form: any; isLoading: boolean }) {
  const { register, formState: { errors } } = form;
  return (
    <>
      <PasswordFieldInput id="current-password" label="Kata Sandi Saat Ini" placeholder="Masukkan kata sandi saat ini" error={errors.currentPassword?.message} disabled={isLoading} registration={register('currentPassword')} autoComplete="current-password" />
      <PasswordFieldInput id="new-password" label="Kata Sandi Baru" placeholder="Minimal 8 karakter" error={errors.newPassword?.message} disabled={isLoading} registration={register('newPassword')} autoComplete="new-password" />
      <PasswordFieldInput id="confirm-password" label="Konfirmasi Kata Sandi Baru" placeholder="Ulangi kata sandi baru" error={errors.confirmPassword?.message} disabled={isLoading} registration={register('confirmPassword')} autoComplete="new-password" />
    </>
  );
}

export function ChangePasswordForm({ onChangePassword, isLoading = false }: ChangePasswordFormProps): React.JSX.Element {
  const { isSuccess, serverError, form, onSubmit } = useChangePasswordState(onChangePassword);
  if (isSuccess) return <MinimalistLoadingTransition />;
  return (
    <div className="space-y-5">
      <PasswordPolicyNotice />
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PasswordFieldsGroup form={form} isLoading={isLoading} />
        <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">Perbarui Kata Sandi</Button>
      </form>
    </div>
  );
}
export default ChangePasswordForm;
