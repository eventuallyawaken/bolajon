import type { AuthUser, UserRole } from '../../shared/store/useAuthStore';

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface AuthState {
  user: AuthUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
