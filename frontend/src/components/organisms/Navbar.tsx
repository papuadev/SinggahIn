import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, LayoutDashboard, Compass } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { RoleBadge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

function UserAvatarVisual({ user }: { user: { avatarUrl?: string | null; name?: string | null } }): React.JSX.Element {
  if (user.avatarUrl) {
    return <img src={user.avatarUrl} alt={user.name || 'Avatar'} className="w-full h-full object-cover" />;
  }
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

function DropdownLinks({ isTenant, onSelect }: { isTenant: boolean; onSelect: () => void }): React.JSX.Element {
  return (
    <div className="py-1 text-sm text-gray-700">
      {isTenant && (
        <Link to="/tenant/properties" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors">
          <LayoutDashboard className="w-4 h-4 text-primary-600 shrink-0" /> Dasbor Properti
        </Link>
      )}
      <Link to="/" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors">
        <Compass className="w-4 h-4 text-primary-600 shrink-0" /> Cari Penginapan
      </Link>
      <Link to="/profile" onClick={onSelect} className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 hover:text-primary-600 transition-colors">
        <UserIcon className="w-4 h-4 text-primary-600 shrink-0" /> Profil Saya
      </Link>
    </div>
  );
}

function LogoutItem({ onLogout }: { onLogout: () => void }): React.JSX.Element {
  return (
    <div className="py-1 border-t border-gray-100">
      <button type="button" onClick={onLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer">
        <LogOut className="w-4 h-4 text-rose-600 shrink-0" /> Keluar
      </button>
    </div>
  );
}

interface DropdownProps {
  user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

function UserDropdownMenu({ user, isOpen, onClose, onLogout }: DropdownProps): React.JSX.Element | null {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} aria-hidden="true" />
      <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-1 divide-y divide-gray-100">
        <AccountInfoHeader user={user} />
        <DropdownLinks isTenant={user.role === 'TENANT'} onSelect={onClose} />
        <LogoutItem onLogout={onLogout} />
      </div>
    </>
  );
}

function AvatarTrigger({ user, isOpen, onClick }: { user: NonNullable<ReturnType<typeof useAuthStore.getState>['user']>; isOpen: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-label="Menu Akun"
      className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 transition-all cursor-pointer shadow-xs"
    >
      <UserAvatarVisual user={user} />
    </button>
  );
}

function UserMenu(): React.JSX.Element {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const handleLogout = async () => { setIsOpen(false); await logout(); navigate('/'); };
  if (!user) return <div />;
  return (
    <div className="relative">
      <AvatarTrigger user={user} isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
      <UserDropdownMenu user={user} isOpen={isOpen} onClose={() => setIsOpen(false)} onLogout={handleLogout} />
    </div>
  );
}

function GuestButtons(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Link to="/login">
        <Button variant="ghost" size="sm" leftIcon={<UserIcon className="w-4 h-4" />}>
          Masuk
        </Button>
      </Link>
      <Link to="/register" className="hidden sm:inline-block">
        <Button variant="primary" size="sm">
          Daftar
        </Button>
      </Link>
    </div>
  );
}

function BrandLogo(): React.JSX.Element {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="text-2xl font-black tracking-tight text-primary-600">
        SinggahIn
      </span>
    </Link>
  );
}

export function Navbar(): React.JSX.Element {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <BrandLogo />
        {isAuthenticated ? <UserMenu /> : <GuestButtons />}
      </div>
    </header>
  );
}
