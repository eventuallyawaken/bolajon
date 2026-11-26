import React from 'react';
import { Tabs } from 'expo-router';
import { CheckSquare, Users, Utensils, User } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography } from '../../src/shared/theme/tokens';
import { useThemeColors } from '../../src/shared/theme/useThemeStore';

export default function TeacherTabLayout() {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopWidth: 1,
          borderTopColor: c.borderLight,
          height: 58 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: typography.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Davomat',
          tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="group"
        options={{
          title: 'Guruhim',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menyu',
          tabBarIcon: ({ color, size }) => <Utensils size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
