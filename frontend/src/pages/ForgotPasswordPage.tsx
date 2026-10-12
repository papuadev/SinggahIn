import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../modules/identity/schemas/identity.schema';
import { identityApi } from '../modules/identity/services/identity.api';
import { FormField } from '../components/molecules/FormField';
import { Input } from '../components/atoms/Input';
import { Button } from '../components/atoms/Button';
import { Alert } from '../components/atoms/Alert';
import { SEOHead } from '../components/atoms/SEOHead';

function SuccessView({ email, onReset }: { email: string; onReset: () => void }): React.JSX.Element {
  return (
    <div className="text-center space-y-4">
      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-7 h-7" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Periksa Email Anda</h3>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          Jika alamat <strong className="text-gray-800">{email}</strong> terdaftar di SinggahIn, kami telah mengirimkan instruksi dan tautan untuk mengatur ulang kata sandi Anda.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-3 text-xs text-amber-800 text-left">
        <strong>Tips Keamanan:</strong> Tautan hanya berlaku selama <strong>1 jam</strong>. Harap periksa folder kotak masuk atau Spam jika email belum muncul dalam beberapa menit.
      </div>

      <div className="pt-2 flex flex-col gap-2.5">
        <Button variant="outline" size="md" onClick={onReset} className="w-full">
          Kirim Ulang ke Email Lain
        </Button>
        <Link to="/login" className="w-full">
          <Button variant="primary" size="md" className="w-full">
            Kembali ke Halaman Masuk
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ForgotPasswordPage(): React.JSX.Element {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setServerError(null);
    setIsLoading(true);
    try {
      await identityApi.forgotPassword(data);
      setSubmittedEmail(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Terjadi kesalahan saat memproses permintaan reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setSubmittedEmail('');
    setServerError(null);
    reset();
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <SEOHead
        title="Lupa Password - SinggahIn"
        description="Atur ulang password akun SinggahIn Anda dengan mudah dan aman."
      />

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        {!isSuccess ? (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Lupa Password?</h2>
              <p className="text-sm text-gray-600 mt-1">
                Masukkan alamat email yang terdaftar untuk menerima tautan pemulihan kata sandi.
              </p>
            </div>

            {serverError && (
              <div className="mb-4">
                <Alert variant="error">{serverError}</Alert>
              </div>
            )}

            <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                label="Alamat Email Akun"
                required
                error={errors.email?.message}
                htmlFor="forgot-email"
              >
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  hasError={!!errors.email}
                  disabled={isLoading}
                  {...register('email')}
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full mt-2"
              >
                Kirim Tautan Reset Password
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali ke Masuk
              </Link>
            </div>
          </div>
        ) : (
          <SuccessView email={submittedEmail} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}
export default ForgotPasswordPage;
