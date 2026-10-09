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
import { TenantDashboardPage } from "./pages/tenant/TenantDashboardPage";
import { TenantPropertyListPage } from "./pages/tenant/TenantPropertyListPage";
import { TenantPropertyCreatePage } from "./pages/tenant/TenantPropertyCreatePage";
import { TenantPropertyEditPage } from "./pages/tenant/TenantPropertyEditPage";
import { TenantOrderManagementPage } from "./pages/tenant/TenantOrderManagementPage";
import { HomePage } from "./pages/HomePage";
import { CatalogSearchPage } from "./pages/CatalogSearchPage";
import { PropertyDetailPage } from "./pages/PropertyDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderPaymentPage } from "./pages/OrderPaymentPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";

function GuestRoutes(): React.JSX.Element {
  return (
    <>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<CatalogSearchPage />} />
      <Route path="/properties/:id" element={<PropertyDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyTokenPage />} />
    </>
  );
}

function UserOrderRoutes(): React.JSX.Element {
  return (
    <>
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute requiredRole="USER"><CheckoutPage /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute requiredRole="USER"><OrderHistoryPage /></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute requiredRole="USER"><OrderPaymentPage /></ProtectedRoute>} />
      <Route path="/orders/:id/payment" element={<ProtectedRoute requiredRole="USER"><OrderPaymentPage /></ProtectedRoute>} />
    </>
  );
}

function TenantRoutes(): React.JSX.Element {
  return (
    <Route path="/tenant" element={<ProtectedRoute requiredRole="TENANT"><TenantLayout /></ProtectedRoute>}>
      <Route path="dashboard" element={<TenantDashboardPage />} />
      <Route path="properties" element={<TenantPropertyListPage />} />
      <Route path="properties/new" element={<TenantPropertyCreatePage />} />
      <Route path="properties/:id/edit" element={<TenantPropertyEditPage />} />
      <Route path="orders" element={<TenantOrderManagementPage />} />
    </Route>
  );
}

function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      {GuestRoutes()}
      {UserOrderRoutes()}
      {TenantRoutes()}
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

function AppLayout(): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900 pb-16 md:pb-0">
      <Navbar />
      <AccountSwitchModal />
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8"><AppRoutes /></main>
      <AppFooter />
      <MobileBottomNav />
    </div>
  );
}

export default function App(): React.JSX.Element {
  const { checkAuth } = useAuthStore();
  useEffect(() => { checkAuth(); }, [checkAuth]);
  return <BrowserRouter><AppLayout /></BrowserRouter>;
}
