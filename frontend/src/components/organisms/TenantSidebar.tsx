import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, PlusCircle, Compass } from 'lucide-react';

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

export function TenantSidebar(): React.JSX.Element {
  const { pathname } = useLocation();
  const isList = pathname === '/tenant/properties';
  const isNew = pathname === '/tenant/properties/new';

  return (
    <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] p-4 space-y-6">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Manajemen Properti</p>
        <SidebarLink to="/tenant/properties" icon={<Building2 className="w-4 h-4" />} label="Daftar Properti" isActive={isList} />
        <SidebarLink to="/tenant/properties/new" icon={<PlusCircle className="w-4 h-4" />} label="Tambah Properti" isActive={isNew} />
      </div>
      <div className="pt-6 border-t border-gray-100">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Akses Cepat</p>
        <SidebarLink to="/" icon={<Compass className="w-4 h-4" />} label="Mode Tamu (Eksplor)" isActive={false} />
      </div>
    </aside>
  );
}
