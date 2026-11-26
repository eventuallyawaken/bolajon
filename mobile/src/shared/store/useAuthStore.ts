import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

export type UserRole = 'parent' | 'teacher';

export interface AuthUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  rawRole?: string;
  tenantId?: string | null;
  tenantName?: string | null;
  branchId?: string | null;
  branchName?: string | null;
  groupId?: string;
  groupName?: string;
  children?: Array<{
    id: string;
    fullName: string;
    groupName: string;
    avatarUrl?: string;
  }>;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  role: UserRole | null;
  activeChildId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrate: () => Promise<void>;
  setAuth: (user: AuthUser, token: string, refreshToken?: string | null) => Promise<void>;
  updateAccessToken: (token: string) => Promise<void>;
  setActiveChildId: (childId: string) => void;
  logout: () => Promise<void>;
  loginAsDemo: (demoRole: UserRole) => Promise<void>;
}

const TOKEN_KEY = 'bolajon_mobile_token';
const REFRESH_KEY = 'bolajon_mobile_refresh_token';
const USER_KEY = 'bolajon_mobile_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  role: null,
  activeChildId: null,
  isAuthenticated: false,
  isLoading: true,

  hydrate: async () => {
    try {
      const [savedToken, savedRefresh, savedUserStr] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KEY),
        SecureStore.getItemAsync(REFRESH_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (savedToken && savedUserStr) {
        const user: AuthUser = JSON.parse(savedUserStr);
        set({
          user,
          token: savedToken,
          refreshToken: savedRefresh,
          role: user.role,
          activeChildId: user.children?.[0]?.id || null,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    } catch {
      // ignore if SecureStore unavailable
    }
    set({ isLoading: false });
  },

  setAuth: async (user: AuthUser, token: string, refreshToken?: string | null) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
      }
    } catch {
      // ignore
    }
    set({
      user,
      token,
      refreshToken: refreshToken ?? get().refreshToken,
      role: user.role,
      activeChildId: user.children?.[0]?.id || null,
      isAuthenticated: true,
    });
  },

  updateAccessToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch {
      // ignore
    }
    set({ token });
  },

  setActiveChildId: (childId: string) => {
    set({ activeChildId: childId });
  },

  logout: async () => {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_KEY),
        SecureStore.deleteItemAsync(USER_KEY),
      ]);
    } catch {
      // ignore
    }
    set({
      user: null,
      token: null,
      refreshToken: null,
      role: null,
      activeChildId: null,
      isAuthenticated: false,
    });
  },

  loginAsDemo: async (demoRole: UserRole) => {
    const demoToken = `demo_jwt_token_${demoRole}_${Date.now()}`;
    const demoUser: AuthUser =
      demoRole === 'parent'
        ? {
            id: 'usr-parent-demo',
            fullName: 'Shavkat Rahimov',
            phone: '+998 90 777 88 99',
            role: 'parent',
            rawRole: 'parent',
            children: [
              { id: 'child-1', fullName: 'Aliyev Temur', groupName: 'Kichkintoylar guruhi (2-3 yosh)' },
              { id: 'child-2', fullName: 'Aliyeva Madina', groupName: 'Yulduzcha guruhi (4-5 yosh)' },
            ],
          }
        : {
            id: 'usr-teacher-demo',
            fullName: 'Zilola Rahimova',
            phone: '+998 90 234 11 22',
            role: 'teacher',
            rawRole: 'teacher',
            groupName: 'Kichkintoylar guruhi',
            branchName: 'Chilonzor filiali',
            branchId: 'branch-chilonzor',
          };

    await get().setAuth(demoUser, demoToken);
  },
}));
