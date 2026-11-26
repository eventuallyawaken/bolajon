import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { AddStockInput } from '../types';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: AddStockInput) => void;
}

export const AddStockModal: React.FC<AddStockModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AddStockInput['category']>('Go‘sht va sut');
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState<AddStockInput['unit']>('kg');
  const [minThreshold, setMinThreshold] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Iltimos, mahsulot nomini kiriting.');
      return;
    }
    onSubmit({
      name: name.trim(),
      category,
      quantity: Number(quantity) || 0,
      unit,
      minThreshold: Number(minThreshold) || 0,
    });
    setName('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Omborga mahsulot qabul qilish (Kirim)" size="md">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
            Mahsulot nomi *
          </label>
          <input
            type="text"
            className="branch-select"
            style={{ width: '100%', height: 40 }}
            placeholder="Masalan: Mol go‘shti"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Kategoriya
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={category}
              onChange={(e) => setCategory(e.target.value as AddStockInput['category'])}
            >
              <option value="Go‘sht va sut">Go‘sht va sut</option>
              <option value="Don va un">Don va un</option>
              <option value="Sabzavot va meva">Sabzavot va meva</option>
              <option value="Yog‘ va ziravor">Yog‘ va ziravor</option>
              <option value="Xo‘jalik buyumi">Xo‘jalik buyumi</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              O‘lchov birligi
            </label>
            <select
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={unit}
              onChange={(e) => setUnit(e.target.value as AddStockInput['unit'])}
            >
              <option value="kg">Kilogramm (kg)</option>
              <option value="litr">Litr</option>
              <option value="dona">Dona</option>
              <option value="qadoq">Qadoq</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Kirim miqdori *
            </label>
            <input
              type="number"
              min={1}
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              Minimal zaxira chegarasi
            </label>
            <input
              type="number"
              min={1}
              className="branch-select"
              style={{ width: '100%', height: 40 }}
              value={minThreshold}
              onChange={(e) => setMinThreshold(Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="primary">
            Omborga qo‘shish
          </Button>
        </div>
      </form>
    </Modal>
  );
};
