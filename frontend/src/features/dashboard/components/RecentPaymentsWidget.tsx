import React from 'react';
import type { RecentPaymentItem } from '../types';
import { Badge } from '@/shared/ui/Badge';
import { Link } from 'react-router-dom';
import { useT } from '@/shared/i18n';

interface RecentPaymentsWidgetProps {
  payments: RecentPaymentItem[];
}

export const RecentPaymentsWidget: React.FC<RecentPaymentsWidgetProps> = ({ payments }) => {
  const { t } = useT();
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{t('dash.recentPaymentsTitle')}</h3>
          <span className="card-subtitle">
            {t('dash.recentPaymentsSub')}
          </span>
        </div>
        <Link to="/payments" className="btn btn-secondary btn-sm">
          {t('dash.allPayments')}
        </Link>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('dash.colChild')}</th>
              <th>{t('dash.colAmount')}</th>
              <th>{t('dash.colMethod')}</th>
              <th>{t('dash.colTime')}</th>
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
                  {p.method === 'card_transfer' && <Badge variant="bank">Karta o‘tkazmasi</Badge>}
                  {!['payme', 'click', 'bank', 'cash', 'card_transfer'].includes(p.method) && (
                    <Badge variant="default">{p.method}</Badge>
                  )}
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
