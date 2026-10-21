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
      <Link to="/forgot-password"><Button variant="primary" size="md" className="w-full">Ajukan Ulang Reset Password</Button></Link>
    </div>
  );
}

function SuccessResetView(): React.JSX.Element {
  return (
    <div className="text-center space-y-4">
      <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm"><CheckCircle2 className="w-7 h-7" /></div>
      <div>
        <h3 className="text-xl font-bold text-gray-900">Password Berhasil Diperbarui!</h3>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">Kata sandi akun Anda telah berhasil diatur ulang. Anda sekarang dapat masuk menggunakan password baru.</p>
      </div>
      <div className="pt-2"><Link to="/login" className="w-full"><Button variant="primary" size="md" className="w-full">Masuk ke Akun</Button></Link></div>
    </div>
  );
}

function ToggleEyeBtn({ show, onToggle, label }: { show: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" onClick={onToggle} className="hover:text-gray-600 focus:outline-none" aria-label={label}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );
}

function ResetFormHeader() {
  return (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Atur Ulang Kata Sandi</h2>
      <p className="text-sm text-gray-600 mt-1">Masukkan kata sandi baru untuk akun Anda. Minimal 8 karakter.</p>
    </div>
  );
}

function ResetFormBody({ form, s }: any) {
  return (
    <form noValidate onSubmit={form.handleSubmit(s.onSubmit)} className="space-y-4">
      <FormField label="Kata Sandi Baru" required error={form.formState.errors.password?.message} htmlFor="new-password">
        <Input id="new-password" type={s.showPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter" leftIcon={<Lock className="w-4 h-4" />} rightIcon={<ToggleEyeBtn show={s.showPassword} onToggle={() => s.setShowPassword((p: boolean) => !p)} label={s.showPassword ? 'Sembunyikan password' : 'Lihat password'} />} hasError={!!form.formState.errors.password} disabled={s.isLoading} {...form.register('password')} />
      </FormField>
      <FormField label="Konfirmasi Kata Sandi Baru" required error={form.formState.errors.confirmPassword?.message} htmlFor="confirm-new-password">
        <Input id="confirm-new-password" type={s.showConfirmPassword ? 'text' : 'password'} placeholder="Ulangi kata sandi baru" leftIcon={<Lock className="w-4 h-4" />} rightIcon={<ToggleEyeBtn show={s.showConfirmPassword} onToggle={() => s.setShowConfirmPassword((p: boolean) => !p)} label={s.showConfirmPassword ? 'Sembunyikan konfirmasi password' : 'Lihat konfirmasi password'} />} hasError={!!form.formState.errors.confirmPassword} disabled={s.isLoading} {...form.register('confirmPassword')} />
      </FormField>
      <Button type="submit" variant="primary" size="lg" isLoading={s.isLoading} className="w-full mt-2">Simpan Kata Sandi Baru</Button>
    </form>
  );
}

async function handleResetPasswordSubmit(token: string, data: ResetPasswordFormData, set: any) {
  set.setServerError(null);
  set.setIsLoading(true);
  try {
    await identityApi.resetPassword({ token, password: data.password, confirmPassword: data.confirmPassword });
    set.setIsSuccess(true);
  } catch (err: any) {
    set.setServerError(err.message || 'Gagal mengatur ulang kata sandi. Tautan mungkin telah kedaluwarsa.');
  } finally { set.setIsLoading(false); }
}

function useResetPasswordState(token: string) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const form = useForm<ResetPasswordFormData>({ resolver: zodResolver(resetPasswordSchema), defaultValues: { token, password: '', confirmPassword: '' } });
  const onSubmit = (d: ResetPasswordFormData) => handleResetPasswordSubmit(token, d, { setServerError, setIsLoading, setIsSuccess });
  return { isSuccess, serverError, isLoading, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword, form, onSubmit };
}

function ResetPasswordContent({ token, s }: any) {
  if (!token) return <NoTokenView />;
  if (s.isSuccess) return <SuccessResetView />;
  return (
    <div>
      <ResetFormHeader />
      {s.serverError && <div className="mb-4"><Alert variant="error">{s.serverError}</Alert></div>}
      <ResetFormBody form={s.form} s={s} />
    </div>
  );
}

export function ResetPasswordPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const s = useResetPasswordState(token);
  return (
    <div className="max-w-md mx-auto py-8">
      <SEOHead title="Atur Ulang Password - SinggahIn" description="Buat kata sandi baru yang kuat untuk akun SinggahIn Anda." />
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <ResetPasswordContent token={token} s={s} />
      </div>
    </div>
  );
}

export default ResetPasswordPage;
