import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { AttendanceRecord, HealthStatus } from '../types';
import { attendanceApi } from '../api';
import { warehouseApi } from '@/features/warehouse/api';
import { AttendanceSummaryStrip } from '../components/AttendanceSummaryStrip';
import { AttendanceTable } from '../components/AttendanceTable';
import { Button } from '@/shared/ui/Button';

export const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('Kichkintoylar guruhi');
  const [attendanceDate, setAttendanceDate] = useState('2026-11-23');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    attendanceApi.getAttendanceRecords().then((res) => {
      setRecords(res);
      setIsLoading(false);
    });
  }, []);

  const summary = useMemo(() => {
    const total = records.length;
    const present = records.filter((r) => r.isPresent).length;
    const absent = total - present;
    const healthChecked = records.filter((r) => r.temperature > 0).length;
    return { total, present, absent, healthChecked };
  }, [records]);

  const handleTogglePresence = (id: string, isPresent: boolean) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isPresent } : r))
    );
  };

  const handleUpdateTemperature = (id: string, temp: number) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, temperature: temp } : r))
    );
  };

  const handleUpdateHealthStatus = (id: string, healthStatus: HealthStatus) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, healthStatus } : r))
    );
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, notes } : r))
    );
  };

  const handleMarkAllPresent = async () => {
    const updated = await attendanceApi.markAllPresent();
    setRecords(updated);
    toast.success('Barcha bolalar "Keldi" deb belgilandi.');
  };

  const handleSaveAttendance = async () => {
    await attendanceApi.saveAttendance();
    const presentCount = records.filter((r) => r.isPresent).length;
    const deducted = await warehouseApi.deductDailyMenuStock(presentCount);

    if (deducted.length > 0) {
      toast.success(
        `"${selectedGroup}" davomati saqlandi! ${presentCount} ta bola uchun kunlik taomnoma mahsulotlari (${deducted.length} xil) ombordan avtomatik ayrildi.`
      );
    } else {
      toast.success(`"${selectedGroup}" bo‘yicha davomat saqlandi!`);
    }
  };

  const handleSendSms = () => {
    toast.info('Kelmagan va harorati yuqori bolalar ota-onalariga SMS taklifnomalar yuborildi.');
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">Davomat ro‘yxati yuklanmoqda...</div>
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
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="Kichkintoylar guruhi">Kichkintoylar guruhi (2-3 yosh)</option>
            <option value="Qaldirg‘och guruhi">Qaldirg‘och guruhi (3-4 yosh)</option>
            <option value="Zukko bolajonlar">Zukko bolajonlar (4-5 yosh)</option>
            <option value="Yulduzcha guruhi">Yulduzcha guruhi (5-6 yosh)</option>
          </select>

          <input
            type="date"
            className="attendance-date-input"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button variant="secondary" size="sm" onClick={handleMarkAllPresent}>
            Barchasi keldi
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendSms}>
            SMS bildirishnoma
          </Button>
          <Button variant="primary" size="sm" onClick={handleSaveAttendance}>
            Davomatni saqlash
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
            <strong>Ertalabki tibbiy nazorat va Ombor integratsiyasi:</strong> Harorati 37.2°C dan yuqori bolalar ota-onaga xabar beriladi. Davomat saqlanganda kelgan bolalar soniga qarab kunlik taomnoma ombordan avtomatik ayriladi.
          </span>
        </div>
        <span className="text-muted" style={{ fontSize: 11.5, fontWeight: 600 }}>
          Mas’ul: Zilola Rahimova
        </span>
      </div>

      {/* Summary Strip */}
      <AttendanceSummaryStrip summary={summary} />

      {/* Attendance Table */}
      <AttendanceTable
        records={records}
        onTogglePresence={handleTogglePresence}
        onUpdateTemperature={handleUpdateTemperature}
        onUpdateHealthStatus={handleUpdateHealthStatus}
        onUpdateNotes={handleUpdateNotes}
      />
    </div>
  );
};

export default AttendancePage;
