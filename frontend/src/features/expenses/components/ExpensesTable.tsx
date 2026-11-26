import React from 'react';
import type { ExpenseRecord } from '../types';

interface ExpensesTableProps {
  expenses: ExpenseRecord[];
}

export const ExpensesTable: React.FC<ExpensesTableProps> = ({ expenses }) => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Xarajat maqsadi</th>
              <th>Kategoriya</th>
              <th>Qabul qiluvchi</th>
              <th>To‘lov usuli</th>
              <th>Summa</th>
              <th>Sana</th>
              <th>Izoh</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Xarajatlar topilmadi.
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.title}</div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: 'var(--brand-soft)',
                        color: 'var(--brand-primary)',
                        fontWeight: 600,
                      }}
                    >
                      {exp.category}
                    </span>
                  </td>
                  <td>{exp.recipient}</td>
                  <td>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{exp.paymentMethod}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#ef4444' }}>- {exp.amount.toLocaleString()} so‘m</strong>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{exp.date}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200 }}>
                    {exp.notes || '-'}
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
