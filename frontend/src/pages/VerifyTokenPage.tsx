import React, { useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { VerifyForm } from '../modules/identity/components/VerifyForm';
import { useAuthStore } from '../stores/auth.store';
import { VerifyFormData } from '../modules/identity/schemas/identity.schema';
import { Alert } from '../components/atoms/Alert';
import { Button } from '../components/atoms/Button';

function NoTokenState(): React.JSX.Element {
  return (
    <div className="space-y-4 text-center">
      <Alert variant="error" title="Token Tidak Ditemukan">
        Tautan verifikasi tidak memiliki token yang valid atau sudah kedaluwarsa. Silakan lakukan registrasi ulang.
      </Alert>
      <Link to="/register">
        <Button variant="primary" size="md">
          Daftar Ulang
        </Button>
      </Link>
    </div>
  );
}

export function VerifyTokenPage(): React.JSX.Element {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';
  const { isLoading, error, verify, clearError } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (data: VerifyFormData) => {
    await verify(data);
    navigate('/');
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Aktivasi Akun SinggahIn</h2>
          <p className="text-sm text-gray-600 mt-1">
            Lengkapi nama dan buat password untuk mengaktifkan akun Anda.
          </p>
        </div>

        {!token ? (
          <NoTokenState />
        ) : (
          <VerifyForm
            token={token}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            serverError={error}
          />
        )}
      </div>
    </div>
  );
}
