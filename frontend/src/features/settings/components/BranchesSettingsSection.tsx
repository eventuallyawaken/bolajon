import React from 'react';
import type { BranchItem } from '@/features/branches/types';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

interface BranchesSettingsSectionProps {
  branches: BranchItem[];
  onOpenAddModal: () => void;
  onDeleteBranch: (id: string, name: string) => void;
}

export const BranchesSettingsSection: React.FC<BranchesSettingsSectionProps> = ({
  branches,
  onOpenAddModal,
  onDeleteBranch,
}) => {
  return (
    <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            🏢 Bog‘cha filiallari boshqaruvi ({branches.length} ta filial)
          </h3>
          <p style={{ margin: '3px 0 0 0', fontSize: 12.5, color: 'var(--text-secondary)' }}>
            Ushbu bog‘chaga qarashli barcha faol filiallar va ularning hududiy ma’muriyati
          </p>
        </div>

        <Button type="button" variant="primary" size="sm" onClick={onOpenAddModal}>
          + Yangi filial qo‘shish
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
        {branches.map((b) => {
          const fillPercent = Math.min(100, Math.round((b.childrenCount / b.capacity) * 100));
          return (
            <div
              key={b.id}
              style={{
                border: '1.5px solid #e2e8f0',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                background: '#fafafa',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: 14.5, color: 'var(--text-primary)', display: 'block' }}>
                    {b.name}
                  </strong>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginTop: 2 }}>
                    📍 {b.address}
                  </span>
                </div>
                <Badge variant={b.status === 'active' ? 'success' : 'warning'}>
                  {b.status === 'active' ? 'Faol' : 'Ta’mirlashda'}
                </Badge>
              </div>

              <div
                style={{
                  background: '#ffffff',
                  padding: '10px 12px',
                  borderRadius: 6,
                  border: '1px solid #edf2f7',
                  fontSize: 12,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 8,
                }}
              >
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Mudir (Rahbar):</span>
                  <strong>{b.manager}</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Telefon:</span>
                  <span>{b.phone}</span>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Guruhlar:</span>
                  <strong>{b.groupsCount} ta guruh</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Sig‘im:</span>
                  <strong>{b.childrenCount} / {b.capacity} bola ({fillPercent}%)</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  style={{ color: '#ef4444', borderColor: '#fca5a5', padding: '4px 10px', fontSize: 11.5 }}
                  onClick={() => onDeleteBranch(b.id, b.name)}
                >
                  Filialni o‘chirish
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
