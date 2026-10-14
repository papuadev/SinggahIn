import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, ClipboardList, Building2, LayoutDashboard, BarChart3, User } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon, label, isActive }: NavItemProps): React.JSX.Element {
  const activeClass = isActive ? 'text-primary-600 font-bold' : 'text-gray-500 hover:text-gray-700 font-medium';
  return (
    <Link to={to} className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors min-w-0 ${activeClass}`}>
      <span className="w-5 h-5 flex items-center justify-center mb-0.5 shrink-0">{icon}</span>
      <span className="text-[11px] sm:text-xs leading-tight truncate max-w-full px-0.5">{label}</span>
    </Link>
  );
}

function UserNavItems({ pathname, isAuth }: { pathname: string; isAuth: boolean }): React.JSX.Element {
  const isOrders = pathname.startsWith('/orders');
  const isProfile = pathname.startsWith('/profile');
  return (
    <>
      <NavItem to="/" icon={<Compass className="w-5 h-5" />} label="Jelajah" isActive={pathname === '/'} />
      <NavItem to={isAuth ? '/orders' : '/login'} icon={<ClipboardList className="w-5 h-5" />} label="Pesanan" isActive={isOrders} />
      <NavItem to={isAuth ? '/profile' : '/login'} icon={<User className="w-5 h-5" />} label={isAuth ? 'Profil' : 'Masuk'} isActive={isProfile} />
    </>
  );
}

function TenantNavItems({ pathname }: { pathname: string }): React.JSX.Element {
  const isProp = pathname.startsWith('/tenant/properties') || pathname.startsWith('/tenant/categories');
  return (
    <>
      <NavItem to="/tenant/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" isActive={pathname === '/tenant/dashboard'} />
      <NavItem to="/tenant/orders" icon={<ClipboardList className="w-5 h-5" />} label="Pesanan" isActive={pathname.startsWith('/tenant/orders')} />
      <NavItem to="/tenant/properties" icon={<Building2 className="w-5 h-5" />} label="Properti" isActive={isProp} />
      <NavItem to="/tenant/reports/sales" icon={<BarChart3 className="w-5 h-5" />} label="Laporan" isActive={pathname.startsWith('/tenant/reports')} />
      <NavItem to="/profile" icon={<User className="w-5 h-5" />} label="Profil" isActive={pathname.startsWith('/profile')} />
    </>
  );
}

export function MobileBottomNav(): React.JSX.Element | null {
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  if (pathname.startsWith('/properties/')) return null;

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-gray-200 md:hidden px-1 py-1 flex items-center justify-around shadow-lg">
      {user?.role === 'TENANT' ? <TenantNavItems pathname={pathname} /> : <UserNavItems pathname={pathname} isAuth={isAuthenticated} />}
    </nav>
  );
}
