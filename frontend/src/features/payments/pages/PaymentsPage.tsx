import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { PaymentRecord, PaymentKpis, CreatePaymentInput } from '../types';
import { paymentsApi } from '../api';
import { PaymentsTable } from '../components/PaymentsTable';
import { AddPaymentModal } from '../components/AddPaymentModal';
import { Button } from '@/shared/ui/Button';

export const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [kpis, setKpis] = useState<PaymentKpis | null>(null);
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([paymentsApi.getPayments(), paymentsApi.getKpis()]).then(([pList, kpiData]) => {
      setPayments(pList);
      setKpis(kpiData);
      setIsLoading(false);
    });
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (filterMethod === 'overdue') {
        if (p.status !== 'overdue') return false;
      } else if (filterMethod !== 'all' && p.method !== filterMethod) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.childName.toLowerCase().includes(q) ||
          p.transactionId.toLowerCase().includes(q) ||
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

  const handlePrintReceipt = (payment: PaymentRecord) => {
    toast.info(`Chek #${payment.receiptNumber} chop etish uchun yuborildi.`);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">To‘lovlar yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Financial KPIs */}
      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>OYLIK TUSHUM</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand-primary)', marginTop: 4 }}>
              {kpis.totalRevenue.toLocaleString()} so‘m
            </div>
            <div style={{ fontSize: 11.5, color: '#16a34a', marginTop: 4 }}>
              Rejadan: {kpis.monthlyTarget > 0 ? Math.round((kpis.totalRevenue / kpis.monthlyTarget) * 100) : 0}% bajarildi
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>TO‘LAGANLAR SONI</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {kpis.collectedCount} ta bola
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4 }}>
              Jami tarbiyalanuvchilardan
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <span className="text-muted" style={{ fontSize: 12, fontWeight: 600 }}>QARZDORLIK</span>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#ef4444', marginTop: 4 }}>
              {kpis.totalDebt.toLocaleString()} so‘m
            </div>
            <div style={{ fontSize: 11.5, color: '#ef4444', marginTop: 4 }}>
              {kpis.debtorCount} ta kechikkan to‘lov
            </div>
          </div>
        </div>
      )}

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
                className={`chip ${filterMethod === 'overdue' ? 'active' : ''}`}
                onClick={() => setFilterMethod('overdue')}
              >
                Qarzdorlar
              </button>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            + To‘lov qabul qilish
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <PaymentsTable payments={filteredPayments} onPrintReceipt={handlePrintReceipt} />

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePayment}
      />
    </div>
  );
};

export default PaymentsPage;
