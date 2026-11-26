import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { BranchItem, CreateBranchInput } from '../types';
import { branchesApi } from '../api';
import { CreateBranchModal } from '../components/CreateBranchModal';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';

export const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    branchesApi.getBranches().then((res) => {
      setBranches(res);
      setIsLoading(false);
    });
    return branchesApi.subscribe(() => {
      branchesApi.getBranches().then(setBranches);
    });
  }, []);

  const handleCreateBranch = async (input: CreateBranchInput) => {
    const created = await branchesApi.createBranch(input);
    setBranches((prev) => [...prev, created]);
    setIsModalOpen(false);
    toast.success(`"${created.name}" filiali muvaffaqiyatli qo‘shildi!`);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">Filiallar yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Bog‘cha tarmoq filiallari
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Jami {branches.length} ta faol filial | Ushbu bog‘cha tarmog‘iga qarashli barcha filiallar
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            + Yangi filial qo‘shish
          </Button>
        </div>
      </div>

      {/* Branches List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {branches.map((b) => {
          const fillPercent = Math.round((b.childrenCount / b.capacity) * 100);
          return (
            <div key={b.id} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {b.name}
                  </h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    📍 {b.address}
                  </p>
                </div>
                <Badge variant={b.status === 'active' ? 'success' : 'warning'}>
                  {b.status === 'active' ? 'Faol' : 'Ta’mirlashda'}
                </Badge>
              </div>

              <div
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 10,
                  fontSize: 12.5,
                }}
              >
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Direktor</span>
                  <strong>{b.manager}</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Aloqa</span>
                  <span>{b.phone}</span>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Guruhlar</span>
                  <strong>{b.groupsCount} ta guruh</strong>
                </div>
                <div>
                  <span className="text-muted" style={{ display: 'block', fontSize: 11 }}>Sig‘im bandligi</span>
                  <strong style={{ color: 'var(--brand-primary)' }}>{fillPercent}%</strong>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span className="text-muted">Bolalar qamrovi:</span>
                  <span style={{ fontWeight: 600 }}>{b.childrenCount} / {b.capacity} bola</span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${fillPercent}%`,
                      height: '100%',
                      background: 'var(--brand-primary)',
                      borderRadius: 4,
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => toast.success(`"${b.name}" boshqaruviga o‘tildi!`)}
                >
                  Filialga kirish
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <CreateBranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateBranch}
      />
    </div>
  );
};

export default BranchesPage;
