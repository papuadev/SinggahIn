import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { Role } from '../../types/auth.types';
import { Spinner } from '../atoms/Spinner';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: Role;
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps): React.JSX.Element {
  const { user, isAuthenticated, isLoading, isInitialized, setConflict } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user && requiredRole && user.role !== requiredRole) {
      setConflict({
        currentRole: user.role,
        targetRole: requiredRole,
        onConfirm: () => navigate(`/login?role=${requiredRole}`),
      });
    }
  }, [isAuthenticated, user, requiredRole, setConflict, navigate]);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={`/login${requiredRole ? `?role=${requiredRole}` : ''}`} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <div className="py-20 text-center text-gray-500">Memerlukan akses peran {requiredRole}...</div>;
  }

  return <>{children}</>;
}
