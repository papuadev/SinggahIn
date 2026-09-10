import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
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

export function ProfileForm({
  user,
  onUpdateProfile,
  onUploadAvatar,
  isLoading = false,
}: ProfileFormProps): React.JSX.Element {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      phoneNumber: user.phoneNumber || '',
    },
  });

  const handleFormSubmit = async (data: ProfileFormData) => {
    setServerError(null);
    setSuccessMsg(null);
    try {
      await onUpdateProfile(data);
      setSuccessMsg('Profil Anda berhasil diperbarui.');
    } catch (err: any) {
      setServerError(err.message || 'Gagal memperbarui profil.');
    }
  };

  return (
    <div className="space-y-6">
      {successMsg && <Alert variant="success">{successMsg}</Alert>}
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <div className="flex flex-col items-center pb-4 border-b border-gray-100">
        <AvatarUploader
          currentAvatarUrl={user.avatarUrl}
          userName={user.name}
          onUpload={onUploadAvatar}
          disabled={isLoading}
        />
        <div className="mt-3 text-center">
          <h3 className="text-lg font-bold text-gray-900">{user.name || 'Pengguna'}</h3>
          <div className="mt-1 flex items-center justify-center gap-2">
            <RoleBadge role={user.role} />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField label="Alamat Email (Akun)" hint="Email akun tidak dapat diubah secara langsung." htmlFor="profile-email">
          <Input
            id="profile-email"
            type="email"
            value={user.email}
            disabled
            leftIcon={<Mail className="w-4 h-4 text-gray-400" />}
          />
        </FormField>

        <FormField label="Nama Lengkap" required error={errors.name?.message} htmlFor="profile-name">
          <Input
            id="profile-name"
            type="text"
            placeholder="Nama Anda"
            leftIcon={<UserIcon className="w-4 h-4" />}
            hasError={!!errors.name}
            disabled={isLoading}
            {...register('name')}
          />
        </FormField>

        <FormField label="Nomor Telepon" error={errors.phoneNumber?.message} hint="Contoh: 08123456789 (9-16 digit)" htmlFor="profile-phone">
          <Input
            id="profile-phone"
            type="tel"
            placeholder="08xxxxxxxxxx"
            leftIcon={<Phone className="w-4 h-4" />}
            hasError={!!errors.phoneNumber}
            disabled={isLoading}
            {...register('phoneNumber')}
          />
        </FormField>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          disabled={!isDirty && !isLoading}
          className="w-full mt-2"
        >
          Simpan Perubahan
        </Button>
      </form>
    </div>
  );
}
