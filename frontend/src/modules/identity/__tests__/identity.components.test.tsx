import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';
import { VerifyForm } from '../components/VerifyForm';
import { AccountSwitchModal } from '../../../components/organisms/AccountSwitchModal';
import { useAuthStore } from '../../../stores/auth.store';

vi.mock('../services/identity.api', () => ({
  identityApi: {
    login: vi.fn(),
    register: vi.fn(),
    verify: vi.fn(),
    logout: vi.fn().mockResolvedValue({ success: true, data: null }),
    getMe: vi.fn(),
  },
}));

describe('Identity Form Organisms', () => {
  it('submits LoginForm with valid credentials', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'user@test.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Masukkan password Anda'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Masuk sebagai/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password123',
        role: 'USER',
      });
    });
  });

  it('renders success state in RegisterForm after submission', async () => {
    const handleSubmit = vi.fn().mockResolvedValue({
      email: 'host@test.com',
      role: 'TENANT',
    });
    render(<RegisterForm onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/Alamat Email/i), {
      target: { value: 'host@test.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Kirim Tautan Verifikasi/i }));

    await waitFor(() => {
      expect(screen.getByText('Periksa Email Anda')).toBeInTheDocument();
      expect(screen.getByText(/host@test.com/)).toBeInTheDocument();
    });
  });

  it('submits VerifyForm with valid tokens and matching password', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);
    render(<VerifyForm token="valid-token-xyz" onSubmit={handleSubmit} />);

    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), {
      target: { value: 'Rian Pratama' },
    });
    fireEvent.change(screen.getByPlaceholderText('Buat password baru'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ulangi password baru'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Aktivasi Akun & Masuk/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        token: 'valid-token-xyz',
        name: 'Rian Pratama',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });
  });

  it('triggers logout and callback in AccountSwitchModal', async () => {
    const onConfirmMock = vi.fn();
    useAuthStore.setState({
      conflict: {
        currentRole: 'USER',
        targetRole: 'TENANT',
        onConfirm: onConfirmMock,
      },
    });

    render(<AccountSwitchModal />);
    expect(screen.getByText('Konfirmasi Beralih Akun')).toBeInTheDocument();

    const switchBtn = screen.getByRole('button', { name: /Keluar & Beralih Peran/i });
    fireEvent.click(switchBtn);

    await waitFor(() => {
      expect(onConfirmMock).toHaveBeenCalled();
      expect(useAuthStore.getState().conflict).toBeNull();
    });
  });
});
