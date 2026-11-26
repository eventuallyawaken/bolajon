import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, CheckCircle2, ChevronRight, FileText } from 'lucide-react-native';
import { radius, spacing, typography } from '../../../shared/theme/tokens';
import { useThemeColors } from '../../../shared/theme/useThemeStore';
import { formatCurrency } from '../../../shared/lib/formatters';
import { useAuthStore } from '../../../shared/store/useAuthStore';
import { extractApiError } from '../../../shared/api/http';
import { useParentChildren, useChildPayments } from '../hooks/useParentQueries';
import type { PaymentItem } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorState } from '../../../shared/ui/ErrorState';

export const ParentPaymentsScreen: React.FC = () => {
  const c = useThemeColors();
  const { activeChildId } = useAuthStore();
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const childrenQuery = useParentChildren();
  const childrenList = childrenQuery.data || [];
  const targetChild = childrenList.find((k) => k.id === activeChildId) || childrenList[0];

  const paymentsQuery = useChildPayments(targetChild?.id);

  const onRefresh = () => {
    childrenQuery.refetch();
    paymentsQuery.refetch();
  };

  if (childrenQuery.isLoading || paymentsQuery.isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <LoadingSpinner message="To‘lovlar yuklanmoqda..." />
      </SafeAreaView>
    );
  }

  if (paymentsQuery.isError) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
        <ErrorState message={extractApiError(paymentsQuery.error)} onRetry={onRefresh} />
      </SafeAreaView>
    );
  }

  const balance = paymentsQuery.data?.balanceOverview;
  const payments = paymentsQuery.data?.payments || [];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.canvas }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={paymentsQuery.isRefetching}
            onRefresh={onRefresh}
            colors={[c.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <ScreenHeader
          title="Bog‘cha to‘lovlari"
          subtitle={targetChild ? `${targetChild.fullName} — Elektron cheklar` : 'Oylik to‘lovlar'}
        />

        {balance && (
          <View
            style={[
              styles.balanceCard,
              { backgroundColor: c.surface, borderColor: c.borderLight, shadowColor: c.shadow },
            ]}
          >
            <View style={styles.balanceHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: c.primarySoft }]}>
                <CreditCard size={20} color={c.primary} />
              </View>
              <Text style={[styles.cardHeaderTitle, { color: c.textPrimary }]}>
                Oylik to‘lov holati
              </Text>
            </View>

            <View style={styles.amountDisplay}>
              <Text style={[styles.balanceLabel, { color: c.textSecondary }]}>
                Oylik tarif miqdori:
              </Text>
              <Text style={[styles.balanceAmount, { color: c.primary }]}>
                {formatCurrency(balance.monthlyFee)}
              </Text>
            </View>

            <View style={[styles.statusRow, { borderTopColor: c.borderSubtle }]}>
              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: c.textMuted }]}>Qarzdorlik:</Text>
                <Text
                  style={[
                    styles.statusValue,
                    { color: balance.debtAmount > 0 ? c.dangerText : c.successText },
                  ]}
                >
                  {balance.debtAmount > 0 ? formatCurrency(balance.debtAmount) : 'Mavjud emas'}
                </Text>
              </View>

              <View style={styles.statusItem}>
                <Text style={[styles.statusLabel, { color: c.textMuted }]}>Oxirgi to‘lov:</Text>
                <Text style={[styles.statusValue, { color: c.textPrimary }]}>
                  {balance.lastPaymentDate || '-'}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>To‘lovlar tarixi</Text>

          {payments.length === 0 ? (
            <Text style={[styles.emptyText, { color: c.textMuted }]}>
              Hali to‘lovlar mavjud emas
            </Text>
          ) : (
            payments.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.paymentCard, { backgroundColor: c.surface, borderColor: c.borderLight }]}
                onPress={() => {
                  setSelectedPayment(p);
                  setModalVisible(true);
                }}
                activeOpacity={0.75}
              >
                <View style={[styles.paymentIconBox, { backgroundColor: c.successBg }]}>
                  <CheckCircle2 size={18} color={c.success} />
                </View>

                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentMonth, { color: c.textPrimary }]}>{p.month} to‘lovi</Text>
                  <Text style={[styles.paymentDate, { color: c.textMuted }]}>
                    {p.date} • {p.method}
                  </Text>
                </View>

                <View style={styles.paymentRight}>
                  <Text style={[styles.paymentAmount, { color: c.textPrimary }]}>
                    {formatCurrency(p.amount)}
                  </Text>
                  <View style={styles.receiptAction}>
                    <FileText size={12} color={c.primary} />
                    <Text style={[styles.receiptActionText, { color: c.primary }]}>Chek</Text>
                    <ChevronRight size={14} color={c.textMuted} />
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <ReceiptModal
        visible={modalVisible}
        payment={selectedPayment}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  balanceCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.md,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderTitle: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  amountDisplay: {
    marginVertical: spacing.xs,
  },
  balanceLabel: {
    fontSize: typography.xs,
  },
  balanceAmount: {
    fontSize: typography.xxl,
    fontWeight: '700',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    marginTop: spacing.md,
    borderTopWidth: 1,
  },
  statusItem: {
    flex: 1,
  },
  statusLabel: {
    fontSize: typography.xs,
  },
  statusValue: {
    fontSize: typography.sm,
    fontWeight: '700',
    marginTop: 2,
  },
  historySection: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.lg,
    fontWeight: '700',
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  paymentIconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMonth: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  paymentDate: {
    fontSize: typography.xs,
    marginTop: 2,
  },
  paymentRight: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: typography.sm,
    fontWeight: '700',
  },
  receiptAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 3,
  },
  receiptActionText: {
    fontSize: typography.xs,
    fontWeight: '600',
  },
});
