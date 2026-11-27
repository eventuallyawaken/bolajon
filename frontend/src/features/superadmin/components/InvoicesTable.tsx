import React from 'react';
import type { SubscriptionInvoice } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { Badge } from '@/shared/ui/Badge';
import { useT } from '@/shared/i18n';

interface InvoicesTableProps {
  invoices: SubscriptionInvoice[];
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices }) => {
  const { t } = useT();
  const columns: Column<SubscriptionInvoice>[] = [
    {
      header: t('sa.invoices.colNumber'),
      render: (inv) => (
        <span className="font-semibold tabular-nums text-primary">{inv.invoiceNumber}</span>
      ),
    },
    {
      header: t('sa.invoices.colTenant'),
      render: (inv) => <span className="font-medium">{inv.tenantName}</span>,
    },
    {
      header: t('sa.invoices.colPlan'),
      render: (inv) => <span className="text-secondary">{inv.planName}</span>,
    },
    {
      header: t('sa.invoices.colAmount'),
      render: (inv) => (
        <span className="font-bold tabular-nums text-primary">{inv.amount}</span>
      ),
    },
    {
      header: t('sa.invoices.colMethod'),
      render: (inv) => {
        switch (inv.paymentMethod) {
          case 'bank':
            return <Badge variant="bank">Bank</Badge>;
          case 'payme':
            return <Badge variant="payme">Payme</Badge>;
          case 'click':
            return <Badge variant="click">Click</Badge>;
          case 'card':
            return <Badge variant="default">Uzcard / Humo</Badge>;
          default:
            return <Badge variant="default">{inv.paymentMethod}</Badge>;
        }
      },
    },
    {
      header: t('sa.invoices.colDate'),
      render: (inv) => (
        <span className="tabular-nums text-muted">{inv.date}</span>
      ),
    },
    {
      header: t('sa.invoices.colStatus'),
      render: (inv) => {
        switch (inv.status) {
          case 'paid':
            return <Badge variant="success">{t('sa.invoices.paid')}</Badge>;
          case 'pending':
            return <Badge variant="warning">{t('sa.invoices.pending')}</Badge>;
          case 'overdue':
            return <Badge variant="danger">{t('sa.invoices.overdue')}</Badge>;
          default:
            return <Badge variant="default">{inv.status}</Badge>;
        }
      },
    },
  ];

  return (
    <div className="card" id="billing">
      <div className="card-header">
        <div>
          <h3 className="card-title">{t('sa.invoices.title')}</h3>
          <span className="card-subtitle">
            {t('sa.invoices.subtitle')}
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        keyExtractor={(item) => item.id}
        emptyMessage={t('sa.invoices.empty')}
      />
    </div>
  );
};

export default InvoicesTable;
