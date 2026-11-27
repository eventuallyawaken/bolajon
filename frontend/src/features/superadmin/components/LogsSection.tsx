import React from 'react';
import type { SystemLog } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { Badge } from '@/shared/ui/Badge';
import { useT } from '@/shared/i18n';

interface LogsSectionProps {
  logs: SystemLog[];
}

export const LogsSection: React.FC<LogsSectionProps> = ({ logs }) => {
  const { t } = useT();
  const columns: Column<SystemLog>[] = [
    {
      header: t('sa.logs.colTime'),
      render: (log) => (
        <span className="tabular-nums font-mono text-muted" style={{ fontSize: 12 }}>
          {log.timestamp}
        </span>
      ),
    },
    {
      header: t('sa.logs.colLevel'),
      render: (log) => {
        if (log.level === 'error') {
          return <span className="log-level error">&bull; ERROR</span>;
        }
        if (log.level === 'warn') {
          return <span className="log-level warn">&bull; WARN</span>;
        }
        return <span className="log-level info">&bull; INFO</span>;
      },
    },
    {
      header: t('sa.logs.colCategory'),
      render: (log) => (
        <Badge variant="default" style={{ textTransform: 'capitalize', fontSize: 11 }}>
          {log.category}
        </Badge>
      ),
    },
    {
      header: t('sa.logs.colActor'),
      render: (log) => <span className="font-semibold text-primary">{log.actor}</span>,
    },
    {
      header: t('sa.logs.colMessage'),
      render: (log) => <span>{log.message}</span>,
    },
    {
      header: t('sa.logs.colIp'),
      render: (log) => (
        <span className="tabular-nums font-mono text-muted" style={{ fontSize: 11.5 }}>
          {log.ip}
        </span>
      ),
    },
  ];

  return (
    <div className="card" id="logs">
      <div className="card-header">
        <div>
          <h3 className="card-title">{t('sa.logs.title')}</h3>
          <span className="card-subtitle">
            {t('sa.logs.subtitle')}
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(item) => item.id}
        emptyMessage={t('sa.logs.empty')}
      />
    </div>
  );
};

export default LogsSection;
