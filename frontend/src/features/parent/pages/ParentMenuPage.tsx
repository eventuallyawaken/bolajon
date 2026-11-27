import React, { useEffect, useState } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { useT } from '@/shared/i18n';
import { parentApi } from '../api';
import type { ParentMenuMeal } from '../types';
import { useParentPortal } from '../context/ParentPortalContext';

export const ParentMenuPage: React.FC = () => {
  const { t } = useT();
  const { activeChild } = useParentPortal();
  const [meals, setMeals] = useState<ParentMenuMeal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeChild?.id) return;
    setIsLoading(true);
    parentApi
      .getMenu(activeChild.id)
      .then(setMeals)
      .finally(() => setIsLoading(false));
  }, [activeChild?.id]);

  const checkAllergyMatch = (meal: ParentMenuMeal): string[] => {
    if (!activeChild?.allergies?.length) return [];
    const haystack = [
      meal.dishName,
      meal.description,
      ...meal.ingredients.map((i) => i.name),
    ]
      .join(' ')
      .toLowerCase();

    return activeChild.allergies.filter((a) => haystack.includes(a.toLowerCase().trim()));
  };

  if (!activeChild) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p className="text-muted" style={{ margin: 0 }}>{t('parent.noChildrenDesc')}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {activeChild.allergies.length > 0 && (
        <div className="alert-box alert-box-danger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
          <div>
            <strong>{t('parent.allergyAlert')}</strong> {activeChild.allergies.join(', ')} ({activeChild.fullName})
          </div>
        </div>
      )}

      {isLoading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div className="text-muted">{t('common.loading')}</div>
        </div>
      ) : meals.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: 0 }}>{t('parent.menuEmpty')}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
          {meals.map((meal) => {
            const matchedAllergens = checkAllergyMatch(meal);
            return (
              <div
                key={meal.id}
                className="card"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  borderColor: matchedAllergens.length > 0 ? '#fca5a5' : undefined,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                  <Badge variant="default" style={{ background: 'var(--brand-soft)', color: 'var(--brand-primary)' }}>
                    {meal.mealType}
                  </Badge>
                  {meal.time && (
                    <span className="text-muted tabular-nums" style={{ fontSize: 12 }}>
                      {meal.time}
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {meal.dishName}
                  </h3>
                  {meal.description && (
                    <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>
                      {meal.description}
                    </p>
                  )}
                </div>

                {matchedAllergens.length > 0 && (
                  <div className="alert-box alert-box-danger">
                    <span>
                      {t('parent.allergyMenuWarn')} ({matchedAllergens.join(', ')})
                    </span>
                  </div>
                )}

                {meal.calories && (
                  <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                    <strong>{t('parent.calories')}:</strong> {meal.calories}
                  </div>
                )}

                {meal.ingredients.length > 0 && (
                  <div>
                    <span className="profile-info-label">{t('parent.ingredients')}</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {meal.ingredients.map((ing, idx) => (
                        <Badge key={idx} variant="default">
                          {ing.name} ({ing.amountPerChild} {ing.unit})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParentMenuPage;
