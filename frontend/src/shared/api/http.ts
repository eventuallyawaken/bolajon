import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newAccessToken = refreshRes.data?.data?.accessToken;
        if (newAccessToken) {
          const stored = localStorage.getItem('bolajon_auth');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.state) {
              parsed.state.accessToken = newAccessToken;
              localStorage.setItem('bolajon_auth', JSON.stringify(parsed));
            }
          }
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return http(originalRequest);
        }
      } catch {
        localStorage.removeItem('bolajon_auth');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
