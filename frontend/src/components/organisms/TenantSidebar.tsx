import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Building2,
  PlusCircle,
  User,
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  CalendarRange,
  Tags,
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function SidebarLink({ to, icon, label, isActive }: SidebarLinkProps): React.JSX.Element {
  const activeClass = isActive
    ? 'bg-primary-50 text-primary-700 font-semibold border-l-4 border-primary-600'
    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  return (
    <Link to={to} className={`flex items-center gap-3 px-3.5 py-2.5 rounded-r-lg text-sm transition-colors ${activeClass}`}>
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function SidebarHeaderDashboard({ isActive }: { isActive: boolean }): React.JSX.Element {
  const cls = isActive
    ? 'bg-primary-600 text-white shadow-xs'
    : 'bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200/80';
  return (
    <div className="mb-4">
      <Link to="/tenant/dashboard" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${cls}`}>
        <span className="w-5 h-5 flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4" />
        </span>
        <span>Dashboard</span>
      </Link>
    </div>
  );
}

function SidebarTransactionGroup({ p }: { p: string }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Manajemen Transaksi</p>
      <SidebarLink to="/tenant/orders" icon={<ClipboardList className="w-4 h-4" />} label="Kelola Pesanan" isActive={p === '/tenant/orders'} />
    </div>
  );
}

function SidebarPropertyGroup({ p }: { p: string }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider pt-3 mb-2">Manajemen Properti</p>
      <SidebarLink to="/tenant/properties/new" icon={<PlusCircle className="w-4 h-4" />} label="Tambah Properti" isActive={p === '/tenant/properties/new'} />
      <SidebarLink to="/tenant/properties" icon={<Building2 className="w-4 h-4" />} label="Kelola Properti" isActive={p === '/tenant/properties'} />
      <SidebarLink to="/tenant/categories" icon={<Tags className="w-4 h-4" />} label="Kategori Properti" isActive={p === '/tenant/categories'} />
    </div>
  );
}

function SidebarReportGroup({ p }: { p: string }) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider pt-3 mb-2">Laporan / Analytic</p>
      <SidebarLink to="/tenant/reports/sales" icon={<BarChart3 className="w-4 h-4" />} label="Laporan Penjualan" isActive={p === '/tenant/reports/sales'} />
      <SidebarLink to="/tenant/reports/occupancy" icon={<CalendarRange className="w-4 h-4" />} label="Matriks Okupansi" isActive={p === '/tenant/reports/occupancy'} />
    </div>
  );
}

function SidebarFooter({ p }: { p: string }) {
  return (
    <div className="pt-6 border-t border-gray-100">
      <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pengaturan Akun</p>
      <SidebarLink to="/profile" icon={<User className="w-4 h-4" />} label="Profil Saya" isActive={p === '/profile'} />
    </div>
  );
}

export function TenantSidebar(): React.JSX.Element {
  const { pathname } = useLocation();
  return (
    <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 space-y-3">
      <SidebarHeaderDashboard isActive={pathname === '/tenant/dashboard'} />
      <SidebarTransactionGroup p={pathname} />
      <SidebarPropertyGroup p={pathname} />
      <SidebarReportGroup p={pathname} />
      <SidebarFooter p={pathname} />
    </aside>
  );
}
