import { create } from 'zustand';
import { identityApi } from '../modules/identity/services/identity.api';
import {
  User,
  LoginInput,
  RegisterInput,
  VerifyInput,
  Role,
  UpdateProfileInput,
} from '../types/auth.types';

export interface ConflictState {
  currentRole: Role;
  targetRole: Role;
  onConfirm?: () => void;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  conflict: ConflictState | null;
  login: (input: LoginInput) => Promise<User>;
  register: (input: RegisterInput) => Promise<{ email: string; role: Role }>;
  verify: (input: VerifyInput) => Promise<User>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  updateProfile: (input: UpdateProfileInput) => Promise<User>;
  setConflict: (conflict: ConflictState | null) => void;
  clearError: () => void;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan pada sistem.';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  conflict: null,

  clearError: () => set({ error: null }),
  setConflict: (conflict) => set({ conflict }),

  login: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await identityApi.login(input);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return res.data.user;
    } catch (err) {
      const message = extractErrorMessage(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await identityApi.register(input);
      set({ isLoading: false });
      return res.data;
    } catch (err) {
      const message = extractErrorMessage(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verify: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const res = await identityApi.verify(input);
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
      return res.data.user;
    } catch (err) {
      const message = extractErrorMessage(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await identityApi.logout();
    } catch {
      // Silently catch network errors during logout to allow client session cleanup
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false, conflict: null });
    }
  },

  checkAuth: async () => {
    if (get().isInitialized && get().isAuthenticated) return;
    set({ isLoading: true });
    try {
      const res = await identityApi.getMe();
      set({ user: res.data.user, isAuthenticated: true, isInitialized: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
    }
  },

  uploadAvatar: async (file: File) => {
    set({ isLoading: true, error: null });
    try {
      const res = await identityApi.uploadAvatar(file);
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, avatarUrl: res.data.avatarUrl }, isLoading: false });
      } else {
        set({ isLoading: false });
      }
      return res.data.avatarUrl;
    } catch (err) {
      const message = extractErrorMessage(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateProfile: async (input: UpdateProfileInput) => {
    set({ isLoading: true, error: null });
    try {
      const res = await identityApi.updateProfile(input);
      set({ user: res.data.user, isLoading: false });
      return res.data.user;
    } catch (err) {
      const message = extractErrorMessage(err);
      set({ error: message, isLoading: false });
      throw err;
    }
  },
}));
