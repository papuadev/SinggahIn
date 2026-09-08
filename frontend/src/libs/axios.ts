import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/api.types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Terjadi kesalahan saat memproses permintaan.';
    return Promise.reject(new Error(message));
  }
);
