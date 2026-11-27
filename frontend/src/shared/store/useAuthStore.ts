import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { http, registerUnauthorizedHandler } from '@/shared/api/http';

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  avatarUrl?: string | null;
  role: string;
  roleName?: string;
  tenantId?: string | null;
  tenantName?: string;
  branchId?: string | null;
  branchName?: string;
}

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  status: string;
  features?: Record<string, any>;
}

const ROLE_ALIASES: Record<string, string> = {
  superadmin: 'superadmin',
  director: 'director',
  direktor: 'director',
  teacher: 'teacher',
  tarbiyachi: 'teacher',
  accountant: 'accountant',
  hisobchi: 'accountant',
  nurse: 'nurse',
  hamshira: 'nurse',
  parent: 'parent',
  ota_ona: 'parent',
};

export function normalizeRole(role?: string | null): string {
  if (!role) return '';
  const key = role.toLowerCase().trim();
  return ROLE_ALIASES[key] || key;
}

export function hasAllowedRole(userRole?: string | null, allowedRoles?: string[]): boolean {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const normalized = normalizeRole(userRole);
  return allowedRoles.some((r) => normalizeRole(r) === normalized);
}

export function getDefaultRouteForRole(role?: string | null): string {
  switch (normalizeRole(role)) {
    case 'superadmin':
      return '/superadmin';
    case 'teacher':
      return '/attendance';
    case 'nurse':
      return '/medical';
    case 'parent':
      return '/parent';
    case 'director':
    case 'accountant':
    default:
      return '/dashboard';
  }
}

export function isJwtExpired(token?: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    const payload = JSON.parse(json) as { exp?: number };
    if (!payload.exp) return true;
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

interface AuthState {
  user: AuthUser | null;
  tenant: TenantInfo | null;
  accessToken: string | null;
  activeBranchId: string | null;
  isAuthenticated: boolean;
  isVerifying: boolean;
  hasVerifiedSession: boolean;
  superadminSession: { user: AuthUser; accessToken: string } | null;
  login: (phone: string, password: string) => Promise<{ success: boolean; role?: string; message?: string }>;
  logout: () => Promise<void>;
  clearSession: () => void;
  verifySession: () => Promise<boolean>;
  setActiveBranchId: (branchId: string) => void;
  impersonateTenant: (tenantId: string) => Promise<void>;
  exitImpersonation: () => void;
  updateUser: (updatedUser: Partial<AuthUser>) => void;
}

let verifyPromise: Promise<boolean> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      accessToken: null,
      activeBranchId: null,
      isAuthenticated: false,
      isVerifying: false,
      hasVerifiedSession: false,
      superadminSession: null,

      clearSession: () => {
        set({
          user: null,
          tenant: null,
          accessToken: null,
          activeBranchId: null,
          isAuthenticated: false,
          isVerifying: false,
          hasVerifiedSession: true,
          superadminSession: null,
        });
      },

      verifySession: async () => {
        if (verifyPromise) return verifyPromise;

        const { accessToken, isAuthenticated } = get();
        if (!accessToken || !isAuthenticated || isJwtExpired(accessToken)) {
          get().clearSession();
          return false;
        }

        verifyPromise = (async () => {
          set({ isVerifying: true });
          try {
            const res = await http.get('/auth/me');
            const me = res.data?.data;
            if (!me) {
              get().clearSession();
              return false;
            }
            set((state) => ({
              user: me,
              tenant: me.tenant || state.tenant || null,
              activeBranchId: state.activeBranchId || me.branchId || null,
              isAuthenticated: true,
              isVerifying: false,
              hasVerifiedSession: true,
            }));
            return true;
          } catch {
            get().clearSession();
            return false;
          } finally {
            verifyPromise = null;
          }
        })();

        return verifyPromise;
      },

      login: async (phone: string, password: string) => {
        try {
          const res = await http.post('/auth/login', { phone, password });
          const { user, tenant, accessToken } = res.data.data;
          set({
            user,
            tenant: tenant || user?.tenant || null,
            accessToken,
            activeBranchId: user?.branchId || null,
            isAuthenticated: true,
            isVerifying: false,
            hasVerifiedSession: true,
            superadminSession: null,
          });
          return { success: true, role: user?.role };
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
        get().clearSession();
      },

      setActiveBranchId: (branchId: string) => {
        set({ activeBranchId: branchId });
      },

      impersonateTenant: async (tenantId: string) => {
        const current = get();
        const savedSuperadmin =
          current.superadminSession ||
          (current.user?.role === 'superadmin' && current.accessToken
            ? { user: current.user, accessToken: current.accessToken }
            : null);

        const res = await http.post(`/superadmin/tenants/${tenantId}/impersonate`);
        const { user, tenant, accessToken } = res.data.data;
        set({
          user,
          tenant: tenant || null,
          accessToken,
          activeBranchId: user?.branchId || null,
          isAuthenticated: true,
          isVerifying: false,
          hasVerifiedSession: true,
          superadminSession: savedSuperadmin,
        });
      },

      exitImpersonation: () => {
        const saved = get().superadminSession;
        if (!saved) return;
        set({
          user: saved.user,
          tenant: null,
          accessToken: saved.accessToken,
          activeBranchId: null,
          isAuthenticated: true,
          isVerifying: false,
          hasVerifiedSession: true,
          superadminSession: null,
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
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        activeBranchId: state.activeBranchId,
        isAuthenticated: state.isAuthenticated,
        superadminSession: state.superadminSession,
      }),
    }
  )
);

registerUnauthorizedHandler(() => {
  useAuthStore.getState().clearSession();
});
