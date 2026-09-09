export type Role = 'USER' | 'TENANT';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  avatarUrl: string | null;
  phoneNumber?: string | null;
  isVerified?: boolean;
  createdAt?: string;
}

export interface RegisterInput {
  email: string;
  role: Role;
}

export interface VerifyInput {
  token: string;
  name: string;
  password: string;
  confirmPassword?: string;
}

export interface LoginInput {
  email: string;
  password: string;
  role: Role;
}

export interface LoginResponseData {
  user: User;
}

export interface RegisterResponseData {
  email: string;
  role: Role;
}
