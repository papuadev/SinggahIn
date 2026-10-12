import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResetPasswordPage } from '../ResetPasswordPage';
import { identityApi } from '../../modules/identity/services/identity.api';

vi.mock('../../modules/identity/services/identity.api', () => ({
  identityApi: {
    resetPassword: vi.fn(),
  },
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders NoTokenView when token query parameter is missing', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByText('Token Tidak Ditemukan')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Ajukan Ulang Reset Password/i })
    ).toBeInTheDocument();
  });

  it('renders reset password form when token is present', () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token-123']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Atur Ulang Kata Sandi/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimal 8 karakter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ulangi kata sandi baru')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Simpan Kata Sandi Baru/i })).toBeInTheDocument();
  });

  it('validates mismatched passwords before calling API', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token-123']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), {
      target: { value: 'passwordBaru123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ulangi kata sandi baru'), {
      target: { value: 'passwordBeda456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Kata Sandi Baru/i }));

    await waitFor(() => {
      expect(screen.getByText('Konfirmasi password tidak cocok')).toBeInTheDocument();
    });
    expect(identityApi.resetPassword).not.toHaveBeenCalled();
  });

  it('successfully resets password and shows success view', async () => {
    (identityApi.resetPassword as any).mockResolvedValueOnce({
      success: true,
      message: 'Password berhasil direset.',
    });

    render(
      <MemoryRouter initialEntries={['/reset-password?token=valid-token-123']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), {
      target: { value: 'passwordBaru123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ulangi kata sandi baru'), {
      target: { value: 'passwordBaru123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Kata Sandi Baru/i }));

    await waitFor(() => {
      expect(identityApi.resetPassword).toHaveBeenCalledWith({
        token: 'valid-token-123',
        password: 'passwordBaru123',
        confirmPassword: 'passwordBaru123',
      });
      expect(screen.getByText('Password Berhasil Diperbarui!')).toBeInTheDocument();
    });
  });

  it('displays server error on expired or invalid token', async () => {
    (identityApi.resetPassword as any).mockRejectedValueOnce(
      new Error('Token reset password tidak valid atau sudah kedaluwarsa.')
    );

    render(
      <MemoryRouter initialEntries={['/reset-password?token=expired-token-123']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), {
      target: { value: 'passwordBaru123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ulangi kata sandi baru'), {
      target: { value: 'passwordBaru123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Simpan Kata Sandi Baru/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Token reset password tidak valid atau sudah kedaluwarsa.')
      ).toBeInTheDocument();
    });
  });
});
