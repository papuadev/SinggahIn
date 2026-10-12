import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '../../../stores/auth.store';
import { User } from '../../../types/auth.types';

const mockUser: User = {
  id: 'usr-1',
  email: 'user@example.com',
  name: 'User Test',
  role: 'USER',
  avatarUrl: null,
};

const mockTenant: User = {
  id: 'tnt-1',
  email: 'tenant@example.com',
  name: 'Tenant Test',
  role: 'TENANT',
  avatarUrl: null,
};

describe('ProtectedRoute Molecule', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      conflict: null,
    });
  });

  it('renders spinner when auth is not initialized', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Halaman Terproteksi</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Halaman Terproteksi')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated and initialized', () => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Halaman Terproteksi</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Halaman Terproteksi')).toBeInTheDocument();
  });

  it('does NOT unmount children or go blank when isLoading is true during in-page operations', () => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      isLoading: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Halaman Terproteksi</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Halaman Terproteksi')).toBeInTheDocument();
  });

  it('renders ForbiddenPage when user role does not match requiredRole', () => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="TENANT">
          <div>Dasbor Khusus Tenant</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Dasbor Khusus Tenant')).not.toBeInTheDocument();
    expect(screen.getByText('Akses Tidak Diizinkan')).toBeInTheDocument();
  });

  it('renders ForbiddenPage when user role matches disallowedRole', () => {
    useAuthStore.setState({
      user: mockTenant,
      isAuthenticated: true,
      isInitialized: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute disallowedRole="TENANT">
          <div>Halaman Tamu Publik</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Halaman Tamu Publik')).not.toBeInTheDocument();
    expect(screen.getByText('Akses Tidak Diizinkan')).toBeInTheDocument();
  });

  it('renders children for unauthenticated guest on route with disallowedRole', () => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute disallowedRole="TENANT">
          <div>Halaman Tamu Publik</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Halaman Tamu Publik')).toBeInTheDocument();
  });

  it('renders modern spinner and unauthorized message for unauthenticated guest on TENANT route', () => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="TENANT">
          <div>Dasbor Tenant</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Dasbor Tenant')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByText('Silahkan login sebagai TENANT untuk mengakses halaman ini')
    ).toBeInTheDocument();
    expect(screen.getByText('Mengalihkan ke halaman utama...')).toBeInTheDocument();
  });

  it('renders modern spinner and unauthorized message for unauthenticated guest on USER route', () => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute requiredRole="USER">
          <div>Halaman Checkout</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Halaman Checkout')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      screen.getByText('Silahkan login sebagai USER untuk mengakses halaman ini')
    ).toBeInTheDocument();
    expect(screen.getByText('Mengalihkan ke halaman utama...')).toBeInTheDocument();
  });
});
