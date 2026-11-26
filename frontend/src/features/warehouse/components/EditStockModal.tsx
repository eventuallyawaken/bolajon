import React, { useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { WarehouseItem, UpdateStockInput } from '../types';

interface EditStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: WarehouseItem | null;
  onSubmit: (id: string, input: UpdateStockInput) => void;
}

export const EditStockModal: React.FC<EditStockModalProps> = ({
  isOpen,
  onClose,
  item,
  onSubmit,
}) => {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Mahsulotni tahrirlash: ${item.name}`}
      size="md"
    >
      <EditStockForm key={item.id} item={item} onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
};

interface EditStockFormProps {
  item: WarehouseItem;
  onClose: () => void;
  onSubmit: (id: string, input: UpdateStockInput) => void;
}

const EditStockForm: React.FC<EditStockFormProps> = ({ item, onClose, onSubmit }) => {
  const [name, setName] = useState(item.name);
  const [category, setCategory] = useState<UpdateStockInput['category']>(item.category);
  const [quantity, setQuantity] = useState(item.quantity);
  const [unit, setUnit] = useState<UpdateStockInput['unit']>(item.unit);
  const [minThreshold, setMinThreshold] = useState(item.minThreshold);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Iltimos, mahsulot nomini kiriting.');
      return;
    }
    onSubmit(item.id, {
      name: name.trim(),
      category,
      quantity: Number(quantity) || 0,
      unit,
      minThreshold: Number(minThreshold) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          Mahsulot nomi *
        </label>
        <input
          type="text"
          className="branch-select"
          style={{ width: '100%', height: 40 }}
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
            onChange={(e) => setCategory(e.target.value as UpdateStockInput['category'])}
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
            onChange={(e) => setUnit(e.target.value as UpdateStockInput['unit'])}
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
            Ombordagi qoldiq miqdor *
          </label>
          <input
            type="number"
            min={0}
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
          O‘zgarishlarni saqlash
        </Button>
      </div>
    </form>
  );
};
