import React from 'react';
import type { Plan } from '../types';
import { Button } from '@/shared/ui/Button';
import { useT } from '@/shared/i18n';

interface PlansSectionProps {
  plans: Plan[];
  onAddPlan: () => void;
  onEditPlan: (plan: Plan) => void;
  onDeletePlan?: (planId: string, planName: string) => void;
}

export const PlansSection: React.FC<PlansSectionProps> = ({
  plans,
  onAddPlan,
  onEditPlan,
  onDeletePlan,
}) => {
  const { t } = useT();
  return (
    <div className="card" id="plans">
      <div className="card-header">
        <div>
          <h3 className="card-title">{t('sa.plans.title')}</h3>
          <span className="card-subtitle">
            {t('sa.plans.subtitle')}
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onAddPlan}
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              style={{ width: 14, height: 14 }}
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          }
        >
          {t('sa.addPlan')}
        </Button>
      </div>

      <div style={{ padding: '24px' }}>
        <div className="plans-grid">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
            >
              {plan.badge && (
                <span
                  className={`plan-badge ${plan.id === 'enterprise' ? 'enterprise' : ''}`}
                >
                  {plan.badge}
                </span>
              )}

              <div className="plan-header">
                <h4 className="plan-title">{plan.name}</h4>
                <p className="plan-desc">{plan.description}</p>
              </div>

              <div className="plan-price-wrap">
                <span className="plan-price-val">{plan.price}</span>
                <span className="plan-price-period">{plan.period}</span>
              </div>

              <ul className="plan-features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="plan-feature-item">
                    <svg
                      className="plan-feature-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: 16, height: 16 }}
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="plan-footer">
                <span
                  className="tabular-nums font-semibold"
                  style={{ fontSize: 13, color: 'var(--brand-primary)' }}
                >
                  {t('sa.plans.activeCount', { count: plan.activeTenantsCount })}
                </span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {onDeletePlan && plan.activeTenantsCount === 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeletePlan(plan.id, plan.name)}
                      title={`"${plan.name}" tarifini o‘chirish`}
                      style={{ color: 'var(--danger-text)', borderColor: 'var(--border-color)', padding: '6px 8px' }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: 13, height: 13 }}
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </Button>
                  )}
                  <Button
                    variant={plan.isPopular ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => onEditPlan(plan)}
                    title={`"${plan.name}" parametrlarini tahrirlash`}
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
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    }
                  >
                    Tahrirlash
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlansSection;
