import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { StaffMember, CreateStaffInput } from '../types';
import { staffApi } from '../api';
import { StaffTable } from '../components/StaffTable';
import { AddStaffModal } from '../components/AddStaffModal';
import { Button } from '@/shared/ui/Button';

export const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    staffApi.getStaffList().then((res) => {
      setStaffList(res);
      setIsLoading(false);
    });
  }, []);

  const filteredStaff = useMemo(() => {
    return staffList.filter((st) => {
      if (roleFilter !== 'all' && st.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          st.fullName.toLowerCase().includes(q) ||
          st.phone.includes(q) ||
          (st.groupAssigned && st.groupAssigned.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [staffList, roleFilter, searchQuery]);

  const handleCreateStaff = async (input: CreateStaffInput) => {
    const created = await staffApi.createStaff(input);
    setStaffList((prev) => [...prev, created]);
    setIsModalOpen(false);
    toast.success(`"${created.fullName}" jamoaga muvaffaqiyatli qo‘shildi!`);
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!window.confirm(`"${name}"ni ro‘yxatdan o‘chirishni xohlaysizmi?`)) return;
    await staffApi.deleteStaff(id);
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    toast.warn(`"${name}" jamoa tarkibidan chiqarildi.`);
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">Xodimlar ro‘yxati yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Control bar */}
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
                placeholder="Xodim ismi yoki telefoni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <button
                type="button"
                className={`chip ${roleFilter === 'all' ? 'active' : ''}`}
                onClick={() => setRoleFilter('all')}
              >
                Barchasi ({staffList.length})
              </button>
              <button
                type="button"
                className={`chip ${roleFilter === 'Tarbiyachi' ? 'active' : ''}`}
                onClick={() => setRoleFilter('Tarbiyachi')}
              >
                Tarbiyachilar
              </button>
              <button
                type="button"
                className={`chip ${roleFilter === 'Hamshira' ? 'active' : ''}`}
                onClick={() => setRoleFilter('Hamshira')}
              >
                Hamshira
              </button>
              <button
                type="button"
                className={`chip ${roleFilter === 'Bosh oshpaz' ? 'active' : ''}`}
                onClick={() => setRoleFilter('Bosh oshpaz')}
              >
                Oshxona
              </button>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            + Yangi xodim qo‘shish
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <StaffTable staffList={filteredStaff} onDeleteStaff={handleDeleteStaff} />

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateStaff}
      />
    </div>
  );
};

export default StaffPage;
