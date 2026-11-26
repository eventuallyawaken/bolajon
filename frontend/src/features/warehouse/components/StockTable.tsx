import React from 'react';
import type { WarehouseItem } from '../types';

interface StockTableProps {
  items: WarehouseItem[];
  onEditItem: (item: WarehouseItem) => void;
}

const StockIndicator: React.FC<{ item: WarehouseItem }> = ({ item }) => {
  const isEnough = item.status === 'enough';
  const isOut = item.quantity === 0;

  if (isEnough) {
    return (
      <svg width="38" height="38" viewBox="0 0 38 38" style={{ flexShrink: 0 }}>
        <circle
          cx="19"
          cy="19"
          r="14"
          stroke="#10b981"
          strokeWidth="3"
          fill="#f0fdf4"
          strokeDasharray="87.96"
          strokeDashoffset="14"
          strokeLinecap="round"
          transform="rotate(-60 19 19)"
        />
        <polyline
          points="13 19 17 23 25 15"
          stroke="#059669"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );
  }

  const percentage = isOut
    ? 0
    : Math.max(1, Math.min(99, Math.round((item.quantity / item.minThreshold) * 100)));
  const circumference = 87.96;
  const dashoffset = circumference - (circumference * percentage) / 100;
  const strokeColor = isOut ? '#ef4444' : '#f59e0b';
  const trackColor = isOut ? '#fee2e2' : '#fef3c7';
  const textColor = isOut ? '#dc2626' : '#d97706';
  const fillColor = isOut ? '#fef2f2' : '#fffbeb';

  return (
    <svg width="38" height="38" viewBox="0 0 38 38" style={{ flexShrink: 0 }}>
      <circle cx="19" cy="19" r="14" stroke={trackColor} strokeWidth="3" fill={fillColor} />
      <circle
        cx="19"
        cy="19"
        r="14"
        stroke={strokeColor}
        strokeWidth="3"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={dashoffset}
        strokeLinecap="round"
        transform="rotate(-90 19 19)"
      />
      <text
        x="19"
        y="22.5"
        textAnchor="middle"
        fontSize="10"
        fontWeight="800"
        fill={textColor}
        fontFamily="inherit"
      >
        {percentage}%
      </text>
    </svg>
  );
};

export const StockTable: React.FC<StockTableProps> = ({ items, onEditItem }) => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ minWidth: 260 }}>MAHSULOT VA ZAXIRA HOLATI</th>
              <th>Kategoriya</th>
              <th>Ombordagi qoldiq</th>
              <th>Oxirgi harakat (Log)</th>
              <th style={{ textAlign: 'center', width: 90 }}>Tahrirlash</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Mahsulotlar mavjud emas.
                </td>
              </tr>
            ) : (
              items.map((item) => {
                const isLow = item.status === 'low';
                const isOut = item.status === 'out_of_stock';
                const rowBg = isOut ? '#fff5f5' : isLow ? '#fffdf5' : undefined;

                return (
                  <tr key={item.id} style={{ backgroundColor: rowBg }}>
                    {/* Mahsulot va zaxira holati (Image style) */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <StockIndicator item={item} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13.5 }}>
                            {item.name}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              marginTop: 3,
                              fontSize: 11.5,
                              color: 'var(--text-secondary)',
                            }}
                          >
                            <span>
                              Min: {item.minThreshold} {item.unit}
                            </span>
                            <span>•</span>
                            {item.status === 'enough' && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: '#dcfce7',
                                  color: '#15803d',
                                  padding: '1px 7px',
                                  borderRadius: 10,
                                  fontWeight: 600,
                                }}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a' }} />
                                Yetarli zaxira
                              </span>
                            )}
                            {item.status === 'low' && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  padding: '1px 7px',
                                  borderRadius: 10,
                                  fontWeight: 600,
                                }}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
                                Kam qolgan
                              </span>
                            )}
                            {item.status === 'out_of_stock' && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: '#fee2e2',
                                  color: '#b91c1c',
                                  padding: '1px 7px',
                                  borderRadius: 10,
                                  fontWeight: 600,
                                }}
                              >
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                                Tugagan
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kategoriya */}
                    <td>
                      <span
                        style={{
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: '#f1f5f9',
                          color: '#334155',
                        }}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Ombordagi qoldiq */}
                    <td>
                      <strong
                        style={{
                          fontSize: 14,
                          color: isOut ? '#ef4444' : isLow ? '#b45309' : 'var(--text-primary)',
                        }}
                      >
                        {item.quantity} {item.unit}
                      </strong>
                    </td>

                    {/* Oxirgi harakat (Log) - dinamik vaqt minutigacha */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {item.lastActionType === 'created' ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#0d9488',
                            }}
                          >
                            ➕ Qo‘shildi
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#2563eb',
                            }}
                          >
                            ✏️ Tahrirlandi
                          </span>
                        )}
                        <span style={{ fontSize: 11.5, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {item.lastActionAt}
                        </span>
                      </div>
                    </td>

                    {/* Tahrirlash (Qalamcha icon) */}
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{
                          padding: '6px 8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 'var(--radius-md)',
                        }}
                        title="Mahsulotni tahrirlash"
                        onClick={() => onEditItem(item)}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
