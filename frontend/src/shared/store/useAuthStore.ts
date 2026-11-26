import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { http } from '@/shared/api/http';

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role: string;
  tenantId?: string | null;
  branchId?: string | null;
}

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  status: string;
  features?: Record<string, any>;
}

interface AuthState {
  user: AuthUser | null;
  tenant: TenantInfo | null;
  accessToken: string | null;
  activeBranchId: string | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setActiveBranchId: (branchId: string) => void;
  impersonateTenant: (tenantId: string) => Promise<void>;
  updateUser: (updatedUser: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tenant: null,
      accessToken: null,
      activeBranchId: null,
      isAuthenticated: false,

      login: async (phone: string, password: string) => {
        try {
          const res = await http.post('/auth/login', { phone, password });
          const { user, tenant, accessToken } = res.data.data;
          set({
            user,
            tenant: tenant || null,
            accessToken,
            activeBranchId: user?.branchId || null,
            isAuthenticated: true,
          });
          return { success: true };
        } catch (err: any) {
          const msg = err.response?.data?.message || 'Login yoki parol noto‘g‘ri';
          return { success: false, message: msg };
        }
      },

      logout: async () => {
        try {
          await http.post('/auth/logout');
        } catch {
          // ignore
        }
        set({
          user: null,
          tenant: null,
          accessToken: null,
          activeBranchId: null,
          isAuthenticated: false,
        });
      },

      setActiveBranchId: (branchId: string) => {
        set({ activeBranchId: branchId });
      },

      impersonateTenant: async (tenantId: string) => {
        const res = await http.post(`/superadmin/impersonate/${tenantId}`);
        const { user, tenant, accessToken } = res.data.data;
        set({
          user,
          tenant: tenant || null,
          accessToken,
          activeBranchId: user?.branchId || null,
          isAuthenticated: true,
        });
      },

      updateUser: (updatedUser: Partial<AuthUser>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : null,
        }));
      },
    }),
    {
      name: 'bolajon_auth',
    }
  )
);
