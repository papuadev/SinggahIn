import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, LayoutDashboard, Compass, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { RoleBadge } from '../../atoms/Badge';

function UserAvatarVisual({ user }: { user: { avatarUrl?: string | null; name?: string | null } }): React.JSX.Element {
  if (user.avatarUrl) return <img src={user.avatarUrl} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />;
  return <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>;
}

function AccountInfoHeader({ user }: { user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']> }): React.JSX.Element {
  return (
    <div className="px-4 py-3 border-b border-gray-100">
      <p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'Pengguna'}</p>
      <p className="text-xs text-gray-500 truncate mb-2">{user.email}</p>
      <RoleBadge role={user.role} />
    </div>
  );
}

function TenantLinks({ onSelect }: { onSelect: () => void }) {
  return (
    <>
      <Link to="/tenant/dashboard" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors">
        <LayoutDashboard className="w-4 h-4 text-primary-600 shrink-0" /> Dashboard
      </Link>
      <Link to="/tenant/orders" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors">
        <ClipboardList className="w-4 h-4 text-primary-600 shrink-0" /> Kelola Pesanan
      </Link>
    </>
  );
}

function CommonLinks({ onSelect, isTenant }: { onSelect: () => void; isTenant: boolean }) {
  return (
    <>
      {!isTenant && <Link to="/orders" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors"><ClipboardList className="w-4 h-4 text-primary-600 shrink-0" /> Pesanan Saya</Link>}
      {!isTenant && <Link to="/" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors"><Compass className="w-4 h-4 text-primary-600 shrink-0" /> Cari Penginapan</Link>}
      <Link to="/profile" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors"><UserIcon className="w-4 h-4 text-primary-600 shrink-0" /> Profil Saya</Link>
    </>
  );
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="py-1 border-t border-gray-100">
      <button type="button" onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer">
        <LogOut className="w-4 h-4 text-rose-600 shrink-0" /> Keluar
      </button>
    </div>
  );
}

function MenuLinksSection({ user, onClose }: any) {
  return (
    <div className="py-1 text-sm text-gray-700">
      {user.role === 'TENANT' && <TenantLinks onSelect={onClose} />}
      <CommonLinks onSelect={onClose} isTenant={user.role === 'TENANT'} />
    </div>
  );
}

function UserDropdownMenu({ user, isOpen, onClose, onLogout }: any): React.JSX.Element | null {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 divide-y divide-gray-100">
        <AccountInfoHeader user={user} />
        <MenuLinksSection user={user} onClose={onClose} />
        <LogoutButton onLogout={onLogout} />
      </div>
    </>
  );
}

function AvatarTriggerButton({ isOpen, onToggle, user }: any) {
  return (
    <button
      type="button" onClick={onToggle} aria-expanded={isOpen} aria-label="Menu Akun"
      className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 transition-all cursor-pointer shadow-xs"
    >
      <UserAvatarVisual user={user} />
    </button>
  );
}

export function UserMenu(): React.JSX.Element {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = async () => { setIsOpen(false); await logout(); navigate('/login'); };
  if (!user) return <div />;

  return (
    <div className="relative">
      <AvatarTriggerButton isOpen={isOpen} onToggle={() => setIsOpen((p) => !p)} user={user} />
      <UserDropdownMenu user={user} isOpen={isOpen} onClose={() => setIsOpen(false)} onLogout={handleLogout} />
    </div>
  );
}
