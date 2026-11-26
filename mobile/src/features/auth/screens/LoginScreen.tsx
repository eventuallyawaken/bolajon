import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Server } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { z } from 'zod';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { useServerConfig } from '../../../shared/config/serverConfig';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { extractApiError } from '../../../shared/api/http';
import { authApi } from '../api';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { ThemeToggle } from '../../../shared/ui/ThemeToggle';
import { ServerConfigModal } from '../components/ServerConfigModal';
import { QuickAccountsCard } from '../components/QuickAccountsCard';

const loginSchema = z.object({
  phone: z.string().min(9, 'Telefon raqamini to‘liq kiriting'),
  password: z.string().min(6, 'Parol kamida 6 belgidan iborat bo‘lishi kerak'),
});

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const c = useThemeColors();
  const { apiUrl, useMock } = useServerConfig();
  const { setAuth, loginAsDemo } = useAuthStore();

  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  const [serverModalOpen, setServerModalOpen] = useState(false);

  const handlePhoneChange = (val: string) => {
    setPhone(!val.startsWith('+998') ? '+998 ' : val);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleLogin = async () => {
    const result = loginSchema.safeParse({ phone: phone.trim(), password });
    if (!result.success) {
      const fieldErrors: { phone?: string; password?: string } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === 'phone') fieldErrors.phone = issue.message;
        if (issue.path[0] === 'password') fieldErrors.password = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.login({ phone, password });
      await setAuth(res.user, res.token, res.refreshToken);
      if (res.user.role === 'teacher') {
        router.replace('/(teacher)/attendance');
      } else {
        router.replace('/(parent)/home');
      }
    } catch (err) {
      Alert.alert('Kirish xatosi', extractApiError(err, 'Telefon raqam yoki maxfiy parol noto‘g‘ri'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccount = async (demoRole: 'parent' | 'teacher', presetPhone: string) => {
    if (useMock) {
      setLoading(true);
      await loginAsDemo(demoRole);
      setLoading(false);
      router.replace(demoRole === 'teacher' ? '/(teacher)/attendance' : '/(parent)/home');
      return;
    }
    setPhone(presetPhone);
    setPassword('Password123!');
    setErrors({});
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[styles.serverPill, { backgroundColor: c.surface, borderColor: c.borderLight }]}
              onPress={() => setServerModalOpen(true)}
              activeOpacity={0.75}
            >
              <View style={[styles.statusDot, { backgroundColor: useMock ? c.warning : c.success }]} />
              <Server size={13} color={c.textSecondary} />
              <Text style={[styles.serverText, { color: c.textSecondary }]} numberOfLines={1}>
                {useMock ? 'Demo rejim' : apiUrl.replace(/^https?:\/\//, '')}
              </Text>
            </TouchableOpacity>

            <ThemeToggle />
          </View>

          <View style={styles.header}>
            <View style={[styles.logoBadge, { backgroundColor: c.primary, shadowColor: c.primary }]}>
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 2L2 7l10 5 10-5-10-5z"
                  stroke="#FFFFFF"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M2 17l10 5 10-5"
                  stroke="#FFFFFF"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Path
                  d="M2 12l10 5 10-5"
                  stroke="#FFFFFF"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </View>
            <Text style={[styles.brandTitle, { color: c.textPrimary }]}>Bolajon ERP</Text>
            <Text style={[styles.brandSubtitle, { color: c.textSecondary }]}>
              Bog‘cha boshqaruvi va ota-onalar platformasi
            </Text>
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: c.surface, borderColor: c.borderLight, shadowColor: c.shadow },
            ]}
          >
            <Text style={[styles.formTitle, { color: c.textPrimary }]}>Tizimga kirish</Text>
            <Text style={[styles.formDesc, { color: c.textMuted }]}>
              Ro‘yxatdan o‘tgan telefon raqam va parolingizni kiriting
            </Text>

            <Input
              label="Telefon raqam"
              value={phone}
              onChangeText={handlePhoneChange}
              placeholder="+998 90 123 45 67"
              keyboardType="phone-pad"
              error={errors.phone}
              autoCapitalize="none"
            />

            <Input
              label="Maxfiy parol"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              placeholder="••••••••"
              isPassword
              error={errors.password}
            />

            <Button
              title={loading ? 'Tekshirilmoqda...' : 'Tizimga kirish'}
              onPress={handleLogin}
              loading={loading}
              style={styles.loginBtn}
            />
          </View>

          <QuickAccountsCard useMock={useMock} onSelect={handleQuickAccount} />
        </ScrollView>
      </KeyboardAvoidingView>

      <ServerConfigModal visible={serverModalOpen} onClose={() => setServerModalOpen(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    maxWidth: '75%',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  serverText: {
    fontSize: 11,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  brandTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: typography.sm,
    textAlign: 'center',
    marginTop: 4,
  },
  card: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: typography.lg,
    fontWeight: '700',
  },
  formDesc: {
    fontSize: typography.xs,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  loginBtn: {
    marginTop: spacing.sm,
  },
});
