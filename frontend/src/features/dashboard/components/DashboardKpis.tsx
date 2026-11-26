import React from 'react';
import type { DashboardKpiItem } from '../types';

interface DashboardKpisProps {
  kpis: DashboardKpiItem[];
}

export const DashboardKpis: React.FC<DashboardKpisProps> = ({ kpis }) => {
  return (
    <section className="kpi-grid" aria-label="Asosiy ko‘rsatkichlar">
      {kpis.map((kpi) => (
        <article key={kpi.id} className="kpi-card">
          <div className="kpi-top">
            <span className="kpi-label">{kpi.label}</span>
            <div className={`kpi-icon kpi-icon-${kpi.colorClass}`}>
              {kpi.colorClass === 'teal' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              )}
              {kpi.colorClass === 'green' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              )}
              {kpi.colorClass === 'blue' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"></rect>
                  <line x1="2" y1="10" x2="22" y2="10"></line>
                </svg>
              )}
              {kpi.colorClass === 'amber' && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              )}
            </div>
          </div>
          <div className="kpi-value tabular-nums">{kpi.value}</div>
          <div className="kpi-footer">
            {kpi.trendText && (
              <span className={`kpi-trend ${kpi.isUp ? 'up' : 'down'}`}>
                {kpi.trendText}
              </span>
            )}
            <span>{kpi.subValue}</span>
          </div>
        </article>
      ))}
    </section>
  );
};

export default DashboardKpis;
