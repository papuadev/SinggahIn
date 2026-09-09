import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/auth.store';
import { Navbar } from './components/organisms/Navbar';
import { AccountSwitchModal } from './components/organisms/AccountSwitchModal';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyTokenPage } from './pages/VerifyTokenPage';
import { ProtectedRoute } from './components/molecules/ProtectedRoute';

function HomePage(): React.JSX.Element {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Selamat Datang di SinggahIn</h2>
      <p className="text-gray-600 max-w-xl mx-auto">
        Platform sewa properti, villa, hotel, apartemen, dan guesthouse terpercaya di seluruh Nusantara.
      </p>
    </div>
  );
}

function TenantPlaceholder(): React.JSX.Element {
  return (
    <div className="py-12 text-center">
      <h3 className="text-2xl font-bold text-gray-900">Dasbor Pemilik Properti (Tenant)</h3>
      <p className="text-gray-600 mt-2">Area khusus untuk mengelola properti, kamar, dan tarif sewa.</p>
    </div>
  );
}

export default function App(): React.JSX.Element {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900">
        <Navbar />
        <AccountSwitchModal />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify" element={<VerifyTokenPage />} />
            <Route
              path="/tenant/dashboard"
              element={
                <ProtectedRoute requiredRole="TENANT">
                  <TenantPlaceholder />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
        <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SinggahIn. Hak cipta dilindungi.
        </footer>
      </div>
    </BrowserRouter>
  );
}
