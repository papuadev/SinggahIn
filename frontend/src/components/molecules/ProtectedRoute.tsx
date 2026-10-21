import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Role } from '../../types/auth.types';
import { Spinner } from '../atoms/Spinner';
import { ForbiddenPage } from '../../pages/ForbiddenPage';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
  disallowedRole?: Role;
}

function RouteSpinner(): React.JSX.Element {
  return (
    <div className="flex justify-center items-center py-20">
      <Spinner size="lg" />
    </div>
  );
}

function useAutoRedirect(delay = 2000, target = '/') {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => navigate(target, { replace: true }), delay);
    return () => clearTimeout(timer);
  }, [navigate, delay, target]);
}

function RedirectSpinner(): React.JSX.Element {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute w-12 h-12 rounded-full bg-primary-100/70 animate-ping opacity-60" />
      <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
    </div>
  );
}

function UnauthorizedRedirect({ role }: { role: Role }): React.JSX.Element {
  useAutoRedirect(2000, '/');
  return (
    <div role="status" aria-live="polite" className="min-h-[50vh] flex flex-col items-center justify-center py-16 px-4 space-y-4 text-center animate-fade-in">
      <RedirectSpinner />
      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-semibold text-gray-900">Silahkan login sebagai {role} untuk mengakses halaman ini</h3>
        <p className="text-xs text-gray-400">Mengalihkan ke halaman utama...</p>
      </div>
    </div>
  );
}

function checkRoutePermission(userRole?: Role | null, required?: Role, disallowed?: Role): 'ALLOWED' | 'FORBIDDEN' | 'REDIRECT' {
  if (disallowed && userRole === disallowed) return 'FORBIDDEN';
  if (required && !userRole) return 'REDIRECT';
  if (required && userRole !== required) return 'FORBIDDEN';
  if (!required && !disallowed && !userRole) return 'REDIRECT';
  return 'ALLOWED';
}

export function ProtectedRoute({ children, requiredRole, disallowedRole }: ProtectedRouteProps): React.JSX.Element {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  if (!isInitialized) return <RouteSpinner />;
  const role = isAuthenticated ? user?.role : null;
  const status = checkRoutePermission(role, requiredRole, disallowedRole);
  if (status === 'FORBIDDEN') return <ForbiddenPage />;
  if (status === 'REDIRECT') return <UnauthorizedRedirect role={requiredRole || 'USER'} />;
  return <>{children}</>;
}
