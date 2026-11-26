import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL_KEY = 'bolajon_mobile_api_url';
const USE_MOCK_KEY = 'bolajon_mobile_use_mock';

export const DEFAULT_API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://192.168.43.153:5000/api';

const DEFAULT_USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

export function normalizeApiUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return DEFAULT_API_URL;
  return trimmed.endsWith('/api') || trimmed.endsWith('/api/v1')
    ? trimmed
    : `${trimmed}/api`;
}

interface ServerConfigState {
  apiUrl: string;
  useMock: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setServerConfig: (apiUrl: string, useMock: boolean) => Promise<void>;
  resetDefault: () => Promise<void>;
  testConnection: (urlOverride?: string) => Promise<{ ok: boolean; message: string }>;
}

export const useServerConfig = create<ServerConfigState>((set, get) => ({
  apiUrl: normalizeApiUrl(DEFAULT_API_URL),
  useMock: DEFAULT_USE_MOCK,
  hydrated: false,

  hydrate: async () => {
    try {
      const [savedUrl, savedMock] = await Promise.all([
        SecureStore.getItemAsync(API_URL_KEY),
        SecureStore.getItemAsync(USE_MOCK_KEY),
      ]);
      set({
        apiUrl: savedUrl ? normalizeApiUrl(savedUrl) : normalizeApiUrl(DEFAULT_API_URL),
        useMock: savedMock !== null ? savedMock === 'true' : DEFAULT_USE_MOCK,
        hydrated: true,
      });
      return;
    } catch {
      // ignore on unsupported environments
    }
    set({ hydrated: true });
  },

  setServerConfig: async (apiUrl: string, useMock: boolean) => {
    const cleanUrl = normalizeApiUrl(apiUrl);
    set({ apiUrl: cleanUrl, useMock });
    try {
      await Promise.all([
        SecureStore.setItemAsync(API_URL_KEY, cleanUrl),
        SecureStore.setItemAsync(USE_MOCK_KEY, String(useMock)),
      ]);
    } catch {
      // ignore
    }
  },

  resetDefault: async () => {
    const cleanUrl = normalizeApiUrl(DEFAULT_API_URL);
    set({ apiUrl: cleanUrl, useMock: DEFAULT_USE_MOCK });
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(API_URL_KEY),
        SecureStore.deleteItemAsync(USE_MOCK_KEY),
      ]);
    } catch {
      // ignore
    }
  },

  testConnection: async (urlOverride?: string) => {
    const target = normalizeApiUrl(urlOverride ?? get().apiUrl);
    try {
      const res = await axios.get(`${target}/health`, { timeout: 4500 });
      if (res.data?.status === 'ok') {
        return { ok: true, message: `Server bilan aloqa o‘rnatildi (${target})` };
      }
      return { ok: false, message: 'Server kutilmagan javob qaytardi' };
    } catch (err: any) {
      return {
        ok: false,
        message: err?.message || `Serverga ulanib bo‘lmadi: ${target}`,
      };
    }
  },
}));
