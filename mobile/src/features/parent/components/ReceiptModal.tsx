import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CheckCircle2, X } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { formatCurrency } from '../../../shared/lib/formatters';
import type { PaymentItem } from '../types';

interface ReceiptModalProps {
  visible: boolean;
  payment: PaymentItem | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ visible, payment, onClose }) => {
  const c = useThemeColors();
  if (!payment) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: c.surface }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <CheckCircle2 size={22} color={c.success} />
              <Text style={[styles.headerTitle, { color: c.textPrimary }]}>
                Elektron Kvitansiya (Chek)
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={c.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={[styles.amountBox, { backgroundColor: c.subtle, borderColor: c.borderLight }]}>
            <Text style={[styles.amountLabel, { color: c.textSecondary }]}>To‘langan summa</Text>
            <Text style={[styles.amountValue, { color: c.primary }]}>
              {formatCurrency(payment.amount)}
            </Text>
            <Text style={[styles.receiptId, { color: c.textMuted }]}>
              Chek №: {payment.receiptNumber}
            </Text>
          </View>

          <View style={[styles.detailsCard, { borderColor: c.borderLight }]}>
            <View style={[styles.detailRow, { borderBottomColor: c.borderSubtle }]}>
              <Text style={[styles.detailLabel, { color: c.textSecondary }]}>Tarbiyalanuvchi:</Text>
              <Text style={[styles.detailValue, { color: c.textPrimary }]}>{payment.childName}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: c.borderSubtle }]}>
              <Text style={[styles.detailLabel, { color: c.textSecondary }]}>To‘lovchi:</Text>
              <Text style={[styles.detailValue, { color: c.textPrimary }]}>{payment.payerName}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: c.borderSubtle }]}>
              <Text style={[styles.detailLabel, { color: c.textSecondary }]}>To‘lov maqsadi:</Text>
              <Text style={[styles.detailValue, { color: c.textPrimary }]}>
                {payment.month} bog‘cha to‘lovi
              </Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: c.borderSubtle }]}>
              <Text style={[styles.detailLabel, { color: c.textSecondary }]}>To‘lov usuli:</Text>
              <Text style={[styles.detailValue, { color: c.textPrimary }]}>{payment.method}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: c.borderSubtle }]}>
              <Text style={[styles.detailLabel, { color: c.textSecondary }]}>Sana:</Text>
              <Text style={[styles.detailValue, { color: c.textPrimary }]}>{payment.date}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <Text style={[styles.detailLabel, { color: c.textSecondary }]}>Holati:</Text>
              <Text style={[styles.detailValue, { color: c.successText, fontWeight: '700' }]}>
                {payment.status === 'PAID' ? 'To‘langan' : payment.status}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: c.primary }]}
            onPress={onClose}
          >
            <Text style={styles.doneBtnText}>Yopish</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: radius['2xl'],
    borderTopRightRadius: radius['2xl'],
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: typography.lg,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  amountBox: {
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  amountLabel: {
    fontSize: typography.xs,
  },
  amountValue: {
    fontSize: typography.xxl,
    fontWeight: '700',
    marginVertical: 4,
  },
  receiptId: {
    fontSize: typography.xs,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  detailsCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: typography.xs,
  },
  detailValue: {
    fontSize: typography.xs,
    fontWeight: '600',
  },
  doneBtn: {
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  doneBtnText: {
    fontSize: typography.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
