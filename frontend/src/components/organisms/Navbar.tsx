import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { RoleBadge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

function UserMenu(): React.JSX.Element {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return <div />;

  return (
    <div className="flex items-center gap-3">
      <RoleBadge role={user.role} />
      <div className="text-right hidden sm:block">
        <p className="text-sm font-semibold text-gray-800">{user.name || 'Pengguna'}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        leftIcon={<LogOut className="w-4 h-4" />}
        aria-label="Keluar"
      >
        Keluar
      </Button>
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
      <Link to="/register">
        <Button variant="primary" size="sm">
          Daftar
        </Button>
      </Link>
    </div>
  );
}

export function Navbar(): React.JSX.Element {
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-primary-600">
              SinggahIn
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600">
            <Link to="/" className="hover:text-primary-600 transition-colors">
              Cari Penginapan
            </Link>
          </nav>
        </div>
        <div>{isAuthenticated ? <UserMenu /> : <GuestButtons />}</div>
      </div>
    </header>
  );
}
