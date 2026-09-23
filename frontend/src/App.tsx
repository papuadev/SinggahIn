import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuthStore } from "./stores/auth.store";
import { Navbar } from "./components/organisms/Navbar";
import { MobileBottomNav } from "./components/organisms/MobileBottomNav";
import { TenantLayout } from "./components/organisms/TenantLayout";
import { AccountSwitchModal } from "./components/organisms/AccountSwitchModal";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyTokenPage } from "./pages/VerifyTokenPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProtectedRoute } from "./components/molecules/ProtectedRoute";
import { TenantPropertyListPage } from "./pages/tenant/TenantPropertyListPage";
import { TenantPropertyCreatePage } from "./pages/tenant/TenantPropertyCreatePage";
import { TenantPropertyEditPage } from "./pages/tenant/TenantPropertyEditPage";
import { HomePage } from "./pages/HomePage";
import { CatalogSearchPage } from "./pages/CatalogSearchPage";
import { PropertyDetailPage } from "./pages/PropertyDetailPage";

function TenantPlaceholder(): React.JSX.Element {
  return (
    <div className="py-12 text-center">
      <h3 className="text-2xl font-bold text-gray-900">
        Dasbor Pemilik Properti (Tenant)
      </h3>
      <p className="text-gray-600 mt-2">
        Area khusus untuk mengelola properti, kamar, dan tarif sewa.
      </p>
    </div>
  );
}

function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<CatalogSearchPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyTokenPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/tenant" element={<ProtectedRoute requiredRole="TENANT"><TenantLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<TenantPlaceholder />} />
        <Route path="properties" element={<TenantPropertyListPage />} />
        <Route path="properties/new" element={<TenantPropertyCreatePage />} />
        <Route path="properties/:id/edit" element={<TenantPropertyEditPage />} />
      </Route>
    </Routes>
  );
}

function AppFooter(): React.JSX.Element {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-500">
      &copy; {new Date().getFullYear()} SinggahIn. Hak cipta dilindungi.
    </footer>
  );
}

export default function App(): React.JSX.Element {
  const { checkAuth } = useAuthStore();
  useEffect(() => { checkAuth(); }, [checkAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900 pb-16 md:pb-0">
        <Navbar />
        <AccountSwitchModal />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8"><AppRoutes /></main>
        <AppFooter />
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
}
