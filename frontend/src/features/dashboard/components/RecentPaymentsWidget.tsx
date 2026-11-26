import React from 'react';
import type { RecentPaymentItem } from '../types';
import { Badge } from '@/shared/ui/Badge';
import { Link } from 'react-router-dom';

interface RecentPaymentsWidgetProps {
  payments: RecentPaymentItem[];
}

export const RecentPaymentsWidget: React.FC<RecentPaymentsWidgetProps> = ({ payments }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Oxirgi qabul qilingan to‘lovlar</h3>
          <span className="card-subtitle">
            Bugun ota-onalar tomonidan amalga oshirilgan to‘lovlar
          </span>
        </div>
        <Link to="/payments" className="btn btn-secondary btn-sm">
          Barcha to‘lovlar
        </Link>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tarbiyalanuvchi</th>
              <th>Summa</th>
              <th>To‘lov usuli</th>
              <th>Vaqt</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="font-bold text-primary">{p.childName}</div>
                  <span className="text-muted" style={{ fontSize: 11.5 }}>
                    {p.groupName}
                  </span>
                </td>
                <td className="tabular-nums font-bold text-primary">{p.amount}</td>
                <td>
                  {p.method === 'payme' && <Badge variant="payme">Payme</Badge>}
                  {p.method === 'click' && <Badge variant="click">Click</Badge>}
                  {p.method === 'bank' && <Badge variant="bank">Bank o‘tkazmasi</Badge>}
                  {p.method === 'cash' && <Badge variant="cash">Naqd</Badge>}
                </td>
                <td className="tabular-nums text-muted" style={{ fontSize: 12 }}>
                  {p.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentPaymentsWidget;
