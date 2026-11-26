import React from 'react';
import type { StaffMember } from '../types';
import { Badge } from '@/shared/ui/Badge';

interface StaffTableProps {
  staffList: StaffMember[];
  onDeleteStaff: (id: string, name: string) => void;
}

export const StaffTable: React.FC<StaffTableProps> = ({ staffList, onDeleteStaff }) => {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Xodim</th>
              <th>Lavozimi</th>
              <th>Telefon raqami</th>
              <th>Biriktirilgan guruh</th>
              <th>Oylik maoshi</th>
              <th>Holat</th>
              <th>Ishga kirgan</th>
              <th style={{ textAlign: 'right' }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Xodimlar topilmadi.
                </td>
              </tr>
            ) : (
              staffList.map((st) => (
                <tr key={st.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: 'var(--brand-soft)',
                          color: 'var(--brand-primary)',
                          fontWeight: 700,
                          fontSize: 12,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {st.fullName.slice(0, 2).toUpperCase()}
                      </div>
                      <strong style={{ color: 'var(--text-primary)' }}>{st.fullName}</strong>
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: '#e0e7ff',
                        color: '#4338ca',
                        fontWeight: 600,
                      }}
                    >
                      {st.role}
                    </span>
                  </td>
                  <td style={{ fontSize: 13 }}>{st.phone}</td>
                  <td>{st.groupAssigned || '-'}</td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {st.salary.toLocaleString()} so‘m
                    </strong>
                  </td>
                  <td>
                    {st.status === 'active' ? (
                      <Badge variant="success">Faol</Badge>
                    ) : (
                      <Badge variant="warning">Mehnat ta’tili</Badge>
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{st.hiredDate}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                      onClick={() => onDeleteStaff(st.id, st.fullName)}
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
