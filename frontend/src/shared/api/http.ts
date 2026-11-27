import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

let unauthorizedHandler: (() => void) | null = null;

export const registerUnauthorizedHandler = (handler: () => void) => {
  unauthorizedHandler = handler;
};

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    try {
      const stored = localStorage.getItem('bolajon_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        const state = parsed?.state;
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
        if (state?.user?.tenantId) {
          config.headers['X-Tenant-Id'] = state.user.tenantId;
        }
        if (state?.activeBranchId || state?.user?.branchId) {
          config.headers['X-Branch-Id'] = state.activeBranchId || state.user.branchId;
        }
      }
    } catch {
      // ignore JSON parse errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const reqUrl: string = error.config?.url || '';
    const status: number | undefined = error.response?.status;
    const message: string = error.response?.data?.message || '';
    const isLoginRequest = reqUrl.includes('/auth/login');
    const isBlockedSession =
      status === 403 &&
      (message.includes('to‘xtatilgan') ||
        message.includes('faol emas') ||
        message.includes('Suspended'));

    if (!isLoginRequest && (status === 401 || isBlockedSession)) {
      localStorage.removeItem('bolajon_auth');
      unauthorizedHandler?.();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
