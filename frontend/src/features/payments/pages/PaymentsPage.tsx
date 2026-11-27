import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import type {
  PaymentRecord,
  PaymentKpis,
  CreatePaymentInput,
  PaymentCard,
  CreatePaymentCardInput,
} from '../types';
import { paymentsApi } from '../api';
import { PaymentsTable } from '../components/PaymentsTable';
import { AddPaymentModal } from '../components/AddPaymentModal';
import { PaymentCardsManager } from '../components/PaymentCardsManager';
import { PaymentReviewModal } from '../components/PaymentReviewModal';
import { Button } from '@/shared/ui/Button';
import { useT } from '@/shared/i18n';

export const PaymentsPage: React.FC = () => {
  const { t } = useT();
  const [activeTab, setActiveTab] = useState<'payments' | 'cards'>('payments');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [kpis, setKpis] = useState<PaymentKpis | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewPayment, setReviewPayment] = useState<PaymentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const [pList, kpiData, cardList] = await Promise.all([
      paymentsApi.getPayments(),
      paymentsApi.getKpis(),
      paymentsApi.getCards().catch(() => []),
    ]);
    setPayments(pList);
    setKpis(kpiData);
    setCards(cardList);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (filterMethod === 'overdue') {
        if (p.status !== 'overdue') return false;
      } else if (filterMethod === 'pending') {
        if (p.status !== 'pending') return false;
      } else if (filterMethod === 'rejected') {
        if (p.status !== 'rejected') return false;
      } else if (filterMethod !== 'all' && p.method !== filterMethod) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.childName.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q) ||
          p.receiptNumber.toLowerCase().includes(q) ||
          p.parentPhone.includes(q)
        );
      }
      return true;
    });
  }, [payments, filterMethod, searchQuery]);

  const handleCreatePayment = async (input: CreatePaymentInput) => {
    const created = await paymentsApi.createPayment(input);
    setPayments((prev) => [created, ...prev]);
    paymentsApi.getKpis().then(setKpis);
    setIsModalOpen(false);
    toast.success(`"${created.childName}" uchun ${created.amount.toLocaleString()} so‘m to‘lov qabul qilindi!`);
  };

  const handleApproveReceipt = async (id: string) => {
    const updated = await paymentsApi.approvePayment(id);
    setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
    paymentsApi.getKpis().then(setKpis);
    toast.success(`"${updated.childName}" cheki tasdiqlandi va oylik tushumga qo‘shildi!`);
  };

  const handleRejectReceipt = async (id: string, reason: string) => {
    const updated = await paymentsApi.rejectPayment(id, reason);
    setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
    paymentsApi.getKpis().then(setKpis);
    toast.warn(`"${updated.childName}" cheki qaytarildi va ota-onaga sabab yuborildi.`);
  };

  const handleCreateCard = async (input: CreatePaymentCardInput) => {
    const created = await paymentsApi.createCard(input);
    setCards((prev) => [created, ...prev]);
    toast.success('Yangi bank kartasi qo‘shildi!');
  };

  const handleUpdateCard = async (id: string, input: Partial<CreatePaymentCardInput>) => {
    const updated = await paymentsApi.updateCard(id, input);
    setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    toast.success('Karta ma’lumotlari yangilandi!');
  };

  const handleDeleteCard = async (id: string) => {
    await paymentsApi.deleteCard(id);
    setCards((prev) => prev.filter((c) => c.id !== id));
    toast.info('Karta o‘chirildi.');
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">{t('payments.loading')}</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Financial KPIs */}
      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>{t('payments.monthlyRev')}</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-primary)', marginTop: 4 }}>
              {kpis.totalRevenue.toLocaleString()} {t('common.currency')}
            </div>
            <div style={{ fontSize: 11.5, color: '#16a34a', marginTop: 4 }}>
              Rejadan: {kpis.monthlyTarget > 0 ? Math.round((kpis.totalRevenue / kpis.monthlyTarget) * 100) : 0}%
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: 18,
              borderLeft: kpis.pendingCount > 0 ? '4px solid #f59e0b' : undefined,
              cursor: 'pointer',
            }}
            onClick={() => {
              setActiveTab('payments');
              setFilterMethod('pending');
            }}
          >
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>{t('payments.pendingKpi')}</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#d97706', marginTop: 4 }}>
              {kpis.pendingCount} ta
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
              {kpis.pendingAmount.toLocaleString()} {t('common.currency')}
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>{t('payments.collectedCount')}</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {kpis.collectedCount}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
              {t('common.active')}
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>{t('payments.debtTitle')}</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
              {kpis.totalDebt.toLocaleString()} {t('common.currency')}
            </div>
            <div style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4 }}>
              {kpis.debtorCount} ta
            </div>
          </div>
        </div>
      )}

      {/* Section Switcher Tabs */}
      <div className="filter-group">
        <button
          type="button"
          className={`chip ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          {t('payments.tabList')} ({payments.length})
        </button>
        <button
          type="button"
          className={`chip ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          {t('payments.tabCards')} ({cards.filter((c) => c.isActive).length})
        </button>
      </div>

      {activeTab === 'cards' ? (
        <PaymentCardsManager
          cards={cards}
          onCreate={handleCreateCard}
          onUpdate={handleUpdateCard}
          onDelete={handleDeleteCard}
        />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
                <div className="search-box" style={{ width: 280 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="search"
                    placeholder="Bola, chek yoki telefon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <button
                    type="button"
                    className={`chip ${filterMethod === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterMethod('all')}
                  >
                    Barchasi ({payments.length})
                  </button>
                  <button
                    type="button"
                    className={`chip ${filterMethod === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilterMethod('pending')}
                  >
                    Tekshirilmoqda ({payments.filter((p) => p.status === 'pending').length})
                  </button>
                  <button
                    type="button"
                    className={`chip ${filterMethod === 'card_transfer' ? 'active' : ''}`}
                    onClick={() => setFilterMethod('card_transfer')}
                  >
                    Karta cheklari
                  </button>
                  <button
                    type="button"
                    className={`chip ${filterMethod === 'Payme' ? 'active' : ''}`}
                    onClick={() => setFilterMethod('Payme')}
                  >
                    Payme
                  </button>
                  <button
                    type="button"
                    className={`chip ${filterMethod === 'Click' ? 'active' : ''}`}
                    onClick={() => setFilterMethod('Click')}
                  >
                    Click
                  </button>
                  <button
                    type="button"
                    className={`chip ${filterMethod === 'rejected' ? 'active' : ''}`}
                    onClick={() => setFilterMethod('rejected')}
                  >
                    Qaytarilgan
                  </button>
                  <button
                    type="button"
                    className={`chip ${filterMethod === 'overdue' ? 'active' : ''}`}
                    onClick={() => setFilterMethod('overdue')}
                  >
                    Qarzdorlar
                  </button>
                </div>
              </div>

              <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
                {t('payments.add')}
              </Button>
            </div>
          </div>

          {/* Payments Table */}
          <PaymentsTable
            payments={filteredPayments}
            onPrintReceipt={(p) => setReviewPayment(p)}
          />
        </>
      )}

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePayment}
      />

      {/* Receipt Review / Approve / Reject Modal */}
      <PaymentReviewModal
        payment={reviewPayment}
        onClose={() => setReviewPayment(null)}
        onApprove={handleApproveReceipt}
        onReject={handleRejectReceipt}
      />
    </div>
  );
};

export default PaymentsPage;
