import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useT } from '@/shared/i18n';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { parentApi } from '../api';
import type { ParentChildOverview, ParentPaymentsData } from '../types';
import { useParentPortal } from '../context/ParentPortalContext';
import { ParentChildSidebarCard } from '../components/ParentChildSidebarCard';
import { AbsenceNoticeModal } from '../components/AbsenceNoticeModal';

export const ParentOverviewPage: React.FC = () => {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const { activeChild, isLoadingChildren } = useParentPortal();
  const [overview, setOverview] = useState<ParentChildOverview | null>(null);
  const [payments, setPayments] = useState<ParentPaymentsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);

  const loadChildData = async (childId: string) => {
    setIsLoading(true);
    try {
      const [ov, pay] = await Promise.all([
        parentApi.getChildOverview(childId),
        parentApi.getChildPayments(childId),
      ]);
      setOverview(ov);
      setPayments(pay);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeChild?.id) {
      void loadChildData(activeChild.id);
    }
  }, [activeChild?.id]);

  if (isLoadingChildren) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">{t('common.loading')}</div>
      </div>
    );
  }

  if (!activeChild) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
          {t('parent.noChildrenTitle')}
        </h3>
        <p className="text-muted" style={{ margin: 0 }}>
          {t('parent.noChildrenDesc')}
        </p>
      </div>
    );
  }

  const today = overview?.todayAttendance;
  const stats = overview?.monthStats;
  const attendancePercent =
    stats && stats.totalDays > 0
      ? Math.round(((stats.presentDays + stats.lateDays) / stats.totalDays) * 100)
      : 0;

  const debtAmount = payments?.balanceOverview?.debtAmount ?? 0;

  const renderStatusBadge = () => {
    if (!today) return <Badge variant="default">{t('parent.notMarked')}</Badge>;
    if (today.status === 'LATE') return <Badge variant="warning">{t('parent.late')}</Badge>;
    if (today.isPresent) return <Badge variant="success">{t('parent.present')}</Badge>;
    return <Badge variant="danger">{t('parent.absent')}</Badge>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <section className="page-hero">
        <div>
          <h2 className="page-hero-title">
            {t('parent.greeting', { name: user?.fullName || t('role.parent') })}
          </h2>
          <p className="page-hero-sub">
            <strong>{activeChild.fullName}</strong> &bull; {activeChild.groupName} &bull; {activeChild.branchName}
          </p>
        </div>

        <div className="page-hero-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsAbsenceModalOpen(true)}
          >
            {t('parent.sendAbsence')}
          </Button>
          <Link to="/parent/payments" className="btn btn-primary">
            {t('parent.nav.payments')}
          </Link>
        </div>
      </section>

      <section className="kpi-grid">
        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t('parent.monthlyRate')}</span>
          </div>
          <div className="kpi-value tabular-nums">{attendancePercent}%</div>
          <div className="kpi-footer">
            <span>
              {stats ? `${stats.presentDays + stats.lateDays} / ${stats.totalDays}` : '0 / 0'}
            </span>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t('parent.monthlyFee')}</span>
          </div>
          <div className="kpi-value tabular-nums">
            {activeChild.monthlyFee.toLocaleString()} {t('common.currency')}
          </div>
          <div className="kpi-footer">
            <span>{activeChild.groupName}</span>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t('parent.debtBalance')}</span>
          </div>
          <div
            className="kpi-value tabular-nums"
            style={{ color: debtAmount > 0 ? 'var(--danger-text)' : 'var(--success-text)' }}
          >
            {debtAmount > 0
              ? `${debtAmount.toLocaleString()} ${t('common.currency')}`
              : t('parent.noDebt')}
          </div>
          <div className="kpi-footer">
            <Link to="/parent/payments" style={{ color: 'var(--brand-primary)', fontWeight: 600 }}>
              {t('parent.nav.payments')}
            </Link>
          </div>
        </article>

        <article className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{t('parent.temperature')}</span>
          </div>
          <div className="kpi-value tabular-nums">
            {today ? `${today.temperature.toFixed(1)}°C` : '—'}
          </div>
          <div className="kpi-footer">
            <span>
              {today
                ? today.healthStatus === 'healthy'
                  ? t('parent.healthy')
                  : today.healthStatus
                : t('parent.notMarked')}
            </span>
          </div>
        </article>
      </section>

      <div className="profile-layout">
        <ParentChildSidebarCard child={activeChild} />

        <div className="profile-content-area">
          {/* Today's attendance & morning check card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">{t('parent.todayStatus')}</h3>
                <span className="card-subtitle">{overview?.date || new Date().toISOString().slice(0, 10)}</span>
              </div>
              {renderStatusBadge()}
            </div>

            <div style={{ padding: 22 }}>
              {isLoading ? (
                <div className="text-muted">{t('common.loading')}</div>
              ) : !today ? (
                <div className="alert-box alert-box-info">
                  <span>{t('parent.notMarked')}</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 16 }}>
                  <div className="profile-info-item">
                    <span className="profile-info-label">{t('parent.temperature')}</span>
                    <span className="profile-info-val tabular-nums" style={{ fontSize: 18, fontWeight: 700 }}>
                      {today.temperature.toFixed(1)}°C
                    </span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">{t('parent.healthStatus')}</span>
                    <span className="profile-info-val">
                      {today.healthStatus === 'healthy' ? t('parent.healthy') : today.healthStatus}
                    </span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">{t('parent.checkedBy')}</span>
                    <span className="profile-info-val">{today.checkedBy}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-label">{t('parent.checkTime')}</span>
                    <span className="profile-info-val tabular-nums">{today.checkTime}</span>
                  </div>
                  {today.notes && (
                    <div className="profile-info-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="profile-info-label">{t('parent.dayDetails')}</span>
                      <span className="profile-info-val">{today.notes}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Latest school notice card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{t('parent.latestNotice')}</h3>
              <Link to="/parent/attendance" className="btn btn-secondary btn-sm">
                {t('parent.calendarTitle')}
              </Link>
            </div>
            <div style={{ padding: 22 }}>
              {overview?.latestNotification ? (
                <div className="alert-box alert-box-info" style={{ flexDirection: 'column', gap: 6 }}>
                  <strong style={{ fontSize: 14 }}>{overview.latestNotification.title}</strong>
                  <span style={{ fontSize: 13 }}>{overview.latestNotification.message}</span>
                  <span className="text-muted tabular-nums" style={{ fontSize: 11.5 }}>
                    {overview.latestNotification.createdAt.slice(0, 16).replace('T', ' ')}
                  </span>
                </div>
              ) : (
                <p className="text-muted" style={{ margin: 0 }}>
                  {t('parent.noNotices')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AbsenceNoticeModal
        isOpen={isAbsenceModalOpen}
        childId={activeChild.id}
        childName={activeChild.fullName}
        onClose={() => setIsAbsenceModalOpen(false)}
        onSuccess={() => void loadChildData(activeChild.id)}
      />
    </div>
  );
};

export default ParentOverviewPage;
