import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { KindergartenGroup, CreateGroupInput } from '../types';

interface EditGroupModalProps {
  group: KindergartenGroup | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, input: Partial<CreateGroupInput>) => void;
}

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  group,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState('3-4 yosh');
  const [roomNumber, setRoomNumber] = useState('');
  const [mainTeacher, setMainTeacher] = useState('');
  const [capacity, setCapacity] = useState(25);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setAgeRange(group.ageRange || '3-4 yosh');
      setRoomNumber(group.roomNumber || '');
      setMainTeacher(group.mainTeacher || '');
      setCapacity(group.capacity || 25);
    }
  }, [group]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;
    if (!name.trim() || !mainTeacher.trim()) {
      alert('Iltimos, guruh nomi va mas’ul tarbiyachini kiriting.');
      return;
    }

    onSubmit(group.id, {
      name: name.trim(),
      ageRange,
      roomNumber: roomNumber.trim(),
      mainTeacher: mainTeacher.trim(),
      capacity: Number(capacity) || 25,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Guruhni tahrirlash" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Guruh nomi *
          </label>
          <input
            type="text"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            placeholder="Masalan: Qaldirg‘och guruhi"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Yosh toifasi
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={ageRange}
              onChange={(e) => setAgeRange(e.target.value)}
            >
              <option value="2-3 yosh">2-3 yosh (Kichik)</option>
              <option value="3-4 yosh">3-4 yosh (O‘rta)</option>
              <option value="4-5 yosh">4-5 yosh (Katta)</option>
              <option value="5-6 yosh">5-6 yosh (Maktabga tayyorlov)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Xona raqami
            </label>
            <input
              type="text"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              placeholder="104-xona"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Mas’ul tarbiyachi *
            </label>
            <input
              type="text"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              placeholder="Zilola Rahimova"
              value={mainTeacher}
              onChange={(e) => setMainTeacher(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Guruh sig‘imi (bola)
            </label>
            <input
              type="number"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              min={5}
              max={60}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
          <Button type="button" variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary">
            Saqlash
          </Button>
        </div>
      </form>
    </Modal>
  );
};
