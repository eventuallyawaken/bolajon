import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { KindergartenGroup } from '../types';

interface GroupCardProps {
  group: KindergartenGroup;
  canManage?: boolean;
  onEdit: (group: KindergartenGroup) => void;
  onDelete: (group: KindergartenGroup) => void;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  canManage = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const fillPercent = Math.min(100, Math.round((group.currentCount / group.capacity) * 100));

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        borderTop: `4px solid ${group.colorTag || 'var(--brand-primary)'}`,
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {group.name}
          </h3>
          <span
            style={{
              display: 'inline-block',
              marginTop: 4,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--brand-primary)',
              background: 'var(--brand-soft)',
              padding: '2px 8px',
              borderRadius: 12,
            }}
          >
            {group.ageRange} • {group.roomNumber}
          </span>
        </div>

        {/* Action icons: Edit & Delete (Director only) */}
        {canManage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              title="Guruhni tahrirlash"
              onClick={() => onEdit(group)}
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '6px',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#0d9488',
                transition: 'background 0.2s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              type="button"
              title="Guruhni o‘chirish"
              onClick={() => onDelete(group)}
              style={{
                background: '#fef2f2',
                border: 'none',
                borderRadius: '6px',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ef4444',
                transition: 'background 0.2s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Capacity progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
          <span className="text-muted">Bolalar soni:</span>
          <span style={{ fontWeight: 600 }}>
            {group.currentCount} / {group.capacity} bola ({fillPercent}% to‘la)
          </span>
        </div>
        <div
          style={{
            height: 8,
            background: '#e2e8f0',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${fillPercent}%`,
              height: '100%',
              background: fillPercent >= 95 ? '#ef4444' : 'var(--brand-primary)',
              borderRadius: 4,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Teachers */}
      <div
        style={{
          padding: '10px 12px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          fontSize: 12.5,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-muted">Asosiy tarbiyachi:</span>
          <strong style={{ color: 'var(--text-primary)' }}>{group.mainTeacher}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-muted">Yordamchi enaga:</span>
          <span>{group.assistantTeacher}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          style={{ flex: 1 }}
          onClick={() => navigate('/attendance')}
        >
          Davomat
        </button>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ flex: 1 }}
          onClick={() => navigate('/children')}
        >
          Bolalar ro‘yxati
        </button>
      </div>
    </div>
  );
};
