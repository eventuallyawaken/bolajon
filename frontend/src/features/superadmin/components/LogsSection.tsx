import React from 'react';
import type { SystemLog } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { Badge } from '@/shared/ui/Badge';

interface LogsSectionProps {
  logs: SystemLog[];
}

export const LogsSection: React.FC<LogsSectionProps> = ({ logs }) => {
  const columns: Column<SystemLog>[] = [
    {
      header: 'Vaqt',
      render: (log) => (
        <span className="tabular-nums font-mono text-muted" style={{ fontSize: 12 }}>
          {log.timestamp}
        </span>
      ),
    },
    {
      header: 'Daraja',
      render: (log) => {
        if (log.level === 'error') {
          return <span className="log-level error">&bull; XATOLIK</span>;
        }
        if (log.level === 'warn') {
          return <span className="log-level warn">&bull; DIQQAT</span>;
        }
        return <span className="log-level info">&bull; INFO</span>;
      },
    },
    {
      header: 'Kategoriya',
      render: (log) => (
        <Badge variant="default" style={{ textTransform: 'capitalize', fontSize: 11 }}>
          {log.category}
        </Badge>
      ),
    },
    {
      header: 'Mas’ul aktor',
      render: (log) => <span className="font-semibold text-primary">{log.actor}</span>,
    },
    {
      header: 'Hodisa tavsifi',
      render: (log) => <span>{log.message}</span>,
    },
    {
      header: 'IP manzil',
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
          <h3 className="card-title">Tizim loglari va monitoring</h3>
          <span className="card-subtitle">
            Platformadagi barcha xavfsizlik, obuna va ma’muriy amallar jurnali
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(item) => item.id}
        emptyMessage="Tizim loglari topilmadi"
      />
    </div>
  );
};

export default LogsSection;
