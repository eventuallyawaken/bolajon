import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Server, X, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { DEFAULT_API_URL, useServerConfig } from '../../../shared/config/serverConfig';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ServerConfigModal: React.FC<ServerConfigModalProps> = ({ visible, onClose }) => {
  const c = useThemeColors();
  const { apiUrl, useMock, setServerConfig, resetDefault, testConnection } = useServerConfig();

  const [urlInput, setUrlInput] = useState(apiUrl);
  const [mockEnabled, setMockEnabled] = useState(useMock);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (visible) {
      setUrlInput(apiUrl);
      setMockEnabled(useMock);
      setTestResult(null);
    }
  }, [visible, apiUrl, useMock]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const res = await testConnection(urlInput);
    setTestResult(res);
    setTesting(false);
  };

  const handleSave = async () => {
    await setServerConfig(urlInput, mockEnabled);
    onClose();
  };

  const handleReset = async () => {
    await resetDefault();
    setUrlInput(DEFAULT_API_URL);
    setMockEnabled(false);
    setTestResult(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: c.surface, borderColor: c.borderLight },
          ]}
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Server size={18} color={c.primary} />
              <Text style={[styles.title, { color: c.textPrimary }]}>Server sozlamalari</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={c.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.desc, { color: c.textSecondary }]}>
            Backend server manzilini kiriting (masalan: https://api.saytingiz.uz/api yoki lokal Wi-Fi IP: http://192.168.1.10:5000/api).
          </Text>

          <Input
            label="API manzili (URL)"
            value={urlInput}
            onChangeText={setUrlInput}
            placeholder="http://192.168.43.153:5000/api"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <View style={[styles.switchRow, { backgroundColor: c.subtle, borderColor: c.borderSubtle }]}>
            <View style={styles.switchTextWrap}>
              <Text style={[styles.switchLabel, { color: c.textPrimary }]}>
                Offline sinov (Mock) rejimi
              </Text>
              <Text style={[styles.switchSub, { color: c.textMuted }]}>
                Server bo‘lmaganda ichki sinov ma’lumotlarini ko‘rsatish
              </Text>
            </View>
            <Switch
              value={mockEnabled}
              onValueChange={setMockEnabled}
              trackColor={{ false: c.borderDark, true: c.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {testResult && (
            <View
              style={[
                styles.testBanner,
                {
                  backgroundColor: testResult.ok ? c.successBg : c.dangerBg,
                  borderColor: testResult.ok ? c.success : c.danger,
                },
              ]}
            >
              {testResult.ok ? (
                <CheckCircle2 size={16} color={c.successText} />
              ) : (
                <AlertCircle size={16} color={c.dangerText} />
              )}
              <Text
                style={[
                  styles.testText,
                  { color: testResult.ok ? c.successText : c.dangerText },
                ]}
              >
                {testResult.message}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <Button
              title="Aloqani tekshirish"
              variant="outline"
              size="sm"
              loading={testing}
              onPress={handleTest}
              style={{ flex: 1 }}
            />
            <Button
              title="Saqlash"
              size="sm"
              onPress={handleSave}
              style={{ flex: 1 }}
            />
          </View>

          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <RotateCcw size={13} color={c.textMuted} />
            <Text style={[styles.resetText, { color: c.textMuted }]}>
              Standart manzilga qaytarish
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: typography.lg,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  desc: {
    fontSize: typography.xs,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  switchTextWrap: {
    flex: 1,
  },
  switchLabel: {
    fontSize: typography.sm,
    fontWeight: '600',
  },
  switchSub: {
    fontSize: 11,
    marginTop: 2,
  },
  testBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  testText: {
    flex: 1,
    fontSize: typography.xs,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
