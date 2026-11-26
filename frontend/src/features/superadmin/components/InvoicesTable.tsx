import React from 'react';
import type { SubscriptionInvoice } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { Badge } from '@/shared/ui/Badge';

interface InvoicesTableProps {
  invoices: SubscriptionInvoice[];
}

export const InvoicesTable: React.FC<InvoicesTableProps> = ({ invoices }) => {
  const columns: Column<SubscriptionInvoice>[] = [
    {
      header: 'Invoys raqami',
      render: (inv) => (
        <span className="font-semibold tabular-nums text-primary">{inv.invoiceNumber}</span>
      ),
    },
    {
      header: 'Bog‘cha (Tenant) nomi',
      render: (inv) => <span className="font-medium">{inv.tenantName}</span>,
    },
    {
      header: 'Tarif rejasi',
      render: (inv) => <span className="text-secondary">{inv.planName}</span>,
    },
    {
      header: 'To‘lov summasi',
      render: (inv) => (
        <span className="font-bold tabular-nums text-primary">{inv.amount}</span>
      ),
    },
    {
      header: 'To‘lov usuli',
      render: (inv) => {
        switch (inv.paymentMethod) {
          case 'bank':
            return <Badge variant="bank">Bank o‘tkazmasi</Badge>;
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
      header: 'Sana',
      render: (inv) => (
        <span className="tabular-nums text-muted">{inv.date}</span>
      ),
    },
    {
      header: 'Holati',
      render: (inv) => {
        switch (inv.status) {
          case 'paid':
            return <Badge variant="success">To‘langan</Badge>;
          case 'pending':
            return <Badge variant="warning">Kutilmoqda</Badge>;
          case 'overdue':
            return <Badge variant="danger">Kechiktirilgan</Badge>;
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
          <h3 className="card-title">Obuna to‘lovlari tarixi (Billing)</h3>
          <span className="card-subtitle">
            Platforma orqali amalga oshirilgan barcha oylik SaaS obuna to‘lovlari va invoyslar
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        keyExtractor={(item) => item.id}
        emptyMessage="To‘lovlar tarixi mavjud emas"
      />
    </div>
  );
};

export default InvoicesTable;
