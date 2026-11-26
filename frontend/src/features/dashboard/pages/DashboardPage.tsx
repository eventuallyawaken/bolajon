import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DashboardData } from '../types';
import { dashboardApi } from '../api';
import { DashboardKpis } from '../components/DashboardKpis';
import { GroupAttendanceWidget } from '../components/GroupAttendanceWidget';
import { RecentPaymentsWidget } from '../components/RecentPaymentsWidget';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getDashboardData().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  if (isLoading || !data) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">Boshqaruv paneli yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Hero greeting */}
      <section className="page-hero">
        <div>
          <h2 className="page-hero-title">Xayrli kun, {data.greetingUser}</h2>
          <p className="page-hero-sub">
            <strong id="activeBranchLabel">{data.branchName}</strong> bo‘yicha bugungi holat — {data.todayDate}
          </p>
        </div>
        <div className="page-hero-actions">
          <Link to="/attendance" className="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <rect x="3" y="4" width="18" height="18" rx="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <path d="m9 14 2 2 4-4"></path>
            </svg>
            Davomat belgilash
          </Link>

          <Link to="/payments" className="btn btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            To‘lovlar
          </Link>
        </div>
      </section>

      {/* 4 KPI Cards */}
      <DashboardKpis kpis={data.kpis} />

      {/* 2-column grid for Attendance & Recent Payments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        <GroupAttendanceWidget groups={data.groupAttendance} />
        <RecentPaymentsWidget payments={data.recentPayments} />
      </div>
    </div>
  );
};

export default DashboardPage;
