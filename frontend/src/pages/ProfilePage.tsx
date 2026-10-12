import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { ProfileForm } from '../modules/identity/components/ProfileForm';
import { ChangeEmailForm } from '../modules/identity/components/ChangeEmailForm';
import { ChangePasswordForm } from '../modules/identity/components/ChangePasswordForm';
import {
  ProfileFormData,
  RequestEmailChangeFormData,
  ChangePasswordFormData,
} from '../modules/identity/schemas/identity.schema';
import { Spinner } from '../components/atoms/Spinner';
import { BackButton } from '../components/atoms/BackButton';
import { SEOHead } from '../components/atoms/SEOHead';

type ProfileTab = 'profile' | 'email' | 'password';

export function ProfilePage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const {
    user,
    isLoading,
    updateProfile,
    uploadAvatar,
    requestEmailChange,
    changePassword,
  } = useAuthStore();

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

  const handleRequestEmailChange = async (data: RequestEmailChangeFormData) => {
    await requestEmailChange(data);
  };

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    await changePassword(data);
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <SEOHead
        title="Pengaturan Profil - SinggahIn"
        description="Kelola profil akun, ubah email dengan verifikasi, dan perbarui kata sandi SinggahIn Anda."
      />

      <BackButton fallbackUrl="/" className="mb-3" />
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h2>
          <p className="text-sm text-gray-600 mt-1">
            Kelola data pribadi, alamat email, dan keamanan akun Anda.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center items-center border-b border-gray-200 mb-6 gap-2 sm:gap-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center gap-2 pb-3 px-3 sm:px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <UserIcon className="w-4 h-4" /> Profil
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex items-center justify-center gap-2 pb-3 px-3 sm:px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'email'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Mail className="w-4 h-4" /> Ubah Email
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex items-center justify-center gap-2 pb-3 px-3 sm:px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'password'
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Lock className="w-4 h-4" /> Ubah Password
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <ProfileForm
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onUploadAvatar={handleUploadAvatar}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'email' && (
          <ChangeEmailForm
            currentEmail={user.email}
            onRequestEmailChange={handleRequestEmailChange}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'password' && (
          <ChangePasswordForm
            onChangePassword={handleChangePassword}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
export default ProfilePage;
