import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { useT } from '@/shared/i18n';
import { parentApi } from '../api';
import type { ParentAttendanceDayRecord, ParentAttendanceHistory } from '../types';
import { useParentPortal } from '../context/ParentPortalContext';

export const ParentAttendancePage: React.FC = () => {
  const { t } = useT();
  const { activeChild } = useParentPortal();
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [history, setHistory] = useState<ParentAttendanceHistory | null>(null);
  const [selectedDay, setSelectedDay] = useState<ParentAttendanceDayRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!activeChild?.id) return;
    setIsLoading(true);
    setSelectedDay(null);
    parentApi
      .getChildAttendanceHistory(activeChild.id, month)
      .then((res) => {
        setHistory(res);
        if (res.records.length > 0) {
          setSelectedDay(res.records[res.records.length - 1]);
        }
      })
      .finally(() => setIsLoading(false));
  }, [activeChild?.id, month]);

  const calendarCells = useMemo(() => {
    const [yearStr, monStr] = month.split('-');
    const year = Number(yearStr);
    const mon = Number(monStr);
    if (!year || !mon) return [];

    const firstDay = new Date(year, mon - 1, 1);
    const daysInMonth = new Date(year, mon, 0).getDate();
    // Monday = 0, Sunday = 6
    const startOffset = (firstDay.getDay() + 6) % 7;

    const recordMap = new Map<string, ParentAttendanceDayRecord>();
    for (const r of history?.records || []) {
      recordMap.set(r.date, r);
    }

    const cells: Array<{
      key: string;
      dayNum: number | null;
      isSunday: boolean;
      record?: ParentAttendanceDayRecord;
    }> = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push({ key: `pad-${i}`, dayNum: null, isSunday: false });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${yearStr}-${monStr}-${String(d).padStart(2, '0')}`;
      const dow = new Date(year, mon - 1, d).getDay();
      cells.push({
        key: dateStr,
        dayNum: d,
        isSunday: dow === 0,
        record: recordMap.get(dateStr),
      });
    }

    return cells;
  }, [month, history]);

  if (!activeChild) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p className="text-muted" style={{ margin: 0 }}>{t('parent.noChildrenDesc')}</p>
      </div>
    );
  }

  const summary = history?.summary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">{t('parent.calendarTitle')}</h3>
            <span className="card-subtitle">
              {activeChild.fullName} &bull; {t('parent.selectDayHint')}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {summary && (
              <div style={{ display: 'flex', gap: 8 }}>
                <Badge variant="success">{t('parent.present')}: {summary.presentDays}</Badge>
                <Badge variant="warning">{t('parent.late')}: {summary.lateDays}</Badge>
                <Badge variant="danger">{t('parent.absent')}: {summary.absentDays}</Badge>
              </div>
            )}
            <input
              type="month"
              className="attendance-date-input"
              value={month}
              onChange={(e) => {
                if (e.target.value) setMonth(e.target.value);
              }}
            />
          </div>
        </div>

        <div className="profile-tab-body">
          {isLoading ? (
            <div className="text-muted">{t('common.loading')}</div>
          ) : (
            <>
              <div className="att-calendar-grid">
                {calendarCells.map((cell) => {
                  if (cell.dayNum === null) {
                    return <div key={cell.key} />;
                  }

                  let statusClass = '';
                  let statusLabel = cell.isSunday ? '—' : '·';
                  if (cell.record) {
                    if (cell.record.status === 'LATE') {
                      statusClass = 'late';
                      statusLabel = `${cell.record.temperature.toFixed(1)}°`;
                    } else if (cell.record.isPresent) {
                      statusClass = 'present';
                      statusLabel = `${cell.record.temperature.toFixed(1)}°`;
                    } else {
                      statusClass = 'absent';
                      statusLabel = '×';
                    }
                  } else if (cell.isSunday) {
                    statusClass = 'weekend';
                  }

                  const isSelected = selectedDay?.id && selectedDay?.id === cell.record?.id;

                  return (
                    <button
                      key={cell.key}
                      type="button"
                      disabled={!cell.record}
                      onClick={() => cell.record && setSelectedDay(cell.record)}
                      className={`att-cal-day ${statusClass}`}
                      style={{
                        cursor: cell.record ? 'pointer' : 'default',
                        outline: isSelected ? '2px solid var(--brand-primary)' : 'none',
                      }}
                    >
                      <span className="att-cal-num">{cell.dayNum}</span>
                      <span className="att-cal-status">{statusLabel}</span>
                    </button>
                  );
                })}
              </div>

              {selectedDay && (
                <div
                  className="card"
                  style={{
                    marginTop: 20,
                    padding: 16,
                    background: 'var(--bg-canvas)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <strong>{t('parent.dayDetails')}: {selectedDay.date}</strong>
                    <Badge
                      variant={
                        selectedDay.status === 'LATE'
                          ? 'warning'
                          : selectedDay.isPresent
                            ? 'success'
                            : 'danger'
                      }
                    >
                      {selectedDay.status === 'LATE'
                        ? t('parent.late')
                        : selectedDay.isPresent
                          ? t('parent.present')
                          : t('parent.absent')}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
                    <span>
                      <strong>{t('parent.temperature')}:</strong> {selectedDay.temperature.toFixed(1)}°C
                    </span>
                    <span>
                      <strong>{t('parent.healthStatus')}:</strong>{' '}
                      {selectedDay.healthStatus === 'healthy' ? t('parent.healthy') : selectedDay.healthStatus}
                    </span>
                    {selectedDay.checkedBy && (
                      <span>
                        <strong>{t('parent.checkedBy')}:</strong> {selectedDay.checkedBy}
                      </span>
                    )}
                    {selectedDay.notes && (
                      <span>
                        <strong>Izoh:</strong> {selectedDay.notes}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Medical card & vaccination records */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('parent.medicalCard')}</h3>
        </div>
        <div className="profile-tab-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {activeChild.allergies.length > 0 && (
            <div className="alert-box alert-box-danger">
              <strong>{t('parent.allergyAlert')}</strong> {activeChild.allergies.join(', ')}
            </div>
          )}

          {activeChild.medicalNotes && (
            <div className="alert-box alert-box-info">
              <span>{activeChild.medicalNotes}</span>
            </div>
          )}

          {activeChild.medicalRecords && activeChild.medicalRecords.length > 0 ? (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('sa.invoices.colDate')}</th>
                    <th>Turi</th>
                    <th>Tavsifi</th>
                    <th>{t('parent.checkedBy')}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeChild.medicalRecords.map((rec) => (
                    <tr key={rec.id}>
                      <td className="tabular-nums">{rec.checkedAt}</td>
                      <td>
                        <Badge variant="default">{rec.recordType}</Badge>
                      </td>
                      <td>{rec.description}</td>
                      <td className="text-secondary">{rec.recordedByRole}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted" style={{ margin: 0 }}>
              {t('parent.noMedicalRecords')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentAttendancePage;
