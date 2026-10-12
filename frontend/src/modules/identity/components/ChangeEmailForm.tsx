import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import {
  requestEmailChangeSchema,
  RequestEmailChangeFormData,
} from '../schemas/identity.schema';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';

export interface ChangeEmailFormProps {
  currentEmail: string;
  onRequestEmailChange: (data: RequestEmailChangeFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ChangeEmailForm({
  currentEmail,
  onRequestEmailChange,
  isLoading = false,
}: ChangeEmailFormProps): React.JSX.Element {
  const [showPassword, setShowPassword] = useState(false);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RequestEmailChangeFormData>({
    resolver: zodResolver(requestEmailChangeSchema),
    defaultValues: { newEmail: '', password: '' },
  });

  const onSubmit = async (data: RequestEmailChangeFormData) => {
    setServerError(null);
    try {
      await onRequestEmailChange(data);
      setSuccessEmail(data.newEmail);
      reset();
    } catch (err: any) {
      setServerError(err.message || 'Gagal mengajukan perubahan email.');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-blue-50/70 border border-blue-200/80 p-4 text-xs text-blue-900 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          Proses Verifikasi Wajib
        </div>
        <p className="leading-relaxed text-blue-800">
          Email Anda saat ini: <strong className="font-semibold">{currentEmail}</strong>.
          Setelah formulir dikirim, tautan verifikasi akan dikirimkan ke alamat email baru.
          Email lama tetap aktif sampai Anda mengklik tautan konfirmasi.
        </p>
      </div>

      {successEmail && (
        <Alert variant="success" title="Tautan Verifikasi Telah Dikirim">
          Kami telah mengirimkan instruksi ke <strong className="font-semibold">{successEmail}</strong>. Silakan periksa inbox atau folder spam Anda untuk menyelesaikan perubahan email.
        </Alert>
      )}

      {serverError && <Alert variant="error">{serverError}</Alert>}

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label="Alamat Email Baru"
          required
          error={errors.newEmail?.message}
          htmlFor="new-email"
        >
          <Input
            id="new-email"
            type="email"
            autoComplete="email"
            placeholder="nama@emailbaru.com"
            leftIcon={<Mail className="w-4 h-4" />}
            hasError={!!errors.newEmail}
            disabled={isLoading}
            {...register('newEmail')}
          />
        </FormField>

        <FormField
          label="Password Akun (Konfirmasi Keamanan)"
          required
          error={errors.password?.message}
          htmlFor="current-acc-password"
        >
          <Input
            id="current-acc-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Masukkan password akun Anda"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
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
          Kirim Verifikasi Email Baru
        </Button>
      </form>
    </div>
  );
}
export default ChangeEmailForm;
