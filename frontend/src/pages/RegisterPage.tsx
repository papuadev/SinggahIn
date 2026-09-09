import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { RegisterForm } from '../modules/identity/components/RegisterForm';
import { useAuthStore } from '../stores/auth.store';
import { RegisterFormData } from '../modules/identity/schemas/identity.schema';
import { Role } from '../types/auth.types';

export function RegisterPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const { isLoading, error, register, clearError } = useAuthStore();

  const roleParam = params.get('role')?.toUpperCase() === 'TENANT' ? 'TENANT' : 'USER';

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (data: RegisterFormData) => {
    return await register(data);
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Bergabung dengan SinggahIn</h2>
          <p className="text-sm text-gray-600 mt-1">
            Daftar mudah tanpa password awal. Kami akan mengirimkan tautan aktivasi ke email Anda.
          </p>
        </div>

        <RegisterForm
          initialRole={roleParam as Role}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          serverError={error}
        />

        <div className="mt-6 text-center text-sm text-gray-600">
          Sudah punya akun?{' '}
          <Link
            to={`/login?role=${roleParam}`}
            className="font-semibold text-primary-600 hover:text-primary-500"
          >
            Masuk ke akun
          </Link>
        </div>
      </div>
    </div>
  );
}
