import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../modules/identity/components/LoginForm';
import { useAuthStore } from '../stores/auth.store';
import { LoginFormData } from '../modules/identity/schemas/identity.schema';
import { Role } from '../types/auth.types';

export function LoginPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, login, setConflict, clearError } = useAuthStore();

  const roleParam = params.get('role')?.toUpperCase() === 'TENANT' ? 'TENANT' : 'USER';

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (isAuthenticated && user && user.role !== roleParam) {
      setConflict({
        currentRole: user.role,
        targetRole: roleParam,
        onConfirm: () => navigate(`/login?role=${roleParam}`),
      });
    }
  }, [isAuthenticated, user, roleParam, setConflict, navigate]);

  const handleSubmit = async (data: LoginFormData) => {
    if (isAuthenticated && user && user.role !== data.role) {
      setConflict({
        currentRole: user.role,
        targetRole: data.role,
        onConfirm: () => navigate(`/login?role=${data.role}`),
      });
      return;
    }
    await login(data);
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Masuk ke SinggahIn</h2>
          <p className="text-sm text-gray-600 mt-1">
            Silakan masuk untuk melanjutkan reservasi atau mengelola properti.
          </p>
        </div>

        <LoginForm
          initialRole={roleParam as Role}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          serverError={error}
        />

        <div className="mt-6 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <Link
            to={`/register?role=${roleParam}`}
            className="font-semibold text-primary-600 hover:text-primary-500"
          >
            Daftar sekarang
          </Link>
        </div>
      </div>
    </div>
  );
}
