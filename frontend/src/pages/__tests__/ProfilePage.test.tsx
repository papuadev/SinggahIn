import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfilePage } from '../ProfilePage';
import { useAuthStore } from '../../stores/auth.store';
import { User } from '../../types/auth.types';

const mockUser: User = {
  id: 'usr-123',
  email: 'rian@example.com',
  name: 'Rian Pratama',
  role: 'USER',
  avatarUrl: null,
  phoneNumber: '08123456789',
};

describe('ProfilePage Component', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
    });
  });

  it('renders tab headers and switches between tabs', () => {
    render(
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    );

    // Initial tab is Profil
    expect(screen.getByRole('button', { name: /^Profil$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ubah Email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ubah Password/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rian Pratama')).toBeInTheDocument();

    // Switch to Ubah Email tab
    fireEvent.click(screen.getByRole('button', { name: /Ubah Email/i }));
    expect(screen.getByPlaceholderText('nama@emailbaru.com')).toBeInTheDocument();
    expect(screen.getByText('rian@example.com')).toBeInTheDocument();

    // Switch to Ubah Password tab
    fireEvent.click(screen.getByRole('button', { name: /Ubah Password/i }));
    expect(screen.getByPlaceholderText('Masukkan kata sandi saat ini')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimal 8 karakter')).toBeInTheDocument();
  });
});
