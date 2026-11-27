import React from 'react';
import type { Child } from '../types';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

interface ChildrenTableProps {
  childrenList: Child[];
  canDelete?: boolean;
  onDeleteChild: (id: string, name: string) => void;
}

export const ChildrenTable: React.FC<ChildrenTableProps> = ({
  childrenList,
  canDelete = false,
  onDeleteChild,
}) => {
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tarbiyalanuvchi</th>
              <th>Guruh</th>
              <th>Tug‘ilgan sana</th>
              <th>Ota-onasi va telefon</th>
              <th>Oylik to‘lov</th>
              <th>Holati</th>
              {canDelete && <th style={{ textAlign: 'right' }}>Amallar</th>}
            </tr>
          </thead>
          <tbody>
            {childrenList.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--radius-full)',
                        background: c.gender === 'male' ? 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)' : 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {c.initials}
                    </div>
                    <div>
                      <div className="font-bold text-primary">{c.fullName}</div>
                      <span className="text-muted" style={{ fontSize: 11.5 }}>
                        Qabul: {c.registeredDate}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="font-medium text-secondary">{c.groupName}</td>
                <td className="tabular-nums text-secondary">{c.birthDate}</td>
                <td>
                  <div className="text-primary font-medium">{c.parentName}</div>
                  <span className="tabular-nums text-muted" style={{ fontSize: 11.5 }}>
                    {c.parentPhone}
                  </span>
                </td>
                <td>
                  <div className="tabular-nums font-semibold">{c.monthlyFee}</div>
                  {c.debtAmount && (
                    <span style={{ color: 'var(--danger-text)', fontSize: 11, fontWeight: 700 }}>
                      Qarz: {c.debtAmount}
                    </span>
                  )}
                </td>
                <td>
                  {c.status === 'active' && <Badge variant="success">Faol</Badge>}
                  {c.status === 'vacation' && <Badge variant="warning">Ta’tilda</Badge>}
                  {c.status === 'left' && <Badge variant="danger">Chiqib ketgan</Badge>}
                </td>
                {canDelete && (
                  <td style={{ textAlign: 'right' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteChild(c.id, c.fullName)}
                      title="O‘chirish"
                      style={{ color: 'var(--danger-text)', padding: '5px 8px' }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 13, height: 13 }}>
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChildrenTable;
