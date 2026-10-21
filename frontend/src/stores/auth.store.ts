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

type SetAuth = (partial: Partial<AuthState> | ((state: AuthState) => Partial<AuthState>)) => void;
type GetAuth = () => AuthState;

function extractErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Terjadi kesalahan pada sistem.';
}

async function runAuthAction<T>(set: SetAuth, fn: () => Promise<T>): Promise<T> {
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

async function handleCheckAuth(set: SetAuth, get: GetAuth) {
  if (get().isInitialized && get().isAuthenticated) return;
  set({ isLoading: true });
  try {
    const res = await identityApi.getMe();
    set({ user: res.data.user, isAuthenticated: true, isInitialized: true, isLoading: false });
  } catch {
    set({ user: null, isAuthenticated: false, isInitialized: true, isLoading: false });
  }
}

function createSessionActions(set: SetAuth, get: GetAuth) {
  return {
    logout: async () => {
      set({ isLoading: true });
      try { await identityApi.logout(); } finally {
        set({ user: null, isAuthenticated: false, isLoading: false, conflict: null });
      }
    },
    checkAuth: () => handleCheckAuth(set, get),
  };
}

function createAuthMutationActions(set: SetAuth) {
  return {
    login: (input: LoginInput) => runAuthAction(set, async () => {
      const res = await identityApi.login(input);
      set({ user: res.data.user, isAuthenticated: true });
      return res.data.user;
    }),
    register: (input: RegisterInput) => runAuthAction(set, async () => (await identityApi.register(input)).data),
    verify: (input: VerifyInput) => runAuthAction(set, async () => {
      const res = await identityApi.verify(input);
      set({ user: res.data.user, isAuthenticated: true });
      return res.data.user;
    }),
  };
}

async function handleUploadAvatar(set: SetAuth, get: GetAuth, file: File) {
  set({ error: null });
  try {
    const res = await identityApi.uploadAvatar(file);
    const currentUser = get().user;
    if (currentUser) set({ user: { ...currentUser, avatarUrl: res.data.avatarUrl } });
    return res.data.avatarUrl;
  } catch (err) { set({ error: extractErrorMessage(err) }); throw err; }
}

function createProfileActions(set: SetAuth, get: GetAuth) {
  return {
    uploadAvatar: (file: File) => handleUploadAvatar(set, get, file),
    updateProfile: (input: UpdateProfileInput) => runAuthAction(set, async () => {
      const res = await identityApi.updateProfile(input);
      set({ user: res.data.user });
      return res.data.user;
    }),
  };
}

function createPasswordEmailActions(set: SetAuth) {
  return {
    forgotPassword: (email: string) => runAuthAction(set, () => identityApi.forgotPassword({ email }).then(r => r.message)),
    resetPassword: (i: any) => runAuthAction(set, () => identityApi.resetPassword(i).then(r => r.message)),
    changePassword: (i: any) => runAuthAction(set, () => identityApi.changePassword(i).then(r => r.message)),
    requestEmailChange: (i: any) => runAuthAction(set, () => identityApi.requestEmailChange(i).then(r => r.message)),
    verifyEmailChange: (token: string) => runAuthAction(set, async () => {
      const res = await identityApi.verifyEmailChange(token);
      set({ user: res.data.user, isAuthenticated: true });
      return res.data.user;
    }),
  };
}

const INITIAL_STATE = { user: null, isAuthenticated: false, isLoading: false, isInitialized: false, error: null, conflict: null };

export const useAuthStore = create<AuthState>((set, get) => ({
  ...INITIAL_STATE,
  clearError: () => set({ error: null }),
  setConflict: (conflict) => set({ conflict }),
  ...createSessionActions(set, get),
  ...createAuthMutationActions(set),
  ...createProfileActions(set, get),
  ...createPasswordEmailActions(set),
}));
