import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Spinner } from '../components/atoms/Spinner';
import { Button } from '../components/atoms/Button';
import { Alert } from '../components/atoms/Alert';
import { SEOHead } from '../components/atoms/SEOHead';

function VerifyLoadingView() {
  return (
    <div className="py-8 space-y-4">
      <Spinner size="lg" className="mx-auto text-primary-600" />
      <p className="text-gray-600 text-sm font-medium">Memverifikasi perubahan email akun Anda...</p>
    </div>
  );
}

function VerifySuccessView({ updatedEmail, isAuthenticated }: { updatedEmail: string; isAuthenticated: boolean }) {
  const target = isAuthenticated ? '/profile' : '/login';
  const label = isAuthenticated ? 'Kembali ke Profil' : 'Masuk ke Akun';
  return (
    <div className="space-y-5">
      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm"><CheckCircle2 className="w-7 h-7" /></div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Email Berhasil Diperbarui!</h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">Alamat email akun Anda kini resmi diperbarui menjadi <strong className="text-gray-800">{updatedEmail || 'email baru Anda'}</strong>.</p>
      </div>
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3 text-xs text-emerald-800 text-left">Mulai sekarang, gunakan alamat email ini untuk proses masuk dan semua notifikasi reservasi.</div>
      <div className="pt-2"><Link to={target}><Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>{label}</Button></Link></div>
    </div>
  );
}

function ErrorActionButtons() {
  return (
    <div className="pt-2 flex flex-col gap-2">
      <Link to="/profile" className="w-full"><Button variant="outline" size="md" className="w-full">Buka Pengaturan Profil</Button></Link>
      <Link to="/" className="w-full"><Button variant="ghost" size="md" className="w-full text-gray-600">Kembali ke Beranda</Button></Link>
    </div>
  );
}

function VerifyErrorView({ error }: { error: string | null }) {
  return (
    <div className="space-y-5">
      <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm"><AlertCircle className="w-7 h-7" /></div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Verifikasi Gagal</h2>
        <div className="mt-3"><Alert variant="error">{error || 'Tautan verifikasi tidak valid atau telah kedaluwarsa.'}</Alert></div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">Tautan verifikasi email hanya berlaku selama 1 jam. Silakan ajukan permohonan perubahan email kembali dari menu pengaturan profil.</p>
      <ErrorActionButtons />
    </div>
  );
}

function runVerifyEffect(token: string, verify: (t: string) => Promise<any>, set: any) {
  if (!token) { set.setIsLoading(false); set.setErrorMessage('Token verifikasi tidak ditemukan dalam tautan URL.'); return () => {}; }
  let isMounted = true;
  verify(token)
    .then((u) => { if (isMounted) { set.setUpdatedEmail(u.email); set.setIsSuccess(true); set.setIsLoading(false); } })
    .catch((e: any) => { if (isMounted) { set.setErrorMessage(e.message || 'Tautan verifikasi email tidak valid atau sudah kedaluwarsa.'); set.setIsLoading(false); } });
  return () => { isMounted = false; };
}

function useVerifyEmailToken(token: string) {
  const { verifyEmailChange } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatedEmail, setUpdatedEmail] = useState('');
  useEffect(() => runVerifyEffect(token, verifyEmailChange, { setIsLoading, setErrorMessage, setUpdatedEmail, setIsSuccess }), [token, verifyEmailChange]);
  return { isLoading, isSuccess, errorMessage, updatedEmail };
}

export function VerifyEmailChangePage(): React.JSX.Element {
  const [params] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { isLoading, isSuccess, errorMessage, updatedEmail } = useVerifyEmailToken(params.get('token') || '');
  return (
    <div className="max-w-md mx-auto py-12">
      <SEOHead title="Verifikasi Perubahan Email - SinggahIn" description="Konfirmasi dan aktivasi email baru untuk akun SinggahIn Anda." />
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        {isLoading && <VerifyLoadingView />}
        {!isLoading && isSuccess && <VerifySuccessView updatedEmail={updatedEmail} isAuthenticated={isAuthenticated} />}
        {!isLoading && !isSuccess && <VerifyErrorView error={errorMessage} />}
      </div>
    </div>
  );
}

export default VerifyEmailChangePage;
