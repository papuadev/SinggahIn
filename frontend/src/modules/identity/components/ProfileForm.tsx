import React, { useState, useEffect } from 'react';
import { useForm, UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as UserIcon, Phone, Mail } from 'lucide-react';
import { profileSchema, ProfileFormData } from '../schemas/identity.schema';
import { FormField } from '../../../components/molecules/FormField';
import { Input } from '../../../components/atoms/Input';
import { Button } from '../../../components/atoms/Button';
import { Alert } from '../../../components/atoms/Alert';
import { RoleBadge } from '../../../components/atoms/Badge';
import { AvatarUploader } from '../../../components/molecules/AvatarUploader';
import { User } from '../../../types/auth.types';

export interface ProfileFormProps {
  user: User;
  onUpdateProfile: (data: ProfileFormData) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<string>;
  isLoading?: boolean;
}

function useAutoDismissMessage(
  successMsg: string | null, serverError: string | null,
  setSuccess: (v: string | null) => void, setError: (v: string | null) => void
): boolean {
  const [isExiting, setIsExiting] = useState(false);
  useEffect(() => {
    if (!successMsg && !serverError) return;
    setIsExiting(false);
    const t1 = setTimeout(() => setIsExiting(true), 4700);
    const t2 = setTimeout(() => { setSuccess(null); setError(null); setIsExiting(false); }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [successMsg, serverError, setSuccess, setError]);
  return isExiting;
}

function FormAlerts({ successMsg, serverError, isExiting }: { successMsg: string | null; serverError: string | null; isExiting: boolean }) {
  if (!successMsg && !serverError) return null;
  const animCls = isExiting ? 'animate-fade-out opacity-0' : 'animate-fade-in opacity-100';
  return (
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${animCls}`}>
      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {serverError && <Alert variant="error">{serverError}</Alert>}
    </div>
  );
}

function ProfileHeader({ user, onUploadAvatar, isLoading }: { user: User; onUploadAvatar: (f: File) => Promise<string>; isLoading: boolean }) {
  return (
    <div className="flex flex-col items-center pb-4 border-b border-gray-100">
      <AvatarUploader currentAvatarUrl={user.avatarUrl} userName={user.name} onUpload={onUploadAvatar} disabled={isLoading} />
      <div className="mt-3 text-center">
        <h3 className="text-lg font-bold text-gray-900">{user.name || 'Pengguna'}</h3>
        <div className="mt-1 flex items-center justify-center gap-2"><RoleBadge role={user.role} /></div>
      </div>
    </div>
  );
}

function EmailField({ email }: { email: string }) {
  return (
    <FormField label="Alamat Email (Akun)" hint="Email akun tidak dapat diubah secara langsung." htmlFor="profile-email">
      <Input id="profile-email" type="email" value={email} disabled leftIcon={<Mail className="w-4 h-4 text-gray-400" />} />
    </FormField>
  );
}

interface InputFieldsProps {
  register: UseFormRegister<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  isLoading: boolean;
}

function NameField({ register, errors, isLoading }: InputFieldsProps) {
  return (
    <FormField label="Nama Lengkap" required error={errors.name?.message} htmlFor="profile-name">
      <Input id="profile-name" type="text" placeholder="Nama Anda" leftIcon={<UserIcon className="w-4 h-4" />} hasError={!!errors.name} disabled={isLoading} {...register('name')} />
    </FormField>
  );
}

function PhoneField({ register, errors, isLoading }: InputFieldsProps) {
  return (
    <FormField label="Nomor Telepon" error={errors.phoneNumber?.message} hint="Contoh: 08123456789 (9-16 digit)" htmlFor="profile-phone">
      <Input id="profile-phone" type="tel" placeholder="08xxxxxxxxxx" leftIcon={<Phone className="w-4 h-4" />} hasError={!!errors.phoneNumber} disabled={isLoading} {...register('phoneNumber')} />
    </FormField>
  );
}

function SubmitButton({ isLoading, disabled }: { isLoading: boolean; disabled: boolean }) {
  return (
    <Button type="submit" variant="primary" size="lg" isLoading={isLoading} disabled={disabled} className="w-full mt-2">
      Simpan Perubahan
    </Button>
  );
}

function ProfileFields({ email, register, errors, isLoading, isDirty }: any) {
  return (
    <>
      <EmailField email={email} />
      <NameField register={register} errors={errors} isLoading={isLoading} />
      <PhoneField register={register} errors={errors} isLoading={isLoading} />
      <SubmitButton isLoading={isLoading} disabled={!isDirty && !isLoading} />
    </>
  );
}

function useProfileFormSubmit(onUpdateProfile: (data: ProfileFormData) => Promise<void>) {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const isExiting = useAutoDismissMessage(successMsg, serverError, setSuccessMsg, setServerError);

  const onSubmit = (data: ProfileFormData) => {
    setServerError(null);
    setSuccessMsg(null);
    return onUpdateProfile(data)
      .then(() => setSuccessMsg('Profil Anda berhasil diperbarui.'))
      .catch((err) => setServerError(err.message || 'Gagal memperbarui profil.'));
  };
  return { successMsg, serverError, isExiting, onSubmit };
}

function useProfileFormInstance(user: User) {
  return useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name || '', phoneNumber: user.phoneNumber || '' },
  });
}

export function ProfileForm({ user, onUpdateProfile, onUploadAvatar, isLoading = false }: ProfileFormProps): React.JSX.Element {
  const { successMsg, serverError, isExiting, onSubmit } = useProfileFormSubmit(onUpdateProfile);
  const { register, handleSubmit, formState: { errors, isDirty } } = useProfileFormInstance(user);
  return (
    <div>
      <FormAlerts successMsg={successMsg} serverError={serverError} isExiting={isExiting} />
      <div className="space-y-6">
        <ProfileHeader user={user} onUploadAvatar={onUploadAvatar} isLoading={isLoading} />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ProfileFields email={user.email} register={register} errors={errors} isLoading={isLoading} isDirty={isDirty} />
        </form>
      </div>
    </div>
  );
}
