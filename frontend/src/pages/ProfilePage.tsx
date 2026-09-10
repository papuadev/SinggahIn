import React from 'react';
import { useAuthStore } from '../stores/auth.store';
import { ProfileForm } from '../modules/identity/components/ProfileForm';
import { ProfileFormData } from '../modules/identity/schemas/identity.schema';
import { Spinner } from '../components/atoms/Spinner';

export function ProfilePage(): React.JSX.Element {
  const { user, isLoading, updateProfile, uploadAvatar } = useAuthStore();

  if (!user) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const handleUpdateProfile = async (data: ProfileFormData) => {
    await updateProfile(data);
  };

  const handleUploadAvatar = async (file: File) => {
    return await uploadAvatar(file);
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan Profil</h2>
          <p className="text-sm text-gray-600 mt-1">
            Kelola identitas akun, foto profil, dan informasi kontak Anda.
          </p>
        </div>

        <ProfileForm
          user={user}
          onUpdateProfile={handleUpdateProfile}
          onUploadAvatar={handleUploadAvatar}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
