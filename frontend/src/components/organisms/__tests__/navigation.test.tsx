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
    expect(screen.queryByText('Cari Penginapan')).not.toBeInTheDocument();
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
    expect(screen.getByText('Profil Saya')).toBeInTheDocument();
    expect(screen.queryByText('Mode Tamu (Eksplor)')).not.toBeInTheDocument();
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

  it('renders MobileBottomNav for tenant with Dasbor and Properti tab without Jelajah', () => {
    useAuthStore.setState({ user: mockTenant, isAuthenticated: true });
    render(
      <MemoryRouter initialEntries={['/tenant/properties']}>
        <MobileBottomNav />
      </MemoryRouter>
    );
    expect(screen.getByText('Dasbor')).toBeInTheDocument();
    expect(screen.getByText('Properti')).toBeInTheDocument();
    expect(screen.queryByText('Jelajah')).not.toBeInTheDocument();
  });

  it('renders MobileBottomNav for normal user without Properti tab', () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    render(
      <MemoryRouter initialEntries={['/']}>
        <MobileBottomNav />
      </MemoryRouter>
    );
    expect(screen.getByText('Jelajah')).toBeInTheDocument();
    expect(screen.queryByText('Properti')).not.toBeInTheDocument();
  });

  it('does not render MobileBottomNav on property detail pages', () => {
    render(
      <MemoryRouter initialEntries={['/properties/cmunwqz9p000zffhbd0esq9he']}>
        <MobileBottomNav />
      </MemoryRouter>
    );
    expect(screen.queryByLabelText('Mobile Navigation')).not.toBeInTheDocument();
  });
});
