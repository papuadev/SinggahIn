import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundPage } from '../NotFoundPage';
import { useAuthStore } from '../../stores/auth.store';

describe('NotFoundPage', () => {
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

  it('renders not found elements for guest/user', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Halaman Tidak Ditemukan')).toBeInTheDocument();
    expect(screen.getByText(/404/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kembali ke Beranda/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cari Penginapan/i })).toBeInTheDocument();
  });

  it('renders tenant actions when logged in as tenant', () => {
    useAuthStore.setState({
      user: { id: 't-1', email: 't@example.com', name: 'Tenant A', role: 'TENANT', avatarUrl: null },
      isAuthenticated: true,
      isInitialized: true,
    });

    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Halaman Tidak Ditemukan')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Dasbor Tenant/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Halaman Sebelumnya/i })).toBeInTheDocument();
  });
});
