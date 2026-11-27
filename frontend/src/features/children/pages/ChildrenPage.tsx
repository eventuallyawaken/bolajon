import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import type { Child, CreateChildInput } from '../types';
import { childrenApi } from '../api';
import { groupsApi } from '@/features/groups/api';
import type { KindergartenGroup } from '@/features/groups/types';
import { ChildrenTable } from '../components/ChildrenTable';
import { AddChildModal } from '../components/AddChildModal';
import { Button } from '@/shared/ui/Button';
import { useAuthStore, normalizeRole } from '@/shared/store/useAuthStore';
import { useT } from '@/shared/i18n';

export const ChildrenPage: React.FC = () => {
  const { t } = useT();
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user?.role);
  const canAdmit = role === 'director' || role === 'teacher';
  const canDelete = role === 'director';

  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [groups, setGroups] = useState<KindergartenGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([childrenApi.getChildren(), groupsApi.getGroups()])
      .then(([cList, gList]) => {
        setChildrenList(cList);
        setGroups(gList);
      })
      .finally(() => setIsLoading(false));
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

  const groupChipNames = useMemo(() => {
    const set = new Set<string>();
    groups.forEach((g) => {
      if (g.name) set.add(g.name);
    });
    childrenList.forEach((c) => {
      if (c.groupName && c.groupName !== 'Guruhsiz') set.add(c.groupName);
    });
    return Array.from(set);
  }, [groups, childrenList]);

  const handleCreateChild = async (input: CreateChildInput) => {
    try {
      const created = await childrenApi.createChild(input);
      setChildrenList((prev) => [created, ...prev]);
      setIsModalOpen(false);
      toast.success(`"${created.fullName}" bog‘chaga muvaffaqiyatli qabul qilindi!`);
    } catch {
      toast.error('Bolani qabul qilishda xatolik yuz berdi');
    }
  };

  const handleDeleteChild = async (id: string, name: string) => {
    if (!window.confirm(`"${name}"ni ro‘yxatdan o‘chirishni tasdiqlaysizmi?`)) return;
    try {
      await childrenApi.deleteChild(id);
      setChildrenList((prev) => prev.filter((c) => c.id !== id));
      toast.warn(`"${name}" ro‘yxatdan chiqarildi.`);
    } catch {
      toast.error('Bolani o‘chirishda xatolik yuz berdi');
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">{t('children.loading')}</div>
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
                placeholder={t('children.search')}
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
                {t('common.all')} ({childrenList.length})
              </button>
              {groupChipNames.map((gName) => (
                <button
                  key={gName}
                  type="button"
                  className={`chip ${groupFilter === gName ? 'active' : ''}`}
                  onClick={() => setGroupFilter(gName)}
                >
                  {gName}
                </button>
              ))}
            </div>
          </div>

          {canAdmit && (
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              {t('children.admit')}
            </Button>
          )}
        </div>
      </div>

      {/* Children Table */}
      <ChildrenTable
        childrenList={filteredChildren}
        canDelete={canDelete}
        onDeleteChild={handleDeleteChild}
      />

      {/* Add Child Modal */}
      {canAdmit && (
        <AddChildModal
          isOpen={isModalOpen}
          groups={groups}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateChild}
        />
      )}
    </div>
  );
};

export default ChildrenPage;
