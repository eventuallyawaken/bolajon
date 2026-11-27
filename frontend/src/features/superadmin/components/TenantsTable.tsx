import React, { useState } from 'react';
import type { Tenant, TenantStatus } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { useT } from '@/shared/i18n';

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
  onDelete: (tenant: Tenant) => Promise<void> | void;
  onOpenCreateModal: () => void;
}

export const TenantsTable: React.FC<TenantsTableProps> = ({
  tenants,
  tenantCounts,
  statusFilter,
  onStatusFilterChange,
  onImpersonate,
  onToggleBlock,
  onDelete,
  onOpenCreateModal,
}) => {
  const { t } = useT();
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const columns: Column<Tenant>[] = [
    {
      header: t('sa.tenants.colName'),
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
      header: t('sa.tenants.colBranches'),
      render: (tenant) => (
        <span className="tabular-nums font-semibold">{tenant.branchesCount}</span>
      ),
    },
    {
      header: t('sa.tenants.colChildren'),
      render: (tenant) => (
        <span className="tabular-nums">{tenant.childrenCount}</span>
      ),
    },
    {
      header: t('sa.tenants.colPlan'),
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
      header: t('sa.tenants.colSubEnd'),
      render: (tenant) => (
        <span className="tabular-nums text-secondary">
          {tenant.subscriptionEnd}
          {tenant.trialDaysRemaining !== undefined && (
            <span style={{ color: 'var(--warning-text)', marginLeft: 4 }}>
              ({tenant.trialDaysRemaining})
            </span>
          )}
        </span>
      ),
    },
    {
      header: t('sa.tenants.colFee'),
      render: (tenant) => (
        <span className="tabular-nums font-semibold">{tenant.monthlyFee}</span>
      ),
    },
    {
      header: t('sa.tenants.colStatus'),
      render: (tenant) => {
        switch (tenant.status) {
          case 'active':
            return <Badge variant="success">{t('sa.tenants.statusActive')}</Badge>;
          case 'trial':
            return <Badge variant="warning">{t('sa.tenants.statusTrial')}</Badge>;
          case 'blocked':
            return <Badge variant="danger">{t('sa.tenants.statusBlocked')}</Badge>;
          default:
            return <Badge variant="default">{tenant.status}</Badge>;
        }
      },
    },
    {
      header: t('sa.tenants.colActions'),
      align: 'right',
      render: (tenant) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onImpersonate(tenant)}
            title={t('sa.tenants.enter')}
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
            {t('sa.tenants.enter')}
          </Button>

          <Button
            variant={tenant.status === 'blocked' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onToggleBlock(tenant.id)}
            style={{
              color: tenant.status === 'blocked' ? 'var(--success-text)' : 'var(--warning-text)',
              borderColor: tenant.status === 'blocked' ? 'var(--success-border)' : 'var(--border-color)',
            }}
          >
            {tenant.status === 'blocked' ? t('sa.tenants.activate') : t('sa.tenants.block')}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setTenantToDelete(tenant)}
            title={t('sa.tenants.deleteTitle')}
            style={{
              color: 'var(--danger-text)',
              borderColor: 'var(--danger-border, #fecaca)',
            }}
          >
            {t('sa.tenants.delete')}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="card" id="tenantsList">
      <div className="card-header">
        <div>
          <h3 className="card-title">{t('sa.tenants.title')}</h3>
          <span className="card-subtitle">
            {t('sa.tenants.subtitle')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div className="filter-group">
            <button
              type="button"
              className={`chip ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange('all')}
            >
              {t('common.all')} ({tenantCounts.all})
            </button>
            <button
              type="button"
              className={`chip ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange('active')}
            >
              {t('sa.tenants.statusActive')} ({tenantCounts.active})
            </button>
            <button
              type="button"
              className={`chip ${statusFilter === 'trial' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange('trial')}
            >
              {t('sa.tenants.statusTrial')} ({tenantCounts.trial})
            </button>
            <button
              type="button"
              className={`chip ${statusFilter === 'blocked' ? 'active' : ''}`}
              onClick={() => onStatusFilterChange('blocked')}
            >
              {t('sa.tenants.statusBlocked')} ({tenantCounts.blocked})
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={onOpenCreateModal}>
            + {t('sa.addTenant')}
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={tenants}
        keyExtractor={(item) => item.id}
        emptyMessage={t('sa.tenants.empty')}
      />

      <Modal
        isOpen={Boolean(tenantToDelete)}
        onClose={() => !isDeleting && setTenantToDelete(null)}
        title={t('sa.tenants.deleteTitle')}
        size="sm"
        footer={
          <>
            <Button
              type="button"
              variant="secondary"
              disabled={isDeleting}
              onClick={() => setTenantToDelete(null)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isDeleting}
              onClick={async () => {
                if (!tenantToDelete) return;
                setIsDeleting(true);
                try {
                  await onDelete(tenantToDelete);
                  setTenantToDelete(null);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? t('sa.tenants.deleting') : t('sa.tenants.confirmDelete')}
            </Button>
          </>
        }
      >
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          {t('sa.tenants.deleteConfirm', { name: tenantToDelete?.name || '' })}
        </p>
      </Modal>
    </div>
  );
};

export default TenantsTable;
