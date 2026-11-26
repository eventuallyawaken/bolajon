import React, { useState } from 'react';
import type { CreateChildInput } from '../types';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';

interface AddChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateChildInput) => void;
}

export const AddChildModal: React.FC<AddChildModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateChildInput>({
    fullName: '',
    birthDate: '',
    gender: 'male',
    groupName: 'Kichkintoylar guruhi',
    parentName: '',
    parentPhone: '+998 ',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.parentPhone.trim()) return;
    onSubmit(formData);
    setFormData({
      fullName: '',
      birthDate: '',
      gender: 'male',
      groupName: 'Kichkintoylar guruhi',
      parentName: '',
      parentPhone: '+998 ',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yangi bola qabuli"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" form="addChildForm" variant="primary">
            Bog‘chaga qabul qilish
          </Button>
        </>
      }
    >
      <form id="addChildForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Bolaning F.I.Sh *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Masalan: Jasur Aliyev"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            required
          />
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Tug‘ilgan sanasi *</label>
            <input
              type="date"
              className="form-input"
              value={formData.birthDate}
              onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Jinsi *</label>
            <select
              className="form-select"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
            >
              <option value="male">O‘g‘il bola</option>
              <option value="female">Qiz bola</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Biriktiriladigan guruh *</label>
          <select
            className="form-select"
            value={formData.groupName}
            onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
          >
            <option value="Kichkintoylar guruhi">Kichkintoylar guruhi (2-3 yosh)</option>
            <option value="Qaldirg‘och guruhi">Qaldirg‘och guruhi (3-4 yosh)</option>
            <option value="Zukko bolajonlar">Zukko bolajonlar (4-5 yosh)</option>
            <option value="Erkatoy guruhi">Erkatoy guruhi (3-4 yosh)</option>
            <option value="Yulduzcha guruhi">Yulduzcha guruhi (5-6 yosh)</option>
          </select>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Ota-onasi (F.I.Sh) *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Masalan: Otabek Aliyev"
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telefon raqami *</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+998 90 123 45 67"
              value={formData.parentPhone}
              onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddChildModal;
