import { create } from 'zustand';
import { identityApi } from '../modules/identity/services/identity.api';
import { User, LoginInput, RegisterInput, VerifyInput, Role, UpdateProfileInput } from '../types/auth.types';

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
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (input: { token: string; password: string; confirmPassword: string }) => Promise<string>;
  changePassword: (input: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<string>;
  requestEmailChange: (input: { newEmail: string; password: string }) => Promise<string>;
  verifyEmailChange: (token: string) => Promise<User>;
  setConflict: (conflict: ConflictState | null) => void;
  clearError: () => void;
}

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan pada sistem.';
}

async function runAuthAction<T>(set: any, fn: () => Promise<T>): Promise<T> {
  set({ isLoading: true, error: null });
  try {
    const res = await fn();
    set({ isLoading: false });
    return res;
  } catch (err) {
    set({ error: extractErrorMessage(err), isLoading: false });
    throw err;
  }
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
    return runAuthAction(set, async () => {
      const res = await identityApi.login(input);
      set({ user: res.data.user, isAuthenticated: true });
      return res.data.user;
    });
  },

  register: async (input) => {
    return runAuthAction(set, async () => {
      const res = await identityApi.register(input);
      return res.data;
    });
  },

  verify: async (input) => {
    return runAuthAction(set, async () => {
      const res = await identityApi.verify(input);
      set({ user: res.data.user, isAuthenticated: true });
      return res.data.user;
    });
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await identityApi.logout();
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
    set({ error: null });
    try {
      const res = await identityApi.uploadAvatar(file);
      const currentUser = get().user;
      if (currentUser) set({ user: { ...currentUser, avatarUrl: res.data.avatarUrl } });
      return res.data.avatarUrl;
    } catch (err) {
      set({ error: extractErrorMessage(err) });
      throw err;
    }
  },

  updateProfile: async (input: UpdateProfileInput) => {
    return runAuthAction(set, async () => {
      const res = await identityApi.updateProfile(input);
      set({ user: res.data.user });
      return res.data.user;
    });
  },

  forgotPassword: (email) => runAuthAction(set, () => identityApi.forgotPassword({ email }).then(r => r.message)),
  resetPassword: (input) => runAuthAction(set, () => identityApi.resetPassword(input).then(r => r.message)),
  changePassword: (input) => runAuthAction(set, () => identityApi.changePassword(input).then(r => r.message)),
  requestEmailChange: (input) => runAuthAction(set, () => identityApi.requestEmailChange(input).then(r => r.message)),

  verifyEmailChange: async (token: string) => {
    return runAuthAction(set, async () => {
      const res = await identityApi.verifyEmailChange(token);
      set({ user: res.data.user, isAuthenticated: true });
      return res.data.user;
    });
  },
}));
