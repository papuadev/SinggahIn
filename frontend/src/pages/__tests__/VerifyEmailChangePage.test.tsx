import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VerifyEmailChangePage } from '../VerifyEmailChangePage';
import { useAuthStore } from '../../stores/auth.store';

describe('VerifyEmailChangePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders error state when token query param is missing', async () => {
    render(
      <MemoryRouter initialEntries={['/verify-email-change']}>
        <VerifyEmailChangePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verifikasi Gagal')).toBeInTheDocument();
      expect(
        screen.getByText('Token verifikasi tidak ditemukan dalam tautan URL.')
      ).toBeInTheDocument();
    });
  });

  it('automatically verifies email on mount and displays success view', async () => {
    const verifyMock = vi.fn().mockResolvedValue({
      id: 'usr-1',
      email: 'newemail@example.com',
      name: 'Rian Pratama',
      role: 'USER',
      avatarUrl: null,
    });
    useAuthStore.setState({
      verifyEmailChange: verifyMock,
      isAuthenticated: true,
    });

    render(
      <MemoryRouter initialEntries={['/verify-email-change?token=token-email-123']}>
        <VerifyEmailChangePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(verifyMock).toHaveBeenCalledWith('token-email-123');
      expect(screen.getByText('Email Berhasil Diperbarui!')).toBeInTheDocument();
      expect(screen.getByText('newemail@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Kembali ke Profil/i })).toBeInTheDocument();
    });
  });

  it('displays error state when token verification fails', async () => {
    const verifyMock = vi.fn().mockRejectedValue(
      new Error('Token verifikasi telah kedaluwarsa.')
    );
    useAuthStore.setState({
      verifyEmailChange: verifyMock,
      isAuthenticated: false,
    });

    render(
      <MemoryRouter initialEntries={['/verify-email-change?token=expired-token']}>
        <VerifyEmailChangePage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Verifikasi Gagal')).toBeInTheDocument();
      expect(
        screen.getByText('Token verifikasi telah kedaluwarsa.')
      ).toBeInTheDocument();
    });
  });
});
