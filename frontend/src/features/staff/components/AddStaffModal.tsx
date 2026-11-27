import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { groupsApi } from '@/features/groups/api';
import type { KindergartenGroup } from '@/features/groups/types';
import type { CreateStaffInput, StaffRole } from '../types';

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateStaffInput) => void;
}

export const AddStaffModal: React.FC<AddStaffModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [groups, setGroups] = useState<KindergartenGroup[]>([]);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<StaffRole>('Tarbiyachi');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [groupAssigned, setGroupAssigned] = useState('');
  const [salary, setSalary] = useState(4000000);

  useEffect(() => {
    if (!isOpen) return;
    groupsApi.getGroups().then((list) => {
      setGroups(list);
      if (list.length > 0) {
        setGroupAssigned((prev) => prev || list[0].name);
      }
    });
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Iltimos, xodimning F.I.Sh. va telefon raqamini to‘liq kiriting.');
      return;
    }
    if (password.trim() && password.trim().length < 6) {
      alert('Parol kamida 6 ta belgidan iborat bo‘lishi kerak.');
      return;
    }
    onSubmit({
      fullName: fullName.trim(),
      role,
      phone: phone.trim(),
      ...(password.trim() ? { password: password.trim() } : {}),
      groupAssigned: role === 'Tarbiyachi' || role === 'Yordamchi tarbiyachi' ? groupAssigned : undefined,
      salary: Number(salary) || 0,
    });
    setFullName('');
    setPhone('+998 ');
    setPassword('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Yangi xodim qo‘shish" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Xodim F.I.Sh. *
          </label>
          <input
            type="text"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            placeholder="Masalan: Ra’no Rustamova"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Lavozimi
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
            >
              <option value="Tarbiyachi">Tarbiyachi</option>
              <option value="Yordamchi tarbiyachi">Yordamchi tarbiyachi</option>
              <option value="Hamshira">Hamshira</option>
              <option value="Bosh oshpaz">Bosh oshpaz</option>
              <option value="Bosh hisobchi">Bosh hisobchi</option>
              <option value="Direktor">Direktor</option>
              <option value="Qo‘riqchi / Qorovul">Qo‘riqchi / Qorovul</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Telefon raqami *
            </label>
            <input
              type="text"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
        </div>

        {(role === 'Tarbiyachi' || role === 'Yordamchi tarbiyachi') && (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Biriktirilgan guruh
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={groupAssigned}
              onChange={(e) => setGroupAssigned(e.target.value)}
            >
              <option value="">Biriktirilmagan</option>
              {groups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Kirish paroli (ixtiyoriy)
          </label>
          <input
            type="text"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            placeholder="Bo‘sh qoldirilsa: Password123!"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Oylik maoshi (so‘m)
          </label>
          <input
            type="number"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary">
            Xodimni saqlash
          </Button>
        </div>
      </form>
    </Modal>
  );
};
