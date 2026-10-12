import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPasswordPage } from '../ForgotPasswordPage';
import { identityApi } from '../../modules/identity/services/identity.api';

vi.mock('../../modules/identity/services/identity.api', () => ({
  identityApi: {
    forgotPassword: vi.fn(),
  },
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial forgot password form with email field', () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Lupa Password\?/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nama@email.com')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Kirim Tautan Reset Password/i })
    ).toBeInTheDocument();
  });

  it('shows error if submitted with invalid email format', async () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('nama@email.com'), {
      target: { value: 'not-an-email' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Tautan Reset Password/i }));

    await waitFor(() => {
      expect(screen.getByText('Format email tidak valid')).toBeInTheDocument();
    });
    expect(identityApi.forgotPassword).not.toHaveBeenCalled();
  });

  it('submits successfully and displays success confirmation view', async () => {
    (identityApi.forgotPassword as any).mockResolvedValueOnce({
      success: true,
      message: 'Jika email terdaftar, tautan reset telah dikirim.',
    });

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('nama@email.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Tautan Reset Password/i }));

    await waitFor(() => {
      expect(identityApi.forgotPassword).toHaveBeenCalledWith({
        email: 'user@example.com',
      });
      expect(screen.getByText('Periksa Email Anda')).toBeInTheDocument();
      expect(screen.getByText('user@example.com')).toBeInTheDocument();
    });

    // Clicking "Kirim Ulang ke Email Lain" resets the view
    fireEvent.click(screen.getByRole('button', { name: /Kirim Ulang ke Email Lain/i }));
    expect(screen.getByPlaceholderText('nama@email.com')).toBeInTheDocument();
  });

  it('shows server error when API call fails', async () => {
    (identityApi.forgotPassword as any).mockRejectedValueOnce(
      new Error('Layanan sedang mengalami gangguan.')
    );

    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('nama@email.com'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Tautan Reset Password/i }));

    await waitFor(() => {
      expect(screen.getByText('Layanan sedang mengalami gangguan.')).toBeInTheDocument();
    });
  });
});
