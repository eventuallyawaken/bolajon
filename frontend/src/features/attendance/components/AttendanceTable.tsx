import React from 'react';
import type { AttendanceRecord, HealthStatus } from '../types';
import { AttendanceToggle } from './AttendanceToggle';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  onTogglePresence: (id: string, isPresent: boolean) => void;
  onUpdateTemperature: (id: string, temp: number) => void;
  onUpdateHealthStatus: (id: string, status: HealthStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  records,
  onTogglePresence,
  onUpdateTemperature,
  onUpdateHealthStatus,
  onUpdateNotes,
}) => {
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 48, textAlign: 'center' }}>№</th>
              <th>Tarbiyalanuvchi</th>
              <th>Davomat (Keldi / Kelmadi)</th>
              <th>Ertalabki harorat (°C)</th>
              <th>Salomatlik holati</th>
              <th>Kunlik izoh</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => (
              <tr key={r.id}>
                <td style={{ textAlign: 'center' }} className="tabular-nums text-muted">
                  {idx + 1}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--brand-soft)',
                        color: 'var(--brand-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {r.initials}
                    </div>
                    <div>
                      <div className="font-bold text-primary">{r.childName}</div>
                      <span className="text-muted" style={{ fontSize: 11.5 }}>
                        {r.groupName}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Davomat toggle switch (Rasm 2 dagi galochkali etalon switch) */}
                <td>
                  <div className="att-switch-cell">
                    <AttendanceToggle
                      checked={r.isPresent}
                      onChange={(checked) => onTogglePresence(r.id, checked)}
                      title={r.isPresent ? 'Keldi' : 'Kelmadi'}
                    />
                    <span
                      className={`att-status-badge ${r.isPresent ? 'present' : 'absent'}`}
                    >
                      {r.isPresent ? 'Keldi' : 'Kelmadi'}
                    </span>
                  </div>
                </td>

                {/* Harorat */}
                <td>
                  <div className="med-filter-cell">
                    <input
                      type="number"
                      step="0.1"
                      min="35"
                      max="41"
                      className={`med-temp-input ${r.temperature > 37.2 ? 'fever' : ''}`}
                      value={r.temperature}
                      onChange={(e) => onUpdateTemperature(r.id, parseFloat(e.target.value) || 36.6)}
                      title={r.temperature > 37.2 ? 'Yuqori harorat (isitma)' : 'Normal harorat'}
                    />
                    <span className="text-muted" style={{ fontSize: 12 }}>°C</span>
                  </div>
                </td>

                {/* Salomatlik holati */}
                <td>
                  <select
                    className="med-status-select"
                    value={r.healthStatus}
                    onChange={(e) => onUpdateHealthStatus(r.id, e.target.value as HealthStatus)}
                    style={{
                      borderColor: r.healthStatus === 'fever' ? '#fca5a5' : r.healthStatus === 'cold' ? '#fed7aa' : 'var(--border-light)',
                      background: r.healthStatus === 'fever' ? '#fef2f2' : r.healthStatus === 'cold' ? '#fffbeb' : 'var(--bg-surface)',
                    }}
                  >
                    <option value="healthy">Sog‘lom</option>
                    <option value="cold">Shamollash alomati</option>
                    <option value="flu">Shamollash / Gripp</option>
                    <option value="fever">Isitmasi bor</option>
                    <option value="quarantine">Karantin / Izolyatsiya</option>
                    <option value="complaint">Boshqa shikoyat</option>
                  </select>
                </td>

                {/* Izoh */}
                <td className="att-note-cell">
                  <input
                    type="text"
                    className="att-note-input"
                    placeholder="Izoh yozing..."
                    value={r.notes}
                    onChange={(e) => onUpdateNotes(r.id, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable;
