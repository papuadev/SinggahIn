import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { LoginForm } from '../modules/identity/components/LoginForm';
import { useAuthStore } from '../stores/auth.store';
import { LoginFormData } from '../modules/identity/schemas/identity.schema';
import { Role } from '../types/auth.types';

function LoginHeader(): React.JSX.Element {
  return (
    <div className="text-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Masuk ke SinggahIn</h2>
      <p className="text-sm text-gray-600 mt-1">
        Silakan masuk untuk melanjutkan reservasi atau mengelola properti.
      </p>
    </div>
  );
}

function RegisterPrompt({ role }: { role: string }): React.JSX.Element {
  return (
    <div className="mt-6 text-center text-sm text-gray-600">
      Belum punya akun?{' '}
      <Link to={`/register?role=${role}`} className="font-semibold text-primary-600 hover:text-primary-500">
        Daftar sekarang
      </Link>
    </div>
  );
}

function useLoginRedirect(isAuthenticated: boolean, role?: Role) {
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(role === 'TENANT' ? '/tenant/dashboard' : '/');
    }
  }, [isAuthenticated, role, navigate]);
}

function LoginCard({ roleParam, onSubmit, isLoading, error }: any): React.JSX.Element {
  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <LoginHeader />
        <LoginForm initialRole={roleParam as Role} onSubmit={onSubmit} isLoading={isLoading} serverError={error} />
        <RegisterPrompt role={roleParam} />
      </div>
    </div>
  );
}

export function LoginPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, login, clearError } = useAuthStore();
  const roleParam = params.get('role')?.toUpperCase() === 'TENANT' ? 'TENANT' : 'USER';

  useEffect(() => { clearError(); }, [clearError]);
  useLoginRedirect(isAuthenticated, user?.role);
  const onSubmit = async (d: LoginFormData) => {
    const u = await login(d);
    navigate(u.role === 'TENANT' ? '/tenant/dashboard' : '/');
  };

  return <LoginCard roleParam={roleParam} onSubmit={onSubmit} isLoading={isLoading} error={error} />;
}
