import React from 'react';
import type { GroupAttendanceItem } from '../types';
import { Badge } from '@/shared/ui/Badge';
import { Link } from 'react-router-dom';
import { useT } from '@/shared/i18n';

interface GroupAttendanceWidgetProps {
  groups: GroupAttendanceItem[];
  showDetailButton?: boolean;
}

export const GroupAttendanceWidget: React.FC<GroupAttendanceWidgetProps> = ({
  groups,
  showDetailButton = true,
}) => {
  const { t } = useT();
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{t('dash.groupAttendanceTitle')}</h3>
          <span className="card-subtitle">
            {t('dash.groupAttendanceSub')}
          </span>
        </div>
        {showDetailButton && (
          <Link to="/attendance" className="btn btn-secondary btn-sm">
            {t('dash.detailedAttendance')}
          </Link>
        )}
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('dash.colGroup')}</th>
              <th>{t('dash.colTeacher')}</th>
              <th>{t('dash.colAttendanceRatio')}</th>
              <th>{t('dash.colHealth')}</th>
              <th>{t('dash.colPercent')}</th>
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
                  <span className="text-muted"> / {group.totalCount} {t('dash.childrenCountShort')}</span>
                </td>
                <td>
                  <span className="tabular-nums text-secondary" style={{ fontSize: 12 }}>
                    {t('dash.checkedCount', { count: group.healthCheckedCount })}
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
