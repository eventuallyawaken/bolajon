import React from 'react';
import type { GroupAttendanceItem } from '../types';
import { Badge } from '@/shared/ui/Badge';
import { Link } from 'react-router-dom';

interface GroupAttendanceWidgetProps {
  groups: GroupAttendanceItem[];
}

export const GroupAttendanceWidget: React.FC<GroupAttendanceWidgetProps> = ({ groups }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">Bugungi davomat (Guruhlar kesimida)</h3>
          <span className="card-subtitle">
            Ertalabki filtrdan o‘tgan bolalar va qatnashuv foizi
          </span>
        </div>
        <Link to="/attendance" className="btn btn-secondary btn-sm">
          Batafsil davomat
        </Link>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Guruh nomi</th>
              <th>Tarbiyachi</th>
              <th>Davomat (Kelgan / Jami)</th>
              <th>Tibbiy filtr</th>
              <th>Foiz</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id}>
                <td>
                  <div className="font-bold text-primary">{group.groupName}</div>
                  <span className="text-muted" style={{ fontSize: 11.5 }}>
                    {group.ageCategory}
                  </span>
                </td>
                <td className="text-secondary">{group.teacherName}</td>
                <td className="tabular-nums font-semibold">
                  <span style={{ color: 'var(--brand-primary)' }}>{group.presentCount}</span>
                  <span className="text-muted"> / {group.totalCount} bola</span>
                </td>
                <td>
                  <span className="tabular-nums text-secondary" style={{ fontSize: 12 }}>
                    {group.healthCheckedCount} tekshirildi
                  </span>
                </td>
                <td>
                  <Badge variant={group.percent >= 90 ? 'success' : 'warning'}>
                    {group.percent}%
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupAttendanceWidget;
