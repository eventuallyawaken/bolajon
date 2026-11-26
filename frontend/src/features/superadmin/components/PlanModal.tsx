import React, { useState } from 'react';
import type { CreatePlanInput, Plan } from '../types';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';

interface PlanModalProps {
  plan: Plan | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Plan | CreatePlanInput) => void;
}

interface PlanFormProps {
  plan: Plan | null;
  onClose: () => void;
  onSave: (data: Plan | CreatePlanInput) => void;
}

const PlanForm: React.FC<PlanFormProps> = ({ plan, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: plan ? plan.name : '',
    price: plan ? plan.price : '',
    period: plan ? plan.period : 'so‘m / oyiga',
    description: plan ? plan.description : '',
    maxBranches: plan ? String(plan.maxBranches) : '1',
    badge: plan?.badge || '',
    featuresText: plan
      ? plan.features.join('\n')
      : '1 ta filial boshqaruvi\n100 tagacha bola hisobi\nKunlik davomat va oylik to‘lovlar\nStandart texnik yordam',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = formData.featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (plan) {
      const updated: Plan = {
        ...plan,
        name: formData.name.trim(),
        price: formData.price.trim(),
        period: formData.period.trim(),
        description: formData.description.trim(),
        maxBranches:
          isNaN(Number(formData.maxBranches))
            ? formData.maxBranches.trim()
            : Number(formData.maxBranches),
        badge: formData.badge.trim() || undefined,
        isPopular: Boolean(formData.badge.toLowerCase().includes('ommabop')),
        features: features.length > 0 ? features : plan.features,
      };
      onSave(updated);
    } else {
      const created: CreatePlanInput = {
        name: formData.name.trim(),
        price: formData.price.trim(),
        period: formData.period.trim(),
        description: formData.description.trim(),
        maxBranches:
          isNaN(Number(formData.maxBranches))
            ? formData.maxBranches.trim()
            : Number(formData.maxBranches),
        badge: formData.badge.trim() || undefined,
        isPopular: Boolean(formData.badge.toLowerCase().includes('ommabop')),
        features: features.length > 0 ? features : ['Standart xizmatlar'],
      };
      onSave(created);
    }
  };

  return (
    <form id="planForm" onSubmit={handleSubmit}>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Tarif nomi *</label>
          <input
            type="text"
            className="form-input"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Masalan: Mini tarif, Premium Plus"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Oylik to‘lov narxi *</label>
          <input
            type="text"
            className="form-input"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="Masalan: 1 800 000"
            required
          />
        </div>
      </div>

      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Filiallar limiti *</label>
          <input
            type="text"
            className="form-input"
            value={formData.maxBranches}
            onChange={(e) => setFormData({ ...formData, maxBranches: e.target.value })}
            placeholder="1, 3 yoki Cheksiz"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Yorliq (Badge) (Ixtiyoriy)</label>
          <input
            type="text"
            className="form-input"
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            placeholder="Masalan: Eng ommabop, Yangi"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tarif tavsifi *</label>
        <input
          type="text"
          className="form-input"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Tarif kimlar uchun mo‘ljallanganligi haqida qisqa ma’lumot"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          Imkoniyatlar ro‘yxati (Har birini yangi qatordan yozing) *
        </label>
        <textarea
          className="form-input"
          rows={5}
          style={{ resize: 'vertical', lineHeight: 1.5 }}
          value={formData.featuresText}
          onChange={(e) => setFormData({ ...formData, featuresText: e.target.value })}
          required
        ></textarea>
      </div>

      <div className="modal-footer" style={{ margin: '16px -24px -24px -24px', padding: '16px 24px' }}>
        <Button type="button" variant="secondary" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="primary">
          {plan ? 'O‘zgarishlarni saqlash' : 'Tarifni qo‘shish'}
        </Button>
      </div>
    </form>
  );
};

export const PlanModal: React.FC<PlanModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={plan ? `Tarifni tahrirlash: ${plan.name}` : 'Yangi SaaS obuna tarifini yaratish'}
      size="md"
    >
      <PlanForm
        key={plan ? plan.id : 'new-plan'}
        plan={plan}
        onClose={onClose}
        onSave={onSave}
      />
    </Modal>
  );
};

export default PlanModal;
