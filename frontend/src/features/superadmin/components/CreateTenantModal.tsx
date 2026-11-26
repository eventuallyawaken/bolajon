import React, { useState } from 'react';
import type { CreateTenantInput, Plan } from '../types';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';

interface CreateTenantModalProps {
  isOpen: boolean;
  plans: Plan[];
  onClose: () => void;
  onSubmit: (input: CreateTenantInput) => void;
}

export const CreateTenantModal: React.FC<CreateTenantModalProps> = ({
  isOpen,
  plans,
  onClose,
  onSubmit,
}) => {
  const defaultPlanId = plans[0]?.id || 'pro';

  const [formData, setFormData] = useState<CreateTenantInput>(() => ({
    name: '',
    subdomain: '',
    directorName: '',
    phone: '+998 ',
    email: '',
    planId: defaultPlanId,
    branchesCount: 1,
    isTrial: true,
  }));

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'branchesCount') {
      setFormData((prev) => ({ ...prev, [name]: Number(value) || 1 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubdomainSuggest = (nameValue: string) => {
    // Generate clean slug from name
    const slug = nameValue
      .toLowerCase()
      .replace(/["'«»]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    if (slug) {
      setFormData((prev) => ({
        ...prev,
        subdomain: prev.subdomain ? prev.subdomain : `${slug}.bolajon.uz`,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.subdomain.trim()) return;
    onSubmit(formData);
    // Reset form
    setFormData({
      name: '',
      subdomain: '',
      directorName: '',
      phone: '+998 ',
      email: '',
      planId: defaultPlanId,
      branchesCount: 1,
      isTrial: true,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Yangi bog‘chani (Tenant) platformaga ulash"
      size="lg"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" form="createTenantForm" variant="primary">
            Bog‘chani ulash va hisob yaratish
          </Button>
        </>
      }
    >
      <form id="createTenantForm" onSubmit={handleSubmit}>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Bog‘cha (Tashkilot) nomi *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="Masalan: &quot;Kamalak Ziyo&quot; MCHJ"
              value={formData.name}
              onChange={(e) => {
                handleChange(e);
                handleSubdomainSuggest(e.target.value);
              }}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Subdomain *</label>
            <input
              type="text"
              name="subdomain"
              className="form-input"
              placeholder="kamalak.bolajon.uz"
              value={formData.subdomain}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Bosh rahbar (Direktor F.I.Sh) *</label>
            <input
              type="text"
              name="directorName"
              className="form-input"
              placeholder="Masalan: Malika Rahimova"
              value={formData.directorName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Bosh telefon raqami *</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="+998 90 123 45 67"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">SaaS obuna tarifi *</label>
            <select
              name="planId"
              className="form-select"
              value={formData.planId || defaultPlanId}
              onChange={handleChange}
              required
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.maxBranches} filialgacha &bull; {p.price} {p.period})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Dastlabki filiallar soni</label>
            <input
              type="number"
              name="branchesCount"
              className="form-input"
              min="1"
              max="50"
              value={formData.branchesCount}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Bosh admin elektron pochtasi *</label>
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="admin@kamalak.uz"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <label className="checkbox-label" style={{ marginTop: 8 }}>
          <input
            type="checkbox"
            name="isTrial"
            className="custom-checkbox"
            checked={formData.isTrial}
            onChange={handleChange}
          />
          <span>14 kunlik bepul sinov muddatini (Trial) yoqish</span>
        </label>
      </form>
    </Modal>
  );
};

export default CreateTenantModal;
