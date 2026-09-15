import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { Navbar } from '../Navbar';
import { MobileBottomNav } from '../MobileBottomNav';
import { TenantSidebar } from '../TenantSidebar';

const mockTenant = {
  id: 'tenant-123',
  email: 'tenant@singgahin.com',
  name: 'Pak Budi',
  role: 'TENANT' as const,
  avatarUrl: null,
};

const mockUser = {
  id: 'user-123',
  email: 'user@singgahin.com',
  name: 'Siti',
  role: 'USER' as const,
  avatarUrl: null,
};

describe('Navigation Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ user: null, isAuthenticated: false });
  });

  it('renders clean guest Navbar with logo and login buttons', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('SinggahIn')).toBeInTheDocument();
    expect(screen.getByText('Masuk')).toBeInTheDocument();
    expect(screen.getByText('Daftar')).toBeInTheDocument();
  });

  it('renders clean avatar in Navbar and opens account details dropdown on click', () => {
    const logoutMock = vi.fn();
    useAuthStore.setState({ user: mockTenant, isAuthenticated: true, logout: logoutMock });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    );
    expect(screen.getByText('SinggahIn')).toBeInTheDocument();
    expect(screen.queryByText('Pak Budi')).not.toBeInTheDocument();

    const avatarBtn = screen.getByRole('button', { name: /Menu Akun/i });
    fireEvent.click(avatarBtn);

    expect(screen.getByText('Pak Budi')).toBeInTheDocument();
    expect(screen.getByText('tenant@singgahin.com')).toBeInTheDocument();
    expect(screen.getByText('Pemilik (Tenant)')).toBeInTheDocument();
    expect(screen.getByText('Dasbor Properti')).toBeInTheDocument();
    expect(screen.getByText('Cari Penginapan')).toBeInTheDocument();
    expect(screen.getByText('Profil Saya')).toBeInTheDocument();

    const logoutBtn = screen.getByRole('button', { name: /Keluar/i });
    fireEvent.click(logoutBtn);
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('renders TenantSidebar with property links in desktop view', () => {
    render(
      <MemoryRouter initialEntries={['/tenant/properties']}>
        <TenantSidebar />
      </MemoryRouter>
    );
    expect(screen.getByText('Daftar Properti')).toBeInTheDocument();
    expect(screen.getByText('Tambah Properti')).toBeInTheDocument();
    expect(screen.getByText('Mode Tamu (Eksplor)')).toBeInTheDocument();
  });

  it('renders MobileBottomNav for guest with Jelajah and Masuk', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileBottomNav />
      </MemoryRouter>
    );
    expect(screen.getByText('Jelajah')).toBeInTheDocument();
    expect(screen.getByText('Masuk')).toBeInTheDocument();
  });

  it('renders MobileBottomNav for tenant with Properti tab', () => {
    useAuthStore.setState({ user: mockTenant, isAuthenticated: true });
    render(
      <MemoryRouter initialEntries={['/tenant/properties']}>
        <MobileBottomNav />
      </MemoryRouter>
    );
    expect(screen.getByText('Properti')).toBeInTheDocument();
  });

  it('renders MobileBottomNav for normal user without Properti tab', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileBottomNav />
      </MemoryRouter>
    );
    expect(screen.queryByText('Properti')).not.toBeInTheDocument();
  });
});
