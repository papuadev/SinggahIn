import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import {
  RegisterInput,
  RegisterResponseData,
  VerifyInput,
  LoginInput,
  LoginResponseData,
  UpdateProfileInput,
} from '../../../types/auth.types';

export const identityApi = {
  async register(data: RegisterInput): Promise<ApiResponse<RegisterResponseData>> {
    const res = await apiClient.post<ApiResponse<RegisterResponseData>>(
      '/identity/register',
      data
    );
    return res.data;
  },

  async verify(data: VerifyInput): Promise<ApiResponse<LoginResponseData>> {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/identity/verify',
      data
    );
    return res.data;
  },

  async login(data: LoginInput): Promise<ApiResponse<LoginResponseData>> {
    const res = await apiClient.post<ApiResponse<LoginResponseData>>(
      '/identity/login',
      data
    );
    return res.data;
  },

  async logout(): Promise<ApiResponse<null>> {
    const res = await apiClient.post<ApiResponse<null>>('/identity/logout');
    return res.data;
  },

  async getMe(): Promise<ApiResponse<LoginResponseData>> {
    const res = await apiClient.get<ApiResponse<LoginResponseData>>('/identity/me');
    return res.data;
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await apiClient.post<ApiResponse<{ avatarUrl: string }>>(
      '/identity/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return res.data;
  },

  async updateProfile(data: UpdateProfileInput): Promise<ApiResponse<LoginResponseData>> {
    const res = await apiClient.patch<ApiResponse<LoginResponseData>>(
      '/identity/profile',
      data
    );
    return res.data;
  },
};
