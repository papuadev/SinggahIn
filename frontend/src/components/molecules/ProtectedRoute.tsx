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

function UnauthorizedRedirect({ role }: { role: Role }): React.JSX.Element {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="min-h-[50vh] flex flex-col items-center justify-center py-16 px-4 space-y-4 text-center animate-fade-in"
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle modern ambient pulse ring */}
        <div className="absolute w-12 h-12 rounded-full bg-primary-100/70 animate-ping opacity-60" />
        {/* Sleek minimalist spinner */}
        <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-primary-600 animate-spin" />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-base font-semibold text-gray-900">
          Silahkan login sebagai {role} untuk mengakses halaman ini
        </h3>
        <p className="text-xs text-gray-400">
          Mengalihkan ke halaman utama...
        </p>
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  requiredRole,
  disallowedRole,
}: ProtectedRouteProps): React.JSX.Element {
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) return <RouteSpinner />;
  if (disallowedRole && isAuthenticated && user?.role === disallowedRole) {
    return <ForbiddenPage />;
  }
  if (requiredRole && (!isAuthenticated || !user)) {
    return <UnauthorizedRedirect role={requiredRole} />;
  }
  if (requiredRole && user?.role !== requiredRole) {
    return <ForbiddenPage />;
  }
  if (!requiredRole && !disallowedRole && (!isAuthenticated || !user)) {
    return <UnauthorizedRedirect role="USER" />;
  }
  return <>{children}</>;
}
