import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import type { AttendanceRecord, HealthStatus } from '../types';
import { attendanceApi } from '../api';
import { groupsApi } from '@/features/groups/api';
import type { KindergartenGroup } from '@/features/groups/types';
import { AttendanceSummaryStrip } from '../components/AttendanceSummaryStrip';
import { AttendanceTable } from '../components/AttendanceTable';
import { Button } from '@/shared/ui/Button';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { useT } from '@/shared/i18n';

export const AttendancePage: React.FC = () => {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const [groups, setGroups] = useState<KindergartenGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isLoading, setIsLoading] = useState(true);
  const [isRecordsLoading, setIsRecordsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let active = true;
    groupsApi
      .getGroups()
      .then((list) => {
        if (!active) return;
        setGroups(list);
        setSelectedGroupId((prev) =>
          prev && list.some((g) => g.id === prev) ? prev : list[0]?.id || ''
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadAttendance = useCallback(async (groupId: string, date: string) => {
    if (!groupId) {
      setRecords([]);
      return;
    }
    setIsRecordsLoading(true);
    try {
      const list = await attendanceApi.getAttendanceRecords(groupId, date);
      setRecords(list);
    } catch {
      toast.error('Davomat ma’lumotlarini yuklashda xatolik yuz berdi');
      setRecords([]);
    } finally {
      setIsRecordsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      void loadAttendance(selectedGroupId, attendanceDate);
    }
  }, [selectedGroupId, attendanceDate, loadAttendance]);

  const selectedGroupObj = useMemo(
    () => groups.find((g) => g.id === selectedGroupId),
    [groups, selectedGroupId]
  );

  const summary = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.isPresent).length;
    const absent = total - present;
    const healthChecked = records.filter((r) => r.temperature > 0).length;
    return { total, present, absent, healthChecked };
  }, [records]);

  const handleTogglePresence = (id: string, isPresent: boolean) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, isPresent } : r)));
  };

  const handleUpdateTemperature = (id: string, temp: number) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, temperature: temp } : r)));
  };

  const handleUpdateHealthStatus = (id: string, healthStatus: HealthStatus) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, healthStatus } : r)));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, notes } : r)));
  };

  const handleMarkAllPresent = async () => {
    if (!selectedGroupId) return;
    try {
      const updated = await attendanceApi.markAllPresent(selectedGroupId, attendanceDate);
      setRecords(updated);
      toast.success('Barcha bolalar "Keldi" deb belgilandi.');
    } catch {
      toast.error('Barchasini belgilashda xatolik yuz berdi');
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedGroupId) return;
    try {
      setIsSaving(true);
      const res = await attendanceApi.saveAttendance(selectedGroupId, attendanceDate, records);
      toast.success(
        res.message ||
          `"${selectedGroupObj?.name || 'Guruh'}" bo‘yicha davomat saqlandi (${res.presentCount} ta bola)!`
      );
      await loadAttendance(selectedGroupId, attendanceDate);
    } catch {
      toast.error('Davomatni saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendSms = async () => {
    if (!selectedGroupId) return;
    try {
      const res = await attendanceApi.sendSmsAlerts(selectedGroupId, attendanceDate);
      if (res.sentCount > 0) {
        toast.success(res.message);
      } else {
        toast.info(res.message);
      }
    } catch {
      toast.error('Ota-onalarga bildirishnoma yuborishda xatolik yuz berdi');
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">{t('attendance.loading')}</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <p className="text-muted" style={{ margin: 0 }}>
          {t('attendance.noGroups')}
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Controls header */}
      <div className="attendance-controls">
        <div className="attendance-filters">
          <select
            className="branch-select"
            style={{ width: 'auto', minWidth: 220 }}
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.ageRange})
              </option>
            ))}
          </select>

          <input
            type="date"
            className="attendance-date-input"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllPresent}
            disabled={records.length === 0}
          >
            {t('attendance.markAll')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendSms}
            disabled={records.length === 0}
          >
            {t('attendance.sendSms')}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSaveAttendance}
            disabled={isSaving || records.length === 0}
          >
            {isSaving ? t('common.loading') : t('attendance.save')}
          </Button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="att-notice-banner">
        <div className="att-notice-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>
            <strong>Ertalabki tibbiy nazorat va Ombor integratsiyasi:</strong> Harorati 37.2°C dan yuqori bolalar ota-onaga va hamshiraga xabar qilinadi. Davomat saqlanganda kelgan bolalar soniga qarab kunlik taomnoma ombordan avtomatik ayriladi.
          </span>
        </div>
        <span className="text-muted" style={{ fontSize: 11.5, fontWeight: 600 }}>
          {user?.fullName || t('role.teacher')}
        </span>
      </div>

      {/* Summary Strip */}
      <AttendanceSummaryStrip summary={summary} />

      {/* Attendance Table */}
      {isRecordsLoading ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="text-muted">{t('attendance.loading')}</div>
        </div>
      ) : records.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div className="text-muted">Ushbu guruhda hozircha tarbiyalanuvchilar yo‘q.</div>
        </div>
      ) : (
        <AttendanceTable
          records={records}
          onTogglePresence={handleTogglePresence}
          onUpdateTemperature={handleUpdateTemperature}
          onUpdateHealthStatus={handleUpdateHealthStatus}
          onUpdateNotes={handleUpdateNotes}
        />
      )}
    </div>
  );
};

export default AttendancePage;
