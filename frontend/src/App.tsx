import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useAuthStore } from "./stores/auth.store";
import { Navbar } from "./components/organisms/Navbar";
import { MobileBottomNav } from "./components/organisms/MobileBottomNav";
import { TenantLayout } from "./components/organisms/TenantLayout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { VerifyTokenPage } from "./pages/VerifyTokenPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { VerifyEmailChangePage } from "./pages/VerifyEmailChangePage";
import { ProfilePage } from "./pages/ProfilePage";
import { ProtectedRoute } from "./components/molecules/ProtectedRoute";
import { ForbiddenPage } from "./pages/ForbiddenPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TenantDashboardPage } from "./pages/tenant/TenantDashboardPage";
import { TenantPropertyListPage } from "./pages/tenant/TenantPropertyListPage";
import { TenantPropertyCreatePage } from "./pages/tenant/TenantPropertyCreatePage";
import { TenantPropertyEditPage } from "./pages/tenant/TenantPropertyEditPage";
import { TenantOrderManagementPage } from "./pages/tenant/TenantOrderManagementPage";
import { TenantSalesReportPage } from "./pages/tenant/TenantSalesReportPage";
import { TenantOccupancyMatrixPage } from "./pages/tenant/TenantOccupancyMatrixPage";
import { TenantCategoryPage } from "./pages/tenant/TenantCategoryPage";
import { HomePage } from "./pages/HomePage";
import { AboutUsPage } from "./pages/AboutUsPage";
import { CatalogSearchPage } from "./pages/CatalogSearchPage";
import { PropertyDetailPage } from "./pages/PropertyDetailPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderPaymentPage } from "./pages/OrderPaymentPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { Footer } from "./components/organisms/Footer";
import { ScrollToTop } from "./components/atoms/ScrollToTop";

function GuestPublicRoutes(): React.JSX.Element {
  return (
    <>
      <Route path="/" element={<ProtectedRoute disallowedRole="TENANT"><HomePage /></ProtectedRoute>} />
      <Route path="/about" element={<AboutUsPage />} />
      <Route path="/search" element={<ProtectedRoute disallowedRole="TENANT"><CatalogSearchPage /></ProtectedRoute>} />
      <Route path="/properties/:id" element={<ProtectedRoute disallowedRole="TENANT"><PropertyDetailPage /></ProtectedRoute>} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
    </>
  );
}

function GuestAuthRoutes(): React.JSX.Element {
  return (
    <>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyTokenPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email-change" element={<VerifyEmailChangePage />} />
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
      <Route path="categories" element={<TenantCategoryPage />} />
      <Route path="properties/new" element={<TenantPropertyCreatePage />} />
      <Route path="properties/:id/edit" element={<TenantPropertyEditPage />} />
      <Route path="orders" element={<TenantOrderManagementPage />} />
      <Route path="reports/sales" element={<TenantSalesReportPage />} />
      <Route path="reports/occupancy" element={<TenantOccupancyMatrixPage />} />
    </Route>
  );
}

function AppRoutes(): React.JSX.Element {
  return (
    <Routes>
      {GuestPublicRoutes()}
      {GuestAuthRoutes()}
      {UserOrderRoutes()}
      {TenantRoutes()}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function MainContent({ isAuthPage }: { isAuthPage: boolean }): React.JSX.Element {
  const cls = `flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 ${isAuthPage ? 'flex flex-col justify-center' : ''}`;
  return (
    <main className={cls}>
      <AppRoutes />
    </main>
  );
}

export function AppLayout(): React.JSX.Element {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const pbCls = isAuthPage ? 'pb-0' : 'pb-16 md:pb-0';

  return (
    <div className={`min-h-screen flex flex-col justify-between bg-gray-50 text-gray-900 ${pbCls}`}>
      {!isAuthPage && <Navbar />}
      <MainContent isAuthPage={isAuthPage} />
      {!isAuthPage && <Footer />}
      {!isAuthPage && <MobileBottomNav />}
    </div>
  );
}

export default function App(): React.JSX.Element {
  const { checkAuth } = useAuthStore();
  useEffect(() => { checkAuth(); }, [checkAuth]);
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout />
    </BrowserRouter>
  );
}
