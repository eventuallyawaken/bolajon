import React from 'react';
import type { DailyMenuItem } from '../types';

interface MenuSectionProps {
  menuItems: DailyMenuItem[];
  onEditMenu: (item: DailyMenuItem) => void;
  onDeleteMenu: (id: string, name: string) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  onEditMenu,
  onDeleteMenu,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--brand-soft)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--brand-primary)',
          fontSize: 12.5,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ fontSize: 16 }}>💡</span>
        <span>
          <strong>Avtomatik integratsiya:</strong> Kunlik davomat saqlanganda kelgan bolalar soniga
          qarab ushbu taomnomadagi barcha mahsulotlar 1 bola me’yori bo‘yicha avtomatik ombordan ayriladi.
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {menuItems.map((menu) => (
          <div
            key={menu.id}
            className="card"
            style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {menu.mealType}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{menu.time}</span>
            </div>

            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                {menu.dishName}
              </h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {menu.description}
              </p>
            </div>

            {/* Ingredients tag list */}
            {menu.ingredients && menu.ingredients.length > 0 && (
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: 10 }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    marginBottom: 6,
                    textTransform: 'uppercase',
                  }}
                >
                  Tarkibiy me’yorlar (1 bolaga):
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {menu.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 12,
                        background: '#f1f5f9',
                        color: '#334155',
                        fontWeight: 600,
                      }}
                    >
                      {ing.productName}: {ing.amountPerChild} {ing.unit}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer with Calories and Action Buttons (Edit / Delete) */}
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 10,
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11.5,
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: '#fef3c7',
                  color: '#b45309',
                }}
              >
                🔥 {menu.calories}
              </span>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ padding: '4px 8px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  onClick={() => onEditMenu(menu)}
                  title="Taomnomani tahrirlash"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Tahrirlash
                </button>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{
                    padding: '4px 8px',
                    fontSize: 12,
                    color: '#ef4444',
                    borderColor: '#fca5a5',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  onClick={() => onDeleteMenu(menu.id, menu.dishName)}
                  title="Taomnomadan o‘chirish"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  O‘chirish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
