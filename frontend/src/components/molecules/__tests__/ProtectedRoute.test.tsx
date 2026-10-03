import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '../../../stores/auth.store';
import { User } from '../../../types/auth.types';

const mockUser: User = {
  id: 'usr-1',
  email: 'user@example.com',
  name: 'User Test',
  role: 'USER',
  avatarUrl: null,
};

describe('ProtectedRoute Molecule', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      conflict: null,
    });
  });

  it('renders spinner when auth is not initialized', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Halaman Terproteksi</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.queryByText('Halaman Terproteksi')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated and initialized', () => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      isLoading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Halaman Terproteksi</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Halaman Terproteksi')).toBeInTheDocument();
  });

  it('does NOT unmount children or go blank when isLoading is true during in-page operations', () => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isInitialized: true,
      isLoading: true, // simulates ongoing action like upload
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Halaman Terproteksi</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    // The page must stay visible and NOT be replaced by full-page spinner!
    expect(screen.getByText('Halaman Terproteksi')).toBeInTheDocument();
  });
});
