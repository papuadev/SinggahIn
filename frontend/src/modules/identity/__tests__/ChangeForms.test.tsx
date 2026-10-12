import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChangeEmailForm } from '../components/ChangeEmailForm';
import { ChangePasswordForm } from '../components/ChangePasswordForm';
import { useAuthStore } from '../../../stores/auth.store';

describe('ChangeEmailForm Component', () => {
  it('renders current email and security notice', () => {
    render(
      <ChangeEmailForm
        currentEmail="current@example.com"
        onRequestEmailChange={vi.fn()}
      />
    );

    expect(screen.getByText('current@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('nama@emailbaru.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Masukkan password akun Anda')).toBeInTheDocument();
  });

  it('submits valid new email and password', async () => {
    const handleRequest = vi.fn().mockResolvedValue(undefined);
    render(
      <ChangeEmailForm
        currentEmail="current@example.com"
        onRequestEmailChange={handleRequest}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('nama@emailbaru.com'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Masukkan password akun Anda'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Verifikasi Email Baru/i }));

    await waitFor(() => {
      expect(handleRequest).toHaveBeenCalledWith({
        newEmail: 'new@example.com',
        password: 'password123',
      });
      expect(screen.getByText(/Tautan Verifikasi Telah Dikirim/i)).toBeInTheDocument();
      expect(screen.getByText('new@example.com')).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const handleRequest = vi.fn();
    render(
      <ChangeEmailForm
        currentEmail="current@example.com"
        onRequestEmailChange={handleRequest}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('nama@emailbaru.com'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Masukkan password akun Anda'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Verifikasi Email Baru/i }));

    await waitFor(() => {
      expect(screen.getByText('Format email baru tidak valid')).toBeInTheDocument();
    });
    expect(handleRequest).not.toHaveBeenCalled();
  });
});

describe('ChangePasswordForm Component', () => {
  it('renders all password fields', () => {
    render(
      <MemoryRouter>
        <ChangePasswordForm onChangePassword={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText('Masukkan kata sandi saat ini')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimal 8 karakter')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ulangi kata sandi baru')).toBeInTheDocument();
  });

  it('submits valid password changes and displays success view with countdown and logout notification', async () => {
    const handleChange = vi.fn().mockResolvedValue(undefined);
    const logoutMock = vi.fn().mockResolvedValue(undefined);
    useAuthStore.setState({ logout: logoutMock });

    render(
      <MemoryRouter>
        <ChangePasswordForm onChangePassword={handleChange} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Masukkan kata sandi saat ini'), {
      target: { value: 'oldPassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), {
      target: { value: 'newPassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ulangi kata sandi baru'), {
      target: { value: 'newPassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Perbarui Kata Sandi/i }));

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalledWith({
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      });
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText('Kata Sandi Berhasil Diperbarui')).toBeInTheDocument();
      expect(screen.getByText('Mengalihkan ke halaman masuk...')).toBeInTheDocument();
    });

    // Wait for the automatic timer transition (1800ms) to trigger logout
    await waitFor(
      () => {
        expect(logoutMock).toHaveBeenCalled();
      },
      { timeout: 2500 }
    );
  });

  it('prevents submission when new password equals current password', async () => {
    const handleChange = vi.fn();
    render(
      <MemoryRouter>
        <ChangePasswordForm onChangePassword={handleChange} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Masukkan kata sandi saat ini'), {
      target: { value: 'samePassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Minimal 8 karakter'), {
      target: { value: 'samePassword123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ulangi kata sandi baru'), {
      target: { value: 'samePassword123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Perbarui Kata Sandi/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Password baru harus berbeda dari password saat ini')
      ).toBeInTheDocument();
    });
    expect(handleChange).not.toHaveBeenCalled();
  });
});
