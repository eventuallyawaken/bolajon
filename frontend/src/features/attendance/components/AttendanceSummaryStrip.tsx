import React from 'react';
import type { AttendanceGroupSummary } from '../types';

interface AttendanceSummaryStripProps {
  summary: AttendanceGroupSummary;
}

export const AttendanceSummaryStrip: React.FC<AttendanceSummaryStripProps> = ({ summary }) => {
  return (
    <section className="att-summary-strip" aria-label="Davomat ko‘rsatkichlari">
      <div className="att-stat-box">
        <span className="att-stat-dot" style={{ background: 'var(--brand-primary)' }}></span>
        <div className="att-stat-info">
          <span className="att-stat-count tabular-nums">{summary.total}</span>
          <span className="att-stat-title">Guruhdagi jami bolalar</span>
        </div>
      </div>

      <div className="att-stat-box">
        <span className="att-stat-dot" style={{ background: 'var(--success-dot)' }}></span>
        <div className="att-stat-info">
          <span className="att-stat-count tabular-nums" style={{ color: 'var(--success-text)' }}>
            {summary.present}
          </span>
          <span className="att-stat-title">Bugun kelganlar</span>
        </div>
      </div>

      <div className="att-stat-box">
        <span className="att-stat-dot" style={{ background: '#94a3b8' }}></span>
        <div className="att-stat-info">
          <span className="att-stat-count tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {summary.absent}
          </span>
          <span className="att-stat-title">Kelmadi (Sababli/Sababsiz)</span>
        </div>
      </div>

      <div className="att-stat-box">
        <span className="att-stat-dot" style={{ background: '#0284c7' }}></span>
        <div className="att-stat-info">
          <span className="att-stat-count tabular-nums" style={{ color: '#0284c7' }}>
            {summary.healthChecked}
          </span>
          <span className="att-stat-title">Ertalabki filtrdan o‘tgan</span>
        </div>
      </div>
    </section>
  );
};

export default AttendanceSummaryStrip;
