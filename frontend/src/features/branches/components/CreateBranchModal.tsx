import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { CreateBranchInput } from '../types';

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateBranchInput) => void;
}

export const CreateBranchModal: React.FC<CreateBranchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateBranchInput>({
    name: '',
    address: '',
    manager: '',
    phone: '+998 ',
    capacity: 120,
    groupsCount: 4,
    status: 'active',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' || name === 'groupsCount' ? Number(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim() || !formData.manager.trim()) {
      alert('Iltimos, filial nomi, manzili va rahbarini to‘liq kiriting.');
      return;
    }

    onSubmit({
      name: formData.name.trim(),
      address: formData.address.trim(),
      manager: formData.manager.trim(),
      phone: formData.phone.trim(),
      capacity: Number(formData.capacity) || 100,
      groupsCount: Number(formData.groupsCount) || 1,
      status: formData.status,
    });

    setFormData({
      name: '',
      address: '',
      manager: '',
      phone: '+998 ',
      capacity: 120,
      groupsCount: 4,
      status: 'active',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bog‘chaga yangi filial qo‘shish" size="lg">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Filial nomi *
          </label>
          <input
            type="text"
            name="name"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            placeholder="Masalan: Yashnobod filiali yoki 2-bino"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Filial manzili *
          </label>
          <input
            type="text"
            name="address"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            placeholder="Masalan: Toshkent sh., Yashnobod tumani, Parkent ko‘chasi, 24-uy"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Filial mudiri (Rahbar F.I.Sh.) *
            </label>
            <input
              type="text"
              name="manager"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              placeholder="Masalan: Kamola Rustamova"
              value={formData.manager}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Aloqa telefoni *
            </label>
            <input
              type="tel"
              name="phone"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Maksimal bola sig‘imi *
            </label>
            <input
              type="number"
              name="capacity"
              min={10}
              max={500}
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Boshlang‘ich guruhlar
            </label>
            <input
              type="number"
              name="groupsCount"
              min={1}
              max={25}
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={formData.groupsCount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Filial holati
            </label>
            <select
              name="status"
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={formData.status}
              onChange={handleChange}
            >
              <option value="active">Faol</option>
              <option value="maintenance">Ta’mirlashda</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary">
            Filialni ro‘yxatga olish
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateBranchModal;
