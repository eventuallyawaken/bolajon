import React from "react";
import type { SuperadminKpis } from "../types";

interface SaasKpiCardsProps {
  kpis: SuperadminKpis | null;
}

export const SaasKpiCards: React.FC<SaasKpiCardsProps> = ({ kpis }) => {
  if (!kpis) return null;

  return (
    <section
      className="mini-stats"
      aria-label="Platforma asosiy ko‘rsatkichlari"
    >
      <div className="mini-stat-card">
        <span className="mini-stat-label">Jami bog‘chalar (Tenantlar)</span>
        <span className="mini-stat-val">{kpis.totalTenants} ta</span>
        <span
          className="mini-stat-sub text-muted"
          style={{ color: "var(--success-text)", fontWeight: 600 }}
        >
          +{kpis.newThisMonth} ta yangi bu oy
        </span>
      </div>

      <div className="mini-stat-card">
        <span className="mini-stat-label">Faol obunalar</span>
        <span
          className="mini-stat-val"
          style={{ color: "var(--brand-primary)" }}
        >
          {kpis.activeTenants} ta ({kpis.activePercent})
        </span>
        <span className="mini-stat-sub text-muted">To‘lov muddati amalda</span>
      </div>

      <div className="mini-stat-card">
        <span className="mini-stat-label">Oylik MRR tushumi</span>
        <span className="mini-stat-val">{kpis.monthlyMrr}</span>
        <span
          className="mini-stat-sub text-muted"
          style={{ color: "var(--success-text)", fontWeight: 600 }}
        >
          {kpis.mrrGrowth} o‘tgan oyga nisbatan
        </span>
      </div>

      <div className="mini-stat-card">
        <span className="mini-stat-label">Sinov muddatidagilar (Trial)</span>
        <span
          className="mini-stat-val"
          style={{ color: "var(--warning-text)" }}
        >
          {kpis.trialTenants} ta
        </span>
        <span className="mini-stat-sub text-muted">
          14 kunlik bepul sinovda
        </span>
      </div>
    </section>
  );
};

export default SaasKpiCards;
