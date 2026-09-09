import { apiClient } from '../../../libs/axios';
import { ApiResponse } from '../../../types/api.types';
import {
  RegisterInput,
  RegisterResponseData,
  VerifyInput,
  LoginInput,
  LoginResponseData,
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
};
