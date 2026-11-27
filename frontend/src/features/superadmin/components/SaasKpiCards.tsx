import React from "react";
import type { SuperadminKpis } from "../types";
import { useT } from "@/shared/i18n";

interface SaasKpiCardsProps {
  kpis: SuperadminKpis | null;
}

export const SaasKpiCards: React.FC<SaasKpiCardsProps> = ({ kpis }) => {
  const { t } = useT();
  if (!kpis) return null;

  return (
    <section
      className="mini-stats"
      aria-label={t('sa.title.overview')}
    >
      <div className="mini-stat-card">
        <span className="mini-stat-label">{t('sa.kpi.totalTenants')}</span>
        <span className="mini-stat-val">{kpis.totalTenants}</span>
        <span
          className="mini-stat-sub text-muted"
          style={{ color: "var(--success-text)", fontWeight: 600 }}
        >
          {t('sa.kpi.newThisMonth', { count: kpis.newThisMonth })}
        </span>
      </div>

      <div className="mini-stat-card">
        <span className="mini-stat-label">{t('sa.kpi.activeSubs')}</span>
        <span
          className="mini-stat-val"
          style={{ color: "var(--brand-primary)" }}
        >
          {kpis.activeTenants} ({kpis.activePercent})
        </span>
        <span className="mini-stat-sub text-muted">{t('sa.kpi.paidValid')}</span>
      </div>

      <div className="mini-stat-card">
        <span className="mini-stat-label">{t('sa.kpi.monthlyMrr')}</span>
        <span className="mini-stat-val">{kpis.monthlyMrr}</span>
        <span
          className="mini-stat-sub text-muted"
          style={{ color: "var(--success-text)", fontWeight: 600 }}
        >
          {kpis.mrrGrowth} {t('sa.kpi.vsLastMonth')}
        </span>
      </div>

      <div className="mini-stat-card">
        <span className="mini-stat-label">{t('sa.kpi.trialTenants')}</span>
        <span
          className="mini-stat-val"
          style={{ color: "var(--warning-text)" }}
        >
          {kpis.trialTenants}
        </span>
        <span className="mini-stat-sub text-muted">
          {t('sa.kpi.trialSub')}
        </span>
      </div>
    </section>
  );
};

export default SaasKpiCards;
