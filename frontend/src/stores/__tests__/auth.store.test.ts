import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';
import { identityApi } from '../../modules/identity/services/identity.api';
import { User } from '../../types/auth.types';

vi.mock('../../modules/identity/services/identity.api', () => ({
  identityApi: {
    login: vi.fn(),
    register: vi.fn(),
    verify: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

const mockUser: User = {
  id: 'usr-123',
  email: 'test@singgahin.com',
  name: 'Test User',
  role: 'USER',
  avatarUrl: null,
};

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      conflict: null,
    });
  });

  it('updates state on successful login', async () => {
    vi.mocked(identityApi.login).mockResolvedValueOnce({
      success: true,
      message: 'Login berhasil',
      data: { user: mockUser },
    });

    await useAuthStore.getState().login({
      email: 'test@singgahin.com',
      password: 'password123',
      role: 'USER',
    });

    expect(useAuthStore.getState().user).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('captures error on failed login', async () => {
    vi.mocked(identityApi.login).mockRejectedValueOnce(
      new Error('Email atau kata sandi tidak cocok')
    );

    await expect(
      useAuthStore.getState().login({
        email: 'test@singgahin.com',
        password: 'wrong',
        role: 'USER',
      })
    ).rejects.toThrow('Email atau kata sandi tidak cocok');

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().error).toBe('Email atau kata sandi tidak cocok');
  });

  it('handles passwordless register flow', async () => {
    vi.mocked(identityApi.register).mockResolvedValueOnce({
      success: true,
      message: 'Tautan terkirim',
      data: { email: 'new@singgahin.com', role: 'TENANT' },
    });

    const result = await useAuthStore.getState().register({
      email: 'new@singgahin.com',
      role: 'TENANT',
    });

    expect(result.email).toBe('new@singgahin.com');
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('resets state on logout', async () => {
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    vi.mocked(identityApi.logout).mockResolvedValueOnce({
      success: true,
      message: 'Logout berhasil',
      data: null,
    });

    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('manages cross-role conflict state', () => {
    const handleConfirm = vi.fn();
    useAuthStore.getState().setConflict({
      currentRole: 'USER',
      targetRole: 'TENANT',
      onConfirm: handleConfirm,
    });

    expect(useAuthStore.getState().conflict).toEqual({
      currentRole: 'USER',
      targetRole: 'TENANT',
      onConfirm: handleConfirm,
    });

    useAuthStore.getState().setConflict(null);
    expect(useAuthStore.getState().conflict).toBeNull();
  });
});
