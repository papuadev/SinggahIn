import React, { useState } from 'react';
import { User as UserIcon, Mail, Lock } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { ProfileForm } from '../modules/identity/components/ProfileForm';
import { ChangeEmailForm } from '../modules/identity/components/ChangeEmailForm';
import { ChangePasswordForm } from '../modules/identity/components/ChangePasswordForm';
import { Spinner } from '../components/atoms/Spinner';
import { BackButton } from '../components/atoms/BackButton';
import { SEOHead } from '../components/atoms/SEOHead';

type ProfileTab = 'profile' | 'email' | 'password';

function ProfileHeader() {
  return (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Pengaturan Akun</h2>
      <p className="text-sm text-gray-600 mt-1">Kelola data pribadi, alamat email, dan keamanan akun Anda.</p>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  const cls = active ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-800';
  return (
    <button type="button" onClick={onClick} className={`flex items-center justify-center gap-2 pb-3 px-3 sm:px-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${cls}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
}

function ProfileTabNav({ activeTab, onTab }: { activeTab: ProfileTab; onTab: (t: ProfileTab) => void }) {
  return (
    <div className="flex justify-center items-center border-b border-gray-200 mb-6 gap-2 sm:gap-6 overflow-x-auto">
      <TabBtn active={activeTab === 'profile'} onClick={() => onTab('profile')} icon={UserIcon} label="Profil" />
      <TabBtn active={activeTab === 'email'} onClick={() => onTab('email')} icon={Mail} label="Ubah Email" />
      <TabBtn active={activeTab === 'password'} onClick={() => onTab('password')} icon={Lock} label="Ubah Password" />
    </div>
  );
}

function ProfileTabContent({ tab, user, a }: any) {
  if (tab === 'email') return <ChangeEmailForm currentEmail={user.email} onRequestEmailChange={(d) => a.requestEmailChange(d)} isLoading={a.isLoading} />;
  if (tab === 'password') return <ChangePasswordForm onChangePassword={(d) => a.changePassword(d)} isLoading={a.isLoading} />;
  return <ProfileForm user={user} onUpdateProfile={(d) => a.updateProfile(d)} onUploadAvatar={(f) => a.uploadAvatar(f)} isLoading={a.isLoading} />;
}

function ProfileCard({ tab, onTab, user, a }: any) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
      <ProfileHeader />
      <ProfileTabNav activeTab={tab} onTab={onTab} />
      <ProfileTabContent tab={tab} user={user} a={a} />
    </div>
  );
}

export function ProfilePage(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const a = useAuthStore();
  if (!a.user) return <div className="flex justify-center items-center py-20"><Spinner size="lg" /></div>;
  return (
    <div className="max-w-xl mx-auto py-8">
      <SEOHead title="Pengaturan Profil - SinggahIn" description="Kelola profil akun, ubah email dengan verifikasi, dan perbarui kata sandi SinggahIn Anda." />
      <BackButton fallbackUrl="/" className="mb-3" />
      <ProfileCard tab={activeTab} onTab={setActiveTab} user={a.user} a={a} />
    </div>
  );
}

export default ProfilePage;
