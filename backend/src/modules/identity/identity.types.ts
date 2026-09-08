import { Role } from '@prisma/client';

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

export interface UserResponseDto {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  avatarUrl: string | null;
  phoneNumber?: string | null;
}
