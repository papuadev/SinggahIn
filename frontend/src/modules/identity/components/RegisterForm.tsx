import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, CheckCircle2, ArrowRight } from 'lucide-react';
import { registerSchema, RegisterFormData } from '../schemas/identity.schema';
import { FormField } from '../../../components/molecules/FormField';
import { RoleSelector } from '../../../components/molecules/RoleSelector';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';
import { Role } from '../../../types/auth.types';

export interface RegisterFormProps {
  initialRole?: Role;
  onSubmit: (data: RegisterFormData) => Promise<{ email: string; role: Role }>;
  isLoading?: boolean;
  serverError?: string | null;
}

function RegisterSuccessView({ email, onReset }: { email: string; onReset: () => void }) {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"><CheckCircle2 className="w-8 h-8" /></div>
      <div className="space-y-1">
        <h4 className="text-xl font-bold text-gray-900">Periksa Email Anda</h4>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">Kami telah mengirimkan tautan verifikasi ke <strong>{email}</strong>. Tautan berlaku selama <strong>1 jam</strong>.</p>
      </div>
      <Button variant="outline" size="md" onClick={onReset} rightIcon={<ArrowRight className="w-4 h-4" />} className="mx-auto">Daftar dengan email lain</Button>
    </div>
  );
}

function EmailRegisterField({ register, errors, isLoading }: any) {
  return (
    <FormField label="Alamat Email" required error={errors.email?.message} hint="Kami akan mengirimkan tautan aktivasi akun ke email ini (Passwordless)." htmlFor="register-email">
      <Input
        id="register-email" type="email" autoComplete="email" placeholder="nama@email.com"
        leftIcon={<Mail className="w-4 h-4" />} hasError={!!errors.email} disabled={isLoading}
        {...register('email')}
      />
    </FormField>
  );
}

function useRegisterFormState(initialRole: Role, onSubmit: (data: RegisterFormData) => Promise<{ email: string; role: Role }>) {
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema), defaultValues: { email: '', role: initialRole } });
  const selectedRole = watch('role');
  const submit = async (data: RegisterFormData) => { const res = await onSubmit(data); setSuccessEmail(res.email); };
  return {
    register, errors, selectedRole, successEmail, setSuccessEmail,
    handleRoleChange: (r: Role) => setValue('role', r), handleSubmit: handleSubmit(submit),
  };
}

export function RegisterForm(props: RegisterFormProps): React.JSX.Element {
  const { initialRole = 'USER', onSubmit, isLoading = false, serverError } = props;
  const s = useRegisterFormState(initialRole, onSubmit);
  if (s.successEmail) return <RegisterSuccessView email={s.successEmail} onReset={() => s.setSuccessEmail(null)} />;
  return (
    <form onSubmit={s.handleSubmit} className="space-y-4">
      {serverError && <Alert variant="error">{serverError}</Alert>}
      <FormField label="Daftar Sebagai"><RoleSelector value={s.selectedRole} onChange={s.handleRoleChange} disabled={isLoading} /></FormField>
      <EmailRegisterField register={s.register} errors={s.errors} isLoading={isLoading} />
      <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full mt-2">Daftar & Kirim Tautan Verifikasi</Button>
    </form>
  );
}
