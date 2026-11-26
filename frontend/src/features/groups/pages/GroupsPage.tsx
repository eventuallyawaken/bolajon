import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { KindergartenGroup, CreateGroupInput } from '../types';
import { groupsApi } from '../api';
import { AddGroupModal } from '../components/AddGroupModal';
import { EditGroupModal } from '../components/EditGroupModal';
import { GroupCard } from '../components/GroupCard';
import { Button } from '@/shared/ui/Button';

export const GroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<KindergartenGroup[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<KindergartenGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGroups = () => {
    groupsApi.getGroups().then((res) => {
      setGroups(res);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (input: CreateGroupInput) => {
    try {
      const newGroup = await groupsApi.createGroup(input);
      setGroups((prev) => [...prev, newGroup]);
      setIsAddModalOpen(false);
      toast.success(`"${newGroup.name}" guruhi muvaffaqiyatli ochildi!`);
    } catch {
      toast.error('Guruh yaratishda xatolik yuz berdi');
    }
  };

  const handleUpdateGroup = async (id: string, input: Partial<CreateGroupInput>) => {
    try {
      const updated = await groupsApi.updateGroup(id, input);
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
      setEditingGroup(null);
      toast.success(`"${updated.name}" guruhi ma’lumotlari muvaffaqiyatli yangilandi!`);
    } catch {
      toast.error('Guruhni tahrirlashda xatolik yuz berdi');
    }
  };

  const handleDeleteGroup = async (group: KindergartenGroup) => {
    if (window.confirm(`Haqiqatan ham "${group.name}" guruhini o‘chirmoqchimisiz?`)) {
      try {
        await groupsApi.deleteGroup(group.id);
        setGroups((prev) => prev.filter((g) => g.id !== group.id));
        toast.warn(`"${group.name}" guruhi muvaffaqiyatli o‘chirildi.`);
      } catch {
        toast.error('Guruhni o‘chirishda xatolik yuz berdi');
      }
    }
  };

  const totalChildren = groups.reduce((acc, g) => acc + g.currentCount, 0);
  const totalCapacity = groups.reduce((acc, g) => acc + g.capacity, 0);
  const percentFilled = totalCapacity > 0 ? Math.round((totalChildren / totalCapacity) * 100) : 0;

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div className="text-muted">Guruhlar yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top summary & actions */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Guruhlar va tarbiyachilar taqsimoti
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
              Jami {groups.length} ta guruh | {totalChildren} / {totalCapacity} bola qamrab olingan ({percentFilled}% to‘ldirilgan)
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            + Yangi guruh ochish
          </Button>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p className="text-muted" style={{ margin: 0 }}>Hozircha guruhlar mavjud emas. Yuqoridagi "+ Yangi guruh ochish" tugmasini bosing.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onEdit={(g) => setEditingGroup(g)}
              onDelete={handleDeleteGroup}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddGroupModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateGroup}
      />

      <EditGroupModal
        group={editingGroup}
        isOpen={Boolean(editingGroup)}
        onClose={() => setEditingGroup(null)}
        onSubmit={handleUpdateGroup}
      />
    </div>
  );
};

export default GroupsPage;
