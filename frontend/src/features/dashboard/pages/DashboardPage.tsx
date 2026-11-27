import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData, DashboardKpiItem } from '../types';
import { dashboardApi } from '../api';
import { DashboardKpis } from '../components/DashboardKpis';
import { GroupAttendanceWidget } from '../components/GroupAttendanceWidget';
import { RecentPaymentsWidget } from '../components/RecentPaymentsWidget';
import { useAuthStore, normalizeRole } from '@/shared/store/useAuthStore';
import { useT } from '@/shared/i18n';

export const DashboardPage: React.FC = () => {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);
  const isAccountant = role === 'accountant';
  const canMarkAttendance = role === 'director';

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getDashboardData().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  const displayedKpis: DashboardKpiItem[] = useMemo(() => {
    if (!data) return [];
    if (!isAccountant || !data.financeSummary) return data.kpis;
    const f = data.financeSummary;
    return [
      {
        id: 'acc-1',
        label: t('dash.accMonthlyRev'),
        value: `${f.monthlyRevenue.toLocaleString()} ${t('common.currency')}`,
        subValue: t('dash.accApprovedOnly'),
        colorClass: 'teal',
      },
      {
        id: 'acc-2',
        label: t('dash.accPendingReceipts'),
        value: String(f.pendingReceiptsCount),
        subValue: `${f.pendingReceiptsAmount.toLocaleString()} ${t('common.currency')}`,
        colorClass: 'amber',
      },
      {
        id: 'acc-3',
        label: t('dash.accMonthlyExpenses'),
        value: `${f.monthlyExpenses.toLocaleString()} ${t('common.currency')}`,
        subValue: t('dash.accCashAndBank'),
        colorClass: 'blue',
      },
      {
        id: 'acc-4',
        label: t('dash.accNetBalance'),
        value: `${f.netBalance.toLocaleString()} ${t('common.currency')}`,
        subValue: `${t('dash.accDebt')}: ${f.totalDebt.toLocaleString()} ${t('common.currency')}`,
        colorClass: 'green',
      },
    ];
  }, [data, isAccountant, t]);

  if (isLoading || !data) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">{t('dash.loading')}</div>
      </div>
    );
  }

  const pendingCount = data.financeSummary?.pendingReceiptsCount ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Hero greeting */}
      <section className="page-hero">
        <div>
          <h2 className="page-hero-title">{t('dash.greeting', { name: data.greetingUser })}</h2>
          <p className="page-hero-sub">
            <strong id="activeBranchLabel">{data.branchName}</strong> {t('dash.subtitleSuffix')} — {data.todayDate}
          </p>
        </div>
        <div className="page-hero-actions">
          {canMarkAttendance && (
            <Link to="/attendance" className="btn btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <path d="m9 14 2 2 4-4"></path>
              </svg>
              {t('dash.markAttendance')}
            </Link>
          )}

          {isAccountant && (
            <Link to="/expenses" className="btn btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              {t('nav.expenses')}
            </Link>
          )}

          <Link to="/payments" className="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            {t('dash.payments')}
          </Link>
        </div>
      </section>

      {/* Pending receipts callout banner for Accountant & Director */}
      {pendingCount > 0 && (
        <div
          className="card"
          style={{
            padding: '14px 20px',
            borderLeft: '4px solid #f59e0b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>
              {t('dash.pendingReceiptsBanner', { count: pendingCount })}
            </strong>
            <div className="text-muted" style={{ fontSize: 12.5, marginTop: 2 }}>
              {t('dash.pendingReceiptsHint')}
            </div>
          </div>
          <Link to="/payments" className="btn btn-primary btn-sm">
            {t('dash.reviewReceiptsBtn')}
          </Link>
        </div>
      )}

      {/* 4 KPI Cards */}
      <DashboardKpis kpis={displayedKpis} />

      {/* 2-column grid for Attendance (read-only for Accountant) & Recent Payments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        <GroupAttendanceWidget
          groups={data.groupAttendance}
          showDetailButton={canMarkAttendance}
        />
        <RecentPaymentsWidget payments={data.recentPayments} />
      </div>
    </div>
  );
};

export default DashboardPage;
