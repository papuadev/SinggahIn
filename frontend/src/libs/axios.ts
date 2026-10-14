import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '../types/api.types';

interface ExtendedConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

type QueueItem = { resolve: () => void; reject: (err: any) => void };
let isRefreshing = false;
let failedQueue: QueueItem[] = [];

function processQueue(error: any) {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()));
  failedQueue = [];
}

function shouldSkipRefresh(error: AxiosError, config?: ExtendedConfig): boolean {
  if (error.response?.status !== 401 || !config || config._retry) return true;
  const url = config.url || '';
  return url.includes('/identity/refresh') || url.includes('/identity/login');
}

function queueFailedRequest(config: ExtendedConfig) {
  return new Promise<void>((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  }).then(() => apiClient(config));
}

async function handleTokenRefresh(config: ExtendedConfig) {
  config._retry = true;
  isRefreshing = true;
  try {
    await apiClient.post('/identity/refresh');
    processQueue(null);
    return apiClient(config);
  } catch (refreshErr) {
    processQueue(refreshErr);
    return Promise.reject(refreshErr);
  } finally {
    isRefreshing = false;
  }
}

function formatErrorMessage(error: AxiosError<ApiErrorResponse>): string {
  return error.response?.data?.message || error.message || 'Terjadi kesalahan saat memproses permintaan.';
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    const config = error.config as ExtendedConfig;
    if (shouldSkipRefresh(error, config)) {
      return Promise.reject(new Error(formatErrorMessage(error)));
    }
    if (isRefreshing) {
      return queueFailedRequest(config).catch((err) => Promise.reject(new Error(formatErrorMessage(err))));
    }
    return handleTokenRefresh(config).catch((err) => Promise.reject(new Error(formatErrorMessage(err))));
  }
);
