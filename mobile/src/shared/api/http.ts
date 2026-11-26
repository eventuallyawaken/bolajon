import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useServerConfig } from '../config/serverConfig';

export const isMockMode = (): boolean => useServerConfig.getState().useMock;

export const http = axios.create({
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

http.interceptors.request.use((config) => {
  const { apiUrl } = useServerConfig.getState();
  config.baseURL = apiUrl;

  const { token, user } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (user?.branchId && !config.headers['X-Branch-Id']) {
    config.headers['X-Branch-Id'] = user.branchId;
  }
  return config;
});

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryConfig | undefined;
    const isAuthPath =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthPath) {
      originalRequest._retry = true;
      const { refreshToken, updateAccessToken, logout } = useAuthStore.getState();
      const { apiUrl } = useServerConfig.getState();

      if (refreshToken) {
        try {
          const refreshRes = await axios.post(`${apiUrl}/auth/refresh`, { refreshToken });
          const newAccessToken = refreshRes.data?.data?.accessToken;
          if (newAccessToken) {
            await updateAccessToken(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return http(originalRequest);
          }
        } catch {
          // Refresh failed -> fall through to logout
        }
      }

      await logout();
    }

    return Promise.reject(error);
  }
);

export function extractApiError(error: unknown, fallback = 'Server bilan aloqa o‘rnatilmadi'): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.message?.includes('Network Error') || err?.message?.includes('timeout')) {
    return 'Serverga ulanib bo‘lmadi. Internet yoki Server manzilini tekshiring.';
  }
  return err?.message || fallback;
}
