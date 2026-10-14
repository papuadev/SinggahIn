import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Spinner } from '../components/atoms/Spinner';
import { Button } from '../components/atoms/Button';
import { Alert } from '../components/atoms/Alert';
import { SEOHead } from '../components/atoms/SEOHead';

export function VerifyEmailChangePage(): React.JSX.Element {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const { verifyEmailChange, isAuthenticated } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatedEmail, setUpdatedEmail] = useState<string>('');

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      setErrorMessage('Token verifikasi tidak ditemukan dalam tautan URL.');
      return;
    }

    let isMounted = true;
    verifyEmailChange(token)
      .then((user) => {
        if (!isMounted) return;
        setUpdatedEmail(user.email);
        setIsSuccess(true);
        setIsLoading(false);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        setErrorMessage(
          err.message || 'Tautan verifikasi email tidak valid atau sudah kedaluwarsa.'
        );
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmailChange]);

  return (
    <div className="max-w-md mx-auto py-12">
      <SEOHead
        title="Verifikasi Perubahan Email - SinggahIn"
        description="Konfirmasi dan aktivasi email baru untuk akun SinggahIn Anda."
      />

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        {isLoading && (
          <div className="py-8 space-y-4">
            <Spinner size="lg" className="mx-auto text-primary-600" />
            <p className="text-gray-600 text-sm font-medium">
              Memverifikasi perubahan email akun Anda...
            </p>
          </div>
        )}

        {!isLoading && isSuccess && (
          <div className="space-y-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Email Berhasil Diperbarui!</h2>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Alamat email akun Anda kini resmi diperbarui menjadi{' '}
                <strong className="text-gray-800">{updatedEmail || 'email baru Anda'}</strong>.
              </p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 text-left">
              Mulai sekarang, gunakan alamat email ini untuk proses masuk dan semua notifikasi reservasi.
            </div>

            <div className="pt-2">
              <Link to={isAuthenticated ? '/profile' : '/login'}>
                <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  {isAuthenticated ? 'Kembali ke Profil' : 'Masuk ke Akun'}
                </Button>
              </Link>
            </div>
          </div>
        )}

        {!isLoading && !isSuccess && (
          <div className="space-y-5">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">Verifikasi Gagal</h2>
              <div className="mt-3">
                <Alert variant="error">
                  {errorMessage || 'Tautan verifikasi tidak valid atau telah kedaluwarsa.'}
                </Alert>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Tautan verifikasi email hanya berlaku selama 1 jam. Silakan ajukan permohonan perubahan email kembali dari menu pengaturan profil.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <Link to="/profile" className="w-full">
                <Button variant="outline" size="md" className="w-full">
                  Buka Pengaturan Profil
                </Button>
              </Link>
              <Link to="/" className="w-full">
                <Button variant="ghost" size="md" className="w-full text-gray-600">
                  Kembali ke Beranda
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default VerifyEmailChangePage;
