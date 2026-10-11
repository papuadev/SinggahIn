import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Home, LayoutDashboard, LogOut, LogIn, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/atoms/Button';

function ForbiddenIcon(): React.JSX.Element {
  return (
    <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
      <div className="absolute inset-0 rounded-2xl bg-amber-500/10 animate-pulse" />
      <div className="relative w-16 h-16 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shadow-xs">
        <ShieldAlert className="w-8 h-8 text-amber-600" aria-hidden="true" />
      </div>
    </div>
  );
}

function RoleBadgeHeader(): React.JSX.Element {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-3">
      <span>403</span>
      <span className="text-amber-400">•</span>
      <span>Akses Dibatasi</span>
    </div>
  );
}

function ForbiddenExplanation({ role }: { role?: string }): React.JSX.Element {
  if (role === 'TENANT') {
    return (
      <p className="text-sm text-gray-600 leading-relaxed">
        Akun Anda terdaftar sebagai <strong className="text-gray-900">Tenant (Pemilik Properti)</strong>.
        Sesuai kebijakan keamanan SinggahIn, akun Tenant hanya dapat mengakses area manajemen properti
        dan tidak dapat mengakses halaman eksplorasi atau pemesanan tamu biasa.
      </p>
    );
  }
  if (role === 'USER') {
    return (
      <p className="text-sm text-gray-600 leading-relaxed">
        Akun Anda terdaftar sebagai <strong className="text-gray-900">Penyewa (User)</strong>.
        Halaman ini merupakan area khusus pengelolaan properti untuk Tenant dan tidak dapat diakses
        oleh akun penyewa biasa.
      </p>
    );
  }
  return (
    <p className="text-sm text-gray-600 leading-relaxed">
      Anda tidak memiliki izin yang sesuai untuk membuka halaman ini. Silakan masuk dengan akun yang memiliki hak akses.
    </p>
  );
}

function TenantActions({ onLogout }: { onLogout: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
      <Link to="/tenant/orders" className="w-full sm:w-auto">
        <Button variant="primary" size="md" className="w-full" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
          Dasbor Tenant
        </Button>
      </Link>
      <Button variant="outline" size="md" onClick={onLogout} className="w-full sm:w-auto" leftIcon={<LogOut className="w-4 h-4" />}>
        Keluar Akun
      </Button>
    </div>
  );
}

function UserActions({ onLogout }: { onLogout: () => void }): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
      <Link to="/" className="w-full sm:w-auto">
        <Button variant="primary" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
          Kembali ke Beranda
        </Button>
      </Link>
      <Button variant="outline" size="md" onClick={onLogout} className="w-full sm:w-auto" leftIcon={<LogOut className="w-4 h-4" />}>
        Keluar Akun
      </Button>
    </div>
  );
}

function GuestActions(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
      <Link to="/login" className="w-full sm:w-auto">
        <Button variant="primary" size="md" className="w-full" leftIcon={<LogIn className="w-4 h-4" />}>
          Masuk ke Akun
        </Button>
      </Link>
      <Button variant="outline" size="md" onClick={() => navigate(-1)} className="w-full sm:w-auto" leftIcon={<ArrowLeft className="w-4 h-4" />}>
        Kembali
      </Button>
    </div>
  );
}

function ForbiddenActionSlot({ role, isAuth, onLogout }: { role?: string; isAuth: boolean; onLogout: () => void }) {
  if (isAuth && role === 'TENANT') return <TenantActions onLogout={onLogout} />;
  if (isAuth && role === 'USER') return <UserActions onLogout={onLogout} />;
  return <GuestActions />;
}

function ForbiddenCard({ role, isAuth, onLogout }: { role?: string; isAuth: boolean; onLogout: () => void }): React.JSX.Element {
  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xs border border-gray-200 p-8 sm:p-10 text-center">
      <ForbiddenIcon />
      <RoleBadgeHeader />
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">Akses Tidak Diizinkan</h1>
      <ForbiddenExplanation role={isAuth ? role : undefined} />
      <div className="mt-6 pt-2"><ForbiddenActionSlot role={role} isAuth={isAuth} onLogout={onLogout} /></div>
    </div>
  );
}

export function ForbiddenPage(): React.JSX.Element {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const onLogout = async () => { await logout(); navigate('/login'); };
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <ForbiddenCard role={user?.role} isAuth={isAuthenticated} onLogout={onLogout} />
    </div>
  );
}
