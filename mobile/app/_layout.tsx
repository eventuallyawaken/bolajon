import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/shared/store/useAuthStore';
import { useThemeStore, useThemeColors } from '../src/shared/theme/useThemeStore';
import { useServerConfig } from '../src/shared/config/serverConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2,
    },
  },
});

function RootNavigation() {
  const router = useRouter();
  const segments = useSegments();
  const c = useThemeColors();
  const { isAuthenticated, role, isLoading, hydrate: hydrateAuth } = useAuthStore();
  const hydrateTheme = useThemeStore((s) => s.hydrate);
  const hydrateServer = useServerConfig((s) => s.hydrate);
  const [bootReady, setBootReady] = useState(false);

  useEffect(() => {
    Promise.all([hydrateTheme(), hydrateServer(), hydrateAuth()]).finally(() => {
      setBootReady(true);
    });
  }, []);

  useEffect(() => {
    if (!bootReady || isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (inAuthGroup || !segments[0]) {
      if (role === 'teacher') {
        router.replace('/(teacher)/attendance');
      } else {
        router.replace('/(parent)/home');
      }
    }
  }, [bootReady, isAuthenticated, role, isLoading, segments]);

  if (!bootReady || isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: c.canvas }]}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={c.isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.canvas } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(parent)" />
        <Stack.Screen name="(teacher)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigation />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
