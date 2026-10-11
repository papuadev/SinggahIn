import React from 'react';
import { Navigate } from 'react-router-dom';
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
    return <Navigate to={`/login?role=${requiredRole}`} replace />;
  }
  if (requiredRole && user?.role !== requiredRole) {
    return <ForbiddenPage />;
  }
  if (!requiredRole && !disallowedRole && (!isAuthenticated || !user)) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
