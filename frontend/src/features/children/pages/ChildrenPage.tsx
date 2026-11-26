import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { Child, CreateChildInput } from '../types';
import { childrenApi } from '../api';
import { ChildrenTable } from '../components/ChildrenTable';
import { AddChildModal } from '../components/AddChildModal';
import { Button } from '@/shared/ui/Button';

export const ChildrenPage: React.FC = () => {
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    childrenApi.getChildren().then((res) => {
      setChildrenList(res);
      setIsLoading(false);
    });
  }, []);

  const filteredChildren = useMemo(() => {
    return childrenList.filter((c) => {
      if (groupFilter !== 'all' && c.groupName !== groupFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.parentName.toLowerCase().includes(q) ||
          c.parentPhone.includes(q)
        );
      }
      return true;
    });
  }, [childrenList, groupFilter, searchQuery]);

  const handleCreateChild = async (input: CreateChildInput) => {
    const created = await childrenApi.createChild(input);
    setChildrenList((prev) => [created, ...prev]);
    setIsModalOpen(false);
    toast.success(`"${created.fullName}" bog‘chaga muvaffaqiyatli qabul qilindi!`);
  };

  const handleDeleteChild = async (id: string, name: string) => {
    if (!window.confirm(`"${name}"ni ro‘yxatdan o‘chirishni tasdiqlaysizmi?`)) return;
    await childrenApi.deleteChild(id);
    setChildrenList((prev) => prev.filter((c) => c.id !== id));
    toast.warn(`"${name}" ro‘yxatdan chiqarildi.`);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">Bolalar ro‘yxati yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header controls */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 280, flexWrap: 'wrap' }}>
            <div className="search-box" style={{ width: 280 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="search"
                placeholder="Bola yoki ota-ona ismini qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <button
                type="button"
                className={`chip ${groupFilter === 'all' ? 'active' : ''}`}
                onClick={() => setGroupFilter('all')}
              >
                Barchasi ({childrenList.length})
              </button>
              <button
                type="button"
                className={`chip ${groupFilter === 'Kichkintoylar guruhi' ? 'active' : ''}`}
                onClick={() => setGroupFilter('Kichkintoylar guruhi')}
              >
                Kichkintoylar
              </button>
              <button
                type="button"
                className={`chip ${groupFilter === 'Qaldirg‘och guruhi' ? 'active' : ''}`}
                onClick={() => setGroupFilter('Qaldirg‘och guruhi')}
              >
                Qaldirg‘och
              </button>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            + Yangi bola qabuli
          </Button>
        </div>
      </div>

      {/* Children Table */}
      <ChildrenTable childrenList={filteredChildren} onDeleteChild={handleDeleteChild} />

      {/* Add Child Modal */}
      <AddChildModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateChild}
      />
    </div>
  );
};

export default ChildrenPage;
