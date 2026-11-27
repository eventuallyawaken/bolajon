import React from 'react';
import type { PaymentRecord } from '../types';
import { Badge } from '@/shared/ui/Badge';

interface PaymentsTableProps {
  payments: PaymentRecord[];
  onPrintReceipt: (payment: PaymentRecord) => void;
}

function formatMethodLabel(p: PaymentRecord): string {
  if (p.method === 'card_transfer') {
    const bank = p.cardSnapshot?.bankName;
    const last4 = p.cardSnapshot?.last4;
    return bank ? `${bank}${last4 ? ` (*${last4})` : ''}` : 'Karta o‘tkazmasi';
  }
  return p.method;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({ payments, onPrintReceipt }) => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tranzaksiya ID</th>
              <th>Tarbiyalanuvchi</th>
              <th>Guruhi</th>
              <th>Oy</th>
              <th>To‘lov usuli</th>
              <th>Summa</th>
              <th>Holat</th>
              <th>Sana</th>
              <th style={{ textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  To‘lovlar topilmadi.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {p.transactionId}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.childName}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.parentPhone}</div>
                  </td>
                  <td>{p.groupName}</td>
                  <td>{p.month}</td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#f1f5f9',
                        color: '#334155',
                        fontWeight: 500,
                      }}
                    >
                      {formatMethodLabel(p)}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: p.amount > 0 ? '#0d9488' : '#ef4444' }}>
                      {p.amount > 0 ? `${p.amount.toLocaleString()} so‘m` : 'Qarzdor'}
                    </strong>
                  </td>
                  <td>
                    {p.status === 'paid' && <Badge variant="success">To‘langan</Badge>}
                    {p.status === 'pending' && <Badge variant="warning">Tekshirilmoqda</Badge>}
                    {p.status === 'rejected' && <Badge variant="danger">Qaytarilgan</Badge>}
                    {p.status === 'overdue' && <Badge variant="danger">Qarzdorlik</Badge>}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.paidAt}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${p.status === 'pending' ? 'btn-primary' : 'btn-outline'}`}
                      style={{ padding: '4px 10px', fontSize: 12 }}
                      onClick={() => onPrintReceipt(p)}
                    >
                      {p.status === 'pending' ? 'Tekshirish' : p.receiptImageUrl ? 'Chek rasmi' : 'Chek'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
