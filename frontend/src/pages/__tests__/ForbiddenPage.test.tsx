import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForbiddenPage } from '../ForbiddenPage';
import { useAuthStore } from '../../stores/auth.store';

describe('ForbiddenPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
      conflict: null,
    });
  });

  it('renders forbidden elements for tenant role', () => {
    useAuthStore.setState({
      user: { id: 't-1', email: 't@example.com', name: 'Tenant A', role: 'TENANT', avatarUrl: null },
      isAuthenticated: true,
      isInitialized: true,
    });

    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Akses Tidak Diizinkan')).toBeInTheDocument();
    expect(screen.getByText(/Tenant \(Pemilik Properti\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/1 Akun = 1 Peran Tunggal/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dasbor Tenant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Keluar Akun/i })).toBeInTheDocument();
  });

  it('renders forbidden elements for user role', () => {
    useAuthStore.setState({
      user: { id: 'u-1', email: 'u@example.com', name: 'User A', role: 'USER', avatarUrl: null },
      isAuthenticated: true,
      isInitialized: true,
    });

    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Akses Tidak Diizinkan')).toBeInTheDocument();
    expect(screen.getByText(/Penyewa \(User\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kembali ke Beranda/i })).toBeInTheDocument();
  });

  it('triggers logout on Keluar Akun button click', async () => {
    const logoutMock = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({
      user: { id: 't-1', email: 't@example.com', name: 'Tenant A', role: 'TENANT', avatarUrl: null },
      isAuthenticated: true,
      isInitialized: true,
      logout: logoutMock,
    });

    render(
      <MemoryRouter>
        <ForbiddenPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Keluar Akun/i }));
    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalled();
    });
  });
});
