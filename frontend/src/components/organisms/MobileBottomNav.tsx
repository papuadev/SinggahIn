import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Building2, User } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

function NavItem({ to, icon, label, isActive }: NavItemProps): React.JSX.Element {
  const activeClass = isActive ? 'text-primary-600 font-semibold' : 'text-gray-500 hover:text-gray-700';
  return (
    <Link to={to} className={`flex flex-col items-center justify-center py-1 flex-1 text-center transition-colors ${activeClass}`}>
      <span className="w-5 h-5 flex items-center justify-center mb-0.5">{icon}</span>
      <span className="text-[11px] leading-tight">{label}</span>
    </Link>
  );
}

function TenantNavItem({ pathname }: { pathname: string }): React.JSX.Element {
  const isActive = pathname.startsWith('/tenant/properties');
  return <NavItem to="/tenant/properties" icon={<Building2 className="w-5 h-5" />} label="Properti" isActive={isActive} />;
}

function AccountNavItem({ isAuthenticated, pathname }: { isAuthenticated: boolean; pathname: string }): React.JSX.Element {
  const target = isAuthenticated ? '/profile' : '/login';
  const label = isAuthenticated ? 'Akun' : 'Masuk';
  const isActive = pathname.startsWith(target);
  return <NavItem to={target} icon={<User className="w-5 h-5" />} label={label} isActive={isActive} />;
}

export function MobileBottomNav(): React.JSX.Element {
  const { pathname } = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  const isExploreActive = pathname === '/';

  return (
    <nav aria-label="Mobile Navigation" className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t border-gray-200 md:hidden px-2 py-1 flex items-center justify-around shadow-lg">
      <NavItem to="/" icon={<Compass className="w-5 h-5" />} label="Jelajah" isActive={isExploreActive} />
      {user?.role === 'TENANT' && <TenantNavItem pathname={pathname} />}
      <AccountNavItem isAuthenticated={isAuthenticated} pathname={pathname} />
    </nav>
  );
}
