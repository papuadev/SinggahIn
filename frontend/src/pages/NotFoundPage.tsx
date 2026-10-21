import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, Home, LayoutDashboard, ArrowLeft, Search } from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { Button } from '../components/atoms/Button';

function NotFoundIcon(): React.JSX.Element {
  return (
    <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
      <div className="absolute inset-0 rounded-2xl bg-primary-500/10 animate-pulse" />
      <div className="relative w-16 h-16 rounded-xl bg-primary-50 border border-primary-200 flex items-center justify-center shadow-xs">
        <Compass className="w-8 h-8 text-primary-600 animate-spin-slow" aria-hidden="true" />
      </div>
    </div>
  );
}

function NotFoundBadge(): React.JSX.Element {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-100 text-primary-800 text-xs font-semibold uppercase tracking-wider mb-3">
      <span>404</span>
      <span className="text-primary-400">•</span>
      <span>Tidak Ditemukan</span>
    </div>
  );
}

function NotFoundDescription(): React.JSX.Element {
  return (
    <p className="text-sm text-gray-600 leading-relaxed mb-6">
      Halaman atau alamat URL yang Anda tuju mungkin telah dipindahkan, dihapus, atau tidak pernah ada.
      Periksa kembali tautan Anda atau kembali ke halaman yang tersedia.
    </p>
  );
}

function TenantNotFoundActions(): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
      <Link to="/tenant/dashboard" className="w-full sm:w-auto">
        <Button variant="primary" size="md" className="w-full" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
          Dasbor Tenant
        </Button>
      </Link>
      <Button variant="outline" size="md" onClick={() => navigate(-1)} className="w-full sm:w-auto" leftIcon={<ArrowLeft className="w-4 h-4" />}>
        Halaman Sebelumnya
      </Button>
    </div>
  );
}

function GuestNotFoundActions(): React.JSX.Element {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
      <Link to="/" className="w-full sm:w-auto">
        <Button variant="primary" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>Kembali ke Beranda</Button>
      </Link>
      <Link to="/search" className="w-full sm:w-auto">
        <Button variant="outline" size="md" className="w-full" leftIcon={<Search className="w-4 h-4" />}>Cari Penginapan</Button>
      </Link>
    </div>
  );
}

function NotFoundCard({ isTenant }: { isTenant: boolean }): React.JSX.Element {
  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xs border border-gray-200 p-8 sm:p-10 text-center">
      <NotFoundIcon />
      <NotFoundBadge />
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">
        Halaman Tidak Ditemukan
      </h1>
      <NotFoundDescription />
      <div className="pt-2">
        {isTenant ? <TenantNotFoundActions /> : <GuestNotFoundActions />}
      </div>
    </div>
  );
}

export function NotFoundPage(): React.JSX.Element {
  const { user } = useAuthStore();
  const isTenant = user?.role === 'TENANT';

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 sm:px-6">
      <NotFoundCard isTenant={isTenant} />
    </div>
  );
}
