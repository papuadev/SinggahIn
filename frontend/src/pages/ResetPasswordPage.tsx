import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { resetPasswordSchema, ResetPasswordFormData } from '../modules/identity/schemas/identity.schema';
import { identityApi } from '../modules/identity/services/identity.api';
import { FormField } from '../components/molecules/FormField';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Alert } from '../components/atoms/Alert';
import { SEOHead } from '../components/atoms/SEOHead';

function NoTokenView(): React.JSX.Element {
  return (
    <div className="space-y-4 text-center">
      <Alert variant="error" title="Token Tidak Ditemukan">
        Tautan reset password tidak memiliki token yang valid atau sudah kedaluwarsa. Silakan ajukan permohonan reset password ulang.
      </Alert>
      <Link to="/forgot-password">
        <Button variant="primary" size="md" className="w-full">
          Ajukan Ulang Reset Password
        </Button>
      </Link>
    </div>
  );
}

function SuccessResetView(): React.JSX.Element {
  return (
    <div className="text-center space-y-4">
      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Password Berhasil Diperbarui!</h3>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Kata sandi akun Anda telah berhasil diatur ulang. Anda sekarang dapat masuk menggunakan password baru.
        </p>
      </div>

      <div className="pt-2">
        <Link to="/login" className="w-full">
          <Button variant="primary" size="md" className="w-full">
            Masuk ke Akun
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ResetPasswordPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await identityApi.resetPassword({
        token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Gagal mengatur ulang kata sandi. Tautan mungkin telah kedaluwarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <SEOHead
        title="Atur Ulang Password - SinggahIn"
        description="Buat kata sandi baru yang kuat untuk akun SinggahIn Anda."
      />

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        {!token ? (
          <NoTokenView />
        ) : isSuccess ? (
          <SuccessResetView />
        ) : (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Atur Ulang Kata Sandi</h2>
              <p className="text-sm text-gray-600 mt-1">
                Masukkan kata sandi baru untuk akun Anda. Minimal 8 karakter.
              </p>
            </div>

            {serverError && (
              <div className="mb-4">
                <Alert variant="error">{serverError}</Alert>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                label="Kata Sandi Baru"
                required
                error={errors.password?.message}
                htmlFor="new-password"
              >
                <Input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
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

              <FormField
                label="Konfirmasi Kata Sandi Baru"
                required
                error={errors.confirmPassword?.message}
                htmlFor="confirm-new-password"
              >
                <Input
                  id="confirm-new-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi kata sandi baru"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="hover:text-gray-600 focus:outline-none"
                      aria-label={showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Lihat konfirmasi password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                Simpan Kata Sandi Baru
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
export default ResetPasswordPage;
