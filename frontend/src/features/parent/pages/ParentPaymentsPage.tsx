import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { useT } from '@/shared/i18n';
import { parentApi } from '../api';
import type {
  ParentPaymentCard,
  ParentPaymentItem,
  ParentPaymentsData,
  SubmitReceiptInput,
} from '../types';
import { useParentPortal } from '../context/ParentPortalContext';
import { PaymentReceiptModal } from '../components/PaymentReceiptModal';
import { SubmitReceiptModal } from '../components/SubmitReceiptModal';

export const ParentPaymentsPage: React.FC = () => {
  const { t } = useT();
  const { activeChild } = useParentPortal();
  const [data, setData] = useState<ParentPaymentsData | null>(null);
  const [cards, setCards] = useState<ParentPaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ParentPaymentItem | null>(null);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const loadPaymentsAndCards = useCallback(async () => {
    if (!activeChild?.id) return;
    setIsLoading(true);
    try {
      const [payData, cardList] = await Promise.all([
        parentApi.getChildPayments(activeChild.id),
        parentApi.getPaymentCards(activeChild.id).catch(() => []),
      ]);
      setData(payData);
      setCards(cardList);
    } finally {
      setIsLoading(false);
    }
  }, [activeChild?.id]);

  useEffect(() => {
    void loadPaymentsAndCards();
  }, [loadPaymentsAndCards]);

  const handleSubmitReceipt = async (input: SubmitReceiptInput) => {
    if (!activeChild?.id) return;
    try {
      await parentApi.submitReceipt(activeChild.id, input);
      toast.success('Chek yuborildi! Hisobchi tasdiqlaganidan so‘ng hisobga olinadi.');
      await loadPaymentsAndCards();
    } catch {
      toast.error('Chekni yuborishda xatolik yuz berdi');
      throw new Error('Submit failed');
    }
  };

  if (!activeChild) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p className="text-muted" style={{ margin: 0 }}>{t('parent.noChildrenDesc')}</p>
      </div>
    );
  }

  const columns: Column<ParentPaymentItem>[] = [
    {
      header: t('sa.invoices.colNumber'),
      render: (p) => <span className="font-semibold tabular-nums">{p.receiptNumber}</span>,
    },
    {
      header: 'Davr',
      render: (p) => (
        <div>
          <span className="font-medium">{p.month}</span>
          {p.rejectionReason && (
            <div style={{ fontSize: 11.5, color: 'var(--danger-text)', marginTop: 2 }}>
              Sabab: {p.rejectionReason}
            </div>
          )}
        </div>
      ),
    },
    {
      header: t('dash.colAmount'),
      render: (p) => (
        <span className="font-bold tabular-nums">
          {p.amount.toLocaleString()} {t('common.currency')}
        </span>
      ),
    },
    {
      header: t('dash.colMethod'),
      render: (p) => (
        <Badge variant="default">
          {p.method === 'CARD_TRANSFER'
            ? p.cardSnapshot?.bankName
              ? `${p.cardSnapshot.bankName} (*${p.cardSnapshot.last4 || ''})`
              : 'KARTA'
            : p.method}
        </Badge>
      ),
    },
    {
      header: t('sa.invoices.colDate'),
      render: (p) => <span className="tabular-nums text-muted">{p.date}</span>,
    },
    {
      header: t('sa.invoices.colStatus'),
      render: (p) => (
        <Badge
          variant={
            p.status === 'PAID'
              ? 'success'
              : p.status === 'PENDING'
                ? 'warning'
                : 'danger'
          }
        >
          {p.status === 'PAID'
            ? t('sa.invoices.paid')
            : p.status === 'PENDING'
              ? t('parent.statusPending')
              : p.status === 'REJECTED'
                ? t('parent.statusRejected')
                : t('sa.invoices.overdue')}
        </Badge>
      ),
    },
    {
      header: t('sa.tenants.colActions'),
      align: 'right',
      render: (p) => (
        <div style={{ display: 'inline-flex', gap: 6 }}>
          {p.status === 'REJECTED' && (
            <Button type="button" variant="primary" size="sm" onClick={() => setIsSubmitOpen(true)}>
              {t('parent.retryReceipt')}
            </Button>
          )}
          <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedPayment(p)}>
            {t('parent.viewReceipt')}
          </Button>
        </div>
      ),
    },
  ];

  const balance = data?.balanceOverview;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {balance && (
        <div className="finance-overview-grid">
          <div className="finance-card">
            <span className="finance-card-title">{t('parent.monthlyFee')}</span>
            <span className="finance-card-amount tabular-nums">
              {balance.monthlyFee.toLocaleString()} {t('common.currency')}
            </span>
            <span className="finance-card-sub">{activeChild.groupName}</span>
          </div>

          <div className="finance-card">
            <span className="finance-card-title">{t('parent.debtBalance')}</span>
            <span
              className="finance-card-amount tabular-nums"
              style={{
                color: balance.debtAmount > 0 ? 'var(--danger-text)' : 'var(--success-text)',
              }}
            >
              {balance.debtAmount > 0
                ? `${balance.debtAmount.toLocaleString()} ${t('common.currency')}`
                : t('parent.noDebt')}
            </span>
            <span className="finance-card-sub">
              {balance.pendingAmount && balance.pendingAmount > 0
                ? `${t('parent.statusPending')}: ${balance.pendingAmount.toLocaleString()} ${t('common.currency')}`
                : activeChild.fullName}
            </span>
          </div>

          <div className="finance-card">
            <span className="finance-card-title">{t('parent.lastPayment')}</span>
            <span className="finance-card-amount tabular-nums">{balance.lastPaymentDate}</span>
            <span className="finance-card-sub">{activeChild.branchName}</span>
          </div>
        </div>
      )}

      {/* Accountant's active payment cards + Quick Submit Receipt CTA */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15.5, fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('parent.cardsSectionTitle')}
            </h3>
            <p className="text-muted" style={{ margin: '4px 0 0 0', fontSize: 12.5 }}>
              {cards.length > 0
                ? cards.map((c) => `${c.bankName} (${c.cardType.toUpperCase()} • ${c.cardNumber})`).join('  |  ')
                : t('parent.noActiveCards')}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setIsSubmitOpen(true)}
          >
            + {t('parent.payOnlineBtn')}
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{t('parent.title.payments')}</h3>
            <span className="card-subtitle">{activeChild.fullName}</span>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: 24 }} className="text-muted">
            {t('common.loading')}
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={data?.payments || []}
            keyExtractor={(item) => item.id}
            emptyMessage={t('parent.paymentsEmpty')}
          />
        )}
      </div>

      <PaymentReceiptModal
        payment={selectedPayment}
        branchName={activeChild.branchName}
        onClose={() => setSelectedPayment(null)}
      />

      <SubmitReceiptModal
        isOpen={isSubmitOpen}
        childName={activeChild.fullName}
        defaultAmount={activeChild.monthlyFee}
        cards={cards}
        onClose={() => setIsSubmitOpen(false)}
        onSubmit={handleSubmitReceipt}
      />
    </div>
  );
};

export default ParentPaymentsPage;
