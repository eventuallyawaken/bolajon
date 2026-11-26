import React from 'react';
import type { Tenant, TenantStatus } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

interface TenantsTableProps {
  tenants: Tenant[];
  tenantCounts: {
    all: number;
    active: number;
    trial: number;
    blocked: number;
  };
  statusFilter: 'all' | TenantStatus;
  onStatusFilterChange: (status: 'all' | TenantStatus) => void;
  onImpersonate: (tenant: Tenant) => void;
  onToggleBlock: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const TenantsTable: React.FC<TenantsTableProps> = ({
  tenants,
  tenantCounts,
  statusFilter,
  onStatusFilterChange,
  onImpersonate,
  onToggleBlock,
  onOpenCreateModal,
}) => {
  const columns: Column<Tenant>[] = [
    {
      header: 'Bog‘cha nomi / Subdomain',
      render: (tenant) => (
        <div className="tenant-cell">
          <div
            className="tenant-avatar"
            style={tenant.avatarColor ? { background: tenant.avatarColor } : undefined}
          >
            {tenant.initials}
          </div>
          <div>
            <div className="font-bold text-primary">{tenant.name}</div>
            <span className="text-muted tabular-nums" style={{ fontSize: '11.5px' }}>
              {tenant.subdomain} &bull; STIR: {tenant.stir}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Filiallar',
      render: (tenant) => (
        <span className="tabular-nums font-semibold">{tenant.branchesCount} ta filial</span>
      ),
    },
    {
      header: 'Jami bolalar',
      render: (tenant) => (
        <span className="tabular-nums">{tenant.childrenCount} bola</span>
      ),
    },
    {
      header: 'Tarif rejasi',
      render: (tenant) => {
        if (tenant.planId === 'enterprise') {
          return <Badge variant="purple">{tenant.planName}</Badge>;
        }
        if (tenant.planId === 'pro') {
          return (
            <Badge
              variant="default"
              style={{ background: '#e0f2fe', color: '#0284c7' }}
            >
              {tenant.planName}
            </Badge>
          );
        }
        return <Badge variant="default">{tenant.planName}</Badge>;
      },
    },
    {
      header: 'Obuna muddati',
      render: (tenant) => (
        <span className="tabular-nums text-secondary">
          {tenant.subscriptionEnd}
          {tenant.trialDaysRemaining !== undefined && (
            <span style={{ color: 'var(--warning-text)', marginLeft: 4 }}>
              ({tenant.trialDaysRemaining} kun qoldi)
            </span>
          )}
        </span>
      ),
    },
    {
      header: 'Oylik to‘lov',
      render: (tenant) => (
        <span className="tabular-nums font-semibold">{tenant.monthlyFee}</span>
      ),
    },
    {
      header: 'Holati',
      render: (tenant) => {
        switch (tenant.status) {
          case 'active':
            return <Badge variant="success">Faol</Badge>;
          case 'trial':
            return <Badge variant="warning">Sinovda</Badge>;
          case 'blocked':
            return <Badge variant="danger">Bloklangan</Badge>;
          default:
            return <Badge variant="default">{tenant.status}</Badge>;
        }
      },
    },
    {
      header: 'Amallar',
      align: 'right',
      render: (tenant) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onImpersonate(tenant)}
            title="Bog‘cha boshqaruv paneliga kirish (Impersonate)"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ width: 13, height: 13 }}
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
            }
          >
            Kirish
          </Button>

          <Button
            variant={tenant.status === 'blocked' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onToggleBlock(tenant.id)}
            title={tenant.status === 'blocked' ? 'Hisobni ochish' : 'Hisobni to‘xtatish'}
            style={{
              color: tenant.status === 'blocked' ? 'var(--success-text)' : 'var(--danger-text)',
              borderColor: tenant.status === 'blocked' ? 'var(--success-border)' : 'var(--border-color)',
            }}
          >
            {tenant.status === 'blocked' ? 'Faollashtirish' : 'Bloklash'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="card" id="tenantsList">
      <div className="card-header">
        <div>
          <h3 className="card-title">Ulangan maktabgacha ta’lim muassasalari</h3>
          <span className="card-subtitle">
            Barcha ro‘yxatga olingan tashkilotlar va ularning SaaS obuna holati
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="filter-group">
            <button
              type="button"
              className={`chip ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange('all')}
            >
              Barchasi ({tenantCounts.all})
            </button>
            <button
              type="button"
              className={`chip ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange('active')}
            >
              Faol ({tenantCounts.active})
            </button>
            <button
              type="button"
              className={`chip ${statusFilter === 'trial' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange('trial')}
            >
              Sinovda ({tenantCounts.trial})
            </button>
            <button
              type="button"
              className={`chip ${statusFilter === 'blocked' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange('blocked')}
            >
              Bloklangan ({tenantCounts.blocked})
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={onOpenCreateModal}>
            + Yangi bog‘cha ulash
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tenants}
        keyExtractor={(item) => item.id}
        emptyMessage="Qidiruv yoki filtr bo‘yicha hech qanday bog‘cha topilmadi"
      />
    </div>
  );
};

export default TenantsTable;
